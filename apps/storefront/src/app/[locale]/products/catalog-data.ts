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
import type { Locale } from "@snn/i18n";

const catalogRevalidateSeconds = 300;

export const catalogCacheTags = {
  products: "commerce:products",
  reviews: "commerce:reviews",
} as const;

export const getCachedCatalogFilters = unstable_cache(
  async (input: { locale: Locale }) => getCatalogFilters(input),
  ["storefront-catalog-filters-v1"],
  {
    revalidate: catalogRevalidateSeconds,
    tags: [catalogCacheTags.products],
  },
);

export const getCachedProductCards = unstable_cache(
  async (input: ProductListInput) => getProductCards(input),
  ["storefront-product-cards-v1"],
  {
    revalidate: catalogRevalidateSeconds,
    tags: [catalogCacheTags.products],
  },
);

export const getCachedProductDetailBySlug = unstable_cache(
  async (input: ProductDetailInput) => getProductDetailBySlug(input),
  ["storefront-product-detail-v1"],
  {
    revalidate: catalogRevalidateSeconds,
    tags: [catalogCacheTags.products],
  },
);

export const getCachedRelatedProductCards = unstable_cache(
  async (input: RelatedProductCardsInput) => getRelatedProductCards(input),
  ["storefront-related-product-cards-v1"],
  {
    revalidate: catalogRevalidateSeconds,
    tags: [catalogCacheTags.products],
  },
);

export const getCachedProductReviewSummary = unstable_cache(
  async (productId: string) => getProductReviewSummary(productId),
  ["storefront-product-review-summary-v1"],
  {
    revalidate: catalogRevalidateSeconds,
    tags: [catalogCacheTags.reviews],
  },
);

export const getCachedProductReviews = unstable_cache(
  async (input: { productId: string }) => getProductReviews(input),
  ["storefront-product-reviews-v1"],
  {
    revalidate: catalogRevalidateSeconds,
    tags: [catalogCacheTags.reviews],
  },
);
