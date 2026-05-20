"use client";

import { useActionState, useEffect, useState } from "react";

import type { ProductReview, ProductReviewEligibility, ProductReviewSummary } from "@snn/commerce";
import type { Locale } from "@snn/i18n";
import {
  Alert,
  Button,
  Checkbox,
  CheckIcon,
  EmptyState,
  Meter,
  Radio,
  RadioGroup,
  RatingStars,
  SearchField,
  Select,
  Textarea,
  TextField,
} from "@snn/ui";

import { CatalogProductGrid, type CatalogProductCard } from "../product-like-controls";
import type { ProductDetailCopy } from "./product-detail-client";
import {
  loadProductReviewEligibilityAction,
  submitProductReviewAction,
  type ProductReviewActionState,
} from "./review-actions";

type ProductDetailDeferredSectionsProps = {
  copy: ProductDetailCopy;
  isSignedIn: boolean;
  locale: Locale;
  productId: string;
  productSlug: string;
  relatedProducts: CatalogProductCard[];
  reviewEligibility: ProductReviewEligibility;
  reviewSummary: ProductReviewSummary;
  reviews: ProductReview[];
  selectedVariantId: string | null;
};

const initialReviewActionState: ProductReviewActionState = {
  message: null,
  ok: false,
};

const reviewScoreValues = [5, 4, 3, 2, 1] as const;

function ProductRatingStars({ rating }: { rating: number }) {
  return <RatingStars rating={rating} size={18} />;
}

function formatReviewDate(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "da" ? "da-DK" : "en-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatReviewCount(count: number, locale: Locale) {
  if (locale === "da") {
    return count === 1 ? "1 anmeldelse" : `${count} anmeldelser`;
  }

  return count === 1 ? "1 review" : `${count} reviews`;
}

function formatRecommendation(summary: ProductReviewSummary, locale: Locale) {
  if (summary.recommendationPercent === null) {
    return null;
  }

  return locale === "da"
    ? `${summary.recommendationPercent}% anbefaler dette produkt`
    : `${summary.recommendationPercent}% recommend this product`;
}

function snapshotPercent(value: number | null) {
  if (value === null) {
    return 0;
  }

  return Math.round((Math.min(Math.max(value, 1), 5) / 5) * 100);
}

function getReviewEligibilityCopy(copy: ProductDetailCopy, eligibility: ProductReviewEligibility) {
  if (eligibility.hasReviewed) {
    return copy.reviewAlreadySubmitted;
  }

  return copy.reviewIneligibleCopy;
}

export function ProductDetailDeferredSections({
  copy,
  isSignedIn,
  locale,
  productId,
  productSlug,
  relatedProducts,
  reviewEligibility,
  reviewSummary,
  reviews,
  selectedVariantId,
}: ProductDetailDeferredSectionsProps) {
  const [resolvedReviewEligibility, setResolvedReviewEligibility] = useState(reviewEligibility);
  const [reviewQuery, setReviewQuery] = useState("");
  const [reviewActionState, reviewFormAction, isReviewPending] = useActionState(
    submitProductReviewAction.bind(null, {
      locale,
      productId,
      productSlug,
    }),
    initialReviewActionState,
  );
  const visibleReviews = reviews.filter((review) => {
    const query = reviewQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return `${review.title} ${review.body} ${review.authorName}`.toLowerCase().includes(query);
  });
  const reviewCountLabel = formatReviewCount(reviewSummary.reviewCount, locale);
  const recommendationLabel = formatRecommendation(reviewSummary, locale);
  const relatedCopy = {
    available: copy.available,
    empty: copy.emptyRelated,
    sale: copy.sale,
    save: copy.save,
    saved: copy.saved,
    unavailable: copy.soldOut,
    unsave: copy.unsave,
  };
  const reviewSnapshots = [
    { label: copy.reviewQuality, value: reviewSummary.snapshots.quality },
    { label: copy.reviewValue, value: reviewSummary.snapshots.value },
    { label: copy.reviewComfort, value: reviewSummary.snapshots.comfort },
    { label: copy.reviewRoutineFit, value: reviewSummary.snapshots.routineFit },
  ];

  useEffect(() => {
    let cancelled = false;

    async function loadReviewEligibility() {
      const result = await loadProductReviewEligibilityAction({
        locale,
        productId,
      }).catch(() => null);

      if (!cancelled && result) {
        setResolvedReviewEligibility(result);
      }
    }

    void loadReviewEligibility();

    return () => {
      cancelled = true;
    };
  }, [locale, productId]);

  useEffect(() => {
    if (reviewActionState.ok) {
      window.location.reload();
    }
  }, [reviewActionState.ok]);

  return (
    <>
      {relatedProducts.length > 0 ? (
        <section className="product-detail__recommendations__SW3bx">
          <div className="product-detail__section-heading__SW3by">
            <h2>{copy.relatedTitle}</h2>
          </div>
          <CatalogProductGrid
            copy={relatedCopy}
            isSignedIn={isSignedIn}
            items={relatedProducts}
            locale={locale}
          />
        </section>
      ) : null}

      <section className="productReviews__root__SW3d0" aria-labelledby="product-reviews-heading">
        <div className="product-detail__section-heading__SW3by">
          <h2 id="product-reviews-heading">{copy.reviews}</h2>
          <p>{reviewCountLabel}</p>
        </div>

        <div className="productReviews__summary__SW3d1">
          <div className="productReviews__score__SW3d2">
            <strong>{(reviewSummary.averageRating ?? 0).toFixed(1)}</strong>
            <ProductRatingStars rating={Math.round(reviewSummary.averageRating ?? 0)} />
            <span>{reviewCountLabel}</span>
            {recommendationLabel ? <p><CheckIcon size={16} /> {recommendationLabel}</p> : null}
          </div>

          <div className="productReviews__bars__SW3d3" aria-label="Rating snapshot">
            {reviewSummary.ratingBars.map((bar) => (
              <Meter
                key={bar.rating}
                label={bar.rating}
                maxValue={100}
                showValueLabel={false}
                value={bar.percent}
              />
            ))}
          </div>

          <div className="productReviews__snapshot__SW3d4">
            {reviewSnapshots.map((snapshot) => (
              <Meter
                key={snapshot.label}
                label={snapshot.label}
                maxValue={100}
                showValueLabel={false}
                value={snapshotPercent(snapshot.value)}
              />
            ))}
          </div>
        </div>

        {resolvedReviewEligibility.canReview ? (
          <form action={reviewFormAction} className="productReviews__form__SW3da">
            <div>
              <h3>{copy.reviewFormTitle}</h3>
              <p>{copy.reviewFormBody}</p>
            </div>
            <input name="variantId" type="hidden" value={selectedVariantId ?? ""} />
            <RadioGroup
              label={copy.reviewRatingLabel}
              orientation="horizontal"
            >
              {reviewScoreValues.map((score) => (
                <Radio
                  defaultChecked={score === 5}
                  key={score}
                  label={String(score)}
                  name="rating"
                  required
                  value={score}
                />
              ))}
            </RadioGroup>
            <TextField
              fullWidth
              label={copy.reviewTitleLabel}
              maxLength={120}
              name="title"
              required
            />
            <Textarea
              fullWidth
              label={copy.reviewBodyLabel}
              maxLength={1400}
              name="body"
              required
              rows={5}
            />
            <div className="productReviews__scoreGrid__SW3dd">
              {[
                ["qualityScore", copy.reviewQuality],
                ["valueScore", copy.reviewValue],
                ["comfortScore", copy.reviewComfort],
                ["routineFitScore", copy.reviewRoutineFit],
              ].map(([name, label]) => (
                <Select defaultValue="5" fullWidth key={name} label={label} name={name} required>
                  {reviewScoreValues.map((score) => (
                    <option key={score} value={score}>{score}</option>
                  ))}
                </Select>
              ))}
            </div>
            <Checkbox
              defaultChecked
              label={copy.reviewRecommendLabel}
              name="wouldRecommend"
            />
            {reviewActionState.message ? (
              <Alert
                status={reviewActionState.ok ? "success" : "danger"}
              >
                {reviewActionState.message}
              </Alert>
            ) : null}
            <Button disabled={isReviewPending || reviewActionState.ok} loading={isReviewPending} type="submit">
              {isReviewPending ? copy.reviewSubmitting : copy.reviewSubmit}
            </Button>
          </form>
        ) : (
          <p className="productReviews__eligibility__SW3dg">
            {getReviewEligibilityCopy(copy, resolvedReviewEligibility)}
          </p>
        )}

        <div className="productReviews__toolbar__SW3d5">
          <SearchField
            aria-label={copy.reviewSearch}
            fullWidth
            onChange={(event) => setReviewQuery(event.target.value)}
            placeholder={copy.reviewSearch}
            value={reviewQuery}
          />
          <span>{copy.sortRecent}</span>
          <span>{copy.reviews}</span>
          <span>{copy.verifiedBuyers}</span>
        </div>

        {reviews.length === 0 ? (
          <EmptyState description={copy.reviewEmptyBody} title={copy.reviewEmptyTitle} />
        ) : visibleReviews.length === 0 ? (
          <EmptyState title={copy.reviewNoMatches} />
        ) : (
          <div className="productReviews__list__SW3d6">
            {visibleReviews.map((review) => (
              <article className="productReviews__item__SW3d7" key={review.id}>
                <div>
                  <strong>{review.authorName}</strong>
                  <span><CheckIcon size={14} /> {copy.reviewVerifiedPurchase}</span>
                  <small>{formatReviewDate(review.createdAt, locale)}</small>
                </div>
                <div>
                  <ProductRatingStars rating={review.rating} />
                  <h3>{review.title}</h3>
                  <p>{review.body}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
