"use server";

import { headers } from "next/headers";

import {
  addCartItem,
  CartServiceError,
  getCartSnapshot,
  getProductCards,
  removeCartItem,
  updateCartItemQuantity,
  type CartErrorCode,
  type CartIdentityInput,
  type CartSnapshot,
} from "@snn/commerce";
import { getCustomerSession } from "@snn/customer";
import { tracePerformance } from "@snn/db";
import type { Locale } from "@snn/i18n";

import { getCartIdentity, setCartCookie } from "./cart-data";

type CartActionInput = {
  locale: Locale;
};

export type CartActionResult =
  | {
      cart: CartSnapshot;
      ok: true;
    }
  | {
      code: CartErrorCode | "AUTH_REQUIRED";
      message: string;
      ok: false;
    };

export type CartDrawerLikeItem = {
  id: string;
  imageUrl: string | null;
  name: string;
  price: {
    amount: number;
    currencyCode: string;
  };
  slug: string;
  variantId: string;
};

export type CartDrawerLikesResult =
  | {
      items: CartDrawerLikeItem[];
      ok: true;
    }
  | {
      code: "AUTH_REQUIRED";
      message: string;
      ok: false;
    };

const cartActionMessages = {
  da: {
    AUTH_REQUIRED: "Log ind for at se dine gemte produkter.",
    CART_CHANGED: "Din kurv blev opdateret. Gennemga den og prov igen.",
    CART_NOT_FOUND: "Vi kunne ikke finde kurven.",
    ADD_FAILED: "Vi kunne ikke tilfoje produktet til kurven lige nu.",
    LOAD_FAILED: "Vi kunne ikke hente kurven lige nu.",
    REMOVE_FAILED: "Vi kunne ikke fjerne produktet lige nu.",
    UNKNOWN: "Vi kunne ikke opdatere kurven lige nu.",
    UPDATE_FAILED: "Vi kunne ikke opdatere produktet lige nu.",
    VARIANT_NOT_FOUND: "Produktet er ikke tilgængeligt.",
    VARIANT_UNAVAILABLE: "Produktet er udsolgt eller ikke tilgængeligt i det antal.",
  },
  en: {
    AUTH_REQUIRED: "Log in to view your saved products.",
    CART_CHANGED: "Your bag was updated. Please review it and try again.",
    CART_NOT_FOUND: "We could not find the bag.",
    ADD_FAILED: "We could not add this item to your bag right now.",
    LOAD_FAILED: "We could not load your bag right now.",
    REMOVE_FAILED: "We could not remove this item right now.",
    UNKNOWN: "We could not update the bag right now.",
    UPDATE_FAILED: "We could not update this item right now.",
    VARIANT_NOT_FOUND: "This product is not available.",
    VARIANT_UNAVAILABLE: "This product is sold out or unavailable in that quantity.",
  },
} as const;

type CartActionMessageCode = CartErrorCode | "AUTH_REQUIRED" | "ADD_FAILED" | "LOAD_FAILED" | "REMOVE_FAILED" | "UPDATE_FAILED";

function getCartActionMessage(locale: Locale, code: CartActionMessageCode) {
  return cartActionMessages[locale][code] ?? cartActionMessages[locale].UNKNOWN;
}

async function withCartAction(
  actionName: string,
  locale: Locale,
  action: (identity: CartIdentityInput) => Promise<CartSnapshot>,
  fallbackCode: "ADD_FAILED" | "LOAD_FAILED" | "REMOVE_FAILED" | "UPDATE_FAILED" = "UPDATE_FAILED",
): Promise<CartActionResult> {
  return tracePerformance(`storefront.cart.${actionName}`, { locale }, async () => {
    try {
      const identity = await getCartIdentity(locale);
      const cart = await action(identity);

      await setCartCookie(cart.id);

      return {
        cart,
        ok: true,
      };
    } catch (error) {
      if (error instanceof CartServiceError) {
        return {
          code: error.code,
          message: getCartActionMessage(locale, error.code),
          ok: false,
        };
      }

      return {
        code: "UNKNOWN",
        message: getCartActionMessage(locale, fallbackCode),
        ok: false,
      };
    };
  });
}

export async function loadCartDrawerAction({ locale }: CartActionInput) {
  return withCartAction("loadDrawer", locale, (identity) => getCartSnapshot(identity), "LOAD_FAILED");
}

export async function addCartItemAction({
  locale,
  quantity = 1,
  variantId,
}: CartActionInput & {
  quantity?: number | undefined;
  variantId: string;
}) {
  return withCartAction("addItem", locale, (identity) => addCartItem({
    ...identity,
    quantity,
    variantId,
  }), "ADD_FAILED");
}

export async function updateCartItemQuantityAction({
  itemId,
  locale,
  quantity,
}: CartActionInput & {
  itemId: string;
  quantity: number;
}) {
  return withCartAction("updateQuantity", locale, (identity) => updateCartItemQuantity({
    ...identity,
    itemId,
    quantity,
  }), "UPDATE_FAILED");
}

export async function removeCartItemAction({
  itemId,
  locale,
}: CartActionInput & {
  itemId: string;
}) {
  return withCartAction("removeItem", locale, (identity) => removeCartItem({
    ...identity,
    itemId,
  }), "REMOVE_FAILED");
}

export async function loadCartLikesAction({ locale }: CartActionInput): Promise<CartDrawerLikesResult> {
  return tracePerformance("storefront.cart.loadLikes", { locale }, async () => {
    const session = await getCustomerSession(await headers()).catch(() => null);

    if (!session?.user.emailVerified || session.user.banned) {
      return {
        code: "AUTH_REQUIRED",
        message: getCartActionMessage(locale, "AUTH_REQUIRED"),
        ok: false,
      };
    }

    const productList = await getProductCards({
      countryCode: "DK",
      likedOnlyUserId: session.user.id,
      likedUserId: session.user.id,
      locale,
      limit: 12,
    });

    return {
      items: productList.items.map((product) => ({
        id: product.id,
        imageUrl: product.imageUrl,
        name: product.name,
        price: {
          amount: product.price.amount,
          currencyCode: product.price.currencyCode,
        },
        slug: product.slug,
        variantId: product.variantId,
      })),
      ok: true,
    };
  });
}
