const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const appDir = process.cwd();
const distDir = path.join(appDir, ".next");
const preservedDir = path.join(appDir, `.next-preserved-${process.pid}`);
const settleMs = Number.parseInt(process.env.NEXT_STABLE_BUILD_SETTLE_MS ?? "20000", 10);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function exists(relativePath) {
  return fs.existsSync(path.join(distDir, relativePath));
}

function validateBuildOutput(label) {
  const missing = [];

  if (!exists("server")) {
    missing.push(".next/server");
  }

  if (!exists("static")) {
    missing.push(".next/static");
  }

  if (missing.length > 0) {
    throw new Error(`${label} is missing required Next build output: ${missing.join(", ")}`);
  }
}

function runNextBuild() {
  return new Promise((resolve, reject) => {
    const child = spawn("next", ["build"], {
      env: process.env,
      shell: process.platform === "win32",
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`next build exited with signal ${signal}`));
        return;
      }

      resolve(code ?? 1);
    });
  });
}

async function waitForDelayedCleanup() {
  const deadline = Date.now() + (Number.isFinite(settleMs) && settleMs > 0 ? settleMs : 20000);

  while (Date.now() < deadline) {
    if (!exists("server") || !exists("static")) {
      return;
    }

    await sleep(1000);
  }
}

async function main() {
  fs.rmSync(preservedDir, { force: true, recursive: true });

  const exitCode = await runNextBuild();

  if (exitCode !== 0) {
    process.exit(exitCode);
  }

  validateBuildOutput("next build");
  fs.cpSync(distDir, preservedDir, {
    dereference: false,
    recursive: true,
  });

  await waitForDelayedCleanup();

  fs.rmSync(distDir, {
    force: true,
    recursive: true,
  });
  fs.renameSync(preservedDir, distDir);
  validateBuildOutput("restored next build");
}

main().catch((error) => {
  fs.rmSync(preservedDir, { force: true, recursive: true });
  console.error(error);
  process.exit(1);
});
