import { NextResponse } from "next/server";

import {
  mapStripeWebhookEnvelope,
  markStripeWebhookEvent,
  persistStripeWebhookEvent,
  projectStripePaymentEvent,
  upsertStripePaymentRecord,
  verifyStripeWebhookSignature,
} from "@snn/payments";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = await request.text();

  let event;

  try {
    event = verifyStripeWebhookSignature(payload, request.headers.get("stripe-signature"));
  } catch (error) {
    console.error("Stripe webhook signature verification failed.");
    console.error(error);

    return NextResponse.json(
      {
        error: "invalid-stripe-signature",
      },
      { status: 400 },
    );
  }

  const persisted = await persistStripeWebhookEvent(event);

  if (!persisted.inserted) {
    return NextResponse.json({
      duplicate: true,
      event: mapStripeWebhookEnvelope(event),
      received: true,
    });
  }

  try {
    const projection = projectStripePaymentEvent(event);

    if (projection) {
      await upsertStripePaymentRecord(projection);
      await markStripeWebhookEvent(event.id, "processed");
    } else {
      await markStripeWebhookEvent(event.id, "ignored");
    }

    return NextResponse.json({
      event: mapStripeWebhookEnvelope(event),
      received: true,
      stored: true,
    });
  } catch (error) {
    await markStripeWebhookEvent(event.id, "failed");

    console.error("Stripe webhook processing failed.");
    console.error(error);

    return NextResponse.json(
      {
        error: "stripe-webhook-processing-failed",
      },
      { status: 500 },
    );
  }
}
