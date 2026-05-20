# Step 1 Deep Dive: Real Bottlenecks

Generated: 2026-05-20T15:27:20.389Z

## How To Run

```bash
pnpm perf:preflight
pnpm perf:local
pnpm perf:report
```

For the production-like local lab, set `PERF_ENVIRONMENT=local`, `PERF_BASE_URL=http://localhost:3000`, `PERF_AUTH_BASE_URL=http://localhost:3002`, `PERF_LOCALE=da`, `PERF_PRODUCT_SLUG=essential-creatine-monohydrate`, and disposable `PERF_CUSTOMER_EMAIL`/`PERF_CUSTOMER_PASSWORD`. Then run `pnpm perf:preflight` followed by `pnpm perf:local`; the local runner lints perf tooling, builds the repo, starts storefront/accounts with `next start`, prepares the disposable customer, runs Lighthouse, runs Playwright flows, writes the report, and shuts servers down.

Set `PERF_CHECKOUT_PAYMENT_PREP=1` only with Stripe test credentials. The validation path requires `STRIPE_SECRET_KEY=sk_test_*` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_*`, and the Playwright flow prepares payment only; it never confirms payment.

For preview server traces, enable `ENABLE_PERFORMANCE_TRACE=1` on the preview deployment and save JSON log lines containing `"event":"performance.trace"` to one of:

- `perf-reports/server-traces.ndjson`
- `perf-reports/vercel-traces.ndjson`
- the file path in `PERF_SERVER_TRACE_FILE`

## Top Candidates

_No data captured yet._

## Playwright Workflow Timings

| Device | Auth | Cache | Measurement | n | p50 | p75 | p95 | Failures | Transfer p75 | Server trace |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| mobile | signed-in | - | cart.drawerLikes.load | 5 | 877.9 ms | 880.5 ms | 898.5 ms | 0 | 14.5 KB | storefront.cart.loadLikes |
| desktop | signed-in | - | cart.drawerLikes.load | 5 | 872.2 ms | 879.4 ms | 881.3 ms | 0 | 14.5 KB | storefront.cart.loadLikes |
| mobile | signed-in | - | cart.signedIn.addItem | 5 | 864 ms | 871 ms | 876 ms | 0 | 72.7 KB | storefront.cart.addItem |
| desktop | signed-in | - | cart.signedIn.addItem | 5 | 864.5 ms | 868.6 ms | 869.1 ms | 0 | 72.7 KB | storefront.cart.addItem |
| mobile | guest | - | cart.addItem | 5 | 866.1 ms | 868 ms | 871.1 ms | 0 | 243.9 KB | storefront.cart.addItem |
| desktop | guest | - | cart.addItem | 5 | 849.4 ms | 851.4 ms | 861.9 ms | 0 | 243.9 KB | storefront.cart.addItem |
| mobile | signed-in | - | account.quickLink.rewards | 5 | 846.3 ms | 846.4 ms | 1,186.8 ms | 0 | 31.5 KB | - |
| desktop | signed-in | - | account.quickLink.rewards | 5 | 838.2 ms | 840.5 ms | 842.8 ms | 0 | 24.8 KB | - |
| desktop | guest | - | cart.incrementQuantity | 5 | 563.3 ms | 701 ms | 839.8 ms | 0 | 256.1 KB | storefront.cart.updateQuantity |
| mobile | guest | - | auth.sessionBootstrap | 15 | 429.1 ms | 573.8 ms | 619.3 ms | 0 | 194.8 KB | - |
| desktop | guest | - | auth.sessionBootstrap | 15 | 420.6 ms | 569.4 ms | 578.8 ms | 0 | 194.8 KB | - |
| desktop | signed-in | cold | route.signedIn.checkoutEntry | 5 | 510.1 ms | 515.3 ms | 543 ms | 0 | 34.9 KB | storefront.checkout.prefill |
| mobile | signed-in | cold | route.signedIn.checkoutEntry | 5 | 505.5 ms | 510.8 ms | 525.2 ms | 0 | 34.9 KB | storefront.checkout.prefill |
| mobile | signed-in | cold | route.signedIn.wishlist | 5 | 435.8 ms | 436.9 ms | 436.9 ms | 0 | 8.6 KB | storefront.catalog.productCards.personalized |
| desktop | signed-in | cold | route.signedIn.wishlist | 5 | 426.9 ms | 433.9 ms | 447.1 ms | 0 | 14.3 KB | storefront.catalog.productCards.personalized |
| desktop | guest | - | cart.decrementQuantity | 5 | 344.3 ms | 349.7 ms | 350.9 ms | 0 | 268.3 KB | storefront.cart.updateQuantity |
| mobile | guest | - | cart.decrementQuantity | 5 | 347.6 ms | 347.8 ms | 349.9 ms | 0 | 268.3 KB | storefront.cart.updateQuantity |
| mobile | guest | - | cart.incrementQuantity | 5 | 341.7 ms | 342.3 ms | 349.2 ms | 0 | 256.1 KB | storefront.cart.updateQuantity |
| mobile | guest | - | cart.removeItem | 5 | 338.1 ms | 340.1 ms | 342 ms | 0 | 279.8 KB | storefront.cart.removeItem |
| desktop | guest | - | cart.removeItem | 5 | 326 ms | 338.6 ms | 339 ms | 0 | 279.8 KB | storefront.cart.removeItem |
| mobile | signed-in | - | account.signOut | 5 | 286.2 ms | 300.2 ms | 301.4 ms | 0 | 0 B | - |
| desktop | signed-in | - | account.signOut | 5 | 280.6 ms | 290.6 ms | 292.6 ms | 0 | 0 B | - |
| mobile | signed-in | - | account.quickLink.addresses | 5 | 235.8 ms | 237.8 ms | 240.7 ms | 0 | 22.3 KB | - |
| desktop | signed-in | - | account.quickLink.addresses | 5 | 229.7 ms | 231.2 ms | 237.1 ms | 0 | 15.6 KB | - |
| mobile | signed-in | - | product.like | 5 | 228.2 ms | 230.5 ms | 232.6 ms | 0 | 71.5 KB | storefront.product.toggleLike |
| desktop | signed-in | - | product.like | 5 | 219.9 ms | 229.8 ms | 235.1 ms | 0 | 71.5 KB | storefront.product.toggleLike |
| mobile | signed-in | - | product.unlike | 5 | 210.5 ms | 219.9 ms | 220.5 ms | 0 | 11 KB | storefront.product.toggleLike |
| desktop | signed-in | - | product.unlike | 5 | 215.7 ms | 217.3 ms | 842.3 ms | 0 | 11 KB | storefront.product.toggleLike |
| mobile | signed-in | cold | route.signedIn.account | 5 | 209.2 ms | 210.1 ms | 211.5 ms | 0 | 0 B | storefront.account.dashboard |
| desktop | signed-in | cold | route.signedIn.account | 5 | 205.9 ms | 206.5 ms | 212.6 ms | 0 | 0 B | storefront.account.dashboard |

## Server Trace Summary

_No data captured yet._

## Lighthouse Summary

| Device | Route | n | Perf | FCP | LCP | TBT | CLS | Speed Index | LCP element | LCP resource | LCP subparts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| account-mobile | /da/account | 5 | 98 | 1,076.1 ms | 2,489.6 ms | 26 ms | 0 | 1,521.3 ms | div.accountDashboard__root__SW2i0 > section.accountHero__root__SW2a0 > div.accountHero__name_... | - | TTFB: 710.1 ms; Load Delay: 0 ms; Load Time: 0 ms; Render Delay: 1,781.8 ms |
| mobile | /da/products/essential-creatine-monohydrate | 5 | 98 | 909.1 ms | 2,482.5 ms | 18 ms | 0 | 909.1 ms | body > main.product-detail__root__SW3b0 > div.product-detail__mobile-headline__SW3ca > h1.pro... | - | TTFB: 453.5 ms; Load Delay: 0 ms; Load Time: 0 ms; Render Delay: 2,338.1 ms |
| mobile | /da/products?sort=newest | 5 | 98 | 907.4 ms | 2,477.7 ms | 10 ms | 0 | 958.7 ms | main.catalog__root__SW3a0 > div > section.catalog-hero__root__SW3a1 > h1 | - | TTFB: 453.7 ms; Load Delay: 0 ms; Load Time: 0 ms; Render Delay: 2,026.7 ms |
| mobile | /da | 5 | 98 | 760.9 ms | 2,477.6 ms | 41.4 ms | 0 | 760.9 ms | div.hero__stage__SW0g1 > div.hero__inner__SW0g2 > div.hero__copy__SW0g3 > h1.hero__title__SW0g5 | - | TTFB: 455.5 ms; Load Delay: 0 ms; Load Time: 0 ms; Render Delay: 2,024.5 ms |
| mobile | /da/checkout | 5 | 98 | 908.6 ms | 2,476.2 ms | 9 ms | 0 | 908.6 ms | main.cartPage__root__SW6a0 > section.cartPage__empty__SW6a7 > div > p | - | TTFB: 453.1 ms; Load Delay: 0 ms; Load Time: 0 ms; Render Delay: 2,026.1 ms |
| auth-mobile | /da/sign-up | 5 | 98 | 906.6 ms | 2,409 ms | 20.5 ms | 0 | 906.6 ms | div.auth__card-frame__SW0fm > div.auth__card__SW0fn > div.auth__header__SW0fo > h2#auth-title | - | TTFB: 453 ms; Load Delay: 0 ms; Load Time: 0 ms; Render Delay: 1,956.1 ms |
| mobile | /da/cart | 5 | 98 | 758.3 ms | 2,330.3 ms | 11 ms | 0 | 758.3 ms | main.cartPage__root__SW6a0 > section.cartPage__empty__SW6a7 > div > p | - | TTFB: 453.2 ms; Load Delay: 0 ms; Load Time: 0 ms; Render Delay: 1,909.2 ms |
| mobile | /da/products | 5 | 98 | 908.4 ms | 2,328.8 ms | 11 ms | 0 | 920.4 ms | main.catalog__root__SW3a0 > div > section.catalog-hero__root__SW3a1 > h1 | - | TTFB: 453.7 ms; Load Delay: 0 ms; Load Time: 0 ms; Render Delay: 2,025.7 ms |
| auth-mobile | /da/sign-in | 5 | 98 | 908.1 ms | 2,325.1 ms | 19 ms | 0 | 908.1 ms | div.auth__card-frame__SW0fm > div.auth__card__SW0fn > div.auth__header__SW0fo > h2#auth-title | - | TTFB: 453.5 ms; Load Delay: 0 ms; Load Time: 0 ms; Render Delay: 1,872.5 ms |
| auth-mobile | /da/forgot-password | 5 | 98 | 908.4 ms | 2,324.6 ms | 51 ms | 0 | 908.4 ms | div.auth__card-frame__SW0fm > div.auth__card__SW0fn > div.auth__header__SW0fo > h1#auth-title | - | TTFB: 455.5 ms; Load Delay: 0 ms; Load Time: 0 ms; Render Delay: 1,906.5 ms |
| mobile | /da/wishlist | 5 | 98 | 756.7 ms | 2,323.8 ms | 9 ms | 0 | 756.7 ms | body > main.wishlistPrompt__root__SW4a0 > section.wishlistPrompt__panel__SW4a1 > h1 | - | TTFB: 453.6 ms; Load Delay: 0 ms; Load Time: 0 ms; Render Delay: 1,876.6 ms |
| account-desktop | /da/account | 5 | 100 | 253.1 ms | 554.4 ms | 0 ms | 0 | 567.5 ms | div.accountDashboard__root__SW2i0 > section.accountHero__root__SW2a0 > div.accountHero__name_... | - | TTFB: 680.3 ms; Load Delay: 0 ms; Load Time: 0 ms; Render Delay: -119.7 ms |
| auth-desktop | /da/sign-in | 5 | 100 | 251 ms | 536.5 ms | 0 ms | 0 | 251 ms | aside.brand__panel__SW0fe > div.brand__copy__SW0fg > div.brand__rotation__SW0hn > h2.heading_... | - | TTFB: 125.8 ms; Load Delay: 0 ms; Load Time: 0 ms; Render Delay: 411.6 ms |
| auth-desktop | /da/forgot-password | 5 | 100 | 248.3 ms | 505.3 ms | 0 ms | 0 | 248.3 ms | aside.brand__panel__SW0fe > div.brand__copy__SW0fg > div.brand__rotation__SW0hn > h2.heading_... | - | TTFB: 124.7 ms; Load Delay: 0 ms; Load Time: 0 ms; Render Delay: 381.7 ms |
| auth-desktop | /da/sign-up | 5 | 100 | 246.6 ms | 504.8 ms | 0 ms | 0 | 246.6 ms | aside.brand__panel__SW0fe > div.brand__copy__SW0fg > div.brand__rotation__SW0hn > h2.heading_... | - | TTFB: 122.9 ms; Load Delay: 0 ms; Load Time: 0 ms; Render Delay: 405.8 ms |

## Targets

- LCP p75: <= 2500 ms
- INP p75: <= 200 ms in field data; use Playwright click-to-feedback timings and Lighthouse TBT as lab proxies
- CLS p75: <= 0.1
- Instant optimistic feedback p75: <= 200 ms where separately measured
- Full browser action p75 after server completion/readiness marker: <= 1000 ms
- Server action p75 investigation threshold: > 1000 ms or query p75 >= 10

## Notes

- Playwright rows use deterministic `data-perf-*` readiness markers rather than `networkidle`.
- Response-backed auth teardown rows use endpoint response timing when available, so the report tracks server/session work instead of Playwright locator auto-wait noise.
- Browser timings and server traces are intentionally separate raw inputs; this report joins them by measurement name and `serverTraceName` so slow UI waits can be separated from slow database work.
- Production smoke should stay limited to public cache/header checks unless production mutations are explicitly approved.
