"use client";

import { useActionState, useEffect, useMemo, useOptimistic, useState } from "react";
import { useRouter } from "next/navigation";

import type { Locale } from "@snn/i18n";

import {
  loadProductLikeStateAction,
  toggleProductLikeAction,
  type ProductLikeActionResult,
} from "../catalog-actions";

export type CatalogGridCopy = {
  available: string;
  empty: string;
  sale: string;
  save: string;
  saved: string;
  unavailable: string;
  unsave: string;
};

type ProductCardLikeControlProps = {
  copy: CatalogGridCopy;
  initialLiked: boolean;
  isSignedIn: boolean;
  locale: Locale;
  productId: string;
  variantId: string;
};

export function CatalogLikeStateLoader({
  locale,
  variantIds,
}: {
  locale: Locale;
  variantIds: string[];
}) {
  const variantKey = useMemo(() => variantIds.join("|"), [variantIds]);

  useEffect(() => {
    if (variantIds.length === 0) {
      return;
    }

    let cancelled = false;

    async function loadLikeState() {
      const result = await loadProductLikeStateAction({
        locale,
        variantIds,
      }).catch(() => null);

      if (!cancelled && result) {
        window.dispatchEvent(new CustomEvent("snn:catalog-like-state", {
          detail: {
            isSignedIn: result.isSignedIn,
            likedVariantIds: result.likedVariantIds,
          },
        }));
      }
    }

    void loadLikeState();

    return () => {
      cancelled = true;
    };
  }, [locale, variantKey, variantIds]);

  return null;
}

export function ProductCardLikeControl({
  copy,
  initialLiked,
  isSignedIn,
  locale,
  productId,
  variantId,
}: ProductCardLikeControlProps) {
  const router = useRouter();
  const [externalIsSignedIn, setExternalIsSignedIn] = useState<boolean | null>(null);
  const [confirmedLiked, setConfirmedLiked] = useState(initialLiked);
  const [motion, setMotion] = useState<"idle" | "like" | "unlike">("idle");
  const resolvedIsSignedIn = externalIsSignedIn ?? isSignedIn;
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(
    confirmedLiked,
    (_currentLiked, nextLiked: boolean) => nextLiked,
  );
  const [actionState, formAction, pending] = useActionState(
    async (_previousState: ProductLikeActionResult, formData: FormData) => {
      const nextLiked = formData.get("liked") === "true";

      setMotion(nextLiked ? "like" : "unlike");
      setOptimisticLiked(nextLiked);

      const result = await toggleProductLikeAction({
        liked: nextLiked,
        locale,
        productId,
        variantId,
      });

      setConfirmedLiked(result.liked);

      if (!result.ok && result.redirectTo) {
        router.push(result.redirectTo as Parameters<typeof router.push>[0]);
      }

      return result;
    },
    {
      liked: initialLiked,
      ok: true,
      productId,
      variantId,
    } satisfies ProductLikeActionResult,
  );

  useEffect(() => {
    if (motion === "idle") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setMotion("idle");
    }, 360);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [motion]);

  useEffect(() => {
    function handleLikeState(event: Event) {
      if (!(event instanceof CustomEvent)) {
        return;
      }

      const detail = event.detail as {
        isSignedIn?: boolean | undefined;
        likedVariantIds?: string[] | undefined;
      };

      setExternalIsSignedIn(Boolean(detail.isSignedIn));
      setConfirmedLiked(Boolean(detail.likedVariantIds?.includes(variantId)));
    }

    window.addEventListener("snn:catalog-like-state", handleLikeState);

    return () => {
      window.removeEventListener("snn:catalog-like-state", handleLikeState);
    };
  }, [variantId]);

  if (!resolvedIsSignedIn) {
    return (
      <span className="product-card__like-slot__SW3al">
        <a
          className="product-card__like-link__SW3ap"
          href={`/${locale}/wishlist`}
          aria-label={copy.save}
        >
          <HeartIcon />
        </a>
      </span>
    );
  }

  const nextLiked = !optimisticLiked;
  const label = optimisticLiked ? copy.unsave : copy.save;
  const errorMessage = actionState.ok ? null : actionState.message;

  return (
    <form
      action={formAction}
      aria-busy={pending}
      className="product-card__like-form__SW3ak"
      data-perf-placement="card"
      data-perf-ready="true"
      data-perf-surface="product-like"
      data-perf-updating={pending ? "true" : "false"}
    >
      <input name="liked" type="hidden" value={String(nextLiked)} />
      <button
        aria-label={label}
        className="product-card__like-button__SW3aq"
        data-motion={motion !== "idle" ? motion : undefined}
        data-selected={optimisticLiked ? "true" : undefined}
        disabled={pending}
        type="submit"
      >
        <HeartIcon filled={optimisticLiked} />
        <span>{optimisticLiked ? copy.saved : copy.save}</span>
      </button>
      {errorMessage ? (
        <span className="product-like__error__SW3an" role="status">
          {errorMessage}
        </span>
      ) : null}
    </form>
  );
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      fill={filled ? "currentColor" : "none"}
      height="18"
      viewBox="0 0 24 24"
      width="18"
    >
      <path
        d="M20.8 4.6c-2.1-2-5.4-1.8-7.3.5L12 6.8l-1.5-1.7c-1.9-2.3-5.2-2.5-7.3-.5-2.4 2.3-2.5 6.1-.2 8.5l8 8.1c.6.6 1.5.6 2.1 0l8-8.1c2.2-2.4 2.1-6.2-.3-8.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
