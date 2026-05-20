const { assertions, baseUrl, extraHeaders, locale, runs } = require("./lighthouserc.shared.cjs");
const { cleanLighthouseOutputDir } = require("./lighthouse-output.cjs");

const outputDir = "perf-reports/lighthouse/account-desktop";

cleanLighthouseOutputDir(outputDir);

module.exports = {
  ci: {
    collect: {
      numberOfRuns: runs,
      puppeteerScript: "tools/perf/lighthouse-auth.cjs",
      settings: {
        extraHeaders,
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
        preset: "desktop",
      },
      url: [`${baseUrl}/${locale}/account`],
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
