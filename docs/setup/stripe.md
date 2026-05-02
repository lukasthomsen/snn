# Stripe Foundation

SNN is set up for Stripe foundation only in this phase.

That means:

- Stripe server client
- webhook signature verification
- persisted webhook events
- payment status projection into the `payment` table when an order reference exists

This phase does **not** include checkout UI or Apple Pay domain validation.

## Required environment variables

For `apps/storefront/.env.local` and the `snn-storefront` Vercel project:

```env
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

Use test-mode values for now.

## Webhook route

The storefront runtime exposes:

- `POST /api/webhooks/stripe`

Absolute production URL on the temporary domain:

- `https://auth.veloro.dk/api/webhooks/stripe`

Recommended Stripe webhook events for this phase:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`
- `charge.refunded`

## How the base layer processes events

1. Verifies the `Stripe-Signature` header with `STRIPE_WEBHOOK_SECRET`
2. Persists the event idempotently into `webhook_event`
3. Projects known payment events into the `payment` table when metadata contains an `orderId`
4. Marks the webhook event as `processed`, `ignored`, or `failed`

## Important metadata convention

Future checkout-session creation should include an order identifier in Stripe metadata:

```json
{
  "orderId": "ORDER_UUID"
}
```

That is how the webhook projector knows which `order` row to reconcile.

## Vercel setup

Add the three Stripe environment variables to the `snn-storefront` project in:

- `Development`
- `Preview`
- `Production`

The `snn-admin` project does not need Stripe envs yet.
