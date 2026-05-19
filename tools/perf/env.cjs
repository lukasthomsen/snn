const fs = require("node:fs");
const path = require("node:path");

const defaultPerfEnvFiles = [
  path.join("apps", "storefront", ".env.local"),
  path.join("apps", "accounts", ".env.local"),
  path.join("apps", "admin", ".env.local"),
  ".env.local",
];

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

function loadEnvFile(filePath, options = {}) {
  const repoRoot = options.repoRoot ?? process.cwd();
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

function loadPerfEnv(options = {}) {
  const files = options.files ?? defaultPerfEnvFiles;

  for (const filePath of files) {
    loadEnvFile(filePath, options);
  }

  normalizeDatabaseSslEnv("DATABASE_URL");
  normalizeDatabaseSslEnv("DATABASE_URL_UNPOOLED");
}

function normalizeDatabaseSslEnv(key) {
  if (!process.env[key]) {
    return;
  }

  process.env[key] = normalizeDatabaseSslMode(process.env[key]);
}

function normalizeDatabaseSslMode(value) {
  try {
    const url = new URL(value);
    const sslMode = url.searchParams.get("sslmode");

    if (sslMode && ["prefer", "require", "verify-ca"].includes(sslMode)) {
      url.searchParams.set("sslmode", "verify-full");
      return url.toString();
    }
  } catch {
    return value;
  }

  return value;
}

module.exports = {
  defaultPerfEnvFiles,
  loadEnvFile,
  loadPerfEnv,
  normalizeDatabaseSslMode,
  stripOuterQuotes,
};
