import { headers } from "next/headers";

import { getCustomerSession } from "@snn/customer";
import { isLocale, type Locale } from "@snn/i18n";

import { CatalogView } from "./catalog-view";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsPage({ params, searchParams }: ProductsPageProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const safeLocale: Locale = isLocale(locale) ? locale : "da";
  const session = await getCustomerSession(await headers());
  const likedUserId = session?.user.emailVerified && !session.user.banned
    ? session.user.id
    : undefined;

  return (
    <main className="catalog__root__SW3a0" data-perf-ready="true" data-perf-surface="catalog">
      <CatalogView
        basePath={`/${safeLocale}/products`}
        likedUserId={likedUserId}
        locale={safeLocale}
        query={query}
      />
    </main>
  );
}
