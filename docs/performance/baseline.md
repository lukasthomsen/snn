# Performance Baseline

This benchmark stack measures the current webshop through the same routes and flows we care about before optimization work begins.

## Environment

Set the deployed storefront URL before running benchmarks:

```bash
export PERF_BASE_URL="https://<storefront-preview-url>"
export PERF_PRODUCT_SLUG="essential-creatine-monohydrate"
export PERF_LOCALE="da"
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

Fill this section after the first fresh preview run.

- Preview URL:
- Commit:
- Lighthouse summary:
- Playwright summary:
- Vercel/Neon findings:
- Top bottlenecks:
