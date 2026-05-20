# Cloudflare Turnstile Setup

## Decision

SNN uses Cloudflare Turnstile for bot protection on sensitive public forms, starting with authentication and later expanding to checkout and other abuse-prone entry points.

Cloudflare remains:

- Turnstile provider

Production page traffic remains Vercel-primary. `www`, `accounts`, and `admin`
should resolve directly to Vercel and should not be Cloudflare-proxied. Cloudflare
can be used for DNS-only records in the future, but orange-cloud proxying in
front of Vercel is intentionally out of scope for the current setup.

## Widget Strategy

Use separate widgets per environment boundary.

### Development widget

- Name: `snn-auth-dev`
- Mode: `managed`
- Hostnames:
  - `localhost`
  - `127.0.0.1`

### Production widget

- Name: `snn-auth-prod`
- Mode: `managed`
- Hostnames:
  - `accounts.veloro.dk`
  - `auth.veloro.dk` temporary legacy redirect hostname

## Preview Policy

Preview deployments intentionally do not receive a Turnstile widget by default.

Reason:

- Turnstile hostname management does not support wildcards
- allowing a broad shared hostname such as `vercel.app` would be too loose for a production-grade setup
- a future stable staging auth hostname is the better long-term path

This keeps preview deploys working while avoiding an overly permissive widget policy.

## Environment Variables

Map the widget keys like this:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `CF_TURNSTILE_SECRET_KEY`

### Local apps

Use the development widget keys in local apps that render Turnstile-protected
auth forms, for example:

- root `.env.local`
- `apps/storefront/.env.local`

### Vercel auth-facing apps

Use the matching widget keys in every Vercel project that renders
Turnstile-protected auth forms:

- Development: development widget keys
- Production: production widget keys

The production `snn-accounts` project must use the `snn-auth-prod` key pair so
`accounts.veloro.dk` is authorized by the live widget.

The admin app does not need Turnstile keys yet.

## Server-Side Validation

Turnstile tokens must always be validated server-side through Cloudflare Siteverify.

SNN exposes the shared validation foundation from:

- [packages/auth/src/turnstile.ts](/Users/lukasthomsen/Desktop/snn/packages/auth/src/turnstile.ts)

That helper:

- checks whether Turnstile is configured
- validates tokens against Cloudflare Siteverify
- enforces the expected hostname
- optionally enforces an expected action

## Future Work

Next steps for Turnstile integration:

1. add the widget to auth forms
2. validate tokens in auth mutations
3. add a stable staging hostname if preview auth verification becomes part of the regular workflow
4. extend the same pattern to checkout and other high-risk public forms

## Edge Audit

Run the read-only edge audit from the repo root:

```bash
pnpm perf:edge
```

The audit confirms that page traffic is direct to Vercel, verifies Turnstile key
pairing without printing secret values, and records whether the production auth
page has an active widget or only the server-side validation foundation.

## Proxy Contingency Only

Do not enable Cloudflare proxying in front of Vercel for `www`, `accounts`, or
`admin` under the current target state. If that decision changes later, add
Cloudflare Cache Rules that bypass:

- every request with a `Cookie` header
- every request with an `Authorization` header
- `/api/*`, including media routes and webhooks
- cart, checkout, wishlist, account, sign-in, and sign-up paths
- accounts and admin hostnames entirely

Keep page caching on Vercel unless a later performance review explicitly changes
the edge architecture.
