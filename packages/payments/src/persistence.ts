import { and, desc, eq } from "drizzle-orm";
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

export async function readLatestStripePaymentReference(orderId: string) {
  const db = getDb();
  const [payment] = await db
    .select({
      externalReference: schema.payments.externalReference,
    })
    .from(schema.payments)
    .where(and(eq(schema.payments.orderId, orderId), eq(schema.payments.provider, "stripe")))
    .orderBy(desc(schema.payments.updatedAt))
    .limit(1);

  return payment?.externalReference ?? null;
}

export async function upsertStripePaymentRecord(payment: StripePaymentProjection) {
  const db = getDb();
  let orderFound = false;

  await db.transaction(async (tx) => {
    const transactionalDb = tx as unknown as ReturnType<typeof getDb>;
    const [order] = await transactionalDb
      .select({
        cartId: schema.orders.cartId,
        id: schema.orders.id,
      })
      .from(schema.orders)
      .where(eq(schema.orders.id, payment.orderId))
      .limit(1);

    if (!order) {
      return;
    }

    orderFound = true;

    await transactionalDb
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

    if (payment.status === "captured" || payment.status === "authorized") {
      await transactionalDb
        .update(schema.orders)
        .set({
          status: "confirmed",
          updatedAt: new Date(),
        })
        .where(eq(schema.orders.id, payment.orderId));

      if (order.cartId) {
        await transactionalDb
          .update(schema.carts)
          .set({
            status: "converted",
            updatedAt: new Date(),
          })
          .where(eq(schema.carts.id, order.cartId));
      }
    }

    if (payment.status === "refunded") {
      await transactionalDb
        .update(schema.orders)
        .set({
          status: "refunded",
          updatedAt: new Date(),
        })
        .where(eq(schema.orders.id, payment.orderId));
    }
  });

  if (!orderFound) {
    return {
      reason: "missing-order",
      upserted: false,
    } as const;
  }

  return {
    upserted: true,
  } as const;
}
