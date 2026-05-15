const locale = process.env.PERF_LOCALE || "da";
const baseUrl = (process.env.PERF_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const productSlug = process.env.PERF_PRODUCT_SLUG || "essential-creatine-monohydrate";
const runs = Number(process.env.PERF_LHCI_RUNS || "3");

const urls = [
  `${baseUrl}/${locale}`,
  `${baseUrl}/${locale}/products`,
  `${baseUrl}/${locale}/products?sort=newest`,
  `${baseUrl}/${locale}/products/${productSlug}`,
  `${baseUrl}/${locale}/cart`,
  `${baseUrl}/${locale}/checkout`,
  `${baseUrl}/${locale}/wishlist`,
];

const assertions = {
  "categories:accessibility": ["warn", { minScore: 0.9 }],
  "categories:best-practices": ["warn", { minScore: 0.9 }],
  "categories:performance": ["warn", { minScore: 0.75 }],
  "categories:seo": ["warn", { minScore: 0.85 }],
  "cumulative-layout-shift": ["warn", { maxNumericValue: 0.1 }],
  "largest-contentful-paint": ["warn", { maxNumericValue: 2500 }],
  "total-blocking-time": ["warn", { maxNumericValue: 200 }],
};

module.exports = {
  assertions,
  baseUrl,
  locale,
  productSlug,
  runs,
  urls,
};
