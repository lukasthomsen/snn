const fs = require("node:fs");
const path = require("node:path");

const repoRoot = process.cwd();
const reportPath = process.env.PERF_STEP_ONE_REPORT_PATH
  ? path.resolve(repoRoot, process.env.PERF_STEP_ONE_REPORT_PATH)
  : path.join(repoRoot, "docs", "performance", "step-1-deep-dive.md");
const measurementPath = process.env.PERF_MEASUREMENTS_PATH
  ? path.resolve(repoRoot, process.env.PERF_MEASUREMENTS_PATH)
  : path.join(repoRoot, "perf-reports", "playwright", "measurements.ndjson");
const lighthouseRoot = process.env.PERF_LIGHTHOUSE_DIR
  ? path.resolve(repoRoot, process.env.PERF_LIGHTHOUSE_DIR)
  : path.join(repoRoot, "perf-reports", "lighthouse");
const serverTraceCandidates = [
  process.env.PERF_SERVER_TRACE_FILE,
  path.join(repoRoot, "perf-reports", "server-traces.ndjson"),
  path.join(repoRoot, "perf-reports", "vercel-traces.ndjson"),
  path.join(repoRoot, "perf-reports", "performance-traces.ndjson"),
].filter(Boolean);

const metricTargets = {
  actionP75Ms: 200,
  cls: 0.1,
  lcpMs: 2500,
  routeP75Ms: 2500,
  serverP75Ms: 200,
  tbtMs: 200,
};

function exists(filePath) {
  return fs.existsSync(filePath);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readNdjson(filePath) {
  if (!exists(filePath)) {
    return [];
  }

  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function walkFiles(rootPath, fileName) {
  if (!exists(rootPath)) {
    return [];
  }

  const entries = fs.readdirSync(rootPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(rootPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkFiles(entryPath, fileName));
    } else if (entry.name === fileName) {
      files.push(entryPath);
    }
  }

  return files;
}

function percentile(values, percentileValue) {
  const numbers = values
    .filter((value) => typeof value === "number" && Number.isFinite(value))
    .sort((a, b) => a - b);

  if (numbers.length === 0) {
    return null;
  }

  const index = Math.min(
    numbers.length - 1,
    Math.max(0, Math.ceil((percentileValue / 100) * numbers.length) - 1),
  );

  return numbers[index];
}

function round(value, digits = 1) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  const factor = 10 ** digits;

  return Math.round(value * factor) / factor;
}

function formatNumber(value, suffix = "") {
  const rounded = round(value);

  return rounded === null ? "-" : `${rounded.toLocaleString("en-US")}${suffix}`;
}

function formatBytes(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }

  if (value < 1024) {
    return `${Math.round(value)} B`;
  }

  if (value < 1024 * 1024) {
    return `${round(value / 1024)} KB`;
  }

  return `${round(value / (1024 * 1024))} MB`;
}

function groupBy(rows, getKey) {
  const groups = new Map();

  for (const row of rows) {
    const key = getKey(row);
    const values = groups.get(key) ?? [];

    values.push(row);
    groups.set(key, values);
  }

  return groups;
}

function markdownTable(headers, rows) {
  if (rows.length === 0) {
    return "_No data captured yet._";
  }

  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function summarizeMeasurements(measurements) {
  const groups = [...groupBy(
    measurements,
    (row) => [
      row.kind,
      row.project,
      row.authState,
      row.cacheState ?? "none",
      row.name,
      row.serverTraceName ?? "",
    ].join("::"),
  ).values()];

  return groups
    .map((rows) => {
      const first = rows[0];
      const durations = rows.map((row) => row.durationMs);
      const failures = rows.filter((row) => row.status !== "ok").length;
      const transferSizes = rows.map((row) => row.transferSizeBytes).filter(Number.isFinite);

      return {
        authState: first.authState,
        cacheState: first.cacheState ?? "-",
        device: first.project,
        failures,
        kind: first.kind,
        name: first.name,
        p50: percentile(durations, 50),
        p75: percentile(durations, 75),
        p95: percentile(durations, 95),
        rows: rows.length,
        scenario: first.scenario,
        serverTraceName: first.serverTraceName,
        target: first.target,
        transferP75: percentile(transferSizes, 75),
      };
    })
    .sort((a, b) => (b.p75 ?? 0) - (a.p75 ?? 0));
}

function summarizeServerTraces(traces) {
  const performanceTraces = traces.filter((row) => row.event === "performance.trace");
  const groups = [...groupBy(performanceTraces, (row) => row.name ?? "unknown").values()];

  return groups
    .map((rows) => {
      const first = rows[0];

      return {
        dbP75: percentile(rows.map((row) => row.queryDurationMs), 75),
        durationP75: percentile(rows.map((row) => row.durationMs), 75),
        errors: rows.filter((row) => row.status === "error").length,
        name: first.name ?? "unknown",
        queryP75: percentile(rows.map((row) => row.queryCount), 75),
        rows: rows.length,
      };
    })
    .sort((a, b) => (b.durationP75 ?? 0) - (a.durationP75 ?? 0));
}

function readLighthouseRuns() {
  const manifestPaths = walkFiles(lighthouseRoot, "manifest.json");
  const runs = [];

  for (const manifestPath of manifestPaths) {
    const manifest = readJson(manifestPath);
    const manifestDir = path.dirname(manifestPath);
    const device = path.basename(manifestDir);

    for (const entry of manifest) {
      const jsonPath = entry.jsonPath
        ? path.resolve(manifestDir, entry.jsonPath)
        : null;

      if (!jsonPath || !exists(jsonPath)) {
        continue;
      }

      const lhr = readJson(jsonPath);
      const audits = lhr.audits ?? {};
      const categories = lhr.categories ?? {};

      const finalUrl = new URL(lhr.finalDisplayedUrl ?? lhr.finalUrl ?? entry.url);

      runs.push({
        cls: audits["cumulative-layout-shift"]?.numericValue,
        device,
        fcpMs: audits["first-contentful-paint"]?.numericValue,
        lcpMs: audits["largest-contentful-paint"]?.numericValue,
        performanceScore: typeof categories.performance?.score === "number"
          ? categories.performance.score * 100
          : undefined,
        route: `${finalUrl.pathname}${finalUrl.search}`,
        speedIndexMs: audits["speed-index"]?.numericValue,
        tbtMs: audits["total-blocking-time"]?.numericValue,
        ttfbMs: audits["server-response-time"]?.numericValue,
      });
    }
  }

  const groups = [...groupBy(runs, (run) => `${run.device}::${run.route}`).values()];

  return groups
    .map((rows) => {
      const first = rows[0];

      return {
        cls: percentile(rows.map((row) => row.cls), 50),
        device: first.device,
        fcpMs: percentile(rows.map((row) => row.fcpMs), 50),
        lcpMs: percentile(rows.map((row) => row.lcpMs), 50),
        performanceScore: percentile(rows.map((row) => row.performanceScore), 50),
        route: first.route,
        rows: rows.length,
        speedIndexMs: percentile(rows.map((row) => row.speedIndexMs), 50),
        tbtMs: percentile(rows.map((row) => row.tbtMs), 50),
        ttfbMs: percentile(rows.map((row) => row.ttfbMs), 50),
      };
    })
    .sort((a, b) => (b.lcpMs ?? 0) - (a.lcpMs ?? 0));
}

function buildCandidates(measurementSummary, serverSummary, lighthouseSummary) {
  const candidates = [];

  for (const row of measurementSummary) {
    const target = row.kind === "route" ? metricTargets.routeP75Ms : metricTargets.actionP75Ms;

    if ((row.p75 ?? 0) > target || row.failures > 0) {
      candidates.push({
        impact: row.failures > 0 ? "high" : row.kind === "action" ? "high" : "medium",
        issue: `${row.name} ${row.device} p75 ${formatNumber(row.p75, " ms")}${row.failures > 0 ? ` with ${row.failures} failures` : ""}`,
        next: row.serverTraceName
          ? `Compare browser timing with ${row.serverTraceName} server traces.`
          : "Inspect browser trace, network waterfall, and readiness marker timing.",
      });
    }
  }

  for (const row of serverSummary) {
    if ((row.durationP75 ?? 0) > metricTargets.serverP75Ms || (row.queryP75 ?? 0) >= 10 || row.errors > 0) {
      candidates.push({
        impact: row.errors > 0 || (row.queryP75 ?? 0) >= 10 ? "high" : "medium",
        issue: `${row.name} server p75 ${formatNumber(row.durationP75, " ms")}, query p75 ${formatNumber(row.queryP75)}`,
        next: "Capture query plans for the slowest query family and reduce repeated reads/writes.",
      });
    }
  }

  for (const row of lighthouseSummary) {
    if ((row.lcpMs ?? 0) > metricTargets.lcpMs || (row.tbtMs ?? 0) > metricTargets.tbtMs || (row.cls ?? 0) > metricTargets.cls) {
      candidates.push({
        impact: (row.lcpMs ?? 0) > metricTargets.lcpMs ? "high" : "medium",
        issue: `${row.device} ${row.route} Lighthouse LCP ${formatNumber(row.lcpMs, " ms")}, TBT ${formatNumber(row.tbtMs, " ms")}, CLS ${formatNumber(row.cls)}`,
        next: "Open the Lighthouse trace and inspect LCP element, request discovery, render blocking, and layout shifts.",
      });
    }
  }

  return candidates.slice(0, 12);
}

function buildReport() {
  const allMeasurements = readNdjson(measurementPath);
  const measurements = allMeasurements.filter((row) => row.schemaVersion === 1);
  const serverTraces = serverTraceCandidates.flatMap((filePath) => readNdjson(filePath));
  const measurementSummary = summarizeMeasurements(measurements);
  const serverSummary = summarizeServerTraces(serverTraces);
  const lighthouseSummary = readLighthouseRuns();
  const candidates = buildCandidates(measurementSummary, serverSummary, lighthouseSummary);
  const generatedAt = new Date().toISOString();

  const measurementRows = measurementSummary.slice(0, 30).map((row) => [
    row.device,
    row.authState,
    row.cacheState,
    row.name,
    String(row.rows),
    formatNumber(row.p50, " ms"),
    formatNumber(row.p75, " ms"),
    formatNumber(row.p95, " ms"),
    row.failures ? String(row.failures) : "0",
    formatBytes(row.transferP75),
    row.serverTraceName ?? "-",
  ]);
  const serverRows = serverSummary.slice(0, 30).map((row) => [
    row.name,
    String(row.rows),
    formatNumber(row.durationP75, " ms"),
    formatNumber(row.queryP75),
    formatNumber(row.dbP75, " ms"),
    row.errors ? String(row.errors) : "0",
  ]);
  const lighthouseRows = lighthouseSummary.slice(0, 30).map((row) => [
    row.device,
    row.route,
    String(row.rows),
    formatNumber(row.performanceScore),
    formatNumber(row.fcpMs, " ms"),
    formatNumber(row.lcpMs, " ms"),
    formatNumber(row.tbtMs, " ms"),
    formatNumber(row.cls),
    formatNumber(row.speedIndexMs, " ms"),
  ]);
  const candidateRows = candidates.map((row) => [
    row.impact,
    row.issue,
    row.next,
  ]);

  return `# Step 1 Deep Dive: Real Bottlenecks

Generated: ${generatedAt}

## How To Run

\`\`\`bash
pnpm perf:preflight
pnpm perf:local
pnpm perf:report
\`\`\`

For the production-like local lab, set \`PERF_ENVIRONMENT=local\`, \`PERF_BASE_URL=http://localhost:3000\`, \`PERF_AUTH_BASE_URL=http://localhost:3002\`, \`PERF_LOCALE=da\`, \`PERF_PRODUCT_SLUG=essential-creatine-monohydrate\`, and disposable \`PERF_CUSTOMER_EMAIL\`/\`PERF_CUSTOMER_PASSWORD\`. Then run \`pnpm perf:preflight\` followed by \`pnpm perf:local\`; the local runner lints perf tooling, builds the repo, starts storefront/accounts with \`next start\`, prepares the disposable customer, runs Lighthouse, runs Playwright flows, writes the report, and shuts servers down.

Set \`PERF_CHECKOUT_PAYMENT_PREP=1\` only with Stripe test credentials. The validation path requires \`STRIPE_SECRET_KEY=sk_test_*\` and \`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_*\`, and the Playwright flow prepares payment only; it never confirms payment.

For preview server traces, enable \`ENABLE_PERFORMANCE_TRACE=1\` on the preview deployment and save JSON log lines containing \`"event":"performance.trace"\` to one of:

- \`perf-reports/server-traces.ndjson\`
- \`perf-reports/vercel-traces.ndjson\`
- the file path in \`PERF_SERVER_TRACE_FILE\`

## Top Candidates

${markdownTable(["Impact", "Finding", "Next check"], candidateRows)}

## Playwright Workflow Timings

${markdownTable(
  ["Device", "Auth", "Cache", "Measurement", "n", "p50", "p75", "p95", "Failures", "Transfer p75", "Server trace"],
  measurementRows,
)}

## Server Trace Summary

${markdownTable(
  ["Trace", "n", "Duration p75", "Query p75", "DB p75", "Errors"],
  serverRows,
)}

## Lighthouse Summary

${markdownTable(
  ["Device", "Route", "n", "Perf", "FCP", "LCP", "TBT", "CLS", "Speed Index"],
  lighthouseRows,
)}

## Targets

- LCP p75: <= ${metricTargets.lcpMs} ms
- INP p75: <= 200 ms in field data; use Playwright click-to-feedback timings and Lighthouse TBT as lab proxies
- CLS p75: <= ${metricTargets.cls}
- Interaction p75 for cart/likes/checkout feedback: <= ${metricTargets.actionP75Ms} ms
- Server action p75 investigation threshold: > ${metricTargets.serverP75Ms} ms or query p75 >= 10

## Notes

- Playwright rows use deterministic \`data-perf-*\` readiness markers rather than \`networkidle\`.
- Browser timings and server traces are intentionally separate raw inputs; this report joins them by measurement name and \`serverTraceName\` so slow UI waits can be separated from slow database work.
- Production smoke should stay limited to public cache/header checks unless production mutations are explicitly approved.
`;
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, buildReport());
console.log(`Wrote ${path.relative(repoRoot, reportPath)}`);
