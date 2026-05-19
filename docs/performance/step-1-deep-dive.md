# Step 1 Deep Dive: Real Bottlenecks

Generated: 2026-05-19T17:28:26.089Z

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
| high | cart.drawerLikes.load mobile p75 4,067.7 ms | Compare browser timing with storefront.cart.loadLikes server traces. |
| high | cart.drawerLikes.load desktop p75 3,981.7 ms | Compare browser timing with storefront.cart.loadLikes server traces. |
| high | cart.signedIn.addItem desktop p75 1,917.3 ms | Compare browser timing with storefront.cart.addItem server traces. |
| high | cart.addItem mobile p75 1,915.1 ms | Compare browser timing with storefront.cart.addItem server traces. |
| high | cart.signedIn.addItem mobile p75 1,903.5 ms | Compare browser timing with storefront.cart.addItem server traces. |
| high | auth.sessionBootstrap desktop p75 1,755.5 ms | Inspect browser trace, network waterfall, and readiness marker timing. |
| high | auth.sessionBootstrap mobile p75 1,648.2 ms | Inspect browser trace, network waterfall, and readiness marker timing. |
| high | account.signOut desktop p75 1,552.3 ms | Inspect browser trace, network waterfall, and readiness marker timing. |
| high | account.signOut mobile p75 1,520.7 ms | Inspect browser trace, network waterfall, and readiness marker timing. |
| high | cart.addItem desktop p75 1,410.4 ms | Compare browser timing with storefront.cart.addItem server traces. |
| high | account.quickLink.rewards mobile p75 1,182.1 ms | Inspect browser trace, network waterfall, and readiness marker timing. |
| high | product.like mobile p75 1,087.7 ms | Compare browser timing with storefront.product.toggleLike server traces. |

## Playwright Workflow Timings

| Device | Auth | Cache | Measurement | n | p50 | p75 | p95 | Failures | Transfer p75 | Server trace |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| mobile | signed-in | - | cart.drawerLikes.load | 5 | 3,955.9 ms | 4,067.7 ms | 4,337.9 ms | 0 | 29.2 KB | storefront.cart.loadLikes |
| desktop | signed-in | - | cart.drawerLikes.load | 5 | 3,939.7 ms | 3,981.7 ms | 4,180.9 ms | 0 | 2.1 KB | storefront.cart.loadLikes |
| desktop | signed-in | cold | route.signedIn.account | 5 | 1,377.9 ms | 2,111.3 ms | 2,491.1 ms | 0 | 7.1 KB | storefront.account.dashboard |
| desktop | signed-in | - | cart.signedIn.addItem | 5 | 1,916.9 ms | 1,917.3 ms | 2,437.2 ms | 0 | 10.2 KB | storefront.cart.addItem |
| mobile | guest | - | cart.addItem | 5 | 1,403.1 ms | 1,915.1 ms | 2,415.8 ms | 0 | 238.7 KB | storefront.cart.addItem |
| mobile | signed-in | - | cart.signedIn.addItem | 5 | 1,897.1 ms | 1,903.5 ms | 1,929.5 ms | 0 | 10.2 KB | storefront.cart.addItem |
| mobile | signed-in | cold | route.signedIn.wishlist | 5 | 1,584.8 ms | 1,853.1 ms | 2,337.6 ms | 0 | 3.9 KB | storefront.catalog.productCards.personalized |
| mobile | signed-in | cold | route.signedIn.checkoutEntry | 5 | 1,582.8 ms | 1,802.5 ms | 2,422.8 ms | 0 | 14.7 KB | storefront.checkout.prefill |
| desktop | guest | - | auth.sessionBootstrap | 15 | 1,617.4 ms | 1,755.5 ms | 1,921.2 ms | 0 | 228.7 KB | - |
| desktop | signed-in | cold | route.signedIn.cartWithItems | 5 | 1,495.5 ms | 1,661.4 ms | 1,683.1 ms | 0 | 4 KB | storefront.cart.loadExisting |
| mobile | guest | - | auth.sessionBootstrap | 15 | 1,593.5 ms | 1,648.2 ms | 2,893.3 ms | 0 | 228.7 KB | - |
| mobile | signed-in | cold | route.signedIn.cartWithItems | 5 | 1,459.4 ms | 1,602.3 ms | 3,116.8 ms | 0 | 3.5 KB | storefront.cart.loadExisting |
| desktop | signed-in | - | account.signOut | 5 | 1,538.6 ms | 1,552.3 ms | 1,564 ms | 0 | 26.6 KB | - |
| desktop | signed-in | cold | route.signedIn.checkoutEntry | 5 | 1,537.8 ms | 1,543.7 ms | 1,565.5 ms | 0 | 14.7 KB | storefront.checkout.prefill |
| mobile | signed-in | - | account.signOut | 5 | 1,519.9 ms | 1,520.7 ms | 1,532.9 ms | 0 | 25.6 KB | - |
| desktop | signed-in | cold | route.signedIn.wishlist | 5 | 1,424.1 ms | 1,447.7 ms | 1,566.9 ms | 0 | 5.3 KB | storefront.catalog.productCards.personalized |
| desktop | guest | - | cart.addItem | 5 | 1,405.8 ms | 1,410.4 ms | 1,883.1 ms | 0 | 238.7 KB | storefront.cart.addItem |
| mobile | signed-in | cold | route.signedIn.account | 5 | 1,304.7 ms | 1,371.2 ms | 1,434.7 ms | 0 | 2.6 KB | storefront.account.dashboard |
| mobile | signed-in | - | account.quickLink.rewards | 5 | 825.3 ms | 1,182.1 ms | 2,232.4 ms | 0 | 18.7 KB | - |
| mobile | signed-in | - | product.like | 5 | 1,083.6 ms | 1,087.7 ms | 1,185.5 ms | 0 | 13.1 KB | storefront.product.toggleLike |
| mobile | signed-in | - | product.unlike | 5 | 1,082.5 ms | 1,084.9 ms | 1,085.2 ms | 0 | 4.1 KB | storefront.product.toggleLike |
| mobile | guest | - | cart.incrementQuantity | 5 | 858.2 ms | 868.1 ms | 872.6 ms | 0 | 244.6 KB | storefront.cart.updateQuantity |
| desktop | guest | - | cart.incrementQuantity | 5 | 861.3 ms | 866.5 ms | 867.8 ms | 0 | 244.6 KB | storefront.cart.updateQuantity |
| desktop | guest | - | cart.decrementQuantity | 5 | 844.7 ms | 855.1 ms | 859 ms | 0 | 293.7 KB | storefront.cart.updateQuantity |
| mobile | guest | - | cart.decrementQuantity | 5 | 844.5 ms | 849.9 ms | 852.5 ms | 0 | 293.7 KB | storefront.cart.updateQuantity |
| desktop | guest | - | cart.removeItem | 5 | 838 ms | 839.9 ms | 840.6 ms | 0 | 337.3 KB | storefront.cart.removeItem |
| mobile | guest | - | cart.removeItem | 5 | 838.8 ms | 839 ms | 839.6 ms | 0 | 337.3 KB | storefront.cart.removeItem |
| desktop | signed-in | - | account.quickLink.rewards | 5 | 826.6 ms | 831.7 ms | 832.6 ms | 0 | 19.7 KB | - |
| desktop | signed-in | - | account.quickLink.addresses | 5 | 231.8 ms | 238.6 ms | 329 ms | 0 | 10.1 KB | - |
| mobile | signed-in | - | account.quickLink.addresses | 5 | 233.8 ms | 238.4 ms | 335.4 ms | 0 | 11 KB | - |

## Server Trace Summary

_No data captured yet._

## Lighthouse Summary

| Device | Route | n | Perf | FCP | LCP | TBT | CLS | Speed Index |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| mobile | /da/products | 3 | 95 | 1,355.4 ms | 2,941.1 ms | 8 ms | 0 | 1,362.1 ms |
| mobile | /da/products?sort=newest | 3 | 95 | 1,357.3 ms | 2,930.3 ms | 11.5 ms | 0 | 1,357.3 ms |
| mobile | /da/products/essential-creatine-monohydrate | 3 | 95 | 1,209 ms | 2,914.6 ms | 10.5 ms | 0 | 1,209 ms |
| account-mobile | /da/account | 3 | 95 | 1,206.4 ms | 2,851.4 ms | 10 ms | 0 | 2,430 ms |
| mobile | /da | 3 | 96 | 1,060.8 ms | 2,707.3 ms | 14.5 ms | 0 | 1,060.8 ms |
| mobile | /da/cart | 6 | 95 | 1,060.2 ms | 2,705.2 ms | 10 ms | 0 | 1,060.2 ms |
| mobile | /da/wishlist | 3 | 97 | 1,056.4 ms | 2,687.1 ms | 2.5 ms | 0 | 1,056.4 ms |
| auth-mobile | /da/sign-up | 3 | 98 | 909.3 ms | 2,332.3 ms | 11.5 ms | 0 | 909.3 ms |
| auth-mobile | /da/sign-in | 3 | 98 | 909.1 ms | 2,327.2 ms | 19 ms | 0 | 909.1 ms |
| auth-mobile | /da/forgot-password | 3 | 98 | 907.6 ms | 2,326.4 ms | 18 ms | 0 | 907.6 ms |
| desktop | /da/products | 3 | 100 | 366.7 ms | 684.7 ms | 0 ms | 0 | 366.7 ms |
| desktop | /da/products?sort=newest | 3 | 100 | 367.6 ms | 650.3 ms | 0 ms | 0 | 367.6 ms |
| desktop | /da/products/essential-creatine-monohydrate | 3 | 100 | 326.2 ms | 624.2 ms | 0 ms | 0 | 326.2 ms |
| desktop | /da | 3 | 100 | 287.2 ms | 591.9 ms | 0 ms | 0 | 287.2 ms |
| account-desktop | /da/account | 3 | 100 | 327 ms | 587 ms | 0 ms | 0 | 937.8 ms |
| desktop | /da/cart | 6 | 100 | 288.8 ms | 586.5 ms | 0 ms | 0 | 309.7 ms |
| desktop | /da/wishlist | 3 | 100 | 286.7 ms | 562.8 ms | 0 ms | 0 | 286.7 ms |
| auth-desktop | /da/sign-in | 3 | 100 | 249.2 ms | 507.2 ms | 0 ms | 0 | 249.2 ms |
| auth-desktop | /da/forgot-password | 3 | 100 | 248.6 ms | 506.5 ms | 0 ms | 0 | 248.6 ms |
| auth-desktop | /da/sign-up | 3 | 100 | 246.8 ms | 503.9 ms | 0 ms | 0 | 246.8 ms |

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
