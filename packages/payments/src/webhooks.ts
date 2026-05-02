import Stripe from "stripe";

import { getStripeWebhookSecret } from "@snn/config";

import { getStripeClient } from "./client";

export function verifyStripeWebhookSignature(payload: string, signature: string | null) {
  const webhookSecret = getStripeWebhookSecret();

  if (!webhookSecret) {
    throw new Error("Stripe webhook secret is not configured. Set STRIPE_WEBHOOK_SECRET.");
  }

  if (!signature) {
    throw new Error("Missing Stripe-Signature header.");
  }

  return getStripeClient().webhooks.constructEvent(payload, signature, webhookSecret);
}

function readOrderId(metadata: Stripe.Metadata | null | undefined) {
  return metadata?.orderId ?? metadata?.order_id ?? null;
}

export function projectStripePaymentEvent(event: Stripe.Event) {
  const baseMetadata = {
    eventId: event.id,
    livemode: event.livemode,
    type: event.type,
  } satisfies Record<string, unknown>;

  switch (event.type) {
    case "checkout.session.async_payment_failed":
    case "checkout.session.async_payment_succeeded":
    case "checkout.session.completed":
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = readOrderId(session.metadata);

      if (!orderId) {
        return null;
      }

      const externalReference =
        typeof session.payment_intent === "string" ? session.payment_intent : session.id;

      return {
        amount: session.amount_total ?? 0,
        capturedAmount: session.payment_status === "paid" ? session.amount_total ?? 0 : 0,
        currencyCode: session.currency?.toUpperCase() ?? "DKK",
        externalReference,
        metadata: {
          ...baseMetadata,
          checkoutSessionId: session.id,
          mode: session.mode,
          paymentStatus: session.payment_status,
        },
        orderId,
        status:
          session.payment_status === "paid"
            ? "captured"
            : event.type === "checkout.session.expired" ||
                event.type === "checkout.session.async_payment_failed"
              ? "failed"
              : "pending",
      } as const;
    }
    case "payment_intent.canceled":
    case "payment_intent.payment_failed":
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const orderId = readOrderId(intent.metadata);

      if (!orderId) {
        return null;
      }

      return {
        amount: intent.amount,
        capturedAmount: intent.amount_received ?? 0,
        currencyCode: intent.currency.toUpperCase(),
        externalReference: intent.id,
        metadata: {
          ...baseMetadata,
          paymentIntentStatus: intent.status,
        },
        orderId,
        status:
          event.type === "payment_intent.succeeded"
            ? "captured"
            : event.type === "payment_intent.canceled" || event.type === "payment_intent.payment_failed"
              ? "failed"
              : "pending",
      } as const;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const orderId = readOrderId(charge.metadata);

      if (!orderId || !charge.payment_intent) {
        return null;
      }

      return {
        amount: charge.amount,
        capturedAmount: Math.max(0, charge.amount - charge.amount_refunded),
        currencyCode: charge.currency.toUpperCase(),
        externalReference:
          typeof charge.payment_intent === "string" ? charge.payment_intent : charge.id,
        metadata: {
          ...baseMetadata,
          amountRefunded: charge.amount_refunded,
          chargeId: charge.id,
        },
        orderId,
        status: charge.amount_refunded >= charge.amount ? "refunded" : "captured",
      } as const;
    }
    default:
      return null;
  }
}
