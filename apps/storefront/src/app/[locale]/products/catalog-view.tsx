import type { Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { preload } from "react-dom";

import type { ProductSort } from "@snn/commerce";
import type { Locale } from "@snn/i18n";

import {
  getCachedCatalogFilters,
  getCachedProductCards,
  getPersonalizedProductCards,
  getRuntimeProductCards,
} from "./catalog-data";
import { CatalogHeroIntro } from "./catalog-hero-intro";
import { CatalogProductGrid } from "./catalog-product-grid";

type CatalogSearchParams = Record<string, string | string[] | undefined>;
type CatalogSearchParamsInput = CatalogSearchParams | Promise<CatalogSearchParams>;
type CatalogSort = ProductSort | "relevance";

type CatalogViewProps = {
  basePath: `/${Locale}/${string}`;
  emptyCopy?: string | undefined;
  intro?: string | undefined;
  likedOnlyUserId?: string | undefined;
  likedUserId?: string | undefined;
  locale: Locale;
  query: CatalogSearchParamsInput;
  title?: string | undefined;
};

const pageCopy = {
  da: {
    allProducts: "Alle produkter",
    available: "På lager",
    availability: "Tilgængelighed",
    categories: "Kategorier",
    clearAll: "Ryd alle",
    collections: "Kollektioner",
    empty:
      "Ingen produkter matcher filtrene endnu. Når kataloget fyldes fra admin, dukker de op her.",
    filters: "Filtre",
    intro:
      "Udforsk produkter til hverdagsrutiner, træning og restitution med live priser, varianter og lagerstatus.",
    liked: "Gemt",
    onlyAvailable: "Kun produkter på lager",
    options: "Valgmuligheder",
    productCountMany: "{count} produkter vist",
    productCountOne: "1 produkt vist",
    productCountZero: "0 produkter vist",
    sale: "Sale",
    save: "Gem produkt",
    saved: "Gemt produkt",
    seeLess: "Se mindre",
    seeMore: "Se mere",
    sort: "Sortering",
    sortNewest: "Nyeste",
    sortPriceAsc: "Pris: lav til høj",
    sortPriceDesc: "Pris: høj til lav",
    sortRelevance: "Relevans",
    sortAndFilter: "Sortering & filter",
    title: "Shop",
    unavailable: "Ikke tilgængelig",
    unsave: "Fjern fra gemte",
    updateFilters: "Opdater filtre",
  },
  en: {
    allProducts: "All products",
    available: "In stock",
    availability: "Availability",
    categories: "Categories",
    clearAll: "Clear All",
    collections: "Collections",
    empty:
      "No products match these filters yet. Once the catalog is populated from admin, they will appear here.",
    filters: "Filters",
    intro:
      "Explore products for daily routines, training, and recovery with live prices, variants, and availability.",
    liked: "Saved",
    onlyAvailable: "Only in-stock products",
    options: "Options",
    productCountMany: "{count} products displayed",
    productCountOne: "1 product displayed",
    productCountZero: "0 products displayed",
    sale: "Sale",
    save: "Save product",
    saved: "Saved product",
    seeLess: "See less",
    seeMore: "See more",
    sort: "Sort",
    sortNewest: "Newest",
    sortPriceAsc: "Price: Low to High",
    sortPriceDesc: "Price: High to Low",
    sortRelevance: "Relevancy",
    sortAndFilter: "Sort & Filter",
    title: "Shop",
    unavailable: "Unavailable",
    unsave: "Remove from saved",
    updateFilters: "Update filters",
  },
} as const;

const reservedFilterKeys = new Set([
  "availability",
  "category",
  "collection",
  "sort",
]);

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getMultiValue(value: string | string[] | undefined) {
  if (!value) {
    return [];
  }

  return (Array.isArray(value) ? value : value.split(","))
    .map((item) => item.trim())
    .filter(Boolean);
}

function getSort(value: string | string[] | undefined): CatalogSort {
  const raw = getSingleValue(value);

  if (raw === "newest" || raw === "price-asc" || raw === "price-desc") {
    return raw;
  }

  return "relevance";
}

function getHref(
  basePath: string,
  query: CatalogSearchParams,
  changes: Record<string, string | null>,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (!value || key in changes) {
      continue;
    }

    params.set(key, Array.isArray(value) ? value.join(",") : value);
  }

  for (const [key, value] of Object.entries(changes)) {
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  }

  const queryString = params.toString();

  return queryString ? `${basePath}?${queryString}` : basePath;
}

function asRoute(href: string) {
  return href as Route;
}

function getOptionValues(query: CatalogSearchParams) {
  const optionValues: Record<string, string[]> = {};

  for (const [key, value] of Object.entries(query)) {
    if (reservedFilterKeys.has(key)) {
      continue;
    }

    const values = getMultiValue(value);

    if (values.length > 0) {
      optionValues[key] = values;
    }
  }

  return optionValues;
}

function getToggleMultiHref(
  basePath: string,
  query: CatalogSearchParams,
  key: string,
  value: string,
) {
  const values = new Set(getMultiValue(query[key]));

  if (values.has(value)) {
    values.delete(value);
  } else {
    values.add(value);
  }

  return getHref(basePath, query, {
    [key]: values.size > 0 ? [...values].join(",") : null,
  });
}

function getProductCountCopy(
  copy: typeof pageCopy[Locale],
  count: number,
) {
  if (count === 0) {
    return copy.productCountZero;
  }

  if (count === 1) {
    return copy.productCountOne;
  }

  return copy.productCountMany.replace("{count}", String(count));
}

function getPublicCardImageUrl(url: string | null) {
  if (!url || url.startsWith("data:")) {
    return null;
  }

  return url;
}

export function CatalogView({
  basePath,
  emptyCopy,
  intro,
  likedOnlyUserId,
  likedUserId,
  locale,
  query,
  title,
}: CatalogViewProps) {
  const copy = pageCopy[locale];
  const resolvedTitle = title ?? copy.title;

  return (
    <div data-perf-ready="true" data-perf-surface={likedOnlyUserId ? "wishlist" : "catalog-results"}>
      <section className="catalog-hero__root__SW3a1">
        <h1>{resolvedTitle}</h1>
        <p className="catalog__count__SW3at">{copy.allProducts}</p>
        <CatalogHeroIntro
          seeLessLabel={copy.seeLess}
          seeMoreLabel={copy.seeMore}
          text={intro ?? copy.intro}
        />
      </section>

      <Suspense fallback={<CatalogResultsFallback copy={copy} title={resolvedTitle} />}>
        <CatalogResults
          basePath={basePath}
          copy={copy}
          emptyCopy={emptyCopy}
          likedOnlyUserId={likedOnlyUserId}
          likedUserId={likedUserId}
          locale={locale}
          query={query}
          title={resolvedTitle}
        />
      </Suspense>
    </div>
  );
}

function CatalogResultsFallback({
  copy,
  title,
}: {
  copy: typeof pageCopy[Locale];
  title: string;
}) {
  return (
    <section className="catalog__layout__SW3a3" aria-label={title}>
      <p className="catalog__count__SW3at catalog__count--results__SW3ax">
        {copy.allProducts}
      </p>
      <div className="catalog-grid__root__SW3a9" aria-hidden="true">
        <span className="catalog-card-skeleton__SW3ay" />
        <span className="catalog-card-skeleton__SW3ay" />
      </div>
    </section>
  );
}

type CatalogResultsProps = {
  basePath: `/${Locale}/${string}`;
  copy: typeof pageCopy[Locale];
  emptyCopy?: string | undefined;
  likedOnlyUserId?: string | undefined;
  likedUserId?: string | undefined;
  locale: Locale;
  query: CatalogSearchParamsInput;
  title: string;
};

async function CatalogResults({
  basePath,
  copy,
  emptyCopy,
  likedOnlyUserId,
  likedUserId,
  locale,
  query,
  title,
}: CatalogResultsProps) {
  const resolvedQuery = await query;
  const categorySlug = getSingleValue(resolvedQuery.category);
  const collectionSlug = getSingleValue(resolvedQuery.collection);
  const onlyAvailable = getSingleValue(resolvedQuery.availability) === "in-stock";
  const optionValues = getOptionValues(resolvedQuery);
  const sort = getSort(resolvedQuery.sort);
  const productSort = sort === "relevance" ? undefined : sort;
  const hasActiveFilters = Boolean(
      categorySlug ||
      collectionSlug ||
      onlyAvailable ||
      sort !== "relevance" ||
      Object.keys(optionValues).length > 0,
  );
  const sortOptions = [
    {
      href: asRoute(getHref(basePath, resolvedQuery, { sort: "price-asc" })),
      label: copy.sortPriceAsc,
      value: "price-asc",
    },
    {
      href: asRoute(getHref(basePath, resolvedQuery, { sort: "price-desc" })),
      label: copy.sortPriceDesc,
      value: "price-desc",
    },
    {
      href: asRoute(getHref(basePath, resolvedQuery, { sort: null })),
      label: copy.sortRelevance,
      value: "relevance",
    },
    {
      href: asRoute(getHref(basePath, resolvedQuery, { sort: "newest" })),
      label: copy.sortNewest,
      value: "newest",
    },
  ];
  const productCardInput = {
      categorySlug,
      collectionSlug,
      countryCode: "DK",
      likedOnlyUserId,
      likedUserId,
      locale,
      onlyAvailable,
      optionValues,
      sort: productSort,
  };
  const shouldUseCachedCards = !likedOnlyUserId && !likedUserId;
  const [filters, productList] = await Promise.all([
    getCachedCatalogFilters({ locale }),
    shouldUseCachedCards
      ? getCachedProductCards(productCardInput)
      : likedOnlyUserId || likedUserId
        ? getPersonalizedProductCards(productCardInput)
        : getRuntimeProductCards(productCardInput),
  ]);
  const { items } = productList;
  const productCountCopy = getProductCountCopy(copy, items.length);
  const gridCopy = {
    available: copy.available,
    empty: emptyCopy ?? copy.empty,
    sale: copy.sale,
    save: copy.save,
    saved: copy.saved,
    unavailable: copy.unavailable,
    unsave: copy.unsave,
  };
  const gridItems = items.map((product) => ({
    availability: product.availability,
    description: product.description,
    displayId: product.displayId,
    id: product.id,
    imageUrl: getPublicCardImageUrl(product.imageUrl),
    isLiked: product.isLiked,
    name: product.name,
    price: product.price,
    secondaryImageUrl: getPublicCardImageUrl(product.secondaryImageUrl),
    slug: product.slug,
    status: product.status,
    variantId: product.variantId,
    variantTitle: product.variantTitle,
  }));
  const firstImageUrl = gridItems[0]?.imageUrl;

  if (firstImageUrl) {
    preload(firstImageUrl, { as: "image" });
  }

  return (
      <section className="catalog__layout__SW3a3" aria-label={title}>
        <p className="catalog__count__SW3at catalog__count--results__SW3ax">
          {productCountCopy}
        </p>
        <aside className="catalog-filter__root__SW3a4" aria-label={copy.filters}>
          <div className="catalog-filter__header__SW3ai">
            <h2>{copy.sortAndFilter}</h2>
            {hasActiveFilters ? (
              <Link className="catalog-filter__clear__SW3aj" href={asRoute(basePath)} scroll={false}>
                {copy.clearAll}
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="catalog-filter__clear__SW3aj"
                data-disabled="true"
              >
                {copy.clearAll}
              </span>
            )}
          </div>

          <div className="catalog-filter__groups__SW3az">
            <details className="catalog-filter__group__SW3ao" open>
              <summary className="catalog-filter__summary__SW3ap">{copy.sort}</summary>
              <div className="catalog-filter__panel__SW3al">
                <div className="catalog-filter__choices__SW3am" aria-label={copy.sort}>
                  {sortOptions.map((option) => (
                    <Link
                      className="catalog-filter__choice__SW3an"
                      data-active={sort === option.value ? "true" : undefined}
                      href={option.href}
                      key={option.value}
                      scroll={false}
                    >
                      {option.label}
                    </Link>
                  ))}
                </div>
              </div>
            </details>

            <details className="catalog-filter__group__SW3ao" open={onlyAvailable || undefined}>
              <summary className="catalog-filter__summary__SW3ap">{copy.availability}</summary>
              <div className="catalog-filter__panel__SW3al">
                <div className="catalog-filter__choices__SW3am">
                  <Link
                    className="catalog-filter__choice__SW3an"
                    data-active={!onlyAvailable ? "true" : undefined}
                    href={asRoute(getHref(basePath, resolvedQuery, { availability: null }))}
                    scroll={false}
                  >
                    {copy.allProducts}
                  </Link>
                  <Link
                    className="catalog-filter__choice__SW3an"
                    data-active={onlyAvailable ? "true" : undefined}
                    href={asRoute(
                      getHref(basePath, resolvedQuery, {
                        availability: onlyAvailable ? null : "in-stock",
                      }),
                    )}
                    scroll={false}
                  >
                    {copy.onlyAvailable}
                  </Link>
                </div>
              </div>
            </details>

            {filters.categories.length > 0 ? (
              <details className="catalog-filter__group__SW3ao" open={Boolean(categorySlug) || undefined}>
                <summary className="catalog-filter__summary__SW3ap">{copy.categories}</summary>
                <div className="catalog-filter__panel__SW3al">
                  <div className="catalog-filter__choices__SW3am">
                    {filters.categories.map((category) => {
                      const active = category.slug === categorySlug;

                      return (
                        <Link
                          className="catalog-filter__choice__SW3an"
                          data-active={active ? "true" : undefined}
                          href={asRoute(
                            getHref(basePath, resolvedQuery, {
                              category: active ? null : category.slug,
                            }),
                          )}
                          key={category.id}
                          scroll={false}
                        >
                          {category.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </details>
            ) : null}

            {filters.collections.length > 0 ? (
              <details className="catalog-filter__group__SW3ao" open={Boolean(collectionSlug) || undefined}>
                <summary className="catalog-filter__summary__SW3ap">{copy.collections}</summary>
                <div className="catalog-filter__panel__SW3al">
                  <div className="catalog-filter__choices__SW3am">
                    {filters.collections.map((collection) => {
                      const active = collection.slug === collectionSlug;

                      return (
                        <Link
                          className="catalog-filter__choice__SW3an"
                          data-active={active ? "true" : undefined}
                          href={asRoute(
                            getHref(basePath, resolvedQuery, {
                              collection: active ? null : collection.slug,
                            }),
                          )}
                          key={collection.id}
                          scroll={false}
                        >
                          {collection.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </details>
            ) : null}

            {filters.options.map((option) => {
              const activeValues = optionValues[option.code] ?? [];

              return (
                <details
                  className="catalog-filter__group__SW3ao"
                  key={option.code}
                  open={activeValues.length > 0 || undefined}
                >
                  <summary className="catalog-filter__summary__SW3ap">{option.name}</summary>
                  <div className="catalog-filter__panel__SW3al">
                    <div className="catalog-filter__choices__SW3am">
                      {option.values.map((value) => {
                        const active = activeValues.includes(value);

                        return (
                          <Link
                            className="catalog-filter__choice__SW3an"
                            data-active={active ? "true" : undefined}
                            href={asRoute(getToggleMultiHref(basePath, resolvedQuery, option.code, value))}
                            key={`${option.code}-${value}`}
                            scroll={false}
                          >
                            {value}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </aside>

        <div className="catalog__results__SW3as">
          <CatalogProductGrid
            copy={gridCopy}
            isSignedIn={Boolean(likedUserId ?? likedOnlyUserId)}
            items={gridItems}
            locale={locale}
            removeOnUnlike={Boolean(likedOnlyUserId)}
          />
        </div>
      </section>
  );
}
