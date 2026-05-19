import { getAppOrigin } from "@snn/config";
import type { Locale } from "@snn/i18n";

type AccountRoute = "sign-in" | "sign-up";

function getSafeStorefrontCallbackURL(locale: Locale, callbackPath?: string) {
  const storefrontOrigin = getAppOrigin("storefront");
  const fallbackURL = new URL(`/${locale}/account`, storefrontOrigin);

  if (!callbackPath) {
    return fallbackURL;
  }

  try {
    const callbackURL = new URL(callbackPath, storefrontOrigin);

    return callbackURL.origin === storefrontOrigin ? callbackURL : fallbackURL;
  } catch {
    return fallbackURL;
  }
}

export function getAccountsHref(
  locale: Locale,
  route: AccountRoute,
  callbackPath?: string,
) {
  const accountsURL = new URL(`/${locale}/${route}`, getAppOrigin("auth"));
  const callbackURL = getSafeStorefrontCallbackURL(locale, callbackPath);

  accountsURL.searchParams.set("callbackURL", callbackURL.toString());

  return accountsURL.toString();
}
