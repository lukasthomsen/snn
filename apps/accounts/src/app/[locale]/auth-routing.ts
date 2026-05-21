import { getAppOrigin } from "@snn/config";
import type { Locale } from "@snn/i18n";

type SearchParams = Record<string, string | string[] | undefined>;
type AccountRoute =
  | "auth-complete"
  | "forgot-password"
  | "reset-password"
  | "sign-in"
  | "sign-up"
  | "two-factor"
  | "verify-email";

export function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function getDefaultCallbackURL(locale: Locale) {
  return new URL(`/${locale}/account`, getAppOrigin("storefront")).toString();
}

export function resolvePostAuthCallbackURL(
  searchParams: SearchParams,
  locale: Locale,
) {
  const fallbackURL = getDefaultCallbackURL(locale);
  const requestedCallbackURL =
    getFirstParam(searchParams.callbackURL) ??
    getFirstParam(searchParams.callbackUrl) ??
    getFirstParam(searchParams.redirect);

  if (!requestedCallbackURL) {
    return fallbackURL;
  }

  try {
    const callbackURL = new URL(requestedCallbackURL, getAppOrigin("storefront"));
    const allowedOrigins = new Set([
      getAppOrigin("storefront"),
      getAppOrigin("admin"),
    ]);

    return allowedOrigins.has(callbackURL.origin)
      ? callbackURL.toString()
      : fallbackURL;
  } catch {
    return fallbackURL;
  }
}

export function getStorefrontFooterURL(locale: Locale) {
  return new URL(`/${locale}#footer`, getAppOrigin("storefront")).toString();
}

export function getStorefrontPrivacyURL(locale: Locale) {
  return new URL(`/${locale}/privacy`, getAppOrigin("storefront")).toString();
}

export function getAccountAuthPath(
  locale: Locale,
  route: AccountRoute,
  callbackURL: string,
  searchParams?: Record<string, string | undefined>,
) {
  const authURL = new URL(`/${locale}/${route}`, getAppOrigin("auth"));

  authURL.searchParams.set("callbackURL", callbackURL);
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value) {
      authURL.searchParams.set(key, value);
    }
  }

  return `${authURL.pathname}${authURL.search}`;
}

export function getAccountAuthURL(
  locale: Locale,
  route: AccountRoute,
  callbackURL: string,
  searchParams?: Record<string, string | undefined>,
) {
  const authURL = new URL(`/${locale}/${route}`, getAppOrigin("auth"));

  authURL.searchParams.set("callbackURL", callbackURL);
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value) {
      authURL.searchParams.set(key, value);
    }
  }

  return authURL.toString();
}

export function getAuthCompleteURL(locale: Locale, callbackURL: string) {
  return getAccountAuthURL(locale, "auth-complete", callbackURL);
}
