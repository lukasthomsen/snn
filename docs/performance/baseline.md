# Performance Baseline

This benchmark stack measures the current webshop through the same routes and flows we care about before optimization work begins.

## Environment

Set the deployed storefront URL before running benchmarks:

```bash
export PERF_BASE_URL="https://<storefront-preview-url>"
export PERF_PRODUCT_SLUG="essential-creatine-monohydrate"
export PERF_LOCALE="da"
```

For protected Vercel previews, add the project automation bypass secret. Lighthouse and Playwright send it as an HTTP header and request a bypass cookie for browser follow-up requests:

```bash
export PERF_VERCEL_BYPASS_TOKEN="<vercel-automation-bypass-secret>"
```

Signed-in flows are optional and require a disposable verified preview customer:

```bash
export PERF_AUTH_BASE_URL="https://<accounts-preview-url>"
export PERF_CUSTOMER_EMAIL="performance+preview@example.com"
export PERF_CUSTOMER_PASSWORD="<disposable-password>"
```

## Commands

```bash
pnpm perf:install-browsers
pnpm perf:lighthouse
pnpm perf:flows
pnpm perf:all
```

Reports are written to `perf-reports/`, which is intentionally ignored. Playwright also writes newline-delimited flow timings to `perf-reports/playwright/measurements.ndjson`.

## What To Capture

- Vercel preview URL and commit SHA.
- Lighthouse mobile and desktop medians across three runs.
- Playwright action timings for cart, likes, wishlist, and checkout entry.
- Vercel structured logs with `event=performance.trace`, including duration, query count, and total database time.
- Neon query-plan notes for the slowest traced actions.

## Baseline Notes

Captured on 2026-05-15 against the Git-backed Vercel preview for `codex/performance-baseline`.

- Preview URL: `https://snn-storefront-hhgn5xs72-medusa-2ed3b03a.vercel.app`
- Preview alias: `https://snn-storefront-git-codex-performance-baseline-medusa-2ed3b03a.vercel.app`
- Commit: `33a531d`
- Draft PR: `https://github.com/lukasthomsen/snn/pull/7`
- Vercel deployment: `dpl_FsMW74Jx4RSxWkySwPKZciU17uzL`
- Web Analytics: enabled for `snn-storefront`
- Speed Insights: not enabled; Vercel reported that the Hobby team can only enable Speed Insights on one project at a time.
- Preview DB: the preview database workflow passed, but provisioning was skipped by the GitHub-side Vercel access check. This run used the current Vercel preview database configuration rather than a newly provisioned Neon branch.

## Lighthouse Summary

Lighthouse CI ran three times per route for mobile and desktop. Values below are medians from the local reports in `perf-reports/lighthouse/`.

### Mobile

| Route | Perf | A11y | SEO | FCP | LCP | TBT | CLS | TTFB | Weight |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/da` | 94 | 90 | 60 | 1,106 ms | 2,788 ms | 59 ms | 0.000 | 35 ms | 295 KB |
| `/da/products` | 90 | 91 | 63 | 1,572 ms | 3,151 ms | 29 ms | 0.017 | 36 ms | 307 KB |
| `/da/products?sort=newest` | 90 | 91 | 63 | 1,564 ms | 3,159 ms | 19 ms | 0.017 | 36 ms | 307 KB |
| `/da/products/essential-creatine-monohydrate` | 93 | 84 | 63 | 1,113 ms | 3,194 ms | 27 ms | 0.000 | 36 ms | 313 KB |
| `/da/cart` | 98 | 90 | 60 | 1,119 ms | 2,321 ms | 25 ms | 0.000 | 38 ms | 296 KB |
| `/da/checkout` | 98 | 90 | 60 | 1,103 ms | 2,303 ms | 9 ms | 0.000 | 37 ms | 296 KB |
| `/da/wishlist` | 97 | 90 | 60 | 1,118 ms | 2,453 ms | 39 ms | 0.000 | 36 ms | 298 KB |

### Desktop

| Route | Perf | A11y | SEO | FCP | LCP | TBT | CLS | TTFB | Weight |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/da` | 100 | 90 | 60 | 334 ms | 536 ms | 0 ms | 0.000 | 37 ms | 358 KB |
| `/da/products` | 100 | 91 | 63 | 347 ms | 613 ms | 0 ms | 0.012 | 36 ms | 370 KB |
| `/da/products?sort=newest` | 100 | 91 | 63 | 324 ms | 650 ms | 0 ms | 0.012 | 37 ms | 371 KB |
| `/da/products/essential-creatine-monohydrate` | 100 | 84 | 63 | 336 ms | 581 ms | 0 ms | 0.000 | 36 ms | 376 KB |
| `/da/cart` | 100 | 90 | 60 | 340 ms | 503 ms | 0 ms | 0.000 | 36 ms | 360 KB |
| `/da/checkout` | 100 | 90 | 60 | 339 ms | 512 ms | 0 ms | 0.000 | 36 ms | 360 KB |
| `/da/wishlist` | 100 | 90 | 60 | 331 ms | 531 ms | 0 ms | 0.000 | 36 ms | 361 KB |

Notes:

- `/da/checkout` redirects to `/da/cart` in the empty-cart state, so checkout needs a seeded cart/customer state for a real checkout-entry benchmark.
- Mobile LCP misses the 2.5 s target on home, product listing, filtered listing, and product detail. TTFB is low, TBT is low, and transfer weight is modest, which points first at above-the-fold image/render priority rather than server response time.
- SEO scores are consistently low, and product detail accessibility is below target. These are not the main speed bottleneck, but they are now visible in CI.

## Playwright Flow Summary

Playwright ran five repeats on desktop and mobile against the protected preview using the Vercel automation bypass header. Signed-in like/wishlist tests skipped because no disposable verified preview customer credentials were provided.

| Project | Measurement | n | Median | p75 | p95 |
| --- | --- | ---: | ---: | ---: | ---: |
| desktop | `cart.addItem` | 5 | 158 ms | 161 ms | 166 ms |
| desktop | `cart.incrementQuantity` | 5 | 15,820 ms | 15,828 ms | 15,835 ms |
| desktop | `cart.decrementQuantity` | 5 | 15,049 ms | 15,052 ms | 15,065 ms |
| desktop | `cart.removeItem` | 5 | 15,047 ms | 15,055 ms | 15,074 ms |
| mobile | `cart.addItem` | 5 | 187 ms | 188 ms | 254 ms |
| mobile | `cart.incrementQuantity` | 5 | 15,552 ms | 15,616 ms | 17,200 ms |
| mobile | `cart.decrementQuantity` | 5 | 15,068 ms | 15,076 ms | 15,151 ms |
| mobile | `cart.removeItem` | 5 | 15,053 ms | 15,064 ms | 15,068 ms |

Route-load measurements were consistently around 15.7-16.9 s because the current helper waits for `networkidle` and usually reaches the 15 s timeout boundary. This is useful as a signal that persistent requests or analytics keep the network busy, but the next harness pass should measure paint-ready UI state separately from network-idle state.

## Vercel And Database Timing

Vercel logs returned 1,000 structured `performance.trace` events for the benchmark window and zero error-level logs for the deployment.

| Trace | n | Duration Median | p75 | p95 | Query Median | DB Median | DB p95 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `storefront.cart.addItem` | 60 | 154.1 ms | 164.0 ms | 164.0 ms | 17 | 147.7 ms | 151.5 ms |
| `storefront.cart.removeItem` | 60 | 94.4 ms | 97.3 ms | 97.3 ms | 12 | 117.1 ms | 130.1 ms |
| `storefront.cart.updateQuantity` | 119 | 46.9 ms | 57.2 ms | 60.8 ms | 3 | 8.7 ms | 10.2 ms |
| `storefront.checkout.prefill` | 40 | 5.6 ms | 6.7 ms | 6.7 ms | 0 | 0.0 ms | 0.0 ms |
| `storefront.cart.loadExisting` | 721 | 3.2 ms | 4.1 ms | 5.5 ms | 0 | 0.0 ms | 0.0 ms |

Findings:

- `cart.addItem` is the heaviest measured server action: 17 database queries and database time dominates the action duration.
- `cart.removeItem` is also query-heavy at 12 queries. The summed database time can exceed action wall time when queries overlap, but it still points at repeated cart/line recalculation work.
- `cart.updateQuantity` is comparatively cheap on the server, so the 15 s Playwright increment/decrement timings are almost certainly a UI/test-wait issue rather than a database issue.
- Catalog/product runtime traces did not appear in the Vercel log sample during warm benchmarks. That likely means those reads were served from static/RSC cache for these runs. A cold-cache route pass should be added before making catalog DB index decisions.

## Ranked Bottlenecks For Step Two

1. Mobile LCP on product surfaces: product listing, filtered listing, product detail, and home are above the 2.5 s target even with low TTFB and low TBT.
2. Cart add/remove query shape: add uses 17 queries and remove uses 12, with database time dominating the measured server action.
3. Interaction readiness measurement: quantity/remove tests wait for `networkidle` until timeout even though server traces are fast, so the UI needs a deterministic settled marker and possibly fewer persistent requests during cart mutations.
4. Checkout coverage gap: empty checkout redirects to cart, so benchmark coverage needs a 1-item cart and signed-in customer state.
5. Signed-in coverage gap: like/unlike and wishlist flow instrumentation is present, but the benchmark needs disposable verified customer credentials before those timings can be trusted.
6. Preview DB isolation gap: the workflow is prepared to migrate/seed preview DBs, but GitHub could not access the Vercel token path during this run, so Neon branch isolation still needs confirmation.
