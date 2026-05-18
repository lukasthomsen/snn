import { z } from "zod";

export type SnnApp = "storefront" | "admin" | "auth";
export type DeploymentTarget = "local" | "preview" | "production";

const optionalString = z
  .union([z.string().min(1), z.literal("")])
  .optional()
  .transform((value) => value || undefined);
const optionalUrl = z
  .union([z.string().url(), z.literal("")])
  .optional()
  .transform((value) => value || undefined);
const optionalPositiveInteger = z
  .union([z.coerce.number().int().positive(), z.literal("")])
  .optional()
  .transform((value) => (typeof value === "number" ? value : undefined));

const serverEnvSchema = z.object({
  ADMIN_SUBDOMAIN: z.string().default("admin"),
  APPLE_CLIENT_ID: optionalString,
  APPLE_CLIENT_SECRET: optionalString,
  APPLE_KEY_ID: optionalString,
  APPLE_PRIVATE_KEY: optionalString,
  APPLE_TEAM_ID: optionalString,
  AUTH_SUBDOMAIN: z.string().default("accounts"),
  AUTH_EMAIL_FROM: z.string().default("SNN <accounts@veloro.dk>"),
  AUTH_EMAIL_REPLY_TO: optionalString,
  BETTER_AUTH_API_KEY: optionalString,
  BETTER_AUTH_API_URL: optionalUrl,
  BETTER_AUTH_KV_URL: optionalUrl,
  BASE_DOMAIN: z.string().default("veloro.dk"),
  BETTER_AUTH_SECRET: optionalString,
  BETTER_AUTH_URL: optionalUrl,
  CLOUDFLARE_ACCOUNT_ID: optionalString,
  CLOUDFLARE_API_TOKEN: optionalString,
  CLOUDFLARE_IMAGES_ACCOUNT_ID: optionalString,
  CLOUDFLARE_IMAGES_API_TOKEN: optionalString,
  CLOUDFLARE_IMAGES_DELIVERY_HASH: optionalString,
  CF_TURNSTILE_SECRET_KEY: optionalString,
  AUTH_TURNSTILE_MODE: z.enum(["off", "report", "enforce"]).optional(),
  DATABASE_POOL_CONNECTION_TIMEOUT_MS: optionalPositiveInteger,
  DATABASE_POOL_IDLE_TIMEOUT_MS: optionalPositiveInteger,
  DATABASE_POOL_MAX: optionalPositiveInteger,
  DATABASE_POOL_MAX_USES: optionalPositiveInteger,
  DATABASE_URL: z.string().default("postgresql://postgres:postgres@127.0.0.1:5432/snn"),
  DATABASE_URL_UNPOOLED: optionalString,
  ENABLE_PERFORMANCE_TRACE: optionalString,
  ENABLE_MEDIA_MANAGEMENT_IN_PRODUCTION: optionalString,
  ENABLE_THEME_LAB_IN_PRODUCTION: optionalString,
  GOOGLE_CLIENT_ID: optionalString,
  GOOGLE_CLIENT_SECRET: optionalString,
  LOCAL_ADMIN_ORIGIN: z.string().url().default("http://localhost:3001"),
  LOCAL_AUTH_ORIGIN: z.string().url().default("http://localhost:3002"),
  LOCAL_STOREFRONT_ORIGIN: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalString,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: optionalString,
  RESEND_API_KEY: optionalString,
  STOREFRONT_SUBDOMAIN: z.string().default("www"),
  STRIPE_SECRET_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString,
  VERCEL: optionalString,
  VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
  VERCEL_PROJECT_PRODUCTION_URL: optionalString,
  VERCEL_TARGET_ENV: optionalString,
  VERCEL_URL: optionalString,
});

const cachedEnv = serverEnvSchema.parse(process.env);

const localOrigins = {
  admin: cachedEnv.LOCAL_ADMIN_ORIGIN,
  auth: cachedEnv.LOCAL_AUTH_ORIGIN,
  storefront: cachedEnv.LOCAL_STOREFRONT_ORIGIN,
} satisfies Record<SnnApp, string>;

function getAppHost(app: SnnApp) {
  if (app === "storefront") {
    return `${cachedEnv.STOREFRONT_SUBDOMAIN}.${cachedEnv.BASE_DOMAIN}`;
  }

  if (app === "admin") {
    return `${cachedEnv.ADMIN_SUBDOMAIN}.${cachedEnv.BASE_DOMAIN}`;
  }

  return `${cachedEnv.AUTH_SUBDOMAIN}.${cachedEnv.BASE_DOMAIN}`;
}

export function getServerEnv() {
  return cachedEnv;
}

export function getDeploymentTarget(): DeploymentTarget {
  if (cachedEnv.VERCEL_ENV === "production") {
    return "production";
  }

  if (cachedEnv.VERCEL_ENV === "preview" || cachedEnv.VERCEL_TARGET_ENV === "preview") {
    return "preview";
  }

  return "local";
}

export function getAppOrigin(app: SnnApp) {
  if (getDeploymentTarget() === "local") {
    return localOrigins[app];
  }

  return `https://${getAppHost(app)}`;
}

export function getCanonicalAuthOrigin() {
  return cachedEnv.BETTER_AUTH_URL ?? getAppOrigin("auth");
}

export function getTrustedOrigins() {
  const origins = new Set([
    getAppOrigin("storefront"),
    getAppOrigin("admin"),
    getCanonicalAuthOrigin(),
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "https://*.vercel.app",
  ]);

  if (hasAppleOAuth()) {
    origins.add("https://appleid.apple.com");
  }

  return Array.from(origins);
}

export function getAuthAllowedHosts() {
  const hosts = new Set<string>();

  for (const origin of [
    getAppOrigin("storefront"),
    getAppOrigin("admin"),
    getCanonicalAuthOrigin(),
  ]) {
    hosts.add(new URL(origin).host);
  }

  hosts.add("localhost:3000");
  hosts.add("localhost:3001");
  hosts.add("localhost:3002");
  hosts.add("*.vercel.app");

  return Array.from(hosts);
}

export function getCookieDomain() {
  if (getDeploymentTarget() === "local") {
    return undefined;
  }

  return cachedEnv.BASE_DOMAIN;
}

export function getDatabaseUrl() {
  return cachedEnv.DATABASE_URL;
}

export function getDatabaseMigrationUrl() {
  return cachedEnv.DATABASE_URL_UNPOOLED ?? cachedEnv.DATABASE_URL;
}

export function getDatabasePoolConfig() {
  return {
    connectionTimeoutMillis: cachedEnv.DATABASE_POOL_CONNECTION_TIMEOUT_MS,
    idleTimeoutMillis: cachedEnv.DATABASE_POOL_IDLE_TIMEOUT_MS,
    max: cachedEnv.DATABASE_POOL_MAX,
    maxUses: cachedEnv.DATABASE_POOL_MAX_USES,
  };
}

export function getBetterAuthSecret() {
  return (
    cachedEnv.BETTER_AUTH_SECRET ??
    "snn-local-development-secret-change-me-before-deploying"
  );
}

export function getBetterAuthInfrastructureConfig() {
  return {
    apiKey: cachedEnv.BETTER_AUTH_API_KEY,
    apiUrl: cachedEnv.BETTER_AUTH_API_URL,
    kvUrl: cachedEnv.BETTER_AUTH_KV_URL,
  };
}

export function getAuthEmailConfig() {
  return {
    from: cachedEnv.AUTH_EMAIL_FROM,
    replyTo: cachedEnv.AUTH_EMAIL_REPLY_TO,
    resendApiKey: cachedEnv.RESEND_API_KEY,
  };
}

export function getTurnstileSiteKey() {
  return cachedEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
}

export function getTurnstileSecretKey() {
  return cachedEnv.CF_TURNSTILE_SECRET_KEY;
}

export function getAuthTurnstileMode() {
  if (cachedEnv.AUTH_TURNSTILE_MODE) {
    return cachedEnv.AUTH_TURNSTILE_MODE;
  }

  return getDeploymentTarget() === "production" &&
    cachedEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
    cachedEnv.CF_TURNSTILE_SECRET_KEY
    ? "enforce"
    : "off";
}

export function getCloudflareConfig() {
  return {
    accountId: cachedEnv.CLOUDFLARE_ACCOUNT_ID,
    apiToken: cachedEnv.CLOUDFLARE_API_TOKEN,
  };
}

export function getCloudflareImagesConfig() {
  const accountId =
    cachedEnv.CLOUDFLARE_IMAGES_ACCOUNT_ID ?? cachedEnv.CLOUDFLARE_ACCOUNT_ID;
  const apiToken =
    cachedEnv.CLOUDFLARE_IMAGES_API_TOKEN ?? cachedEnv.CLOUDFLARE_API_TOKEN;

  return {
    accountId,
    apiToken,
    deliveryHash: cachedEnv.CLOUDFLARE_IMAGES_DELIVERY_HASH,
    enabled: Boolean(accountId && apiToken && cachedEnv.CLOUDFLARE_IMAGES_DELIVERY_HASH),
  };
}

function isEnabledFlag(value: string | undefined) {
  return value === "1" || value === "true";
}

export function isMediaManagementEnabled() {
  if (getDeploymentTarget() !== "production") {
    return true;
  }

  return isEnabledFlag(cachedEnv.ENABLE_MEDIA_MANAGEMENT_IN_PRODUCTION);
}

export function isThemeLabEnabled() {
  if (getDeploymentTarget() !== "production") {
    return true;
  }

  return isEnabledFlag(cachedEnv.ENABLE_THEME_LAB_IN_PRODUCTION);
}

export function getStripePublishableKey() {
  return cachedEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}

export function getStripeSecretKey() {
  return cachedEnv.STRIPE_SECRET_KEY;
}

export function getStripeWebhookSecret() {
  return cachedEnv.STRIPE_WEBHOOK_SECRET;
}

export function hasGoogleOAuth() {
  return Boolean(cachedEnv.GOOGLE_CLIENT_ID && cachedEnv.GOOGLE_CLIENT_SECRET);
}

export function hasAppleOAuth() {
  return Boolean(
    cachedEnv.APPLE_CLIENT_ID &&
      (cachedEnv.APPLE_CLIENT_SECRET ||
        (cachedEnv.APPLE_TEAM_ID &&
          cachedEnv.APPLE_KEY_ID &&
          cachedEnv.APPLE_PRIVATE_KEY)),
  );
}

export function getVercelMetadata() {
  return {
    deploymentTarget: getDeploymentTarget(),
    productionUrl: cachedEnv.VERCEL_PROJECT_PRODUCTION_URL,
    runtimeHostname: cachedEnv.VERCEL_URL,
  };
}
