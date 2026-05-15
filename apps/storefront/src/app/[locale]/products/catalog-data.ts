import { unstable_cache } from "next/cache";

import {
  getCatalogFilters,
  getProductCards,
  getProductDetailBySlug,
  getProductReviews,
  getProductReviewSummary,
  getRelatedProductCards,
  type ProductDetailInput,
  type ProductListInput,
  type RelatedProductCardsInput,
} from "@snn/commerce";
import { tracePerformance } from "@snn/db";
import type { Locale } from "@snn/i18n";

const catalogRevalidateSeconds = 300;

export const catalogCacheTags = {
  products: "commerce:products",
  reviews: "commerce:reviews",
} as const;

export const getCachedCatalogFilters = unstable_cache(
  async (input: { locale: Locale }) => tracePerformance("storefront.catalog.filters", {
    locale: input.locale,
  }, () => getCatalogFilters(input)),
  ["storefront-catalog-filters-v1"],
  {
    revalidate: catalogRevalidateSeconds,
    tags: [catalogCacheTags.products],
  },
);

export const getCachedProductCards = unstable_cache(
  async (input: ProductListInput) => traceProductCards("storefront.catalog.productCards.cached", input),
  ["storefront-product-cards-v1"],
  {
    revalidate: catalogRevalidateSeconds,
    tags: [catalogCacheTags.products],
  },
);

export const getCachedProductDetailBySlug = unstable_cache(
  async (input: ProductDetailInput) => tracePerformance("storefront.catalog.productDetail", {
    locale: input.locale ?? null,
    slug: input.slug,
  }, () => getProductDetailBySlug(input)),
  ["storefront-product-detail-v1"],
  {
    revalidate: catalogRevalidateSeconds,
    tags: [catalogCacheTags.products],
  },
);

export const getCachedRelatedProductCards = unstable_cache(
  async (input: RelatedProductCardsInput) => tracePerformance("storefront.catalog.relatedProducts.cached", {
    locale: input.locale ?? null,
    limit: input.limit ?? null,
  }, () => getRelatedProductCards(input)),
  ["storefront-related-product-cards-v1"],
  {
    revalidate: catalogRevalidateSeconds,
    tags: [catalogCacheTags.products],
  },
);

export const getCachedProductReviewSummary = unstable_cache(
  async (productId: string) => tracePerformance("storefront.catalog.reviewSummary", {}, () => getProductReviewSummary(productId)),
  ["storefront-product-review-summary-v1"],
  {
    revalidate: catalogRevalidateSeconds,
    tags: [catalogCacheTags.reviews],
  },
);

export const getCachedProductReviews = unstable_cache(
  async (input: { productId: string }) => tracePerformance("storefront.catalog.reviews", {}, () => getProductReviews(input)),
  ["storefront-product-reviews-v1"],
  {
    revalidate: catalogRevalidateSeconds,
    tags: [catalogCacheTags.reviews],
  },
);

export function getPersonalizedProductCards(input: ProductListInput) {
  return traceProductCards("storefront.catalog.productCards.personalized", input);
}

export function getPersonalizedRelatedProductCards(input: RelatedProductCardsInput) {
  return tracePerformance("storefront.catalog.relatedProducts.personalized", {
    locale: input.locale ?? null,
    limit: input.limit ?? null,
  }, () => getRelatedProductCards(input));
}

function traceProductCards(name: string, input: ProductListInput) {
  return tracePerformance(name, {
    category: input.categorySlug ?? null,
    collection: input.collectionSlug ?? null,
    likedOnly: Boolean(input.likedOnlyUserId),
    likedState: Boolean(input.likedUserId),
    limit: input.limit ?? null,
    locale: input.locale ?? null,
    onlyAvailable: input.onlyAvailable ?? null,
    sort: input.sort ?? null,
  }, () => getProductCards(input));
}
