import { and, eq } from "drizzle-orm";
import type Stripe from "stripe";

import { getDb, schema } from "@snn/db";

import type { StripePaymentProjection, StripeWebhookProcessingStatus } from "./domain";

export async function persistStripeWebhookEvent(event: Stripe.Event) {
  const db = getDb();
  const serializedEvent = JSON.parse(JSON.stringify(event)) as Record<string, unknown>;
  const [inserted] = await db
    .insert(schema.webhookEvents)
    .values({
      externalEventId: event.id,
      payload: serializedEvent,
      source: "stripe",
      status: "pending",
      type: event.type,
    })
    .onConflictDoNothing({
      target: [schema.webhookEvents.source, schema.webhookEvents.externalEventId],
    })
    .returning({
      id: schema.webhookEvents.id,
    });

  return {
    inserted: Boolean(inserted),
    serializedEvent,
    webhookEventId: inserted?.id,
  };
}

export async function markStripeWebhookEvent(
  eventId: string,
  status: Exclude<StripeWebhookProcessingStatus, "duplicate">,
) {
  const db = getDb();

  await db
    .update(schema.webhookEvents)
    .set({
      processedAt: new Date().toISOString(),
      status,
      updatedAt: new Date(),
    })
    .where(
      and(eq(schema.webhookEvents.source, "stripe"), eq(schema.webhookEvents.externalEventId, eventId)),
    );
}

export async function upsertStripePaymentRecord(payment: StripePaymentProjection) {
  const db = getDb();
  const [order] = await db
    .select({
      id: schema.orders.id,
    })
    .from(schema.orders)
    .where(eq(schema.orders.id, payment.orderId))
    .limit(1);

  if (!order) {
    return {
      reason: "missing-order",
      upserted: false,
    } as const;
  }

  await db
    .insert(schema.payments)
    .values({
      amount: payment.amount,
      capturedAmount: payment.capturedAmount,
      currencyCode: payment.currencyCode,
      externalReference: payment.externalReference,
      metadata: payment.metadata,
      orderId: payment.orderId,
      provider: "stripe",
      status: payment.status,
    })
    .onConflictDoUpdate({
      set: {
        amount: payment.amount,
        capturedAmount: payment.capturedAmount,
        currencyCode: payment.currencyCode,
        metadata: payment.metadata,
        status: payment.status,
        updatedAt: new Date(),
      },
      target: [schema.payments.provider, schema.payments.externalReference],
    });

  return {
    upserted: true,
  } as const;
}
