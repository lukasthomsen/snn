import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getAppOrigin } from "@snn/config";
import type { Locale } from "@snn/i18n";
import { CustomerAuthError, requireCustomerSession } from "@snn/customer";

export const accountSections = {
  da: [
    { href: "account/rewards", label: "Rewards" },
    { href: "account/points-history", label: "Points history" },
    { href: "account/loyalty", label: "Loyalty overview" },
    { href: "account/orders", label: "Orders" },
    { href: "account/addresses", label: "Address book" },
    { href: "account/returns", label: "Returns" },
    { href: "account/refer", label: "Refer a friend" },
    { href: "account/settings", label: "Account settings" },
  ],
  en: [
    { href: "account/rewards", label: "Rewards" },
    { href: "account/points-history", label: "Points history" },
    { href: "account/loyalty", label: "Loyalty overview" },
    { href: "account/orders", label: "Orders" },
    { href: "account/addresses", label: "Address book" },
    { href: "account/returns", label: "Returns" },
    { href: "account/refer", label: "Refer a friend" },
    { href: "account/settings", label: "Account settings" },
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

const getRequestCustomerSession = cache(async () => {
  return requireCustomerSession(await headers());
});

export async function requireAccountSession(locale: Locale, pathname?: string) {
  try {
    return await getRequestCustomerSession();
  } catch (error) {
    if (
      error instanceof CustomerAuthError &&
      (error.code === "AUTH_REQUIRED" ||
        error.code === "BANNED" ||
        error.code === "EMAIL_UNVERIFIED")
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
