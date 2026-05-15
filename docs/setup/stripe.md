# Stripe Sandbox Checkout

SNN uses Stripe test-mode PaymentIntents with the on-site Payment Element on the
storefront checkout page.

Current customer-facing flow:

- `/[locale]/checkout` prepares or reuses a pending commerce order for the active cart.
- Stripe creates or updates a sandbox PaymentIntent for that order.
- The checkout page confirms payment through the Stripe Payment Element.
- Browser finalization and signed webhooks reconcile through the shared payment projection path.
- The cart remains `open` until payment reconciliation confirms success.

## Required environment variables

For `apps/storefront/.env.local` and the `snn-storefront` Vercel project:

```env
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

Use test-mode values for now.

Useful Stripe test cards:

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## Webhook route

The storefront runtime exposes:

- `POST /api/webhooks/stripe`

Absolute production URL:

- `https://www.veloro.dk/api/webhooks/stripe`

Recommended Stripe webhook events:

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`
- `charge.refunded`

The projector still tolerates Checkout Session events for compatibility, but the
current storefront checkout does not create Checkout Sessions.

## How the base layer processes events

1. Verifies the `Stripe-Signature` header with `STRIPE_WEBHOOK_SECRET`
2. Persists the event idempotently into `webhook_event`
3. Projects known payment events into the `payment` table when metadata contains an `orderId`
4. Marks the webhook event as `processed`, `ignored`, or `failed`

## Metadata convention

PaymentIntent creation must include:

```json
{
  "cartId": "CART_UUID",
  "orderId": "ORDER_UUID",
  "orderNumber": "SNN-YYYYMMDD-ABC123"
}
```

That is how webhooks and browser retries reconcile the same commerce order.

## Local verification

Use a disposable or development database before running payment/order tests.

```bash
pnpm db:check:migrations
pnpm --filter @snn/commerce typecheck
pnpm --filter @snn/payments typecheck
pnpm --filter @snn/storefront typecheck
pnpm --filter @snn/storefront lint
```

For signed webhook testing, forward events with Stripe CLI to:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Vercel setup

Add the three Stripe environment variables to the `snn-storefront` project in:

- `Development`
- `Preview`
- `Production`

The `snn-admin` project does not need Stripe envs yet.
