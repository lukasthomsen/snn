import { headers } from "next/headers";

import { getCustomerSession } from "@snn/customer";
import { isLocale, type Locale } from "@snn/i18n";

import { getAccountsHref } from "../auth-links";
import { CatalogView } from "../products/catalog-view";

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
  const session = await getCustomerSession(await headers());
  const copy = wishlistCopy[safeLocale];

  if (session?.user.emailVerified && !session.user.banned) {
    return (
      <div className="catalog__embedded__SW3am" data-perf-ready="true" data-perf-surface="wishlist">
        <CatalogView
          basePath={`/${safeLocale}/wishlist`}
          emptyCopy={copy.empty}
          intro={copy.intro}
          likedOnlyUserId={session.user.id}
          likedUserId={session.user.id}
          locale={safeLocale}
          query={query}
          title={copy.wishlistTitle}
        />
      </div>
    );
  }

  const callbackPath = `/${safeLocale}/wishlist`;

  return (
    <main className="wishlistPrompt__root__SW4a0" data-perf-ready="true" data-perf-surface="wishlist">
      <section className="wishlistPrompt__panel__SW4a1">
        <span className="wishlistPrompt__mark__SW4a2" aria-hidden="true">♡</span>
        <h1>{copy.title}</h1>
        <p>{copy.subheader}</p>
        <div className="wishlistPrompt__actions__SW4a3">
          <a href={getAccountsHref(safeLocale, "sign-up", callbackPath)}>
            {copy.createAccount}
          </a>
          <a href={getAccountsHref(safeLocale, "sign-in", callbackPath)}>
            {copy.logIn}
          </a>
        </div>
      </section>
    </main>
  );
}
