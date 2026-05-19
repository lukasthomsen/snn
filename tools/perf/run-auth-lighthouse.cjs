const { spawnSync } = require("node:child_process");

for (const configPath of [
  "tools/perf/lighthouserc.auth.mobile.cjs",
  "tools/perf/lighthouserc.auth.desktop.cjs",
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
