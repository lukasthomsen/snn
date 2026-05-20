const { assertions, extraHeaders, locale, runs } = require("./lighthouserc.shared.cjs");
const { cleanLighthouseOutputDir } = require("./lighthouse-output.cjs");

const authBaseUrl = (process.env.PERF_AUTH_BASE_URL || "http://localhost:3002").replace(/\/$/, "");
const outputDir = "perf-reports/lighthouse/auth-desktop";

cleanLighthouseOutputDir(outputDir);

module.exports = {
  ci: {
    collect: {
      numberOfRuns: runs,
      settings: {
        extraHeaders,
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
        preset: "desktop",
      },
      url: [
        `${authBaseUrl}/${locale}/sign-in`,
        `${authBaseUrl}/${locale}/sign-up`,
        `${authBaseUrl}/${locale}/forgot-password`,
      ],
    },
    assert: {
      assertions: {
        ...assertions,
        "categories:performance": ["warn", { minScore: 0.9 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.05 }],
        "total-blocking-time": ["warn", { maxNumericValue: 150 }],
      },
    },
    upload: {
      outputDir,
      target: "filesystem",
    },
  },
};
