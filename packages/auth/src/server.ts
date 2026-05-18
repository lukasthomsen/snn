import { SignJWT, importPKCS8 } from "jose";

import { passkey } from "@better-auth/passkey";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { dash } from "@better-auth/infra";
import { betterAuth } from "better-auth";
import {
  APIError,
  createAuthMiddleware,
  freshSessionMiddleware,
  getSessionFromCtx,
} from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin, emailOTP, haveIBeenPwned, twoFactor } from "better-auth/plugins";
import { and, eq, inArray, sql } from "drizzle-orm";

import {
  getAppOrigin,
  getAuthAllowedHosts,
  getAuthTurnstileMode,
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
import {
  authAppName,
  authPasswordPolicy,
  authTurnstileHeaderName,
  authTurnstileProtectedPaths,
  internalAuthRequestHeaderName,
  isStrongPassword,
  normalizeDateOfBirth,
  nullableText,
} from "./policy";
import { validateTurnstileToken } from "./turnstile";

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

const emailVerificationExpiresIn = 60 * 60 * 24;
const emailVerificationCodeExpiresIn = 10 * 60;
const appName = authAppName;

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
    .select({
      id: schema.customerProfiles.id,
      userId: schema.customerProfiles.userId,
    })
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

function getRequestBody(body: unknown) {
  return body && typeof body === "object"
    ? body as Record<string, unknown>
    : {};
}

type AuthTurnstileContext = {
  headers?: Headers | undefined;
  path: string;
  request?: Request | undefined;
};

function getAuthMiddlewareHeaders(ctx: AuthTurnstileContext) {
  return ctx.request?.headers ?? ctx.headers;
}

function getHeader(headers: Headers | undefined, name: string) {
  return headers?.get(name) ?? undefined;
}

function getRequestRemoteIp(headers: Headers | undefined) {
  const forwardedFor = getHeader(headers, "x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim();
  }

  return getHeader(headers, "cf-connecting-ip") ?? getHeader(headers, "x-real-ip");
}

function getTurnstileActionForPath(path: string) {
  return authTurnstileProtectedPaths[
    path as keyof typeof authTurnstileProtectedPaths
  ];
}

async function validateAuthTurnstileForPath(ctx: AuthTurnstileContext) {
  const expectedAction = getTurnstileActionForPath(ctx.path);

  if (!expectedAction) {
    return;
  }

  const headers = getAuthMiddlewareHeaders(ctx);

  if (
    !ctx.request &&
    getHeader(headers, internalAuthRequestHeaderName) === "1"
  ) {
    return;
  }

  const mode = getAuthTurnstileMode();

  if (mode === "off") {
    return;
  }

  const result = await validateTurnstileToken({
    expectedAction,
    idempotencyKey: getHeader(headers, "x-vercel-id"),
    remoteIp: getRequestRemoteIp(headers),
    token: getHeader(headers, authTurnstileHeaderName) ?? "",
  });

  if (result.success) {
    return;
  }

  globalThis.console.warn("[auth] Turnstile challenge failed", {
    errors: result.errors,
    mode,
    path: ctx.path,
  });

  if (mode === "report") {
    return;
  }

  throw new APIError("FORBIDDEN", {
    code: "TURNSTILE_REQUIRED",
    message: "Security check failed. Please try again.",
  });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function getDatabaseErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  if ("code" in error && typeof error.code === "string") {
    return error.code;
  }

  if ("cause" in error) {
    return getDatabaseErrorCode(error.cause);
  }

  return undefined;
}

function isMissingDateOfBirthColumnError(error: unknown) {
  return (
    getDatabaseErrorCode(error) === "42703" &&
    getErrorMessage(error).includes("date_of_birth")
  );
}

function warnAboutProfileSyncFailure(context: string, error: unknown) {
  globalThis.console.warn(
    `[auth] Customer profile sync skipped during ${context}: ${getErrorMessage(error)}`,
  );
}

type ExistingAuthUser = {
  emailVerified: boolean;
  id: string;
};

type ExistingAuthAccount = {
  hasPassword: boolean;
  providerId: string;
};

const credentialProviderIds = new Set(["credential", "email-password"]);
const socialEmailProviderIds = new Set(["apple", "google"]);

function hasCredentialPasswordAccount(accounts: ExistingAuthAccount[]) {
  return accounts.some((account) =>
    credentialProviderIds.has(account.providerId) && account.hasPassword,
  );
}

function hasSocialEmailProvider(accounts: ExistingAuthAccount[]) {
  return accounts.some((account) => socialEmailProviderIds.has(account.providerId));
}

async function getAuthUserByEmail(email: string) {
  const [user] = await getDb()
    .select({
      emailVerified: schema.users.emailVerified,
      id: schema.users.id,
    })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);

  return user;
}

async function getAuthAccountsByUserId(userId: string) {
  return getDb()
    .select({
      hasPassword: sql<boolean>`${schema.accounts.password} is not null`,
      providerId: schema.accounts.providerId,
    })
    .from(schema.accounts)
    .where(eq(schema.accounts.userId, userId));
}

function canSendCredentialVerification(input: {
  accounts: ExistingAuthAccount[];
  user: ExistingAuthUser;
}) {
  return (
    !input.user.emailVerified &&
    hasCredentialPasswordAccount(input.accounts) &&
    !hasSocialEmailProvider(input.accounts)
  );
}

async function assertCredentialSignUpCanUseEmail(email: string) {
  const existingUser = await getAuthUserByEmail(email);

  if (!existingUser) {
    return;
  }

  const accounts = await getAuthAccountsByUserId(existingUser.id);

  if (canSendCredentialVerification({ accounts, user: existingUser })) {
    return;
  }

  if (hasSocialEmailProvider(accounts)) {
    throw new APIError("BAD_REQUEST", {
      code: "EMAIL_MANAGED_BY_SOCIAL_PROVIDER",
      message: "This email is already connected to Google or Apple sign-in.",
    });
  }

  throw new APIError("BAD_REQUEST", {
    code: "EMAIL_ALREADY_REGISTERED",
    message: "An account with this email already exists.",
  });
}

async function sendExistingCredentialVerification(input: {
  request: Request | undefined;
  user: ExistingAuthUser & { email: string };
}) {
  const accounts = await getAuthAccountsByUserId(input.user.id);

  if (!canSendCredentialVerification({ accounts, user: input.user })) {
    return;
  }

  const headers = new Headers(input.request?.headers);
  headers.set(internalAuthRequestHeaderName, "1");

  await auth.api.sendVerificationOTP({
    body: {
      email: input.user.email,
      type: "email-verification",
    },
    headers,
  });
}

async function upsertCustomerProfileForSignUp(input: {
  dateOfBirth: unknown;
  email: string;
  firstName: unknown;
  lastName: unknown;
  name: string;
  userId: string;
}) {
  const email = input.email.trim().toLowerCase();
  const [fallbackFirstName, ...fallbackLastNameParts] = input.name.trim().split(/\s+/).filter(Boolean);
  const firstName = nullableText(input.firstName) ?? fallbackFirstName ?? null;
  const lastName = nullableText(input.lastName) ??
    (fallbackLastNameParts.length > 0 ? fallbackLastNameParts.join(" ") : null);
  const dateOfBirth = normalizeDateOfBirth(input.dateOfBirth);
  const now = new Date();

  try {
    await getDb()
      .insert(schema.customerProfiles)
      .values({
        dateOfBirth,
        email,
        firstName,
        lastName,
        userId: input.userId,
      })
      .onConflictDoUpdate({
        target: schema.customerProfiles.email,
        set: {
          dateOfBirth,
          firstName,
          lastName,
          updatedAt: now,
          userId: input.userId,
        },
      });
  } catch (error) {
    if (!isMissingDateOfBirthColumnError(error)) {
      throw error;
    }

    warnAboutProfileSyncFailure("sign-up date of birth write", error);
    await getDb()
      .insert(schema.customerProfiles)
      .values({
        email,
        firstName,
        lastName,
        userId: input.userId,
      })
      .onConflictDoUpdate({
        target: schema.customerProfiles.email,
        set: {
          firstName,
          lastName,
          updatedAt: now,
          userId: input.userId,
        },
      });
  }
}

async function safelyEnsureCustomerProfileForVerifiedUser(user: {
  id: string;
  email: string;
  name: string;
}) {
  try {
    await ensureCustomerProfileForVerifiedUser(user);
  } catch (error) {
    warnAboutProfileSyncFailure("email verification", error);
  }
}

async function safelyUpsertCustomerProfileForSignUp(input: {
  dateOfBirth: unknown;
  email: string;
  firstName: unknown;
  lastName: unknown;
  name: string;
  userId: string;
}) {
  try {
    await upsertCustomerProfileForSignUp(input);
  } catch (error) {
    warnAboutProfileSyncFailure("sign-up", error);
  }
}

async function deleteCustomerProfileForDeletedUser(user: { id: string }) {
  await getDb().transaction(async (tx) => {
    await tx.insert(schema.auditLogs).values({
      action: "customer_account.deleted",
      actorType: "customer",
      actorUserId: user.id,
      entityId: user.id,
      entityType: "user",
      metadata: {},
    });

    await tx
      .delete(schema.customerProfiles)
      .where(eq(schema.customerProfiles.userId, user.id));
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
  "/change-email",
  "/change-password",
  "/delete-user",
  "/set-password",
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
  emailOTP({
    allowedAttempts: 5,
    expiresIn: emailVerificationCodeExpiresIn,
    otpLength: 8,
    overrideDefaultEmailVerification: true,
    resendStrategy: "reuse",
    async sendVerificationOTP({ email, otp, type }) {
      if (type !== "email-verification") {
        return;
      }

      await sendAuthActionEmail({
        actionCode: otp,
        appName,
        expirationMinutes: Math.floor(emailVerificationCodeExpiresIn / 60),
        kind: "verify-email",
        to: email,
        userName: "",
      });
    },
    storeOTP: "encrypted",
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
    paths: ["/sign-up/email", "/change-password", "/reset-password", "/set-password"],
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
  user: {
    changeEmail: {
      enabled: true,
      async sendChangeEmailConfirmation({ user, newEmail, url }) {
        await sendAuthActionEmail({
          actionUrl: url,
          appName,
          expirationMinutes: 1440,
          kind: "change-email",
          newEmail,
          to: user.email,
          userName: user.name,
        });
      },
    },
    deleteUser: {
      enabled: true,
      beforeDelete: deleteCustomerProfileForDeletedUser,
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: authPasswordPolicy.minLength,
    maxPasswordLength: authPasswordPolicy.maxLength,
    requireEmailVerification: true,
    async onExistingUserSignUp({ user }, request) {
      await sendExistingCredentialVerification({
        request,
        user: {
          email: user.email,
          emailVerified: user.emailVerified,
          id: user.id,
        },
      });
    },
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
      await safelyEnsureCustomerProfileForVerifiedUser(user);
    },
    autoSignInAfterVerification: true,
    expiresIn: emailVerificationExpiresIn,
    sendOnSignIn: true,
    sendOnSignUp: true,
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
  databaseHooks: {
    user: {
      create: {
        async after(user, ctx) {
          if (ctx?.path === "/sign-up/email") {
            const body = getRequestBody(ctx.body);

            await safelyUpsertCustomerProfileForSignUp({
              dateOfBirth: body.dateOfBirth,
              email: user.email,
              firstName: body.firstName,
              lastName: body.lastName,
              name: user.name,
              userId: user.id,
            });

            return;
          }

          if (user.emailVerified) {
            await safelyEnsureCustomerProfileForVerifiedUser(user);
          }
        },
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      await validateAuthTurnstileForPath(ctx);

      if (ctx.path === "/sign-up/email") {
        const body = getRequestBody(ctx.body);
        const firstName = nullableText(body.firstName);
        const lastName = nullableText(body.lastName);
        const email = nullableText(body.email)?.toLowerCase();
        const password = typeof body.password === "string" ? body.password : "";
        const dateOfBirthInput = nullableText(body.dateOfBirth);
        const dateOfBirth = normalizeDateOfBirth(body.dateOfBirth);

        if (!firstName || !lastName || !email || !password) {
          throw new APIError("BAD_REQUEST", {
            message: "First name, last name, email, and password are required.",
          });
        }

        if (dateOfBirthInput && !dateOfBirth) {
          throw new APIError("BAD_REQUEST", {
            message: "Date of birth must be a valid past date.",
          });
        }

        if (!isStrongPassword(password)) {
          throw new APIError("BAD_REQUEST", {
            message: "Password does not meet the requirements.",
          });
        }

        await assertCredentialSignUpCanUseEmail(email);
      }

      if (ctx.path === "/change-email") {
        const session = await getSessionFromCtx(ctx, {
          disableCookieCache: true,
        });

        if (session?.user) {
          const [managedEmailAccount] = await getDb()
            .select({ providerId: schema.accounts.providerId })
            .from(schema.accounts)
            .where(
              and(
                eq(schema.accounts.userId, session.user.id),
                inArray(schema.accounts.providerId, [...socialEmailProviderIds]),
              ),
            )
            .limit(1);

          if (managedEmailAccount) {
            throw new APIError("BAD_REQUEST", {
              message: "Email is managed by Google or Apple sign-in.",
            });
          }
        }
      }

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
