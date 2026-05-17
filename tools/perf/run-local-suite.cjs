const { spawn, spawnSync } = require("node:child_process");

const baseUrl = (process.env.PERF_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const authBaseUrl = (process.env.PERF_AUTH_BASE_URL || "http://localhost:3002").replace(/\/$/, "");
const childEnv = {
  ...process.env,
  PERF_AUTH_BASE_URL: authBaseUrl,
  PERF_BASE_URL: baseUrl,
  PERF_ENVIRONMENT: process.env.PERF_ENVIRONMENT || "local",
  PERF_LOCALE: process.env.PERF_LOCALE || "da",
};
const servers = [];

function runStep(name, args) {
  console.log(`\n> ${[name, ...args].join(" ")}`);
  const result = spawnSync(name, args, {
    env: childEnv,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`${[name, ...args].join(" ")} failed with exit code ${result.status ?? 1}.`);
  }
}

function startServer(label, args) {
  console.log(`\n> starting ${label}: pnpm ${args.join(" ")}`);
  const child = spawn("pnpm", args, {
    detached: process.platform !== "win32",
    env: childEnv,
    stdio: "inherit",
  });

  servers.push({
    child,
    label,
  });

  child.on("exit", (code, signal) => {
    if (!child.killed) {
      console.error(`${label} exited early with code=${code} signal=${signal}`);
    }
  });

  return child;
}

function getBypassHeaders() {
  const bypassToken = childEnv.PERF_VERCEL_BYPASS_TOKEN || childEnv.VERCEL_AUTOMATION_BYPASS_SECRET;

  if (!bypassToken) {
    return {};
  }

  return {
    "x-vercel-protection-bypass": bypassToken,
    "x-vercel-set-bypass-cookie": "true",
  };
}

async function waitForUrl(label, url, timeoutMs = 120_000) {
  const startedAt = Date.now();
  let lastError = "";

  while (Date.now() - startedAt < timeoutMs) {
    for (const server of servers) {
      if (server.child.exitCode !== null) {
        throw new Error(`${server.label} exited before ${label} became ready.`);
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5_000);

    try {
      const response = await fetch(url, {
        headers: getBypassHeaders(),
        signal: controller.signal,
      });

      if (response.ok) {
        console.log(`${label} ready at ${url}`);
        return;
      }

      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error.message;
    } finally {
      clearTimeout(timeout);
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(`${label} did not become ready at ${url}. Last error: ${lastError}`);
}

function killProcessGroup(child, signal) {
  try {
    if (process.platform !== "win32") {
      process.kill(-child.pid, signal);
    } else {
      child.kill(signal);
    }
  } catch {
    child.kill(signal);
  }
}

async function stopServers() {
  await Promise.all(servers.map(async ({ child, label }) => {
    if (child.exitCode !== null) {
      return;
    }

    console.log(`Stopping ${label}...`);
    killProcessGroup(child, "SIGTERM");

    await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        if (child.exitCode === null) {
          killProcessGroup(child, "SIGKILL");
        }

        resolve();
      }, 10_000);

      child.once("exit", () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  }));
}

async function main() {
  runStep("pnpm", ["perf:lint"]);
  runStep("pnpm", ["perf:preflight"]);
  runStep("pnpm", ["build"]);

  startServer("storefront", ["--filter", "@snn/storefront", "start"]);
  startServer("accounts", ["--filter", "@snn/accounts", "start"]);

  try {
    await waitForUrl("storefront", `${baseUrl}/api/health`);
    await waitForUrl("accounts", `${authBaseUrl}/api/health`);

    runStep("pnpm", ["perf:customer"]);
    runStep("pnpm", ["perf:lighthouse"]);
    runStep("pnpm", ["perf:flows"]);
    runStep("pnpm", ["perf:report"]);
  } finally {
    await stopServers();
  }
}

process.on("SIGINT", () => {
  stopServers().finally(() => process.exit(130));
});
process.on("SIGTERM", () => {
  stopServers().finally(() => process.exit(143));
});

main().catch(async (error) => {
  console.error(error);
  await stopServers();
  process.exit(1);
});
