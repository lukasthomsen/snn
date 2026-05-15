"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";

import {
  createProductReview,
  ProductReviewServiceError,
  type ProductReviewErrorCode,
} from "@snn/commerce";
import {
  CustomerAuthError,
  ensureCustomerProfile,
  requireCustomerSession,
} from "@snn/customer";
import type { Locale } from "@snn/i18n";

import { catalogCacheTags } from "../catalog-data";

type SubmitProductReviewInput = {
  locale: Locale;
  productId: string;
  productSlug: string;
};

export type ProductReviewActionState = {
  fieldErrors?: Partial<Record<
    | "body"
    | "comfortScore"
    | "qualityScore"
    | "rating"
    | "routineFitScore"
    | "title"
    | "valueScore",
    string
  >> | undefined;
  message: string | null;
  ok: boolean;
};

const reviewActionMessages = {
  da: {
    ALREADY_REVIEWED: "Du har allerede anmeldt dette produkt.",
    AUTH_REQUIRED: "Log ind for at skrive en anmeldelse.",
    BANNED: "Denne konto kan ikke skrive anmeldelser.",
    EMAIL_UNVERIFIED: "Bekræft din email, før du skriver en anmeldelse.",
    INVALID_REVIEW: "Udfyld titel, tekst og vurderinger for at sende anmeldelsen.",
    NOT_PURCHASED: "Anmeldelser er kun for kunder, der har købt produktet.",
    UNKNOWN: "Vi kunne ikke gemme anmeldelsen lige nu.",
    success: "Tak. Din anmeldelse er nu vist på produktet.",
  },
  en: {
    ALREADY_REVIEWED: "You have already reviewed this product.",
    AUTH_REQUIRED: "Log in to write a review.",
    BANNED: "This account cannot write reviews.",
    EMAIL_UNVERIFIED: "Verify your email before writing a review.",
    INVALID_REVIEW: "Fill in the title, review, and ratings before submitting.",
    NOT_PURCHASED: "Reviews are only for customers who bought this product.",
    UNKNOWN: "We could not save the review right now.",
    success: "Thank you. Your review is now visible on the product.",
  },
} as const;

function getString(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

function getNumber(formData: FormData, name: string) {
  const value = Number(getString(formData, name));

  return Number.isFinite(value) ? value : 0;
}

function getReviewMessage(locale: Locale, code: ProductReviewErrorCode | "AUTH_REQUIRED" | "BANNED" | "EMAIL_UNVERIFIED") {
  return reviewActionMessages[locale][code] ?? reviewActionMessages[locale].UNKNOWN;
}

export async function submitProductReviewAction(
  input: SubmitProductReviewInput,
  _state: ProductReviewActionState,
  formData: FormData,
): Promise<ProductReviewActionState> {
  const copy = reviewActionMessages[input.locale];

  try {
    const { user } = await requireCustomerSession(await headers());
    const profile = await ensureCustomerProfile(user);
    const title = getString(formData, "title");
    const body = getString(formData, "body");

    if (!title.trim() || !body.trim()) {
      const fieldErrors: NonNullable<ProductReviewActionState["fieldErrors"]> = {};

      if (!title.trim()) {
        fieldErrors.title = copy.INVALID_REVIEW;
      }

      if (!body.trim()) {
        fieldErrors.body = copy.INVALID_REVIEW;
      }

      return {
        fieldErrors,
        message: copy.INVALID_REVIEW,
        ok: false,
      };
    }

    await createProductReview({
      body,
      comfortScore: getNumber(formData, "comfortScore"),
      customerId: profile.id,
      productId: input.productId,
      qualityScore: getNumber(formData, "qualityScore"),
      rating: getNumber(formData, "rating"),
      routineFitScore: getNumber(formData, "routineFitScore"),
      title,
      valueScore: getNumber(formData, "valueScore"),
      variantId: getString(formData, "variantId") || null,
      wouldRecommend: getString(formData, "wouldRecommend") === "on",
    });

    revalidatePath(`/${input.locale}/products/${input.productSlug}`);
    revalidateTag(catalogCacheTags.reviews, "max");

    return {
      message: copy.success,
      ok: true,
    };
  } catch (error) {
    if (error instanceof CustomerAuthError) {
      const code = error.code === "BANNED" || error.code === "EMAIL_UNVERIFIED"
        ? error.code
        : "AUTH_REQUIRED";

      return {
        message: getReviewMessage(input.locale, code),
        ok: false,
      };
    }

    if (error instanceof ProductReviewServiceError) {
      return {
        message: getReviewMessage(input.locale, error.code),
        ok: false,
      };
    }

    return {
      message: copy.UNKNOWN,
      ok: false,
    };
  }
}
