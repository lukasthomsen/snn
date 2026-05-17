const { assertions, baseUrl, extraHeaders, locale, runs } = require("./lighthouserc.shared.cjs");

module.exports = {
  ci: {
    collect: {
      numberOfRuns: runs,
      puppeteerScript: "tools/perf/lighthouse-auth.cjs",
      settings: {
        extraHeaders,
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      },
      url: [`${baseUrl}/${locale}/account`],
    },
    assert: {
      assertions: {
        ...assertions,
        "categories:performance": ["warn", { minScore: 0.8 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.05 }],
        "total-blocking-time": ["warn", { maxNumericValue: 150 }],
      },
    },
    upload: {
      outputDir: "perf-reports/lighthouse/account-mobile",
      target: "filesystem",
    },
  },
};
