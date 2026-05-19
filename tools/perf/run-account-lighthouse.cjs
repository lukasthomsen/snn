const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("@playwright/test");

const repoRoot = process.cwd();
const envFiles = [
  ".env.local",
  path.join("apps", "storefront", ".env.local"),
  path.join("apps", "accounts", ".env.local"),
];

function stripOuterQuotes(value) {
  const trimmed = value.trim();
  const quote = trimmed[0];

  if ((quote !== "\"" && quote !== "'") || trimmed[trimmed.length - 1] !== quote) {
    return trimmed;
  }

  const unquoted = trimmed.slice(1, -1);

  return quote === "\""
    ? unquoted.replace(/\\n/g, "\n").replace(/\\"/g, "\"")
    : unquoted;
}

function loadEnvFile(filePath) {
  const absolutePath = path.resolve(repoRoot, filePath);

  if (!fs.existsSync(absolutePath)) {
    return;
  }

  const lines = fs.readFileSync(absolutePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);

    if (!match || line.trim().startsWith("#")) {
      continue;
    }

    const [, key, rawValue] = match;

    if (process.env[key] === undefined) {
      process.env[key] = stripOuterQuotes(rawValue ?? "");
    }
  }
}

for (const filePath of envFiles) {
  loadEnvFile(filePath);
}

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
