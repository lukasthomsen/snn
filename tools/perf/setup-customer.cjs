const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

const repoRoot = process.cwd();
const envFiles = [
  ".env.local",
  path.join("apps", "storefront", ".env.local"),
  path.join("apps", "accounts", ".env.local"),
];
const allowedMutationEnvironments = new Set(["local", "preview"]);

function stripOuterQuotes(value) {
  const trimmed = value.trim();
  const quote = trimmed[0];

  if ((quote !== "\"" && quote !== "'") || trimmed[trimmed.length - 1] !== quote) {
    return trimmed;
  }

  return trimmed.slice(1, -1);
}

function loadEnvFile(filePath) {
  const absolutePath = path.resolve(repoRoot, filePath);

  if (!fs.existsSync(absolutePath)) {
    return;
  }

  const lines = fs.readFileSync(absolutePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);

    if (!match || line.trim().startsWith("#")) {
      continue;
    }

    const [, key, rawValue] = match;

    if (process.env[key] === undefined) {
      process.env[key] = stripOuterQuotes(rawValue ?? "");
    }
  }
}

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
  for (const filePath of envFiles) {
    loadEnvFile(filePath);
  }

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

  try {
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
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
