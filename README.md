# SNN

SNN is a scalable ecommerce monorepo built on:

- Next.js 16
- TypeScript
- Better Auth
- Neon PostgreSQL
- Drizzle ORM
- Cloudflare DNS + Turnstile
- Zustand
- Vercel Pro
- Custom CSS with shared tokens and CSS Modules

## Phase order

1. Foundation
2. Theme system
3. Front page
4. Header and footer
5. Auth pages
6. Continue feature delivery

## Workspace

- `apps/storefront`: storefront runtime, health endpoint, and Better Auth API host
- `apps/admin`: staff/admin runtime
- `packages/auth`: shared Better Auth server and client setup
- `packages/commerce`: domain constants and commerce contracts
- `packages/config`: typed runtime configuration and host derivation
- `packages/db`: Drizzle schema and Neon database access
- `packages/eslint-config`: shared ESLint configuration
- `packages/i18n`: shared locale routing and dictionary loading
- `packages/media`: Cloudflare Images contracts, direct-upload helpers, and delivery URL utilities
- `packages/payments`: Stripe foundation, webhook verification, and payment event mapping
- `packages/tsconfig`: shared TypeScript baselines
- `packages/ui`: shared theme runtime, CSS token surface, and reusable UI components

## Local commands

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
```

## Commerce Database Commands

Use a local or other non-production database unless you explicitly intend to touch shared data.

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:backfill:commerce
pnpm db:backfill:commerce -- --apply
pnpm db:seed:commerce
pnpm db:seed:commerce -- --apply
pnpm db:check:commerce
```

- `db:backfill:commerce` converts legacy variant prices and stock links into price sets and inventory items.
- `db:seed:commerce` creates deterministic sample products across supplements, snacks, accessories, apparel, bundles, market prices, sale prices, media placeholders, and inventory.
- `db:check:commerce` reports storefront-blocking catalog issues before cart and checkout work begins.
