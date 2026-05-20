import { headers } from "next/headers";
import { Suspense } from "react";

import { getCustomerSession } from "@snn/customer";
import { isLocale, type Locale } from "@snn/i18n";

import { getAccountsHref } from "../auth-links";
import { WishlistCatalog } from "./wishlist-catalog";

type WishlistPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const wishlistCopy = {
  da: {
    createAccount: "Create account",
    empty: "Din wishlist er tom. Brug hjertet på shop-siden for at gemme produkter her.",
    intro: "Alle produkter i din wishlist, samlet med de samme filtre som shoppen.",
    logIn: "Log in",
    subheader: "Create an account or log in to keep your saved products across devices.",
    title: "Save the wishlist",
    wishlistTitle: "Wishlist",
  },
  en: {
    createAccount: "Create account",
    empty: "Your wishlist is empty. Use the heart on the shop page to save products here.",
    intro: "Every product in your wishlist, with the same filters as the shop.",
    logIn: "Log in",
    subheader: "Create an account or log in to keep your saved products across devices.",
    title: "Save the wishlist",
    wishlistTitle: "Wishlist",
  },
} as const;

export default async function WishlistPage({ params, searchParams }: WishlistPageProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const safeLocale: Locale = isLocale(locale) ? locale : "da";
  const copy = wishlistCopy[safeLocale];

  return (
    <Suspense fallback={<WishlistPrompt copy={copy} locale={safeLocale} />}>
      <WishlistContent copy={copy} locale={safeLocale} query={query} />
    </Suspense>
  );
}

type WishlistContentProps = {
  copy: typeof wishlistCopy[Locale];
  locale: Locale;
  query: Record<string, string | string[] | undefined>;
};

async function WishlistContent({ copy, locale, query }: WishlistContentProps) {
  const requestHeaders = await headers();

  if (!hasCustomerSessionCookie(requestHeaders.get("cookie"))) {
    return <WishlistPrompt copy={copy} locale={locale} />;
  }

  const session = await getCustomerSession(requestHeaders);

  if (session?.user.emailVerified && !session.user.banned) {
    return <WishlistCatalog copy={copy} locale={locale} query={query} userId={session.user.id} />;
  }

  return <WishlistPrompt copy={copy} locale={locale} />;
}

function hasCustomerSessionCookie(cookieHeader: string | null) {
  return /(?:^|;\s*)(?:__Secure-)?better-auth\.session_token=/.test(cookieHeader ?? "");
}

function WishlistPrompt({
  copy,
  locale,
}: {
  copy: typeof wishlistCopy[Locale];
  locale: Locale;
}) {
  const callbackPath = `/${locale}/wishlist`;

  return (
    <main className="wishlistPrompt__root__SW4a0" data-perf-ready="true" data-perf-surface="wishlist">
      <section className="wishlistPrompt__panel__SW4a1">
        <WishlistMark className="wishlistPrompt__image__SW4a4" />
        <h1>{copy.title}</h1>
        <p>{copy.subheader}</p>
        <div className="wishlistPrompt__actions__SW4a3">
          <a href={getAccountsHref(locale, "sign-up", callbackPath)}>
            {copy.createAccount}
          </a>
          <a href={getAccountsHref(locale, "sign-in", callbackPath)}>
            {copy.logIn}
          </a>
        </div>
      </section>
    </main>
  );
}

function WishlistMark({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 112 112"
    >
      <rect fill="#F4F4F4" height="104" rx="22" width="104" x="4" y="4" />
      <path
        d="M56 82C49.6 76.7 43.9 71.8 38.9 67.2C33.9 62.6 30.3 58.4 28.2 54.7C26.2 51.1 25.8 47.7 27 44.7C28.1 41.7 30.2 39.4 33.1 37.9C36.1 36.3 39.4 36 43 36.9C46.6 37.9 50.2 40.4 53.7 44.5L56 47.2L58.3 44.5C61.8 40.4 65.4 37.9 69 36.9C72.6 36 75.9 36.3 78.9 37.9C81.8 39.4 83.9 41.7 85 44.7C86.2 47.7 85.8 51.1 83.8 54.7C81.7 58.4 78.1 62.6 73.1 67.2C68.1 71.8 62.4 76.7 56 82Z"
        fill="#131313"
      />
      <path
        d="M37 48C38.1 44.8 40.9 43.2 45.4 43.3"
        opacity="0.72"
        stroke="white"
        strokeLinecap="round"
        strokeWidth="4"
      />
    </svg>
  );
}
