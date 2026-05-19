import { defineConfig, devices } from "@playwright/test";
import perfEnv from "./tools/perf/env.cjs";

const { loadPerfEnv } = perfEnv as {
  loadPerfEnv: (options?: { repoRoot?: string }) => void;
};

loadPerfEnv();

delete process.env.NO_COLOR;

const baseURL = process.env.PERF_BASE_URL ?? "http://localhost:3000";
const vercelBypassToken = process.env.PERF_VERCEL_BYPASS_TOKEN ?? process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const repeatEach = Number.parseInt(process.env.PERF_FLOW_RUNS ?? "5", 10);
const extraHTTPHeaders = vercelBypassToken
  ? {
      "x-vercel-protection-bypass": vercelBypassToken,
      "x-vercel-set-bypass-cookie": "true",
    }
  : undefined;

export default defineConfig({
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  outputDir: "perf-reports/playwright/artifacts",
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: {
          height: 1_000,
          width: 1_440,
        },
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["Pixel 5"],
      },
    },
  ],
  reporter: [
    ["list"],
    ["json", { outputFile: "perf-reports/playwright/results.json" }],
    ["html", { open: "never", outputFolder: "perf-reports/playwright/html" }],
  ],
  repeatEach: Number.isFinite(repeatEach) && repeatEach > 0 ? repeatEach : 5,
  retries: 0,
  testDir: "tests/performance",
  timeout: 90_000,
  use: {
    baseURL,
    extraHTTPHeaders,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  workers: 1,
});
