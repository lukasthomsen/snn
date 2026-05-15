import "server-only";

import { cookies, headers } from "next/headers";

import {
  CartServiceError,
  getExistingCartSnapshot,
  type CartIdentityInput,
  type CartMoney,
  type CartSnapshot,
} from "@snn/commerce";
import { ensureCustomerProfile, getCustomerAddresses, getCustomerSession } from "@snn/customer";
import type { Locale } from "@snn/i18n";

export const cartCookieName = "snn_cart_id";

export const cartCookieMaxAge = 30 * 24 * 60 * 60;

export type CheckoutPrefill = {
  city: string;
  countryCode: string;
  email: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2: string;
  phone: string;
  postalCode: string;
  signedIn: boolean;
};

const fallbackCurrencyCode = "DKK";
const freeExpressShippingThresholdAmount = 130_000;
const freeShippingThresholdAmount = 55_000;

function money(amount: number, currencyCode = fallbackCurrencyCode): CartMoney {
  return {
    amount,
    currencyCode,
  };
}

export function createEmptyCartSnapshot(currencyCode = fallbackCurrencyCode): CartSnapshot {
  return {
    currencyCode,
    id: "empty",
    itemCount: 0,
    lines: [],
    recommendations: [],
    shipping: {
      amount: null,
      expressProgressPercent: 0,
      freeExpressShippingThreshold: money(freeExpressShippingThresholdAmount, currencyCode),
      freeShippingThreshold: money(freeShippingThresholdAmount, currencyCode),
      label: "calculated_at_checkout",
      progressPercent: 0,
      qualifiedForFreeExpressShipping: false,
      qualifiedForFreeShipping: false,
      remainingExpressAmount: money(freeExpressShippingThresholdAmount, currencyCode),
      remainingAmount: money(freeShippingThresholdAmount, currencyCode),
    },
    subtotal: money(0, currencyCode),
    total: money(0, currencyCode),
  };
}

export async function setCartCookie(cartId: string) {
  const cookieStore = await cookies();

  cookieStore.set(cartCookieName, cartId, {
    httpOnly: true,
    maxAge: cartCookieMaxAge,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function getCartIdentity(locale: Locale): Promise<CartIdentityInput> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const session = await getCustomerSession(headerStore).catch(() => null);
  const verifiedCustomer = session?.user.emailVerified && !session.user.banned
    ? session.user
    : null;
  const profile = verifiedCustomer ? await ensureCustomerProfile(verifiedCustomer) : null;

  return {
    cartId: cookieStore.get(cartCookieName)?.value ?? null,
    countryCode: "DK",
    customerId: profile?.id ?? null,
    email: verifiedCustomer?.email ?? null,
    likedUserId: verifiedCustomer?.id ?? null,
    locale,
  };
}

export async function loadExistingCartSnapshot(locale: Locale): Promise<CartSnapshot> {
  const identity = await getCartIdentity(locale);

  if (!identity.cartId && !identity.customerId) {
    return createEmptyCartSnapshot();
  }

  try {
    return await getExistingCartSnapshot(identity);
  } catch (error) {
    if (error instanceof CartServiceError && error.code === "CART_NOT_FOUND") {
      return createEmptyCartSnapshot();
    }

    throw error;
  }
}

export async function loadCheckoutPrefill(): Promise<CheckoutPrefill> {
  const session = await getCustomerSession(await headers()).catch(() => null);
  const verifiedCustomer = session?.user.emailVerified && !session.user.banned
    ? session.user
    : null;

  if (!verifiedCustomer) {
    return {
      city: "",
      countryCode: "DK",
      email: "",
      firstName: "",
      lastName: "",
      line1: "",
      line2: "",
      phone: "",
      postalCode: "",
      signedIn: false,
    };
  }

  const [profile, addresses] = await Promise.all([
    ensureCustomerProfile(verifiedCustomer),
    getCustomerAddresses(verifiedCustomer),
  ]);
  const address = addresses.find((item) => item.isDefaultShipping) ?? addresses[0] ?? null;

  return {
    city: address?.city ?? "",
    countryCode: address?.countryCode ?? "DK",
    email: verifiedCustomer.email,
    firstName: address?.firstName ?? profile.firstName ?? "",
    lastName: address?.lastName ?? profile.lastName ?? "",
    line1: address?.line1 ?? "",
    line2: address?.line2 ?? "",
    phone: address?.phone ?? profile.phone ?? "",
    postalCode: address?.postalCode ?? "",
    signedIn: true,
  };
}
