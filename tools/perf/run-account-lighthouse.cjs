const { spawnSync } = require("node:child_process");

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
