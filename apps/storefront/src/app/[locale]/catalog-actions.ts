"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import {
  CustomerAuthError,
  likeCustomerProduct,
  requireCustomerSession,
  unlikeCustomerProduct,
} from "@snn/customer";
import { tracePerformance } from "@snn/db";
import type { Locale } from "@snn/i18n";

type ProductLikeActionInput = {
  liked: boolean;
  locale: Locale;
  productId: string;
  variantId: string;
};

type ProductLikeActionErrorCode =
  | "AUTH_REQUIRED"
  | "BANNED"
  | "EMAIL_UNVERIFIED"
  | "UNKNOWN";

export type ProductLikeActionResult =
  | {
      ok: true;
      liked: boolean;
      productId: string;
      variantId: string;
    }
  | {
      code: ProductLikeActionErrorCode;
      liked: boolean;
      message: string;
      ok: false;
      productId: string;
      variantId: string;
      redirectTo?: string | undefined;
    };

const actionMessages = {
  da: {
    authRequired: "Log ind for at gemme produkter.",
    banned: "Denne konto kan ikke gemme produkter.",
    emailUnverified: "Bekræft din email, før du gemmer produkter.",
    unknown: "Vi kunne ikke opdatere produktet lige nu.",
  },
  en: {
    authRequired: "Log in to save products.",
    banned: "This account cannot save products.",
    emailUnverified: "Verify your email before saving products.",
    unknown: "We could not update this product right now.",
  },
} as const;

function getWishlistPath(locale: Locale) {
  return `/${locale}/wishlist`;
}

async function getLikeSession(locale: Locale, previousLiked: boolean): Promise<{
  result?: ProductLikeActionResult;
  user?: Awaited<ReturnType<typeof requireCustomerSession>>["user"] | undefined;
}> {
  try {
    const { user } = await requireCustomerSession(await headers());

    return { user };
  } catch (error) {
    const copy = actionMessages[locale];

    if (error instanceof CustomerAuthError) {
      const messages = {
        AUTH_REQUIRED: copy.authRequired,
        BANNED: copy.banned,
        EMAIL_UNVERIFIED: copy.emailUnverified,
        FRESH_SESSION_REQUIRED: copy.authRequired,
        MFA_REQUIRED: copy.authRequired,
        STAFF_REQUIRED: copy.unknown,
      } satisfies Record<CustomerAuthError["code"], string>;
      const code: ProductLikeActionErrorCode = error.code === "AUTH_REQUIRED" ||
        error.code === "FRESH_SESSION_REQUIRED" ||
        error.code === "MFA_REQUIRED"
        ? "AUTH_REQUIRED"
        : error.code === "BANNED" || error.code === "EMAIL_UNVERIFIED"
          ? error.code
          : "UNKNOWN";

      return {
        result: {
          code,
          liked: previousLiked,
          message: messages[error.code],
          ok: false,
          productId: "",
          variantId: "",
          redirectTo: code === "AUTH_REQUIRED" ? getWishlistPath(locale) : undefined,
        },
      };
    }

    throw error;
  }
}

function revalidateLikedSurfaces(locale: Locale) {
  revalidatePath(`/${locale}/account`);
  revalidatePath(`/${locale}/account/liked`);
  revalidatePath(`/${locale}/wishlist`);
}

export async function toggleProductLikeAction({
  liked,
  locale,
  productId,
  variantId,
}: ProductLikeActionInput): Promise<ProductLikeActionResult> {
  return tracePerformance("storefront.product.toggleLike", {
    liked,
    locale,
  }, async () => {
    const previousLiked = !liked;
    const session = await getLikeSession(locale, previousLiked);

    if (session.result) {
      return {
        ...session.result,
        productId,
        variantId,
      };
    }

    if (!session.user) {
      return {
        code: "AUTH_REQUIRED",
        liked: previousLiked,
        message: actionMessages[locale].authRequired,
        ok: false,
        productId,
        variantId,
        redirectTo: getWishlistPath(locale),
      };
    }

    try {
      if (liked) {
        await likeCustomerProduct(session.user, productId, variantId);
      } else {
        await unlikeCustomerProduct(session.user, productId, variantId);
      }

      revalidateLikedSurfaces(locale);

      return {
        liked,
        ok: true,
        productId,
        variantId,
      };
    } catch {
      return {
        code: "UNKNOWN",
        liked: previousLiked,
        message: actionMessages[locale].unknown,
        ok: false,
        productId,
        variantId,
      };
    }
  });
}
