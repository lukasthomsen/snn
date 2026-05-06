import { z } from "zod";

export type SnnApp = "storefront" | "admin" | "auth";
export type DeploymentTarget = "local" | "preview" | "production";

const serverEnvSchema = z.object({
  ADMIN_SUBDOMAIN: z.string().default("admin"),
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_CLIENT_SECRET: z.string().optional(),
  APPLE_KEY_ID: z.string().optional(),
  APPLE_PRIVATE_KEY: z.string().optional(),
  APPLE_TEAM_ID: z.string().optional(),
  AUTH_SUBDOMAIN: z.string().default("accounts"),
  BETTER_AUTH_API_KEY: z.string().optional(),
  BETTER_AUTH_API_URL: z.string().url().optional(),
  BETTER_AUTH_KV_URL: z.string().url().optional(),
  BASE_DOMAIN: z.string().default("veloro.dk"),
  BETTER_AUTH_SECRET: z.string().optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  CLOUDFLARE_IMAGES_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_IMAGES_API_TOKEN: z.string().optional(),
  CLOUDFLARE_IMAGES_DELIVERY_HASH: z.string().optional(),
  CF_TURNSTILE_SECRET_KEY: z.string().optional(),
  DATABASE_URL: z.string().default("postgresql://postgres:postgres@127.0.0.1:5432/snn"),
  DATABASE_URL_UNPOOLED: z.string().optional(),
  ENABLE_MEDIA_MANAGEMENT_IN_PRODUCTION: z.string().optional(),
  ENABLE_THEME_LAB_IN_PRODUCTION: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  LOCAL_ADMIN_ORIGIN: z.string().url().default("http://localhost:3001"),
  LOCAL_AUTH_ORIGIN: z.string().url().default("http://localhost:3002"),
  LOCAL_STOREFRONT_ORIGIN: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  STOREFRONT_SUBDOMAIN: z.string().default("www"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  VERCEL: z.string().optional(),
  VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
  VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
  VERCEL_TARGET_ENV: z.string().optional(),
  VERCEL_URL: z.string().optional(),
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

export function getTurnstileSiteKey() {
  return cachedEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
}

export function getTurnstileSecretKey() {
  return cachedEnv.CF_TURNSTILE_SECRET_KEY;
}

export function getCloudflareImagesConfig() {
  return {
    accountId: cachedEnv.CLOUDFLARE_IMAGES_ACCOUNT_ID,
    apiToken: cachedEnv.CLOUDFLARE_IMAGES_API_TOKEN,
    deliveryHash: cachedEnv.CLOUDFLARE_IMAGES_DELIVERY_HASH,
    enabled: Boolean(
      cachedEnv.CLOUDFLARE_IMAGES_ACCOUNT_ID &&
        cachedEnv.CLOUDFLARE_IMAGES_API_TOKEN &&
        cachedEnv.CLOUDFLARE_IMAGES_DELIVERY_HASH,
    ),
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
