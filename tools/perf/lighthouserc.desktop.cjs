const { assertions, extraHeaders, runs, urls } = require("./lighthouserc.shared.cjs");

module.exports = {
  ci: {
    collect: {
      numberOfRuns: runs,
      settings: {
        extraHeaders,
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
        preset: "desktop",
      },
      url: urls,
    },
    assert: {
      assertions,
    },
    upload: {
      outputDir: "perf-reports/lighthouse/desktop",
      target: "filesystem",
    },
  },
};
