import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getAppOrigin } from "@snn/config";
import type { Locale } from "@snn/i18n";
import { CustomerAuthError, requireCustomerSession } from "@snn/customer";

export const accountSections = {
  da: [
    { href: "account", label: "Overview" },
    { href: "account/orders", label: "Orders" },
    { href: "account/liked", label: "Liked" },
    { href: "account/profile", label: "Profile" },
    { href: "account/addresses", label: "Addresses" },
    { href: "account/security", label: "Security" },
    { href: "account/privacy", label: "Privacy" },
  ],
  en: [
    { href: "account", label: "Overview" },
    { href: "account/orders", label: "Orders" },
    { href: "account/liked", label: "Liked" },
    { href: "account/profile", label: "Profile" },
    { href: "account/addresses", label: "Addresses" },
    { href: "account/security", label: "Security" },
    { href: "account/privacy", label: "Privacy" },
  ],
} as const;

export function getAccountCallbackURL(locale: Locale, pathname = `/${locale}/account`) {
  return new URL(pathname, getAppOrigin("storefront")).toString();
}

export function getAccountSignInURL(locale: Locale, callbackURL = getAccountCallbackURL(locale)) {
  const url = new URL(`/${locale}/sign-in`, getAppOrigin("auth"));

  url.searchParams.set("callbackURL", callbackURL);

  return url.toString();
}

export async function requireAccountSession(locale: Locale, pathname?: string) {
  try {
    return await requireCustomerSession(await headers());
  } catch (error) {
    if (
      error instanceof CustomerAuthError &&
      (error.code === "AUTH_REQUIRED" || error.code === "BANNED")
    ) {
      const signInURL = getAccountSignInURL(
        locale,
        getAccountCallbackURL(locale, pathname),
      ) as Parameters<typeof redirect>[0];

      redirect(signInURL);
    }

    throw error;
  }
}
