const { spawnSync } = require("node:child_process");
const { chromium } = require("@playwright/test");
const { loadPerfEnv } = require("./env.cjs");

const repoRoot = process.cwd();
loadPerfEnv({ repoRoot });

process.env.PERF_BASE_URL ??= "http://localhost:3000";
process.env.PERF_AUTH_BASE_URL ??= "http://localhost:3002";

if (!process.env.CHROME_PATH) {
  process.env.CHROME_PATH = chromium.executablePath();
}

const requiredEnv = [
  "PERF_AUTH_BASE_URL",
  "PERF_CUSTOMER_EMAIL",
  "PERF_CUSTOMER_PASSWORD",
];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.warn(
    `Skipping account Lighthouse: missing ${missingEnv.join(", ")}.`,
  );
  process.exit(0);
}

for (const configPath of [
  "tools/perf/lighthouserc.account.mobile.cjs",
  "tools/perf/lighthouserc.account.desktop.cjs",
]) {
  const result = spawnSync(
    "pnpm",
    ["exec", "lhci", "autorun", `--config=${configPath}`],
    {
      env: process.env,
      stdio: "inherit",
    },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
