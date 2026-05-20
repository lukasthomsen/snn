const fs = require("node:fs");
const path = require("node:path");

const lighthouseOutputNames = [
  "mobile",
  "desktop",
  "auth-mobile",
  "auth-desktop",
  "account-mobile",
  "account-desktop",
];

function getLighthouseOutputDir(name, root = process.cwd()) {
  return path.join(root, "perf-reports", "lighthouse", name);
}

function getLighthouseOutputDirs(root = process.cwd()) {
  return lighthouseOutputNames.map((name) => getLighthouseOutputDir(name, root));
}

function cleanLighthouseOutputDir(outputDir) {
  const resolvedOutputDir = path.resolve(process.cwd(), outputDir);
  const lighthouseRoot = path.resolve(process.cwd(), "perf-reports", "lighthouse");

  if (!resolvedOutputDir.startsWith(`${lighthouseRoot}${path.sep}`)) {
    throw new Error(`Refusing to clean Lighthouse output outside ${lighthouseRoot}: ${resolvedOutputDir}`);
  }

  fs.rmSync(resolvedOutputDir, { force: true, recursive: true });
}

module.exports = {
  cleanLighthouseOutputDir,
  getLighthouseOutputDir,
  getLighthouseOutputDirs,
  lighthouseOutputNames,
};
