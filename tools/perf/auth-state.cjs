const crypto = require("node:crypto");
const { Pool } = require("pg");

const { loadPerfEnv } = require("./env.cjs");

const allowedMutationEnvironments = new Set(["local", "preview"]);
const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
const sessionCookieBaseName = "better-auth.session_token";
const sessionMaxAgeSeconds = 60 * 60 * 24 * 30;
const localFallbackSecret = "snn-local-development-secret-change-me-before-deploying";

function normalizeBaseUrl(value, fallback) {
  return (value || fallback).replace(/\/$/, "");
}

function deriveEnvironment(baseUrl) {
  if (process.env.PERF_ENVIRONMENT) {
    return process.env.PERF_ENVIRONMENT;
  }

  const url = new URL(baseUrl);

  if (localHosts.has(url.hostname)) {
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
      `Refusing performance auth session bootstrap for PERF_ENVIRONMENT=${environment}. Use local or preview only.`,
    );
  }
}

function randomToken(bytes = 24) {
  return crypto.randomBytes(bytes).toString("base64url");
}

function signCookieValue(value, secret) {
  const signature = crypto.createHmac("sha256", secret).update(value).digest("base64");

  return encodeURIComponent(`${value}.${signature}`);
}

function getCookieDomain(baseUrl) {
  const hostname = new URL(baseUrl).hostname;

  if (localHosts.has(hostname)) {
    return hostname;
  }

  const baseDomain = process.env.BASE_DOMAIN?.trim();

  if (!baseDomain) {
    return hostname;
  }

  return baseDomain.startsWith(".") ? baseDomain : `.${baseDomain}`;
}

function getSessionCookieNames(baseUrl) {
  const hostname = new URL(baseUrl).hostname;

  if (process.env.PERF_AUTH_COOKIE_NAME) {
    return [process.env.PERF_AUTH_COOKIE_NAME];
  }

  if (localHosts.has(hostname)) {
    return [`__Secure-${sessionCookieBaseName}`, sessionCookieBaseName];
  }

  return [`__Secure-${sessionCookieBaseName}`];
}

function toPlaywrightCookies({ baseUrl, signedToken }) {
  const domain = getCookieDomain(baseUrl);
  const expires = Math.floor(Date.now() / 1000) + sessionMaxAgeSeconds;

  return getSessionCookieNames(baseUrl).map((name) => ({
    domain,
    expires,
    httpOnly: true,
    name,
    path: "/",
    sameSite: "Lax",
    secure: name.startsWith("__Secure-") || new URL(baseUrl).protocol === "https:",
    value: signedToken,
  }));
}

async function findUser(pool, email) {
  const result = await pool.query(
    `
      select id, email, email_verified, banned
      from "user"
      where lower(email) = lower($1)
      limit 1
    `,
    [email],
  );

  return result.rows[0] ?? null;
}

async function createPerfSession(pool, userId) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + sessionMaxAgeSeconds * 1000);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const token = randomToken();
    const id = `perf_${randomToken(18)}`;

    try {
      await pool.query(
        `
          insert into "session" (
            id,
            expires_at,
            token,
            ip_address,
            user_agent,
            user_id,
            created_at,
            updated_at
          )
          values ($1, $2, $3, $4, $5, $6, $7, $7)
        `,
        [
          id,
          expiresAt,
          token,
          "127.0.0.1",
          "SNN performance flow",
          userId,
          now,
        ],
      );

      return token;
    } catch (error) {
      if (error?.code !== "23505" || attempt === 4) {
        throw error;
      }
    }
  }

  throw new Error("Could not create a unique performance auth session.");
}

async function createPerfAuthCookies(options = {}) {
  loadPerfEnv({ repoRoot: options.repoRoot ?? process.cwd() });

  const baseUrl = normalizeBaseUrl(options.baseUrl ?? process.env.PERF_BASE_URL, "http://localhost:3000");
  const authBaseUrl = normalizeBaseUrl(options.authBaseUrl ?? process.env.PERF_AUTH_BASE_URL, "http://localhost:3002");
  const environment = deriveEnvironment(baseUrl);
  const email = (options.email ?? process.env.PERF_CUSTOMER_EMAIL)?.trim().toLowerCase();
  const secret = process.env.BETTER_AUTH_SECRET ?? localFallbackSecret;

  if (!email) {
    throw new Error("Missing PERF_CUSTOMER_EMAIL.");
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL.");
  }

  assertSafeEnvironment(environment, baseUrl, authBaseUrl);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
  });

  try {
    const user = await findUser(pool, email);

    if (!user) {
      throw new Error(`Disposable performance customer ${email} does not exist. Run pnpm perf:customer first.`);
    }

    if (!user.email_verified || user.banned) {
      throw new Error(`Disposable performance customer ${email} is not eligible for signed-in flows.`);
    }

    const token = await createPerfSession(pool, user.id);
    const signedToken = signCookieValue(token, secret);

    return {
      cookies: toPlaywrightCookies({
        baseUrl,
        signedToken,
      }),
      token,
    };
  } finally {
    await pool.end();
  }
}

module.exports = {
  createPerfAuthCookies,
};
