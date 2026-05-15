"use server";

import {
  CartServiceError,
  createCheckoutOrderFromCart,
  type CartMoney,
  type CheckoutOrderContactInput,
} from "@snn/commerce";
import { tracePerformance } from "@snn/db";
import type { Locale } from "@snn/i18n";
import {
  getStripeClient,
  projectStripePaymentIntent,
  readLatestStripePaymentReference,
  upsertStripePaymentRecord,
} from "@snn/payments";

import { getCartIdentity } from "../cart-data";

type StripeClient = ReturnType<typeof getStripeClient>;
type StripePaymentIntent = Parameters<typeof projectStripePaymentIntent>[0];

type PrepareCheckoutPaymentResult =
  | {
      amount: CartMoney;
      clientSecret: string;
      orderId: string;
      orderNumber: string;
      paymentIntentId: string;
      ok: true;
    }
  | {
      error: string;
      ok: false;
    };

type FinalizeCheckoutPaymentResult =
  | {
      orderId: string;
      ok: true;
      paymentStatus: "captured" | "failed" | "pending";
    }
  | {
      error: string;
      ok: false;
    };

const mutablePaymentIntentStatuses = new Set<string>([
  "requires_confirmation",
  "requires_payment_method",
]);

function normalizeContact(input: CheckoutOrderContactInput): CheckoutOrderContactInput {
  return {
    addressLine1: input.addressLine1.trim(),
    addressLine2: input.addressLine2?.trim() ?? "",
    city: input.city.trim(),
    countryCode: input.countryCode.trim().toUpperCase(),
    email: input.email.trim(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    phone: input.phone.trim(),
    postalCode: input.postalCode.trim(),
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof CartServiceError) {
    if (error.code === "CART_NOT_FOUND") {
      return "Your cart is empty or no longer available. Please review your bag and try again.";
    }

    if (error.code === "CART_CHANGED") {
      return "Your cart or checkout details changed. Please review your bag and try again.";
    }
  }

  if (error instanceof Error && error.message.includes("Stripe is not configured")) {
    return "Stripe sandbox is not configured for this environment.";
  }

  return "We could not prepare payment. Please check your details and try again.";
}

function getPaymentIntentMetadata(order: {
  amount: CartMoney;
  cartId: string;
  id: string;
  orderNumber: string;
}) {
  return {
    cartId: order.cartId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    orderTotal: String(order.amount.amount),
  };
}

function getPaymentIntentIdempotencyKey(order: {
  amount: CartMoney;
  id: string;
}) {
  return [
    "checkout",
    order.id,
    order.amount.currencyCode.toLowerCase(),
    order.amount.amount,
  ].join(":");
}

function assertExpectedAmount(orderAmount: CartMoney, expectedAmount: CartMoney) {
  if (
    orderAmount.amount !== expectedAmount.amount ||
    orderAmount.currencyCode !== expectedAmount.currencyCode
  ) {
    throw new CartServiceError("CART_CHANGED", "The cart amount changed during checkout.");
  }
}

async function persistPaymentIntent(paymentIntent: StripePaymentIntent, source: string) {
  const projection = projectStripePaymentIntent(paymentIntent, {
    checkoutSource: source,
    projectedAt: new Date().toISOString(),
  });

  if (!projection) {
    return false;
  }

  await upsertStripePaymentRecord(projection);

  return true;
}

async function createFreshPaymentIntent(
  stripe: StripeClient,
  order: Awaited<ReturnType<typeof createCheckoutOrderFromCart>>,
) {
  return stripe.paymentIntents.create(
    {
      amount: order.amount.amount,
      currency: order.amount.currencyCode.toLowerCase(),
      metadata: getPaymentIntentMetadata(order),
      payment_method_types: ["card"],
      receipt_email: order.email,
    },
    {
      idempotencyKey: getPaymentIntentIdempotencyKey(order),
    },
  );
}

async function getCheckoutPaymentIntent(
  stripe: StripeClient,
  order: Awaited<ReturnType<typeof createCheckoutOrderFromCart>>,
) {
  const existingPaymentReference = await readLatestStripePaymentReference(order.id);

  if (!existingPaymentReference?.startsWith("pi_")) {
    return createFreshPaymentIntent(stripe, order);
  }

  let existingPaymentIntent: StripePaymentIntent | null = null;

  try {
    existingPaymentIntent = await stripe.paymentIntents.retrieve(existingPaymentReference);
  } catch {
    existingPaymentIntent = null;
  }

  if (
    !existingPaymentIntent ||
    existingPaymentIntent.metadata.orderId !== order.id ||
    !mutablePaymentIntentStatuses.has(existingPaymentIntent.status)
  ) {
    return createFreshPaymentIntent(stripe, order);
  }

  if (existingPaymentIntent.currency.toUpperCase() !== order.amount.currencyCode) {
    return createFreshPaymentIntent(stripe, order);
  }

  return stripe.paymentIntents.update(
    existingPaymentIntent.id,
    {
      metadata: getPaymentIntentMetadata(order),
      receipt_email: order.email,
      ...(existingPaymentIntent.amount !== order.amount.amount
        ? { amount: order.amount.amount }
        : {}),
    },
    {
      idempotencyKey: `${getPaymentIntentIdempotencyKey(order)}:update`,
    },
  );
}

export async function prepareCheckoutPayment(
  locale: Locale,
  contactInput: CheckoutOrderContactInput,
  expectedAmount: CartMoney,
): Promise<PrepareCheckoutPaymentResult> {
  return tracePerformance("storefront.checkout.preparePayment", {
    currencyCode: expectedAmount.currencyCode,
    locale,
  }, async () => {
    try {
      const contact = normalizeContact(contactInput);
      const identity = await getCartIdentity(locale);
      const order = await createCheckoutOrderFromCart({
        ...identity,
        contact,
        locale,
      });

      if (order.amount.amount <= 0) {
        return {
          error: "Your order total must be greater than zero before payment.",
          ok: false,
        };
      }

      assertExpectedAmount(order.amount, expectedAmount);

      const stripe = getStripeClient();
      const paymentIntent = await getCheckoutPaymentIntent(stripe, order);

      if (!paymentIntent.client_secret) {
        return {
          error: "Stripe did not return a payment secret. Please try again.",
          ok: false,
        };
      }

      await persistPaymentIntent(paymentIntent, "prepare-checkout");

      return {
        amount: order.amount,
        clientSecret: paymentIntent.client_secret,
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentIntentId: paymentIntent.id,
        ok: true,
      };
    } catch (error) {
      return {
        error: getErrorMessage(error),
        ok: false,
      };
    }
  });
}

export async function finalizeCheckoutPayment(
  paymentIntentId: string,
): Promise<FinalizeCheckoutPaymentResult> {
  try {
    if (!paymentIntentId.startsWith("pi_")) {
      return {
        error: "Invalid Stripe payment reference.",
        ok: false,
      };
    }

    const paymentIntent = await getStripeClient().paymentIntents.retrieve(paymentIntentId);
    const orderId = paymentIntent.metadata.orderId;

    if (!orderId) {
      return {
        error: "Stripe payment is missing an order reference.",
        ok: false,
      };
    }

    const projection = projectStripePaymentIntent(paymentIntent, {
      checkoutSource: "finalize-checkout",
      projectedAt: new Date().toISOString(),
    });

    if (!projection) {
      return {
        error: "Stripe payment is missing an order reference.",
        ok: false,
      };
    }

    await upsertStripePaymentRecord(projection);

    return {
      orderId: projection.orderId,
      ok: true,
      paymentStatus: projection.status,
    };
  } catch {
    return {
      error: "We could not verify the payment with Stripe. Please refresh and check your order.",
      ok: false,
    };
  }
}
