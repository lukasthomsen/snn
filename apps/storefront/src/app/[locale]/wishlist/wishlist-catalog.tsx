import type { Locale } from "@snn/i18n";

import { CatalogView } from "../products/catalog-view";

type WishlistCatalogProps = {
  copy: {
    empty: string;
    intro: string;
    wishlistTitle: string;
  };
  locale: Locale;
  query: Record<string, string | string[] | undefined>;
  userId: string;
};

export function WishlistCatalog({
  copy,
  locale,
  query,
  userId,
}: WishlistCatalogProps) {
  return (
    <div className="catalog__embedded__SW3am" data-perf-ready="true" data-perf-surface="wishlist">
      <CatalogView
        basePath={`/${locale}/wishlist`}
        emptyCopy={copy.empty}
        intro={copy.intro}
        likedOnlyUserId={userId}
        likedUserId={userId}
        locale={locale}
        query={query}
        title={copy.wishlistTitle}
      />
    </div>
  );
}
