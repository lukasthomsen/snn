import adminDa from "./messages/admin.da.json";
import adminEn from "./messages/admin.en.json";
import storefrontDa from "./messages/storefront.da.json";
import storefrontEn from "./messages/storefront.en.json";

export const locales = ["da", "en"] as const;
export type Locale = (typeof locales)[number];
export type DictionaryApp = "admin" | "storefront";

export const defaultLocale: Locale = "da";

const dictionaries = {
  admin: {
    da: adminDa,
    en: adminEn,
  },
  storefront: {
    da: storefrontDa,
    en: storefrontEn,
  },
} as const satisfies Record<DictionaryApp, Record<Locale, Record<string, string>>>;

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function resolvePreferredLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) {
    return defaultLocale;
  }

  const normalized = acceptLanguage.toLowerCase();

  if (normalized.includes("da")) {
    return "da";
  }

  return "en";
}

export function getDictionary(app: DictionaryApp, locale: Locale) {
  return dictionaries[app][locale];
}

