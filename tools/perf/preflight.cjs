const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");
const { Pool } = require("pg");

const repoRoot = process.cwd();
const envFiles = [
  ".env.local",
  path.join("apps", "storefront", ".env.local"),
  path.join("apps", "accounts", ".env.local"),
];
const defaultBaseUrl = "http://localhost:3000";
const defaultAuthBaseUrl = "http://localhost:3002";
const defaultProductSlug = "essential-creatine-monohydrate";
const allowedMutationEnvironments = new Set(["local", "preview"]);
const checks = [];

function stripOuterQuotes(value) {
  const trimmed = value.trim();
  const quote = trimmed[0];

  if ((quote !== "\"" && quote !== "'") || trimmed[trimmed.length - 1] !== quote) {
    return trimmed;
  }

  const unquoted = trimmed.slice(1, -1);

  return quote === "\""
    ? unquoted.replace(/\\n/g, "\n").replace(/\\"/g, "\"")
    : unquoted;
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

function addCheck(name, ok, details) {
  checks.push({
    details,
    name,
    ok,
  });
}

function getUrl(value, fallback) {
  const raw = (value || fallback).replace(/\/$/, "");

  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

function deriveEnvironment(baseUrl) {
  if (process.env.PERF_ENVIRONMENT) {
    return process.env.PERF_ENVIRONMENT;
  }

  if (!baseUrl) {
    return "unknown";
  }

  if (["localhost", "127.0.0.1", "::1"].includes(baseUrl.hostname)) {
    return "local";
  }

  if (baseUrl.hostname.endsWith(".vercel.app")) {
    return "preview";
  }

  return "production-smoke";
}

function isLocalUrl(url) {
  return Boolean(url && ["localhost", "127.0.0.1", "::1"].includes(url.hostname));
}

function isKnownProductionUrl(url) {
  return Boolean(url && /(^|\.)veloro\.dk$/i.test(url.hostname));
}

function getPort(url, fallbackPort) {
  if (!url) {
    return fallbackPort;
  }

  if (url.port) {
    return Number(url.port);
  }

  return url.protocol === "https:" ? 443 : 80;
}

function checkPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

function runVersionCommand(command, args) {
  return execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

async function checkPlaywright() {
  const { chromium } = require("@playwright/test");
  const browser = await chromium.launch({ headless: true });

  await browser.close();
}

async function checkDatabase(productSlug) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
  });

  try {
    const ping = await pool.query("select 1 as ok");

    if (ping.rows[0]?.ok !== 1) {
      throw new Error("Database did not return the expected ping row.");
    }

    const product = await pool.query(
      `
        select p.id, p.status
        from product p
        left join product_translation pt on pt.product_id = p.id
        where p.slug = $1 or pt.slug = $1
        limit 1
      `,
      [productSlug],
    );

    if (product.rowCount === 0) {
      throw new Error(`No product exists for PERF_PRODUCT_SLUG=${productSlug}.`);
    }

    const status = product.rows[0].status;

    if (!["active", "published"].includes(status)) {
      throw new Error(`Product ${productSlug} exists but is ${status}, not active/published.`);
    }
  } finally {
    await pool.end();
  }
}

async function main() {
  for (const filePath of envFiles) {
    loadEnvFile(filePath);
  }

  const baseUrl = getUrl(process.env.PERF_BASE_URL, defaultBaseUrl);
  const authBaseUrl = getUrl(process.env.PERF_AUTH_BASE_URL, defaultAuthBaseUrl);
  const productSlug = process.env.PERF_PRODUCT_SLUG || defaultProductSlug;
  const environment = deriveEnvironment(baseUrl);
  const missingEnv = [
    "DATABASE_URL",
    "PERF_CUSTOMER_EMAIL",
    "PERF_CUSTOMER_PASSWORD",
  ].filter((key) => !process.env[key]);

  addCheck("PERF_BASE_URL", Boolean(baseUrl), baseUrl ? baseUrl.toString().replace(/\/$/, "") : "invalid URL");
  addCheck(
    "PERF_AUTH_BASE_URL",
    Boolean(authBaseUrl),
    authBaseUrl ? authBaseUrl.toString().replace(/\/$/, "") : "invalid URL",
  );
  addCheck("Required environment variables", missingEnv.length === 0, missingEnv.length > 0
    ? `Missing ${missingEnv.join(", ")}`
    : "DATABASE_URL and disposable customer credentials are present");
  addCheck(
    "Disposable password length",
    !process.env.PERF_CUSTOMER_PASSWORD || process.env.PERF_CUSTOMER_PASSWORD.length >= 15,
    process.env.PERF_CUSTOMER_PASSWORD
      ? "PERF_CUSTOMER_PASSWORD is at least 15 characters for Better Auth"
      : "Skipped until PERF_CUSTOMER_PASSWORD is set",
  );
  addCheck(
    "Mutation environment",
    allowedMutationEnvironments.has(environment)
      && process.env.VERCEL_ENV !== "production"
      && !isKnownProductionUrl(baseUrl)
      && !isKnownProductionUrl(authBaseUrl),
    `PERF_ENVIRONMENT=${environment}`,
  );

  const paymentPrepEnabled = process.env.PERF_CHECKOUT_PAYMENT_PREP === "1";

  addCheck("Stripe payment-prep gate", !paymentPrepEnabled
    || (
      process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")
      && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_test_")
    ), paymentPrepEnabled
    ? "PERF_CHECKOUT_PAYMENT_PREP=1 requires sk_test_ and pk_test_ keys"
    : "Payment prep disabled");

  try {
    const nodeMajor = Number(process.versions.node.split(".")[0]);

    addCheck("Node.js", nodeMajor === 24, `Detected ${process.versions.node}; repo engine is 24.x`);
  } catch (error) {
    addCheck("Node.js", false, error.message);
  }

  try {
    const pnpmVersion = runVersionCommand("pnpm", ["--version"]);

    addCheck("pnpm", Boolean(pnpmVersion), `Detected ${pnpmVersion}`);
  } catch (error) {
    addCheck("pnpm", false, error.message);
  }

  try {
    await checkPlaywright();
    addCheck("Playwright Chromium", true, "Chromium can launch");
  } catch (error) {
    addCheck("Playwright Chromium", false, `${error.message} Run pnpm perf:install-browsers.`);
  }

  if (isLocalUrl(baseUrl) || isLocalUrl(authBaseUrl)) {
    const storefrontPort = getPort(baseUrl, 3000);
    const accountsPort = getPort(authBaseUrl, 3002);
    const storefrontPortFree = await checkPortFree(storefrontPort);
    const accountsPortFree = await checkPortFree(accountsPort);

    addCheck(`Port ${storefrontPort}`, storefrontPortFree, "Storefront next start port must be free");
    addCheck(`Port ${accountsPort}`, accountsPortFree, "Accounts next start port must be free");
  } else {
    addCheck("Local ports", true, "Skipped for non-local PERF_BASE_URL/PERF_AUTH_BASE_URL");
  }

  if (process.env.DATABASE_URL) {
    try {
      await checkDatabase(productSlug);
      addCheck("Database and product slug", true, `${productSlug} exists and is published/active`);
    } catch (error) {
      addCheck("Database and product slug", false, error.message);
    }
  }

  const failed = checks.filter((check) => !check.ok);

  for (const check of checks) {
    const prefix = check.ok ? "[ok]" : "[fail]";

    console.log(`${prefix} ${check.name}: ${check.details}`);
  }

  if (failed.length > 0) {
    console.log(`\nPreflight failed with ${failed.length} issue(s).`);
    process.exit(1);
  }

  console.log("\nPreflight passed. The local performance lab is ready to run.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
