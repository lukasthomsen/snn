import Stripe from "stripe";

import { getStripeSecretKey } from "@snn/config";

let stripeClient: Stripe | undefined;

export function getStripeClient() {
  const secretKey = getStripeSecretKey();

  if (!secretKey) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}
