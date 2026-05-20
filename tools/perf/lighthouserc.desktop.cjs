const { assertions, extraHeaders, runs, urls } = require("./lighthouserc.shared.cjs");
const { cleanLighthouseOutputDir } = require("./lighthouse-output.cjs");

const outputDir = "perf-reports/lighthouse/desktop";

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
      url: urls,
    },
    assert: {
      assertions,
    },
    upload: {
      outputDir,
      target: "filesystem",
    },
  },
};
