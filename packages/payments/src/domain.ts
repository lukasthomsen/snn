import type Stripe from "stripe";

export type CheckoutSessionMode = "payment" | "setup" | "subscription";
export type CheckoutSessionPaymentStatus = "no_payment_required" | "paid" | "unpaid";
export type CheckoutSessionLifecycleStatus = "complete" | "expired" | "open";
export type StripeWebhookProcessingStatus =
  | "duplicate"
  | "failed"
  | "ignored"
  | "pending"
  | "processed";

export type StripeCheckoutSessionSnapshot = {
  amountTotal?: number | null;
  currencyCode?: string | null;
  customerEmail?: string | null;
  id: string;
  metadata: Record<string, string>;
  mode: CheckoutSessionMode;
  paymentStatus: CheckoutSessionPaymentStatus;
  status: CheckoutSessionLifecycleStatus;
  url?: string | null;
};

export type StripeWebhookEnvelope = {
  createdAt: string;
  externalEventId: string;
  livemode: boolean;
  objectType: string;
  type: string;
};

export type StripePaymentProjection = {
  amount: number;
  capturedAmount: number;
  currencyCode: string;
  externalReference: string;
  metadata: Record<string, unknown>;
  orderId: string;
  status: "authorized" | "captured" | "failed" | "pending" | "refunded";
};

export function mapStripeCheckoutSession(
  session: Stripe.Checkout.Session,
): StripeCheckoutSessionSnapshot {
  return {
    amountTotal: session.amount_total,
    currencyCode: session.currency?.toUpperCase() ?? null,
    customerEmail: session.customer_details?.email ?? session.customer_email,
    id: session.id,
    metadata: session.metadata ?? {},
    mode: session.mode,
    paymentStatus: session.payment_status,
    status: session.status ?? "open",
    url: session.url,
  };
}

export function mapStripeWebhookEnvelope(event: Stripe.Event): StripeWebhookEnvelope {
  return {
    createdAt: new Date(event.created * 1000).toISOString(),
    externalEventId: event.id,
    livemode: event.livemode,
    objectType: event.data.object.object,
    type: event.type,
  };
}
