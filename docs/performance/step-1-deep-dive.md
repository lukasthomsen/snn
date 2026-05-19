# Step 1 Deep Dive: Real Bottlenecks

Generated: 2026-05-19T11:20:56.379Z

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

| Impact | Finding | Next check |
| --- | --- | --- |
| high | cart.addItem desktop p75 2,008.8 ms | Compare browser timing with storefront.cart.addItem server traces. |
| high | cart.addItem mobile p75 1,971.4 ms | Compare browser timing with storefront.cart.addItem server traces. |
| high | cart.removeItem mobile p75 1,359.1 ms | Compare browser timing with storefront.cart.removeItem server traces. |
| high | cart.removeItem desktop p75 1,353.7 ms | Compare browser timing with storefront.cart.removeItem server traces. |
| high | cart.incrementQuantity desktop p75 933.8 ms | Compare browser timing with storefront.cart.updateQuantity server traces. |
| high | cart.incrementQuantity mobile p75 927.3 ms | Compare browser timing with storefront.cart.updateQuantity server traces. |
| high | cart.decrementQuantity mobile p75 877.9 ms | Compare browser timing with storefront.cart.updateQuantity server traces. |
| high | cart.decrementQuantity desktop p75 874.4 ms | Compare browser timing with storefront.cart.updateQuantity server traces. |
| high | mobile /da/products?sort=newest Lighthouse LCP 3,318.5 ms, TBT 12 ms, CLS 0 | Open the Lighthouse trace and inspect LCP element, request discovery, render blocking, and layout shifts. |
| high | mobile /da/products/essential-creatine-monohydrate Lighthouse LCP 3,238.8 ms, TBT 15 ms, CLS 0 | Open the Lighthouse trace and inspect LCP element, request discovery, render blocking, and layout shifts. |
| high | mobile /da/products Lighthouse LCP 3,134.8 ms, TBT 146.5 ms, CLS 0 | Open the Lighthouse trace and inspect LCP element, request discovery, render blocking, and layout shifts. |
| high | mobile /da/cart Lighthouse LCP 2,984.9 ms, TBT 13.5 ms, CLS 0 | Open the Lighthouse trace and inspect LCP element, request discovery, render blocking, and layout shifts. |

## Playwright Workflow Timings

| Device | Auth | Cache | Measurement | n | p50 | p75 | p95 | Failures | Transfer p75 | Server trace |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| desktop | guest | - | cart.addItem | 5 | 1,941.9 ms | 2,008.8 ms | 2,422.2 ms | 0 | 289.5 KB | storefront.cart.addItem |
| mobile | guest | - | cart.addItem | 5 | 1,968.4 ms | 1,971.4 ms | 2,018.8 ms | 0 | 289.5 KB | storefront.cart.addItem |
| mobile | guest | - | cart.removeItem | 5 | 1,353.7 ms | 1,359.1 ms | 1,385.4 ms | 0 | 363 KB | storefront.cart.removeItem |
| desktop | guest | - | cart.removeItem | 5 | 867.2 ms | 1,353.7 ms | 1,866.7 ms | 0 | 363 KB | storefront.cart.removeItem |
| desktop | guest | - | cart.incrementQuantity | 5 | 927.4 ms | 933.8 ms | 940.5 ms | 0 | 316.3 KB | storefront.cart.updateQuantity |
| mobile | guest | - | cart.incrementQuantity | 5 | 905.2 ms | 927.3 ms | 945.2 ms | 0 | 316.3 KB | storefront.cart.updateQuantity |
| mobile | guest | - | cart.decrementQuantity | 5 | 875.1 ms | 877.9 ms | 877.9 ms | 0 | 341 KB | storefront.cart.updateQuantity |
| desktop | guest | - | cart.decrementQuantity | 5 | 874 ms | 874.4 ms | 875.1 ms | 0 | 341 KB | storefront.cart.updateQuantity |
| mobile | guest | cold | route.public.catalog | 5 | 252.9 ms | 284.3 ms | 301.6 ms | 0 | 277.8 KB | storefront.catalog.productCards.cached |
| mobile | guest | cold | route.public.catalog.filtered | 5 | 238.5 ms | 248.8 ms | 250.5 ms | 0 | 279.2 KB | storefront.catalog.productCards.cached |
| mobile | guest | cold | route.public.productDetail | 5 | 232.9 ms | 235.5 ms | 266.9 ms | 0 | 284.1 KB | storefront.catalog.productDetail |
| desktop | guest | cold | route.public.catalog | 5 | 205.5 ms | 227.6 ms | 229.1 ms | 0 | 277.8 KB | storefront.catalog.productCards.cached |
| desktop | guest | cold | route.public.catalog.filtered | 5 | 203.1 ms | 220.1 ms | 222.4 ms | 0 | 279.6 KB | storefront.catalog.productCards.cached |
| mobile | guest | cold | route.public.wishlistSignedOut | 5 | 205.9 ms | 206.8 ms | 343.4 ms | 0 | 279.6 KB | - |
| desktop | guest | warm | route.public.catalog.warm | 5 | 130.8 ms | 196.4 ms | 220.9 ms | 0 | 3.4 KB | storefront.catalog.productCards.cached |
| mobile | guest | cold | route.public.accountSignedOutRedirect | 5 | 174.2 ms | 193.6 ms | 244.6 ms | 0 | 247.9 KB | - |
| mobile | guest | warm | route.public.catalog.filtered.warm | 5 | 166.5 ms | 188 ms | 203.2 ms | 0 | 3.9 KB | storefront.catalog.productCards.cached |
| mobile | guest | cold | route.public.home | 5 | 171.8 ms | 183.7 ms | 203 ms | 0 | 276.4 KB | - |
| desktop | guest | cold | route.public.productDetail | 5 | 172.7 ms | 176 ms | 181 ms | 0 | 285 KB | storefront.catalog.productDetail |
| desktop | guest | warm | route.public.catalog.filtered.warm | 5 | 138.4 ms | 163.4 ms | 174.2 ms | 0 | 3.9 KB | storefront.catalog.productCards.cached |
| mobile | guest | warm | route.public.catalog.warm | 5 | 158.4 ms | 160.3 ms | 207.3 ms | 0 | 3.4 KB | storefront.catalog.productCards.cached |
| mobile | guest | cold | route.public.checkoutEmptyRedirect | 5 | 153 ms | 154.2 ms | 180 ms | 0 | 277.8 KB | storefront.cart.loadExisting |
| desktop | guest | cold | route.public.wishlistSignedOut | 5 | 145.5 ms | 152.5 ms | 159.9 ms | 0 | 279.1 KB | - |
| mobile | guest | cold | route.public.emptyCart | 5 | 143.1 ms | 146.2 ms | 171.6 ms | 0 | 277.4 KB | storefront.cart.loadExisting |
| mobile | guest | warm | route.public.productDetail.warm | 5 | 132.6 ms | 132.9 ms | 224.2 ms | 0 | 2.1 KB | storefront.catalog.productDetail |
| desktop | guest | cold | route.public.home | 5 | 126.2 ms | 131.8 ms | 236.9 ms | 0 | 276.4 KB | - |
| desktop | guest | cold | route.public.checkoutEmptyRedirect | 5 | 120.2 ms | 128.8 ms | 138.1 ms | 0 | 277.8 KB | storefront.cart.loadExisting |
| desktop | guest | cold | route.public.accountSignedOutRedirect | 5 | 114.9 ms | 122.4 ms | 139.7 ms | 0 | 247.9 KB | - |
| mobile | guest | warm | route.public.home.warm | 5 | 95.6 ms | 106.8 ms | 109.4 ms | 0 | 3.4 KB | - |
| desktop | guest | warm | route.public.productDetail.warm | 5 | 99.2 ms | 105.7 ms | 106.8 ms | 0 | 3.9 KB | storefront.catalog.productDetail |

## Server Trace Summary

_No data captured yet._

## Lighthouse Summary

| Device | Route | n | Perf | FCP | LCP | TBT | CLS | Speed Index |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| mobile | /da/products?sort=newest | 3 | 92 | 1,358.1 ms | 3,318.5 ms | 12 ms | 0 | 1,358.1 ms |
| mobile | /da/products/essential-creatine-monohydrate | 3 | 93 | 1,210 ms | 3,238.8 ms | 15 ms | 0 | 1,210 ms |
| mobile | /da/products | 3 | 93 | 1,359.8 ms | 3,134.8 ms | 146.5 ms | 0 | 1,410 ms |
| mobile | /da/cart | 6 | 94 | 1,063.7 ms | 2,984.9 ms | 13.5 ms | 0 | 1,121.9 ms |
| mobile | /da/wishlist | 3 | 95 | 1,061.8 ms | 2,911.6 ms | 26.5 ms | 0 | 1,066 ms |
| mobile | /da | 3 | 95 | 1,061.8 ms | 2,901.9 ms | 33.5 ms | 0 | 1,061.8 ms |
| account-mobile | /da/account | 3 | 95 | 1,209.5 ms | 2,877.5 ms | 45 ms | 0 | 1,332.1 ms |
| auth-mobile | /da/sign-in | 3 | 96 | 1,078.5 ms | 2,646.6 ms | 113 ms | 0 | 2,376.7 ms |
| auth-mobile | /da/sign-up | 3 | 96 | 921.8 ms | 2,608.9 ms | 92.5 ms | 0 | 942.7 ms |
| auth-mobile | /da/forgot-password | 3 | 96 | 913.7 ms | 2,606 ms | 79 ms | 0 | 913.7 ms |
| desktop | /da/products?sort=newest | 3 | 100 | 378.9 ms | 780.4 ms | 0 ms | 0 | 386.3 ms |
| desktop | /da/products | 3 | 100 | 371.3 ms | 745.9 ms | 0 ms | 0 | 371.3 ms |
| desktop | /da/products/essential-creatine-monohydrate | 3 | 100 | 337.5 ms | 714.5 ms | 0 ms | 0 | 337.5 ms |
| desktop | /da/cart | 6 | 100 | 303.9 ms | 658.2 ms | 0 ms | 0 | 303.9 ms |
| account-desktop | /da/account | 3 | 100 | 329.1 ms | 654.7 ms | 0 ms | 0 | 445.8 ms |
| desktop | /da/wishlist | 3 | 100 | 294.5 ms | 627.8 ms | 0 ms | 0 | 294.5 ms |
| desktop | /da | 3 | 100 | 291.3 ms | 626.9 ms | 0 ms | 0 | 291.3 ms |
| auth-desktop | /da/sign-up | 3 | 100 | 255.8 ms | 577.8 ms | 0 ms | 0 | 279.3 ms |
| auth-desktop | /da/forgot-password | 3 | 100 | 261.9 ms | 560.9 ms | 0 ms | 0 | 261.9 ms |
| auth-desktop | /da/sign-in | 3 | 100 | 257 ms | 559 ms | 0 ms | 0 | 257 ms |

## Targets

- LCP p75: <= 2500 ms
- INP p75: <= 200 ms in field data; use Playwright click-to-feedback timings and Lighthouse TBT as lab proxies
- CLS p75: <= 0.1
- Interaction p75 for cart/likes/checkout feedback: <= 200 ms
- Server action p75 investigation threshold: > 200 ms or query p75 >= 10

## Notes

- Playwright rows use deterministic `data-perf-*` readiness markers rather than `networkidle`.
- Browser timings and server traces are intentionally separate raw inputs; this report joins them by measurement name and `serverTraceName` so slow UI waits can be separated from slow database work.
- Production smoke should stay limited to public cache/header checks unless production mutations are explicitly approved.
