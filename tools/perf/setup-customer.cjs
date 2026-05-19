const { spawn } = require("node:child_process");
const { Pool } = require("pg");
const { loadPerfEnv } = require("./env.cjs");

const repoRoot = process.cwd();
const allowedMutationEnvironments = new Set(["local", "preview"]);

function normalizeBaseUrl(value, fallback) {
  return (value || fallback).replace(/\/$/, "");
}

function deriveEnvironment(baseUrl) {
  if (process.env.PERF_ENVIRONMENT) {
    return process.env.PERF_ENVIRONMENT;
  }

  const url = new URL(baseUrl);

  if (["localhost", "127.0.0.1", "::1"].includes(url.hostname)) {
    return "local";
  }

  if (url.hostname.endsWith(".vercel.app")) {
    return "preview";
  }

  return "production-smoke";
}

function assertSafeEnvironment(environment, baseUrl, authBaseUrl) {
  const hosts = [baseUrl, authBaseUrl].map((value) => new URL(value).hostname);
  const touchesProduction = hosts.some((host) => /(^|\.)veloro\.dk$/i.test(host));

  if (!allowedMutationEnvironments.has(environment) || process.env.VERCEL_ENV === "production" || touchesProduction) {
    throw new Error(
      `Refusing disposable customer setup for PERF_ENVIRONMENT=${environment}. Use local or preview only.`,
    );
  }
}

function getBypassHeaders() {
  const bypassToken = process.env.PERF_VERCEL_BYPASS_TOKEN || process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

  if (!bypassToken) {
    return {};
  }

  return {
    "x-vercel-protection-bypass": bypassToken,
    "x-vercel-set-bypass-cookie": "true",
  };
}

function isLocalhostUrl(value) {
  const hostname = new URL(value).hostname;

  return ["localhost", "127.0.0.1", "::1"].includes(hostname);
}

async function isAuthServerReady(authBaseUrl) {
  try {
    const response = await fetch(`${authBaseUrl}/api/health`, {
      headers: getBypassHeaders(),
      signal: globalThis.AbortSignal.timeout(5_000),
    });

    return response.ok;
  } catch {
    return false;
  }
}

function killProcessGroup(child, signal) {
  try {
    if (process.platform !== "win32") {
      process.kill(-child.pid, signal);
      return;
    }
  } catch {
    // Fall through to direct child kill for platforms or shells without groups.
  }

  child.kill(signal);
}

function startManagedAuthServer() {
  const child = spawn("pnpm", ["--filter", "@snn/accounts", "start"], {
    cwd: repoRoot,
    detached: process.platform !== "win32",
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => {
    if (!child.snnExpectedStop) {
      process.stdout.write(chunk);
    }
  });

  child.stderr.on("data", (chunk) => {
    if (!child.snnExpectedStop) {
      process.stderr.write(chunk);
    }
  });

  return child;
}

async function waitForManagedAuthServer(authBaseUrl, child) {
  const startedAt = Date.now();
  let lastError = "not ready";

  while (Date.now() - startedAt < 120_000) {
    if (child.exitCode !== null) {
      throw new Error(`Managed accounts server exited before becoming ready. Last status: ${lastError}`);
    }

    if (await isAuthServerReady(authBaseUrl)) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(`Managed accounts server did not become ready at ${authBaseUrl}/api/health.`);
}

async function ensureAuthServer(authBaseUrl) {
  if (await isAuthServerReady(authBaseUrl)) {
    return null;
  }

  if (!isLocalhostUrl(authBaseUrl)) {
    throw new Error(`Accounts auth server is not reachable at ${authBaseUrl}. Start it or use a reachable preview URL.`);
  }

  console.log(`Accounts server is not running at ${authBaseUrl}; starting @snn/accounts temporarily.`);
  const child = startManagedAuthServer();

  await waitForManagedAuthServer(authBaseUrl, child);

  return child;
}

async function stopManagedAuthServer(child) {
  if (!child || child.exitCode !== null) {
    return;
  }

  child.snnExpectedStop = true;
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
}

async function postAuthJson(authBaseUrl, pathName, body) {
  const response = await fetch(`${authBaseUrl}${pathName}`, {
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      origin: authBaseUrl,
      ...getBypassHeaders(),
    },
    method: "POST",
  });
  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text.slice(0, 500) };
    }
  }

  return {
    data,
    ok: response.ok,
    status: response.status,
  };
}

async function findUser(pool, email) {
  const result = await pool.query(
    `
      select id, email, name, email_verified
      from "user"
      where lower(email) = lower($1)
      limit 1
    `,
    [email],
  );

  return result.rows[0] ?? null;
}

async function waitForUser(pool, email) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const user = await findUser(pool, email);

    if (user) {
      return user;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return null;
}

async function ensureVerifiedUser(pool, userId) {
  await pool.query(
    `
      update "user"
      set email_verified = true,
          banned = false,
          ban_reason = null,
          ban_expires = null,
          updated_at = now()
      where id = $1
    `,
    [userId],
  );
}

async function ensureCustomerProfile(pool, user) {
  const email = user.email.trim().toLowerCase();

  await pool.query("begin");

  try {
    const byEmail = await pool.query(
      `
        select id
        from customer_profile
        where lower(email) = lower($1)
        limit 1
      `,
      [email],
    );

    if (byEmail.rowCount > 0) {
      await pool.query(
        `
          update customer_profile
          set user_id = $1,
              first_name = coalesce(first_name, 'Performance'),
              last_name = coalesce(last_name, 'Runner'),
              updated_at = now()
          where id = $2
        `,
        [user.id, byEmail.rows[0].id],
      );
      await pool.query("commit");
      return;
    }

    const byUser = await pool.query(
      `
        select id
        from customer_profile
        where user_id = $1
        limit 1
      `,
      [user.id],
    );

    if (byUser.rowCount > 0) {
      await pool.query(
        `
          update customer_profile
          set email = $1,
              first_name = coalesce(first_name, 'Performance'),
              last_name = coalesce(last_name, 'Runner'),
              updated_at = now()
          where id = $2
        `,
        [email, byUser.rows[0].id],
      );
      await pool.query("commit");
      return;
    }

    await pool.query(
      `
        insert into customer_profile (user_id, email, first_name, last_name)
        values ($1, $2, 'Performance', 'Runner')
      `,
      [user.id, email],
    );
    await pool.query("commit");
  } catch (error) {
    await pool.query("rollback");
    throw error;
  }
}

function getAuthErrorMessage(result) {
  return result.data?.error?.message
    || result.data?.message
    || result.data?.raw
    || `HTTP ${result.status}`;
}

async function main() {
  loadPerfEnv({ repoRoot });

  const baseUrl = normalizeBaseUrl(process.env.PERF_BASE_URL, "http://localhost:3000");
  const authBaseUrl = normalizeBaseUrl(process.env.PERF_AUTH_BASE_URL, "http://localhost:3002");
  const locale = process.env.PERF_LOCALE || "da";
  const environment = deriveEnvironment(baseUrl);
  const email = process.env.PERF_CUSTOMER_EMAIL?.trim().toLowerCase();
  const password = process.env.PERF_CUSTOMER_PASSWORD;
  const missing = [
    ["DATABASE_URL", process.env.DATABASE_URL],
    ["PERF_CUSTOMER_EMAIL", email],
    ["PERF_CUSTOMER_PASSWORD", password],
  ].filter(([, value]) => !value).map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing ${missing.join(", ")}.`);
  }

  if (password.length < 15) {
    throw new Error("PERF_CUSTOMER_PASSWORD must be at least 15 characters.");
  }

  assertSafeEnvironment(environment, baseUrl, authBaseUrl);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
  });
  let managedAuthServer = null;

  try {
    managedAuthServer = await ensureAuthServer(authBaseUrl);

    let user = await findUser(pool, email);

    if (!user) {
      const signUp = await postAuthJson(authBaseUrl, "/api/auth/sign-up/email", {
        callbackURL: `${baseUrl}/${locale}/account`,
        dateOfBirth: "1990-01-01",
        email,
        firstName: "Performance",
        lastName: "Runner",
        name: "Performance Runner",
        password,
      });

      if (!signUp.ok) {
        throw new Error(`Could not create disposable customer: ${getAuthErrorMessage(signUp)}`);
      }

      user = await waitForUser(pool, email);
    }

    if (!user) {
      throw new Error(`Disposable customer ${email} was not created.`);
    }

    await ensureVerifiedUser(pool, user.id);
    user = await findUser(pool, email);
    await ensureCustomerProfile(pool, user);

    const signIn = await postAuthJson(authBaseUrl, "/api/auth/sign-in/email", {
      callbackURL: `${baseUrl}/${locale}/account`,
      email,
      password,
      rememberMe: true,
    });

    if (!signIn.ok || signIn.data?.error) {
      throw new Error(
        `Disposable customer exists but sign-in failed. Check PERF_CUSTOMER_PASSWORD. ${getAuthErrorMessage(signIn)}`,
      );
    }

    console.log(`Disposable performance customer is ready: ${email}`);
  } finally {
    await stopManagedAuthServer(managedAuthServer);
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
