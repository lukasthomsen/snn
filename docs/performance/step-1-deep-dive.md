# Step 1 Deep Dive: Real Bottlenecks

Generated: 2026-05-16T21:33:16.164Z

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
| high | mobile /da/products/essential-creatine-monohydrate Lighthouse LCP 3,193.8 ms, TBT 27 ms, CLS 0 | Open the Lighthouse trace and inspect LCP element, request discovery, render blocking, and layout shifts. |
| high | mobile /da/products?sort=newest Lighthouse LCP 3,158.5 ms, TBT 19 ms, CLS 0 | Open the Lighthouse trace and inspect LCP element, request discovery, render blocking, and layout shifts. |
| high | mobile /da/products Lighthouse LCP 3,150.7 ms, TBT 29 ms, CLS 0 | Open the Lighthouse trace and inspect LCP element, request discovery, render blocking, and layout shifts. |
| high | mobile /da Lighthouse LCP 2,788.4 ms, TBT 59 ms, CLS 0 | Open the Lighthouse trace and inspect LCP element, request discovery, render blocking, and layout shifts. |

## Playwright Workflow Timings

_No data captured yet._

## Server Trace Summary

_No data captured yet._

## Lighthouse Summary

| Device | Route | n | Perf | FCP | LCP | TBT | CLS | Speed Index |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| mobile | /da/products/essential-creatine-monohydrate | 3 | 93 | 1,112.6 ms | 3,193.8 ms | 27 ms | 0 | 2,817.6 ms |
| mobile | /da/products?sort=newest | 3 | 90 | 1,564.1 ms | 3,158.5 ms | 19 ms | 0 | 4,333.4 ms |
| mobile | /da/products | 3 | 90 | 1,572.3 ms | 3,150.7 ms | 29 ms | 0 | 4,444 ms |
| mobile | /da | 3 | 94 | 1,105.9 ms | 2,788.4 ms | 59 ms | 0 | 3,907 ms |
| account-mobile | /da/account | 3 | 97 | 1,206.6 ms | 2,488.2 ms | 8.5 ms | 0 | 1,206.9 ms |
| mobile | /da/wishlist | 3 | 97 | 1,117.6 ms | 2,452.7 ms | 39 ms | 0 | 1,513.4 ms |
| mobile | /da/cart | 6 | 98 | 1,102.9 ms | 2,302.9 ms | 13 ms | 0 | 1,431.2 ms |
| desktop | /da/products | 1 | 86 | 298.9 ms | 1,452.9 ms | 17 ms | 0 | 6,353.3 ms |
| desktop | /da/products/essential-creatine-monohydrate | 1 | 89 | 333.8 ms | 1,067.8 ms | 7.5 ms | 0 | 4,112.5 ms |
| desktop | /da | 1 | 99 | 265.7 ms | 979.7 ms | 0 ms | 0 | 702.3 ms |
| desktop | /da/products?sort=newest | 1 | 94 | 295.9 ms | 952.9 ms | 1 ms | 0 | 2,202.1 ms |
| desktop | /da/cart | 2 | 94 | 261 ms | 811 ms | 4.5 ms | 0 | 1,193.8 ms |
| desktop | /da/wishlist | 1 | 99 | 248.9 ms | 762.9 ms | 0 ms | 0 | 1,082.9 ms |
| account-desktop | /da/account | 3 | 100 | 325.5 ms | 531.1 ms | 0 ms | 0 | 435.8 ms |

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
