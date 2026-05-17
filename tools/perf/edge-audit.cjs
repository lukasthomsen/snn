const dns = require("node:dns").promises;
const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

const repoRoot = process.cwd();
const outputDir = path.join(repoRoot, "perf-reports", "edge");
const jsonReportPath = path.join(outputDir, "edge-audit.json");
const markdownReportPath = path.join(repoRoot, "docs", "performance", "step-2-edge-setup.md");
const envFiles = [
  ".env.local",
  path.join("apps", "storefront", ".env.local"),
  path.join("apps", "accounts", ".env.local"),
  path.join("apps", "admin", ".env.local"),
];
const defaultVariants = {
  thumb: {
    neverRequireSignedURLs: true,
    options: { fit: "cover", height: 240, metadata: "none", width: 240 },
  },
  productcard: {
    neverRequireSignedURLs: true,
    options: { fit: "cover", height: 1200, metadata: "none", width: 960 },
  },
  pdpgallery: {
    neverRequireSignedURLs: true,
    options: { fit: "contain", height: 1600, metadata: "none", width: 1600 },
  },
  pdpzoom: {
    neverRequireSignedURLs: true,
    options: { fit: "contain", height: 2400, metadata: "keep", width: 2400 },
  },
  hero: {
    neverRequireSignedURLs: true,
    options: { fit: "cover", height: 1800, metadata: "none", width: 2400 },
  },
};
const imageVariantNames = Object.keys(defaultVariants);
const selectedHeaders = [
  "cache-control",
  "cf-cache-status",
  "cf-ray",
  "content-type",
  "location",
  "server",
  "set-cookie",
  "strict-transport-security",
  "vary",
  "x-matched-path",
  "x-vercel-cache",
  "x-vercel-id",
];
const requiredVercelEnvKeys = [
  "BASE_DOMAIN",
  "CLOUDFLARE_IMAGES_DELIVERY_HASH",
  "CF_TURNSTILE_SECRET_KEY",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
];
const bypassRules = [
  "Bypass every request with a Cookie header.",
  "Bypass every request with an Authorization header.",
  "Bypass /api/*, including media routes and Stripe webhooks.",
  "Bypass /cart, /checkout, /wishlist, /account, /sign-in, and /sign-up.",
  "Bypass accounts and admin hostnames entirely.",
  "Respect origin Cache-Control for static public pages and assets only.",
];

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

function getEnv() {
  for (const filePath of envFiles) {
    loadEnvFile(filePath);
  }

  const baseDomain = process.env.BASE_DOMAIN || "veloro.dk";
  const storefrontHost = `${process.env.STOREFRONT_SUBDOMAIN || "www"}.${baseDomain}`;
  const accountsHost = `${process.env.AUTH_SUBDOMAIN || "accounts"}.${baseDomain}`;
  const adminHost = `${process.env.ADMIN_SUBDOMAIN || "admin"}.${baseDomain}`;

  return {
    accountsHost,
    adminHost,
    baseDomain,
    storefrontHost,
  };
}

function statusRank(status) {
  return {
    fail: 3,
    warn: 2,
    pass: 1,
    skip: 0,
  }[status] ?? 0;
}

function worstStatus(rows) {
  return rows.reduce((worst, row) => (
    statusRank(row.status) > statusRank(worst) ? row.status : worst
  ), "skip");
}

function hasValue(value) {
  return typeof value === "string" && value.length > 0;
}

function redact(value, visible = 4) {
  if (!value) {
    return undefined;
  }

  if (value.length <= visible * 2) {
    return `${value[0] ?? ""}...`;
  }

  return `${value.slice(0, visible)}...${value.slice(-visible)}`;
}

function headerSubset(headers) {
  const subset = {};

  for (const name of selectedHeaders) {
    const value = headers.get(name);

    if (value) {
      subset[name] = name === "set-cookie" ? "[present]" : value;
    }
  }

  return subset;
}

function absoluteRedirectUrl(currentUrl, location) {
  if (!location) {
    return undefined;
  }

  return new URL(location, currentUrl).toString();
}

function isVercelHeader(headers) {
  const server = headers.server ?? "";

  return /vercel/i.test(server) || Boolean(headers["x-vercel-id"]);
}

function isCloudflareHeader(headers) {
  const server = headers.server ?? "";

  return /cloudflare/i.test(server) || Boolean(headers["cf-ray"]);
}

async function fetchWithTimeout(url, init = {}, timeoutMs = 15_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      headers: {
        "user-agent": "snn-edge-audit/1.0",
        ...(init.headers ?? {}),
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchChain(url, method = "HEAD", maxRedirects = 5) {
  const chain = [];
  let currentUrl = url;

  for (let redirectIndex = 0; redirectIndex <= maxRedirects; redirectIndex += 1) {
    const response = await fetchWithTimeout(currentUrl, {
      method,
      redirect: "manual",
    });
    const headers = headerSubset(response.headers);
    const nextUrl = absoluteRedirectUrl(currentUrl, response.headers.get("location"));

    chain.push({
      headers,
      status: response.status,
      url: currentUrl,
    });

    if (!nextUrl || response.status < 300 || response.status >= 400) {
      break;
    }

    currentUrl = nextUrl;
  }

  return {
    chain,
    final: chain[chain.length - 1],
  };
}

async function resolveMaybe(type, host) {
  try {
    if (type === "A") {
      return await dns.resolve4(host);
    }

    if (type === "AAAA") {
      return await dns.resolve6(host);
    }

    if (type === "CNAME") {
      return await dns.resolveCname(host);
    }

    if (type === "NS") {
      return await dns.resolveNs(host);
    }
  } catch (error) {
    if (error.code === "ENODATA" || error.code === "ENOTFOUND" || error.code === "ENODOMAIN") {
      return [];
    }

    return [`error:${error.code ?? error.message}`];
  }

  return [];
}

async function auditHost(hostConfig) {
  const [aRecords, aaaaRecords, cnameRecords] = await Promise.all([
    resolveMaybe("A", hostConfig.host),
    resolveMaybe("AAAA", hostConfig.host),
    resolveMaybe("CNAME", hostConfig.host),
  ]);
  const http = await fetchChain(`https://${hostConfig.host}/`, "HEAD");
  const finalHeaders = http.final?.headers ?? {};
  const hasVercel = isVercelHeader(finalHeaders);
  const hasCloudflare = isCloudflareHeader(finalHeaders);
  const status = hasVercel && !hasCloudflare ? "pass" : "fail";

  return {
    ...hostConfig,
    dns: {
      a: aRecords,
      aaaa: aaaaRecords,
      cname: cnameRecords,
    },
    http,
    status,
    summary: hasCloudflare
      ? "Cloudflare proxy headers detected on a page hostname."
      : hasVercel
        ? "Traffic reaches Vercel directly."
        : "Vercel headers were not detected.",
  };
}

async function auditRoute(route) {
  try {
    const response = await fetchChain(route.url, "HEAD");
    const final = response.final;
    const headers = final?.headers ?? {};
    const statusCode = final?.status ?? 0;
    const expectedStatus = route.expectedStatuses.includes(statusCode);
    const hasVercel = isVercelHeader(headers);
    const hasCloudflare = isCloudflareHeader(headers);
    const status = expectedStatus && hasVercel && !hasCloudflare
      ? "pass"
      : !expectedStatus || hasCloudflare
        ? "fail"
        : "warn";

    return {
      ...route,
      expectedStatus,
      hasCloudflare,
      hasVercel,
      response,
      status,
    };
  } catch (error) {
    return {
      ...route,
      error: error.message,
      status: "fail",
    };
  }
}

function extractImageUrls(html) {
  const matches = html.match(/https:\/\/imagedelivery\.net\/[^"'<>\\\s]+/g) ?? [];

  return Array.from(new Set(matches.map((url) => url.replace(/&amp;/g, "&"))));
}

async function readLiveImageUrls(urls) {
  const found = new Set();

  for (const url of urls) {
    try {
      const response = await fetchWithTimeout(url, {
        method: "GET",
        redirect: "follow",
      });
      const contentType = response.headers.get("content-type") ?? "";

      if (!contentType.includes("text/html")) {
        continue;
      }

      const html = await response.text();

      for (const imageUrl of extractImageUrls(html)) {
        found.add(imageUrl);
      }
    } catch {
      // Route failures are reported separately; image discovery can fall back to the database.
    }
  }

  return Array.from(found);
}

async function readDatabaseImageUrls() {
  if (!process.env.DATABASE_URL) {
    return {
      rows: [],
      skipped: "DATABASE_URL is not configured.",
    };
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
  });

  try {
    const result = await pool.query(`
      select provider_asset_id, delivery_url
      from media_asset
      where provider = 'cloudflare_images'
        and delivery_url like 'https://imagedelivery.net/%'
      order by updated_at desc
      limit 12
    `);

    return {
      rows: result.rows,
    };
  } catch (error) {
    return {
      error: error.message,
      rows: [],
    };
  } finally {
    await pool.end();
  }
}

async function readCloudflareImageIds() {
  const accountId = process.env.CLOUDFLARE_IMAGES_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    return {
      rows: [],
      skipped: "Cloudflare Images API credentials are not configured.",
    };
  }

  try {
    const response = await cloudflareRequest("/images/v1?per_page=12", accountId, apiToken);

    if (!response.ok || !response.body?.success) {
      return {
        error: `Cloudflare Images list returned HTTP ${response.status}.`,
        rows: [],
      };
    }

    const result = response.body.result;
    const images = Array.isArray(result?.images)
      ? result.images
      : Array.isArray(result)
        ? result
        : [];

    return {
      rows: images
        .map((image) => image.id)
        .filter(Boolean)
        .map((providerAssetId) => ({
          provider_asset_id: providerAssetId,
        })),
    };
  } catch (error) {
    return {
      error: error.message,
      rows: [],
    };
  }
}

function parseImageDeliveryUrl(url) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname !== "imagedelivery.net") {
      return null;
    }

    const [deliveryHash, imageId, variant] = parsed.pathname.split("/").filter(Boolean);

    if (!deliveryHash || !imageId || !variant) {
      return null;
    }

    return {
      deliveryHash,
      imageId,
      variant,
    };
  } catch {
    return null;
  }
}

function buildImageSamples(liveUrls, databaseRows, apiRows, deliveryHash) {
  const samples = new Set(liveUrls);

  for (const row of databaseRows) {
    if (row.delivery_url) {
      samples.add(row.delivery_url);
    }

    if (deliveryHash && row.provider_asset_id) {
      samples.add(`https://imagedelivery.net/${deliveryHash}/${row.provider_asset_id}/productcard`);
    }
  }

  for (const row of apiRows) {
    if (deliveryHash && row.provider_asset_id) {
      samples.add(`https://imagedelivery.net/${deliveryHash}/${row.provider_asset_id}/productcard`);
    }
  }

  return Array.from(samples).slice(0, 12);
}

async function auditImageUrl(url, expectedHash) {
  try {
    const parsed = parseImageDeliveryUrl(url);
    const response = await fetchChain(url, "HEAD", 2);
    const final = response.final;
    const headers = final?.headers ?? {};
    const hashMatches = expectedHash ? parsed?.deliveryHash === expectedHash : undefined;
    const cloudflare = isCloudflareHeader(headers);
    const imageContent = (headers["content-type"] ?? "").startsWith("image/");
    const okStatus = (final?.status ?? 0) >= 200 && (final?.status ?? 0) < 400;
    const status = okStatus && cloudflare && imageContent && hashMatches !== false ? "pass" : "fail";

    return {
      contentType: headers["content-type"],
      hashMatches,
      parsed: parsed
        ? {
            deliveryHash: redact(parsed.deliveryHash, 5),
            imageId: redact(parsed.imageId, 5),
            variant: parsed.variant,
          }
        : null,
      response,
      status,
      url: parsed
        ? `https://imagedelivery.net/${redact(parsed.deliveryHash, 5)}/${redact(parsed.imageId, 5)}/${parsed.variant}`
        : url,
    };
  } catch (error) {
    return {
      error: error.message,
      status: "fail",
      url,
    };
  }
}

async function cloudflareRequest(pathname, accountId, token) {
  const response = await fetchWithTimeout(`https://api.cloudflare.com/client/v4/accounts/${accountId}${pathname}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
    method: "GET",
  });
  const text = await response.text();
  let body = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text.slice(0, 500) };
    }
  }

  return {
    body,
    ok: response.ok,
    status: response.status,
  };
}

function normalizeCloudflareVariants(result) {
  if (!result) {
    return [];
  }

  if (Array.isArray(result)) {
    return result;
  }

  if (result.variants && typeof result.variants === "object") {
    return Object.values(result.variants);
  }

  return [];
}

function compareVariant(actual, expected) {
  if (!actual) {
    return false;
  }

  const options = actual.options ?? {};

  return actual.neverRequireSignedURLs === expected.neverRequireSignedURLs
    && options.fit === expected.options.fit
    && options.metadata === expected.options.metadata
    && options.width === expected.options.width
    && options.height === expected.options.height;
}

async function auditCloudflareApi() {
  const imageAccountId = process.env.CLOUDFLARE_IMAGES_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
  const imageApiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const images = {
    status: "skip",
    summary: "Cloudflare Images API credentials are not configured.",
  };
  const turnstile = {
    status: "skip",
    summary: "Cloudflare account API credentials are not configured.",
  };

  if (imageAccountId && imageApiToken) {
    try {
      const response = await cloudflareRequest("/images/v1/variants", imageAccountId, imageApiToken);

      if (!response.ok || !response.body?.success) {
        images.status = "warn";
        images.summary = `Cloudflare Images variants API returned HTTP ${response.status}.`;
        images.httpStatus = response.status;
      } else {
        const variants = normalizeCloudflareVariants(response.body.result);
        const byId = new Map(variants.map((variant) => [variant.id, variant]));
        const checks = imageVariantNames.map((id) => ({
          id,
          matchesDefinition: compareVariant(byId.get(id), defaultVariants[id]),
          present: byId.has(id),
        }));

        images.status = checks.every((check) => check.present && check.matchesDefinition) ? "pass" : "warn";
        images.summary = images.status === "pass"
          ? "All expected Cloudflare Images variants are present and match repo definitions."
          : "One or more Cloudflare Images variants are missing or differ from repo definitions.";
        images.variants = checks;
      }
    } catch (error) {
      images.status = "warn";
      images.summary = error.message;
    }
  }

  if (accountId && apiToken) {
    try {
      const response = await cloudflareRequest("/challenges/widgets", accountId, apiToken);

      if (!response.ok || !response.body?.success) {
        turnstile.status = "warn";
        turnstile.summary = `Cloudflare Turnstile widgets API returned HTTP ${response.status}.`;
        turnstile.httpStatus = response.status;
      } else {
        const widgets = Array.isArray(response.body.result) ? response.body.result : [];

        turnstile.status = "pass";
        turnstile.summary = `Cloudflare Turnstile API returned ${widgets.length} widget(s).`;
        turnstile.widgets = widgets.map((widget) => ({
          domains: widget.domains ?? widget.hostnames ?? [],
          mode: widget.mode,
          name: widget.name,
        }));
      }
    } catch (error) {
      turnstile.status = "warn";
      turnstile.summary = error.message;
    }
  }

  return {
    images,
    turnstile,
  };
}

async function vercelRequest(pathname, token, query) {
  const url = new URL(`https://api.vercel.com${pathname}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value) {
        url.searchParams.set(key, value);
      }
    }
  }

  const response = await fetchWithTimeout(url.toString(), {
    headers: {
      authorization: `Bearer ${token}`,
    },
    method: "GET",
  });
  const text = await response.text();
  let body = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text.slice(0, 500) };
    }
  }

  return {
    body,
    ok: response.ok,
    status: response.status,
  };
}

async function auditVercelProject(projectId, expectedDomains, teamId, token) {
  const result = {
    domains: [],
    envKeys: [],
    expectedDomains,
    projectId: redact(projectId, 6),
    status: "skip",
  };

  try {
    const domains = await vercelRequest(`/v9/projects/${projectId}/domains`, token, { teamId });

    if (!domains.ok) {
      result.status = "warn";
      result.summary = `Domain API returned HTTP ${domains.status}.`;
      return result;
    }

    const assignedDomains = domains.body?.domains ?? [];

    result.domains = assignedDomains.map((domain) => ({
      name: domain.name,
      verified: domain.verified,
    }));

    const assignedDomainNames = new Set(result.domains.map((domain) => domain.name));
    const allExpectedDomainsAssigned = expectedDomains.every((domain) => assignedDomainNames.has(domain));
    const env = await vercelRequest(`/v10/projects/${projectId}/env`, token, { teamId });

    if (env.ok) {
      const envRows = env.body?.envs ?? [];
      const envKeys = new Set(envRows.map((row) => row.key));

      result.envKeys = requiredVercelEnvKeys.map((key) => ({
        key,
        present: envKeys.has(key),
      }));
    } else {
      result.envKeys = requiredVercelEnvKeys.map((key) => ({
        key,
        present: "unknown",
      }));
      result.envSummary = `Env API returned HTTP ${env.status}.`;
    }

    result.status = allExpectedDomainsAssigned ? "pass" : "warn";
    result.summary = allExpectedDomainsAssigned
      ? "Expected production domains are assigned to the project."
      : "One or more expected production domains are not assigned to the project.";
  } catch (error) {
    result.status = "warn";
    result.summary = error.message;
  }

  return result;
}

async function auditVercelApi(env) {
  const token = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_ORG_ID;
  const projectConfigs = [
    {
      expectedDomains: [env.baseDomain, env.storefrontHost],
      id: process.env.VERCEL_STOREFRONT_PROJECT_ID,
      name: "storefront",
    },
    {
      expectedDomains: [env.accountsHost],
      id: process.env.VERCEL_ACCOUNTS_PROJECT_ID,
      name: "accounts",
    },
    {
      expectedDomains: [env.adminHost],
      id: process.env.VERCEL_ADMIN_PROJECT_ID,
      name: "admin",
    },
  ];

  if (!token) {
    return {
      projects: [],
      status: "skip",
      summary: "VERCEL_TOKEN is not configured.",
    };
  }

  const availableProjects = projectConfigs.filter((project) => project.id);

  if (availableProjects.length === 0) {
    return {
      projects: [],
      status: "skip",
      summary: "No VERCEL_*_PROJECT_ID values are configured.",
    };
  }

  const projects = [];

  for (const project of availableProjects) {
    projects.push({
      name: project.name,
      ...(await auditVercelProject(project.id, project.expectedDomains, teamId, token)),
    });
  }

  return {
    projects,
    status: worstStatus(projects),
    summary: `${projects.length} Vercel project(s) checked with read-only API calls.`,
  };
}

function auditTurnstileConfig(authHtml, sourceText) {
  const hasSiteKey = hasValue(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const hasSecretKey = hasValue(process.env.CF_TURNSTILE_SECRET_KEY);
  const pairStatus = hasSiteKey === hasSecretKey ? "pass" : "fail";
  const authLoadsScript = /challenges\.cloudflare\.com\/turnstile/.test(authHtml);
  const authHasSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    ? authHtml.includes(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)
    : false;
  const sourceHasSiteverify = /challenges\.cloudflare\.com\/turnstile\/v0\/siteverify/.test(sourceText);
  const sourceExportsValidation = /validateTurnstileToken/.test(sourceText);
  const status = pairStatus === "fail"
    ? "fail"
    : sourceHasSiteverify && sourceExportsValidation
      ? "pass"
      : "warn";

  return {
    authPage: authLoadsScript || authHasSiteKey
      ? "Turnstile widget appears on the production auth page."
      : "Foundation configured, widget not active yet.",
    keyPair: {
      hasSecretKey,
      hasSiteKey,
      status: pairStatus,
    },
    serverValidation: {
      hasSiteverifyEndpoint: sourceHasSiteverify,
      hasValidationExport: sourceExportsValidation,
    },
    status,
  };
}

function readTurnstileSource() {
  const filePath = path.join(repoRoot, "packages", "auth", "src", "turnstile.ts");

  if (!fs.existsSync(filePath)) {
    return "";
  }

  return fs.readFileSync(filePath, "utf8");
}

async function readAuthHtml(accountsHost) {
  try {
    const response = await fetchWithTimeout(`https://${accountsHost}/da/sign-in`, {
      method: "GET",
      redirect: "follow",
    });

    return await response.text();
  } catch {
    return "";
  }
}

function markdownTable(headers, rows) {
  if (rows.length === 0) {
    return "_No rows._";
  }

  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function formatStatus(status) {
  return status.toUpperCase();
}

function formatHeader(value) {
  if (!value) {
    return "-";
  }

  return String(value).replace(/\|/g, "\\|");
}

function buildFindings(report) {
  const findings = [];

  for (const host of report.hosts) {
    if (host.status !== "pass") {
      findings.push(`${host.host}: ${host.summary}`);
    }
  }

  for (const route of report.routes) {
    if (route.status !== "pass") {
      findings.push(`${route.name}: expected ${route.expectedStatuses.join("/")} and direct Vercel, got ${route.response?.final?.status ?? "error"}.`);
    }
  }

  if (report.images.status !== "pass") {
    findings.push(`Cloudflare Images: ${report.images.summary}`);
  }

  if (report.turnstile.status !== "pass") {
    findings.push("Turnstile keys/server validation need attention.");
  }

  if (report.docs.status !== "pass") {
    findings.push(report.docs.summary);
  }

  return findings;
}

function buildMarkdown(report) {
  const generatedAt = report.generatedAt;
  const findings = buildFindings(report);
  const hostRows = report.hosts.map((host) => [
    host.name,
    host.host,
    formatStatus(host.status),
    host.dns.a.join(", ") || "-",
    host.dns.cname.join(", ") || "-",
    formatHeader(host.http.final?.headers.server),
    formatHeader(host.http.final?.headers["x-vercel-id"]),
    formatHeader(host.http.final?.headers["cf-ray"]),
  ]);
  const routeRows = report.routes.map((route) => [
    route.name,
    formatStatus(route.status),
    String(route.response?.final?.status ?? "-"),
    formatHeader(route.response?.final?.headers["cache-control"]),
    formatHeader(route.response?.final?.headers["x-vercel-cache"]),
    formatHeader(route.response?.final?.headers.server),
    formatHeader(route.response?.final?.headers["cf-ray"]),
  ]);
  const imageRows = report.images.samples.map((sample) => [
    formatStatus(sample.status),
    sample.url,
    String(sample.response?.final?.status ?? "-"),
    formatHeader(sample.contentType),
    formatHeader(sample.response?.final?.headers.server),
    formatHeader(sample.response?.final?.headers["cf-ray"]),
  ]);
  const checkRows = [
    ["DNS/host headers", formatStatus(worstStatus(report.hosts)), "Page hostnames should resolve to Vercel and avoid Cloudflare proxy headers."],
    ["Public routes", formatStatus(worstStatus(report.routes)), "Routes should return expected statuses with Vercel headers."],
    ["Cloudflare Images", formatStatus(report.images.status), report.images.summary],
    ["Turnstile", formatStatus(report.turnstile.status), report.turnstile.authPage],
    ["Cloudflare API", formatStatus(report.cloudflareApi.status), report.cloudflareApi.summary],
    ["Vercel API", formatStatus(report.vercelApi.status), report.vercelApi.summary],
    ["Docs", formatStatus(report.docs.status), report.docs.summary],
  ];

  return `# Step 2 Edge Setup Audit

Generated: ${generatedAt}

## Summary

Target state: Vercel is the primary page CDN/reverse proxy path. Cloudflare is used for Images and Turnstile only.

Overall status: **${formatStatus(report.status)}**

${findings.length > 0 ? findings.map((finding) => `- ${finding}`).join("\n") : "- No blocking edge setup issues found."}

## Check Summary

${markdownTable(["Area", "Status", "Result"], checkRows)}

## DNS And Page Host Headers

Nameservers for \`${report.env.baseDomain}\`: ${report.nameservers.join(", ") || "-"}

${markdownTable(
  ["Name", "Host", "Status", "A", "CNAME", "Server", "x-vercel-id", "cf-ray"],
  hostRows,
)}

## Public Route Headers

${markdownTable(
  ["Route", "Status", "HTTP", "Cache-Control", "x-vercel-cache", "Server", "cf-ray"],
  routeRows,
)}

## Cloudflare Images

Configured delivery hash: ${report.images.hasDeliveryHash ? "present" : "missing"}

${markdownTable(
  ["Status", "Sample URL", "HTTP", "Content-Type", "Server", "cf-ray"],
  imageRows,
)}

Cloudflare Images API: ${report.cloudflareApi.images.summary}

## Turnstile

- Key pair: ${report.turnstile.keyPair.hasSiteKey ? "site key present" : "site key missing"} / ${report.turnstile.keyPair.hasSecretKey ? "secret key present" : "secret key missing"}
- Auth page: ${report.turnstile.authPage}
- Server validation: ${report.turnstile.serverValidation.hasSiteverifyEndpoint && report.turnstile.serverValidation.hasValidationExport ? "wired to Siteverify" : "not fully wired"}
- Cloudflare API: ${report.cloudflareApi.turnstile.summary}

## Optional Vercel API

${report.vercelApi.projects.length > 0
  ? markdownTable(
    ["Project", "Status", "Summary"],
    report.vercelApi.projects.map((project) => [
      project.name,
      formatStatus(project.status),
      project.summary ?? "-",
    ]),
  )
  : report.vercelApi.summary}

## Proxy Contingency Only

Do not enable Cloudflare proxying in front of Vercel for page domains under the current target state. If that decision changes later, create Cloudflare Cache Rules that:

${bypassRules.map((rule) => `- ${rule}`).join("\n")}

## Sources

- Vercel Cloudflare guidance: https://vercel.com/kb/guide/cloudflare-with-vercel
- Cloudflare Cache Rules: https://developers.cloudflare.com/cache/how-to/cache-rules/settings/
- Cloudflare Images variants: https://developers.cloudflare.com/images/optimization/hosted-images/create-variants/
- Cloudflare Images delivery: https://developers.cloudflare.com/images/optimization/hosted-images/serve-uploaded-images/
- Cloudflare Turnstile server validation: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
`;
}

function auditDocs() {
  const turnstilePath = path.join(repoRoot, "docs", "setup", "cloudflare-turnstile.md");
  const turnstileDoc = fs.existsSync(turnstilePath) ? fs.readFileSync(turnstilePath, "utf8") : "";
  const claimsAuthoritativeDns = /authoritative DNS/i.test(turnstileDoc);

  return {
    status: claimsAuthoritativeDns ? "fail" : "pass",
    summary: claimsAuthoritativeDns
      ? "Cloudflare docs still claim authoritative DNS."
      : "Cloudflare docs describe Vercel-primary page delivery.",
  };
}

async function main() {
  const env = getEnv();
  const hostConfigs = [
    { host: env.baseDomain, name: "apex" },
    { host: env.storefrontHost, name: "storefront" },
    { host: env.accountsHost, name: "accounts" },
    { host: env.adminHost, name: "admin" },
  ];
  const routeConfigs = [
    { expectedStatuses: [200], name: "storefront.home", url: `https://${env.storefrontHost}/da` },
    { expectedStatuses: [200], name: "storefront.product-listing", url: `https://${env.storefrontHost}/da/products` },
    { expectedStatuses: [200], name: "storefront.product-detail", url: `https://${env.storefrontHost}/da/products/essential-creatine-monohydrate` },
    { expectedStatuses: [200, 302, 307, 308], name: "storefront.cart", url: `https://${env.storefrontHost}/da/cart` },
    { expectedStatuses: [200, 302, 307, 308], name: "storefront.checkout", url: `https://${env.storefrontHost}/da/checkout` },
    { expectedStatuses: [200, 302, 307, 308], name: "storefront.wishlist", url: `https://${env.storefrontHost}/da/wishlist` },
    { expectedStatuses: [200], name: "accounts.sign-in", url: `https://${env.accountsHost}/da/sign-in` },
    { expectedStatuses: [200, 302, 307, 308], name: "admin.home", url: `https://${env.adminHost}/da` },
  ];
  const nameservers = await resolveMaybe("NS", env.baseDomain);
  const hosts = [];

  for (const hostConfig of hostConfigs) {
    hosts.push(await auditHost(hostConfig));
  }

  const routes = [];

  for (const routeConfig of routeConfigs) {
    routes.push(await auditRoute(routeConfig));
  }

  const liveImageUrls = await readLiveImageUrls(routeConfigs.slice(0, 3).map((route) => route.url));
  const databaseImages = await readDatabaseImageUrls();
  const cloudflareImages = await readCloudflareImageIds();
  const deliveryHash = process.env.CLOUDFLARE_IMAGES_DELIVERY_HASH;
  const imageSamples = buildImageSamples(liveImageUrls, databaseImages.rows, cloudflareImages.rows, deliveryHash);
  const sampleAudits = [];

  for (const imageUrl of imageSamples) {
    sampleAudits.push(await auditImageUrl(imageUrl, deliveryHash));
  }

  const imageStatus = sampleAudits.length === 0
    ? "warn"
    : worstStatus(sampleAudits);
  const cloudflareApi = await auditCloudflareApi();
  const vercelApi = await auditVercelApi(env);
  const authHtml = await readAuthHtml(env.accountsHost);
  const turnstile = auditTurnstileConfig(authHtml, readTurnstileSource());
  const docs = auditDocs();
  const report = {
    cloudflareApi: {
      ...cloudflareApi,
      status: worstStatus([cloudflareApi.images, cloudflareApi.turnstile]),
      summary: [cloudflareApi.images.summary, cloudflareApi.turnstile.summary].join(" "),
    },
    docs,
    env: {
      accountsHost: env.accountsHost,
      adminHost: env.adminHost,
      baseDomain: env.baseDomain,
      storefrontHost: env.storefrontHost,
    },
    generatedAt: new Date().toISOString(),
    hosts,
    images: {
      database: {
        error: databaseImages.error,
        rows: databaseImages.rows.length,
        skipped: databaseImages.skipped,
      },
      cloudflareApi: {
        error: cloudflareImages.error,
        rows: cloudflareImages.rows.length,
        skipped: cloudflareImages.skipped,
      },
      hasDeliveryHash: Boolean(deliveryHash),
      liveUrls: liveImageUrls.length,
      samples: sampleAudits,
      status: deliveryHash && sampleAudits.length > 0 ? imageStatus : "warn",
      summary: deliveryHash
        ? sampleAudits.length > 0
          ? `${sampleAudits.length} Cloudflare Images sample(s) checked.`
          : "Delivery hash is present, but no image URLs were found in live HTML or the database."
        : "CLOUDFLARE_IMAGES_DELIVERY_HASH is missing.",
    },
    nameservers,
    routes,
    status: "skip",
    target: "vercel-primary",
    turnstile,
    vercelApi,
  };

  report.status = worstStatus([
    ...report.hosts,
    ...report.routes,
    report.images,
    report.turnstile,
    report.docs,
  ]);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(path.dirname(markdownReportPath), { recursive: true });
  fs.writeFileSync(jsonReportPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(markdownReportPath, buildMarkdown(report));

  console.log(`Wrote ${path.relative(repoRoot, jsonReportPath)}`);
  console.log(`Wrote ${path.relative(repoRoot, markdownReportPath)}`);
  console.log(`Overall status: ${formatStatus(report.status)}`);

  if (process.env.PERF_EDGE_STRICT === "1" && report.status === "fail") {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
