const { assertions, extraHeaders, locale, runs } = require("./lighthouserc.shared.cjs");

const authBaseUrl = (process.env.PERF_AUTH_BASE_URL || "http://localhost:3002").replace(/\/$/, "");

module.exports = {
  ci: {
    collect: {
      numberOfRuns: runs,
      settings: {
        extraHeaders,
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
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
        "categories:performance": ["warn", { minScore: 0.85 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.05 }],
      },
    },
    upload: {
      outputDir: "perf-reports/lighthouse/auth-mobile",
      target: "filesystem",
    },
  },
};
