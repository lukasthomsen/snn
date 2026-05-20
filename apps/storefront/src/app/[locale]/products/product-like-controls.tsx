"use client";

import { useActionState, useEffect, useMemo, useOptimistic, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { ProductCard } from "@snn/commerce";
import type { Locale } from "@snn/i18n";
import { FavoriteButton, FavoriteLink } from "@snn/ui";

import {
  loadProductLikeStateAction,
  toggleProductLikeAction,
  type ProductLikeActionResult,
} from "../catalog-actions";
import { StorefrontImage } from "../components/storefront-image";

export type CatalogProductCard = Pick<
  ProductCard,
  | "availability"
  | "description"
  | "displayId"
  | "id"
  | "imageUrl"
  | "isLiked"
  | "name"
  | "price"
  | "secondaryImageUrl"
  | "slug"
  | "status"
  | "variantId"
  | "variantTitle"
>;

export type CatalogGridCopy = {
  available: string;
  empty: string;
  sale: string;
  save: string;
  saved: string;
  unavailable: string;
  unsave: string;
};

type LikeControlLabels = {
  save: string;
  saved: string;
  unsave: string;
};

type ProductLikeControlProps = {
  initialLiked: boolean;
  isSignedIn: boolean;
  labels: LikeControlLabels;
  locale: Locale;
  onOptimisticChange?: ((liked: boolean) => void) | undefined;
  onRollback?: (() => void) | undefined;
  onServerResult?: ((result: ProductLikeActionResult) => void) | undefined;
  productId: string;
  showText?: boolean | undefined;
  variantId: string;
  variant: "card" | "detail";
};

type ProductCardItemProps = {
  copy: CatalogGridCopy;
  isSignedIn: boolean;
  locale: Locale;
  onRemove: (displayId: string) => void;
  product: CatalogProductCard;
  removeOnUnlike: boolean;
};

type CatalogProductGridProps = {
  copy: CatalogGridCopy;
  isSignedIn: boolean;
  items: CatalogProductCard[];
  locale: Locale;
  removeOnUnlike?: boolean | undefined;
};

const exitDurationMs = 280;

function formatMoney(amount: number, currencyCode: string, locale: Locale) {
  return new Intl.NumberFormat(locale === "da" ? "da-DK" : "en-DK", {
    currency: currencyCode,
    style: "currency",
  }).format(amount / 100);
}

function formatPrice(product: CatalogProductCard, locale: Locale) {
  return formatMoney(product.price.amount, product.price.currencyCode, locale);
}

function ProductLikeControl({
  initialLiked,
  isSignedIn,
  labels,
  locale,
  onOptimisticChange,
  onRollback,
  onServerResult,
  productId,
  showText,
  variantId,
  variant,
}: ProductLikeControlProps) {
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
      onOptimisticChange?.(nextLiked);

      const result = await toggleProductLikeAction({
        liked: nextLiked,
        locale,
        productId,
        variantId,
      });

      if (result.ok) {
        setConfirmedLiked(result.liked);
        onServerResult?.(result);

        return result;
      }

      setConfirmedLiked(result.liked);
      onRollback?.();
      onServerResult?.(result);

      if (result.redirectTo) {
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

  const linkWrapperClassName = variant === "card"
    ? "product-card__like-slot__SW3al"
    : undefined;
  const nextLiked = !optimisticLiked;
  const label = optimisticLiked ? labels.unsave : labels.save;
  const text = optimisticLiked ? labels.saved : labels.save;
  const errorMessage = actionState.ok ? null : actionState.message;

  useEffect(() => {
    if (variant !== "card") {
      return undefined;
    }

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
  }, [variant, variantId]);

  if (!resolvedIsSignedIn) {
    const link = (
      <FavoriteLink
        href={`/${locale}/wishlist`}
        label={labels.save}
        placement={variant}
        showLabel={showText}
      >
        {labels.save}
      </FavoriteLink>
    );

    return linkWrapperClassName ? (
      <span className={linkWrapperClassName}>{link}</span>
    ) : link;
  }

  return (
    <form
      action={formAction}
      aria-busy={pending}
      className={variant === "card" ? "product-card__like-form__SW3ak" : "product-detail__like-form__SW3bf"}
      data-perf-placement={variant}
      data-perf-ready="true"
      data-perf-surface="product-like"
      data-perf-updating={pending ? "true" : "false"}
    >
      <input name="liked" type="hidden" value={String(nextLiked)} />
      <FavoriteButton
        isSelected={optimisticLiked}
        label={label}
        motion={motion}
        placement={variant}
        isPending={pending}
        showLabel={showText}
        type="submit"
      >
        {text}
      </FavoriteButton>
      {errorMessage ? (
        <span className="product-like__error__SW3an" role="status">
          {errorMessage}
        </span>
      ) : null}
    </form>
  );
}

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
  isSignedIn,
  locale,
  product,
}: {
  copy: CatalogGridCopy;
  isSignedIn: boolean;
  locale: Locale;
  product: CatalogProductCard;
}) {
  return (
    <ProductLikeControl
      initialLiked={product.isLiked}
      isSignedIn={isSignedIn}
      key={`${product.id}-${product.variantId}-${product.isLiked}`}
      labels={copy}
      locale={locale}
      productId={product.id}
      variantId={product.variantId}
      variant="card"
    />
  );
}

function ProductCardItem({
  copy,
  isSignedIn,
  locale,
  onRemove,
  product,
  removeOnUnlike,
}: ProductCardItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const exitReadyRef = useRef(false);
  const exitConfirmedRef = useRef(false);
  const exitTimerRef = useRef<number | null>(null);

  function clearExitTimer() {
    if (exitTimerRef.current) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }

  function beginExit() {
    if (!removeOnUnlike) {
      return;
    }

    clearExitTimer();
    exitReadyRef.current = false;
    exitConfirmedRef.current = false;
    setIsExiting(true);

    exitTimerRef.current = window.setTimeout(() => {
      exitReadyRef.current = true;
      exitTimerRef.current = null;

      if (exitConfirmedRef.current) {
        onRemove(product.displayId);
      }
    }, exitDurationMs);
  }

  function cancelExit() {
    clearExitTimer();
    exitReadyRef.current = false;
    exitConfirmedRef.current = false;
    setIsExiting(false);
  }

  function confirmExit() {
    if (!removeOnUnlike) {
      return;
    }

    exitConfirmedRef.current = true;

    if (exitReadyRef.current) {
      onRemove(product.displayId);
    }
  }

  useEffect(() => () => {
    clearExitTimer();
  }, []);

  return (
    <article className="product-card__root__SW3ab" data-exiting={isExiting ? "true" : undefined}>
      <ProductLikeControl
        initialLiked={product.isLiked}
        isSignedIn={isSignedIn}
        key={`${product.id}-${product.variantId}-${product.isLiked}`}
        labels={copy}
        locale={locale}
        onOptimisticChange={(liked) => {
          if (!liked) {
            beginExit();
          }
        }}
        onRollback={cancelExit}
        onServerResult={(result) => {
          if (result.ok && !result.liked) {
            confirmExit();
          }
        }}
        productId={product.id}
        variantId={product.variantId}
        variant="card"
      />
      <a className="product-card__link__SW3aj" href={`/${locale}/products/${product.slug}?variant=${product.variantId}`}>
        <span className="product-card__media__SW3ac">
          {product.price.isSale ? (
            <span className="product-card__sale__SW3ah">{copy.sale}</span>
          ) : null}
          {product.imageUrl ? (
            <StorefrontImage
              alt=""
              fetchPriority="auto"
              height={800}
              loading="lazy"
              sizes="(max-width: 42rem) calc(100vw - 2rem), (max-width: 72rem) calc(50vw - 1.5rem), 33vw"
              src={product.imageUrl}
              width={640}
            />
          ) : (
            <span aria-hidden="true" className="product-card__placeholder__SW3ai" />
          )}
          {product.secondaryImageUrl ? (
            <StorefrontImage
              alt=""
              className="product-card__secondary-image__SW3ao"
              fetchPriority="low"
              height={800}
              loading="lazy"
              sizes="(max-width: 42rem) calc(100vw - 2rem), (max-width: 72rem) calc(50vw - 1.5rem), 33vw"
              src={product.secondaryImageUrl}
              width={640}
            />
          ) : null}
        </span>
        <span className="product-card__copy__SW3ad">
          <span>
            <strong>{product.name}</strong>
            <small>{product.variantTitle}</small>
          </span>
          <span>
            <strong>
              {product.price.compareAtAmount && product.price.compareAtAmount > product.price.amount ? (
                <del>{formatMoney(product.price.compareAtAmount, product.price.currencyCode, locale)}</del>
              ) : null}
              {formatPrice(product, locale)}
            </strong>
            <small>{product.availability.isAvailable ? copy.available : copy.unavailable}</small>
          </span>
        </span>
      </a>
    </article>
  );
}

export function CatalogProductGrid({
  copy,
  isSignedIn,
  items,
  locale,
  removeOnUnlike = false,
}: CatalogProductGridProps) {
  const itemKey = useMemo(() => items.map((product) => product.displayId).join("|"), [items]);
  const variantIds = useMemo(() => items.map((product) => product.variantId), [items]);
  const initialLikedVariantIds = useMemo(() => new Set(
    items.filter((product) => product.isLiked).map((product) => product.variantId),
  ), [items]);
  const [likeState, setLikeState] = useState<{
    isSignedIn: boolean;
    itemKey: string;
    likedVariantIds: Set<string>;
  }>(() => ({
    isSignedIn,
    itemKey,
    likedVariantIds: initialLikedVariantIds,
  }));
  const [removalState, setRemovalState] = useState<{
    itemKey: string;
    removedDisplayIds: Set<string>;
  }>(() => ({
    itemKey,
    removedDisplayIds: new Set(),
  }));
  const removedDisplayIds = removalState.itemKey === itemKey
    ? removalState.removedDisplayIds
    : new Set<string>();
  const activeLikeState = likeState.itemKey === itemKey
    ? likeState
    : {
        isSignedIn,
        itemKey,
        likedVariantIds: initialLikedVariantIds,
      };
  const visibleItems = items
    .map((product) => ({
      ...product,
      isLiked: activeLikeState.likedVariantIds.has(product.variantId),
    }))
    .filter((product) => !removedDisplayIds.has(product.displayId));

  useEffect(() => {
    let cancelled = false;

    if (variantIds.length === 0) {
      return () => {
        cancelled = true;
      };
    }

    async function loadLikeState() {
      const result = await loadProductLikeStateAction({
        locale,
        variantIds,
      }).catch(() => null);

      if (!cancelled && result) {
        setLikeState({
          isSignedIn: result.isSignedIn,
          itemKey,
          likedVariantIds: new Set(result.likedVariantIds),
        });
      }
    }

    void loadLikeState();

    return () => {
      cancelled = true;
    };
  }, [itemKey, locale, variantIds]);

  return (
    <div className="catalog-grid__root__SW3a9">
      {visibleItems.length === 0 ? (
        <div className="catalog-empty__root__SW3aa">
          <p>{copy.empty}</p>
        </div>
      ) : (
        visibleItems.map((product) => (
          <ProductCardItem
            copy={copy}
            isSignedIn={activeLikeState.isSignedIn}
            key={product.displayId}
            locale={locale}
            onRemove={(displayId) => {
              setRemovalState((current) => {
                const currentRemovedDisplayIds = current.itemKey === itemKey
                  ? current.removedDisplayIds
                  : new Set<string>();
                const next = new Set(currentRemovedDisplayIds);

                next.add(displayId);

                return {
                  itemKey,
                  removedDisplayIds: next,
                };
              });
            }}
            product={product}
            removeOnUnlike={removeOnUnlike}
          />
        ))
      )}
    </div>
  );
}

export function ProductDetailLikeControl({
  isLiked,
  isSignedIn,
  locale,
  onLikedChange,
  productId,
  showText = true,
  variantId,
}: {
  isLiked: boolean;
  isSignedIn: boolean;
  locale: Locale;
  onLikedChange?: ((variantId: string, liked: boolean) => void) | undefined;
  productId: string;
  showText?: boolean | undefined;
  variantId: string;
}) {
  const labels = {
    save: locale === "da" ? "Gem produkt" : "Save product",
    saved: locale === "da" ? "Gemt produkt" : "Saved product",
    unsave: locale === "da" ? "Fjern fra gemte" : "Remove from saved",
  };

  return (
    <ProductLikeControl
      initialLiked={isLiked}
      isSignedIn={isSignedIn}
      key={`${productId}-${variantId}-${isLiked}`}
      labels={labels}
      locale={locale}
      onServerResult={(result) => {
        if (result.ok) {
          onLikedChange?.(result.variantId, result.liked);
        }
      }}
      productId={productId}
      showText={showText}
      variantId={variantId}
      variant="detail"
    />
  );
}
