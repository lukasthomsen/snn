import { getAppOrigin } from "@snn/config";
import type { Locale } from "@snn/i18n";

type AccountRoute = "sign-in" | "sign-up";

export function getAccountsHref(locale: Locale, route: AccountRoute) {
  const accountsURL = new URL(`/${locale}/${route}`, getAppOrigin("auth"));
  const callbackURL = new URL(`/${locale}`, getAppOrigin("storefront"));

  accountsURL.searchParams.set("callbackURL", callbackURL.toString());

  return accountsURL.toString();
}
