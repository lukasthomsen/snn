import { isLocale, type Locale } from "@snn/i18n";

import { CatalogView } from "./catalog-view";

type ProductsPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const revalidate = 300;

export default async function ProductsPage({ params, searchParams }: ProductsPageProps) {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "da";

  return (
    <main className="catalog__root__SW3a0" data-perf-ready="true" data-perf-surface="catalog">
      <CatalogView
        basePath={`/${safeLocale}/products`}
        locale={safeLocale}
        query={searchParams}
      />
    </main>
  );
}
