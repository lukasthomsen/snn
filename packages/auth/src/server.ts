import { SignJWT, importPKCS8 } from "jose";

import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";

import {
  getAuthAllowedHosts,
  getBetterAuthSecret,
  getCanonicalAuthOrigin,
  getCookieDomain,
  getDeploymentTarget,
  getServerEnv,
  getTrustedOrigins,
  hasAppleOAuth,
  hasGoogleOAuth,
} from "@veloro/config";
import { getDb, schema } from "@veloro/db";

type BetterAuthOptions = Parameters<typeof betterAuth>[0];

async function buildAppleClientSecret() {
  const env = getServerEnv();

  if (env.APPLE_CLIENT_SECRET) {
    return env.APPLE_CLIENT_SECRET;
  }

  if (!env.APPLE_PRIVATE_KEY || !env.APPLE_KEY_ID || !env.APPLE_TEAM_ID || !env.APPLE_CLIENT_ID) {
    return undefined;
  }

  const key = await importPKCS8(env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n"), "ES256");
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({})
    .setProtectedHeader({
      alg: "ES256",
      kid: env.APPLE_KEY_ID,
    })
    .setIssuer(env.APPLE_TEAM_ID)
    .setAudience("https://appleid.apple.com")
    .setSubject(env.APPLE_CLIENT_ID)
    .setIssuedAt(now)
    .setExpirationTime(now + 60 * 60 * 24 * 180)
    .sign(key);
}

async function buildSocialProviders() {
  const env = getServerEnv();
  const socialProviders: NonNullable<BetterAuthOptions["socialProviders"]> = {};

  if (hasGoogleOAuth() && env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    socialProviders.google = {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    };
  }

  if (hasAppleOAuth() && env.APPLE_CLIENT_ID) {
    const clientSecret = await buildAppleClientSecret();

    if (clientSecret) {
      socialProviders.apple = {
        clientId: env.APPLE_CLIENT_ID,
        clientSecret,
      };
    }
  }

  return socialProviders;
}

const socialProviders = await buildSocialProviders();
const cookieDomain = getCookieDomain();

export const auth = betterAuth({
  appName: "SNN",
  baseURL: {
    allowedHosts: getAuthAllowedHosts(),
    fallback: getCanonicalAuthOrigin(),
  },
  trustedOrigins: getTrustedOrigins(),
  secret: getBetterAuthSecret(),
  database: drizzleAdapter(getDb(), {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders,
  advanced: {
    crossSubDomainCookies: cookieDomain
      ? {
          enabled: true,
          domain: cookieDomain,
        }
      : {
          enabled: false,
        },
    useSecureCookies: getDeploymentTarget() !== "local",
  },
  plugins: [
    admin(),
  ],
});
