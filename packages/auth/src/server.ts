import { SignJWT, importPKCS8 } from "jose";

import { passkey } from "@better-auth/passkey";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { dash } from "@better-auth/infra";
import { betterAuth } from "better-auth";
import { createAuthMiddleware, freshSessionMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin, haveIBeenPwned, twoFactor } from "better-auth/plugins";
import { eq } from "drizzle-orm";

import {
  getAppOrigin,
  getAuthAllowedHosts,
  getBetterAuthInfrastructureConfig,
  getBetterAuthSecret,
  getCanonicalAuthOrigin,
  getCookieDomain,
  getDeploymentTarget,
  getServerEnv,
  getTrustedOrigins,
  hasAppleOAuth,
  hasGoogleOAuth,
} from "@snn/config";
import { getDb, schema } from "@snn/db";

import { sendAuthActionEmail } from "./email";

type BetterAuthOptions = Parameters<typeof betterAuth>[0];

const authSchema = {
  user: schema.users,
  session: schema.sessions,
  account: schema.accounts,
  verification: schema.verifications,
  rateLimit: schema.rateLimits,
  twoFactor: schema.twoFactors,
  passkey: schema.passkeys,
};

const appName = "Veloro";

function getPasskeyRpId() {
  if (getDeploymentTarget() === "local") {
    return "localhost";
  }

  return getServerEnv().BASE_DOMAIN;
}

function getPasskeyOrigins() {
  return [
    getCanonicalAuthOrigin(),
    getAppOrigin("storefront"),
    getAppOrigin("admin"),
  ];
}

async function ensureCustomerProfileForVerifiedUser(user: {
  id: string;
  email: string;
  name: string;
}) {
  const db = getDb();
  const email = user.email.trim().toLowerCase();
  const [existingProfile] = await db
    .select()
    .from(schema.customerProfiles)
    .where(eq(schema.customerProfiles.email, email))
    .limit(1);

  if (existingProfile) {
    if (existingProfile.userId !== user.id) {
      await db
        .update(schema.customerProfiles)
        .set({
          userId: user.id,
          updatedAt: new Date(),
        })
        .where(eq(schema.customerProfiles.id, existingProfile.id));
    }

    return;
  }

  const [firstName, ...lastNameParts] = user.name.trim().split(/\s+/).filter(Boolean);

  await db.insert(schema.customerProfiles).values({
    email,
    firstName: firstName ?? null,
    lastName: lastNameParts.length > 0 ? lastNameParts.join(" ") : null,
    userId: user.id,
  });
}

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
const betterAuthInfrastructure = getBetterAuthInfrastructureConfig();
const freshSessionPaths = new Set([
  "/two-factor/enable",
  "/two-factor/disable",
  "/two-factor/generate-backup-codes",
  "/two-factor/view-backup-codes",
  "/passkey/generate-register-options",
  "/passkey/verify-registration",
  "/passkey/delete-passkey",
  "/passkey/update-passkey",
]);
const authPlugins = [
  ...(betterAuthInfrastructure.apiKey
    ? [
        dash({
          apiKey: betterAuthInfrastructure.apiKey,
          ...(betterAuthInfrastructure.apiUrl
            ? { apiUrl: betterAuthInfrastructure.apiUrl }
            : {}),
          ...(betterAuthInfrastructure.kvUrl
            ? { kvUrl: betterAuthInfrastructure.kvUrl }
            : {}),
        }),
      ]
    : []),
  twoFactor({
    issuer: appName,
    twoFactorCookieMaxAge: 10 * 60,
    trustDeviceMaxAge: 30 * 24 * 60 * 60,
  }),
  passkey({
    rpID: getPasskeyRpId(),
    rpName: appName,
    origin: getPasskeyOrigins(),
  }),
  admin(),
  haveIBeenPwned({
    customPasswordCompromisedMessage:
      "This password has appeared in a data breach. Please choose a different password.",
  }),
  nextCookies(),
];

export const auth = betterAuth({
  appName,
  baseURL: {
    allowedHosts: getAuthAllowedHosts(),
    fallback: getCanonicalAuthOrigin(),
  },
  trustedOrigins: getTrustedOrigins(),
  secret: getBetterAuthSecret(),
  database: drizzleAdapter(getDb(), {
    provider: "pg",
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 15,
    maxPasswordLength: 128,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    customSyntheticUser({ additionalFields, coreFields, id }) {
      return {
        ...coreFields,
        role: "user",
        banned: false,
        banReason: null,
        banExpires: null,
        twoFactorEnabled: false,
        ...additionalFields,
        id,
      };
    },
    async sendResetPassword({ user, url }) {
      await sendAuthActionEmail({
        actionUrl: url,
        appName,
        expirationMinutes: 60,
        kind: "reset-password",
        to: user.email,
        userName: user.name,
      });
    },
  },
  emailVerification: {
    async afterEmailVerification(user) {
      await ensureCustomerProfileForVerifiedUser(user);
    },
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24,
    sendOnSignIn: true,
    sendOnSignUp: true,
    async sendVerificationEmail({ user, url }) {
      await sendAuthActionEmail({
        actionUrl: url,
        appName,
        expirationMinutes: 1440,
        kind: "verify-email",
        to: user.email,
        userName: user.name,
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    freshAge: 60 * 15,
    storeSessionInDatabase: true,
    updateAge: 60 * 60 * 24,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "apple", "email-password"],
    },
    encryptOAuthTokens: true,
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 120,
    customRules: {
      "/sign-in/email": {
        window: 60,
        max: 5,
      },
      "/sign-up/email": {
        window: 60 * 10,
        max: 5,
      },
      "/send-verification-email": {
        window: 60 * 10,
        max: 3,
      },
      "/forget-password": {
        window: 60 * 10,
        max: 3,
      },
      "/request-password-reset": {
        window: 60 * 10,
        max: 3,
      },
      "/two-factor/verify-backup-code": {
        window: 60 * 10,
        max: 6,
      },
      "/two-factor/verify-totp": {
        window: 60 * 10,
        max: 6,
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (freshSessionPaths.has(ctx.path)) {
        return freshSessionMiddleware(
          ctx as Parameters<typeof freshSessionMiddleware>[0],
        );
      }

      return undefined;
    }),
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
  plugins: authPlugins,
});
