# Cloudflare Turnstile Setup

## Decision

SNN uses Cloudflare Turnstile for bot protection on sensitive public forms, starting with authentication and later expanding to checkout and other abuse-prone entry points.

Cloudflare remains:

- authoritative DNS
- Turnstile provider

Cloudflare does **not** proxy `www`, `auth`, or `admin` in front of Vercel.

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
  - `auth.veloro.dk`

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

### Local storefront

Use the development widget keys in:

- `apps/storefront/.env.local`

### Vercel storefront

Use:

- Development: development widget keys
- Production: production widget keys

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
