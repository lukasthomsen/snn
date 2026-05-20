import { createHmac, timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import {
  getBetterAuthSecret,
  getCookieDomain,
  getDeploymentTarget,
} from "@snn/config";
import { getDb, schema } from "@snn/db";
import { defaultLocale, isLocale, type Locale } from "@snn/i18n";

export const runtime = "nodejs";

type SignOutRouteContext = {
  params: Promise<{
    locale: string;
  }>;
};

const sessionCookieNames = [
  "__Secure-better-auth.session_token",
  "better-auth.session_token",
] as const;

const cookieBaseNamesToExpire = [
  "better-auth.session_token",
  "better-auth.session_data",
  "better-auth.account_data",
  "better-auth.dont_remember",
  "better-auth.oauth_state",
] as const;

function getRedirectUrl(request: Request, locale: Locale, path = "") {
  return new URL(`/${locale}${path}`, request.url);
}

function isSameOriginPost(request: Request) {
  const origin = request.headers.get("origin") ?? request.headers.get("referer");

  if (!origin) {
    return false;
  }

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function parseCookieHeader(cookieHeader: string | null) {
  const cookies = new Map<string, string>();

  for (const part of cookieHeader?.split(";") ?? []) {
    const separatorIndex = part.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const name = part.slice(0, separatorIndex).trim();
    const value = part.slice(separatorIndex + 1).trim();

    if (name && !cookies.has(name)) {
      cookies.set(name, value);
    }
  }

  return cookies;
}

function getCurrentSessionToken(request: Request) {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const signedCookie = sessionCookieNames
    .map((name) => cookies.get(name))
    .find(Boolean);

  if (!signedCookie) {
    return null;
  }

  let decodedCookie: string;

  try {
    decodedCookie = decodeURIComponent(signedCookie);
  } catch {
    return null;
  }

  const signatureSeparator = decodedCookie.lastIndexOf(".");

  if (signatureSeparator <= 0) {
    return null;
  }

  const token = decodedCookie.slice(0, signatureSeparator);
  const signature = decodedCookie.slice(signatureSeparator + 1);
  const expectedSignature = createHmac("sha256", getBetterAuthSecret())
    .update(token)
    .digest("base64");
  const signatureBuffer = Buffer.from(signature, "base64");
  const expectedSignatureBuffer = Buffer.from(expectedSignature, "base64");

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return null;
  }

  return token;
}

function getCookieNamesToExpire(request: Request) {
  const names = new Set<string>();
  const cookies = parseCookieHeader(request.headers.get("cookie"));

  for (const baseName of cookieBaseNamesToExpire) {
    names.add(baseName);
    names.add(`__Secure-${baseName}`);
  }

  for (const name of cookies.keys()) {
    if (
      /^(__Secure-)?better-auth\.(session_data|account_data)\.\d+$/.test(name)
    ) {
      names.add(name);
    }
  }

  return Array.from(names);
}

function expireAuthCookies(request: Request, response: NextResponse) {
  const cookieDomain = getCookieDomain();
  const useSecureCookies = getDeploymentTarget() !== "local";

  for (const name of getCookieNamesToExpire(request)) {
    response.cookies.set(name, "", {
      ...(cookieDomain ? { domain: cookieDomain } : {}),
      expires: new Date(0),
      httpOnly: true,
      maxAge: 0,
      path: "/",
      sameSite: "lax",
      secure: useSecureCookies || name.startsWith("__Secure-"),
    });
  }
}

export async function POST(request: Request, { params }: SignOutRouteContext) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : defaultLocale;

  if (!isSameOriginPost(request)) {
    return NextResponse.redirect(
      getRedirectUrl(request, safeLocale, "/account"),
      { status: 303 },
    );
  }

  const token = getCurrentSessionToken(request);
  const response = NextResponse.redirect(getRedirectUrl(request, safeLocale), {
    status: 303,
  });

  if (token) {
    await getDb().delete(schema.sessions).where(eq(schema.sessions.token, token));
  }

  expireAuthCookies(request, response);

  return response;
}
