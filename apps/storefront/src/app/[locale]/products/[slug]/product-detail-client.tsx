"use client";

import type { MouseEvent } from "react";
import { Fragment, useActionState, useEffect, useMemo, useState } from "react";

import type {
  ProductDetail,
  ProductReview,
  ProductReviewEligibility,
  ProductReviewSummary,
  ProductVariant,
} from "@snn/commerce";
import type { Locale } from "@snn/i18n";
import {
  Accordion,
  AccordionActionItem,
  Alert,
  BadgePercentIcon,
  Button,
  Checkbox,
  CheckIcon,
  Drawer,
  EmptyState,
  Heading,
  Meter,
  MediaButton,
  PackageOpenIcon,
  RatingSummaryInline,
  RatingStars,
  Radio,
  RadioGroup,
  RulerIcon,
  SearchField,
  Select,
  ShareIcon,
  ShieldCheckIcon,
  Text,
  Textarea,
  TextField,
  TruckIcon,
  VariantPicker,
  VariantPickerOption,
} from "@snn/ui";

import { useCartDrawer } from "../../components/cart-drawer";
import { StorefrontImage } from "../../components/storefront-image";
import { CatalogProductGrid, ProductDetailLikeControl, type CatalogProductCard } from "../product-like-controls";
import { submitProductReviewAction, type ProductReviewActionState } from "./review-actions";

type ProductDetailCopy = {
  addToBag: string;
  addingToBag: string;
  available: string;
  benefits: string;
  closeDrawer: string;
  deliveryReturns: string;
  details: string;
  emptyRelated: string;
  fitGuide: string;
  freeDelivery: string;
  howToUse: string;
  imageZoomIn: string;
  imageZoomOut: string;
  membersEarn: string;
  noPrice: string;
  options: string;
  relatedTitle: string;
  reviewAlreadySubmitted: string;
  returnsHandled: string;
  reviewComfort: string;
  reviewEmptyBody: string;
  reviewEmptyTitle: string;
  reviewFormBody: string;
  reviewFormTitle: string;
  reviewIneligibleCopy: string;
  reviewNoMatches: string;
  reviewQuality: string;
  reviewRatingLabel: string;
  reviewRecommendLabel: string;
  reviewRoutineFit: string;
  reviewSearch: string;
  reviewSubmit: string;
  reviewSubmitting: string;
  reviewBodyLabel: string;
  reviewTitleLabel: string;
  reviewValue: string;
  reviewVerifiedPurchase: string;
  reviews: string;
  sale: string;
  save: string;
  saved: string;
  secureCheckout: string;
  share: string;
  shared: string;
  sortRecent: string;
  soldOut: string;
  unavailableCombination: string;
  unsave: string;
  verifiedBuyers: string;
};

type ProductDetailClientProps = {
  copy: ProductDetailCopy;
  initialVariantId?: string | undefined;
  isSignedIn: boolean;
  likedVariantIds: string[];
  locale: Locale;
  product: ProductDetail;
  relatedProducts: CatalogProductCard[];
  reviewEligibility: ProductReviewEligibility;
  reviewSummary: ProductReviewSummary;
  reviews: ProductReview[];
};

type ProductInfoPanelId = "benefits" | "deliveryReturns" | "details";

type ProductInfoFact = {
  label: string;
  value: string;
};

type ProductInfoSection = {
  body?: string | undefined;
  facts?: ProductInfoFact[] | undefined;
  heading: string;
  list?: string[] | undefined;
};

type ProductInfoPanel = {
  id: ProductInfoPanelId;
  sections: ProductInfoSection[];
  title: string;
};

type GalleryMedia = {
  altText: string;
  id: string;
  mediaType: "image" | "video";
  url: string;
};

const productInfoCopy = {
  da: {
    accessoryCare: "Skyl efter brug. Tåler opvaskemaskine, hvis produktet er markeret som dishwasher safe.",
    accessoryHeading: "Klar til hverdagsbrug",
    apparelBody: "Lavet til træning, hverdagsbrug og de dage, hvor komforten skal være nem.",
    apparelHeading: "Pasform & fornemmelse",
    benefitsHeading: "Hvorfor den passer ind",
    caffeineFree: "Koffeinfri",
    capsuleHeading: "Kapselrutine",
    color: "Farve",
    deliveryExpress: "Express levering - 125 DKK",
    deliveryExpressFree: "Gratis express levering på ordrer over 1.300 DKK",
    deliveryExpressTime: "Forventet levering 1-3 hverdage",
    deliveryReturnsBody: "Gratis 30 dages returret. Flasker, undertøj og badetøj kan være undtaget.",
    deliveryReturnsHeading: "Returnering",
    deliveryStandard: "Standard levering - 45 DKK",
    deliveryStandardFree: "Gratis standardlevering på ordrer over 550 DKK",
    deliveryStandardTime: "Forventet levering 3-5 hverdage",
    dishwasherSafe: "Tåler opvaskemaskine",
    electrolytes: "Indeholder elektrolytter",
    factsHeading: "Produktfakta",
    flavor: "Smag",
    goal: "Mål",
    howToUseHeading: "Sådan bruges den",
    kitHeading: "Hvad kittet er til",
    material: "Materiale",
    memberBenefitsHeading: "Medlemsfordele",
    optionHeading: "Valgt variant",
    pack: "Pakke",
    protein: (value: string) => `${value} g protein pr. servering`,
    proteinSnackHeading: "Snack & timing",
    selectedVariant: "Valgt",
    size: "Størrelse",
    sku: "SKU",
    supplementHeading: "Daglig rutine",
    type: "Type",
    vegan: "Vegansk",
    variant: "Variant",
    washCold: "Vask koldt og lufttør for at holde formen længere.",
  },
  en: {
    accessoryCare: "Rinse after use. Dishwasher safe when the product is marked that way.",
    accessoryHeading: "Built for daily carry",
    apparelBody: "Made for training, daily wear, and the days when comfort needs to feel easy.",
    apparelHeading: "Fit & feel",
    benefitsHeading: "Why it fits",
    caffeineFree: "Caffeine free",
    capsuleHeading: "Capsule routine",
    color: "Color",
    deliveryExpress: "Express shipping - 125 DKK",
    deliveryExpressFree: "Free express delivery on orders over 1,300 DKK",
    deliveryExpressTime: "Estimated delivery 1-3 working days",
    deliveryReturnsBody: "Free 30-day return policy. Bottles, underwear, and swimwear may be excluded.",
    deliveryReturnsHeading: "Returns",
    deliveryStandard: "Standard shipping - 45 DKK",
    deliveryStandardFree: "Free standard delivery on orders over 550 DKK",
    deliveryStandardTime: "Estimated delivery 3-5 working days",
    dishwasherSafe: "Dishwasher safe",
    electrolytes: "Includes electrolytes",
    factsHeading: "Product facts",
    flavor: "Flavor",
    goal: "Goal",
    howToUseHeading: "How to use",
    kitHeading: "What the kit is for",
    material: "Material",
    memberBenefitsHeading: "Member benefits",
    optionHeading: "Selected variant",
    pack: "Pack",
    protein: (value: string) => `${value}g protein per serving`,
    proteinSnackHeading: "Snack & timing",
    selectedVariant: "Selected",
    size: "Size",
    sku: "SKU",
    supplementHeading: "Daily routine",
    type: "Type",
    vegan: "Vegan",
    variant: "Variant",
    washCold: "Wash cold and air dry to keep the shape longer.",
  },
} as const;

const initialReviewActionState: ProductReviewActionState = {
  message: null,
  ok: false,
};

const reviewScoreValues = [5, 4, 3, 2, 1] as const;

function formatMoney(amount: number, currencyCode: string, locale: Locale) {
  return new Intl.NumberFormat(locale === "da" ? "da-DK" : "en-DK", {
    currency: currencyCode,
    style: "currency",
  }).format(amount / 100);
}

function formatPrice(variant: ProductVariant | null, locale: Locale) {
  if (!variant?.price) {
    return null;
  }

  return formatMoney(variant.price.amount, variant.price.currencyCode, locale);
}

function getInitialOptions(product: ProductDetail, initialVariantId?: string | undefined) {
  const requestedVariant = initialVariantId
    ? product.variants.find((variant) => variant.id === initialVariantId)
    : null;
  const primaryVariant = requestedVariant
    ?? product.variants.find((variant) => variant.isDefault)
    ?? product.variants[0]
    ?? null;
  const selectedOptions: Record<string, string> = {};

  for (const option of primaryVariant?.options ?? []) {
    selectedOptions[option.optionCode] = option.value;
  }

  return selectedOptions;
}

function getVariantByOptions(product: ProductDetail, selectedOptions: Record<string, string>) {
  return product.variants.find((variant) => product.options.every((option) => {
    const selectedValue = selectedOptions[option.code];

    if (!selectedValue) {
      return false;
    }

    return variant.options.some((variantOption) => (
      variantOption.optionCode === option.code &&
      variantOption.value === selectedValue
    ));
  })) ?? null;
}

function getMediaType(url: string, mimeType?: string | null): GalleryMedia["mediaType"] {
  if (mimeType?.startsWith("video/")) {
    return "video";
  }

  return /\.(?:mp4|m4v|mov|webm|ogg)(?:[?#].*)?$/i.test(url) ? "video" : "image";
}

function isPlayableVideoSource(url: string) {
  return url.startsWith("data:video/") || /\.(?:mp4|m4v|mov|webm|ogg)(?:[?#].*)?$/i.test(url);
}

function getGalleryMedia(product: ProductDetail, displayVariant: ProductVariant | null) {
  const gallery = new Map<string, GalleryMedia>();
  const variantMedia = displayVariant
    ? product.media.filter((media) => media.variantId === displayVariant.id && media.role !== "swatch")
    : [];
  const sharedMedia = product.media.filter((media) => !media.variantId && media.role !== "swatch");

  for (const media of variantMedia) {
    if (!media.url || gallery.has(media.url)) {
      continue;
    }

    gallery.set(media.url, {
      altText: media.altText ?? product.name,
      id: media.id,
      mediaType: getMediaType(media.url, media.mimeType),
      url: media.url,
    });
  }

  if (displayVariant?.imageUrl && !gallery.has(displayVariant.imageUrl)) {
    gallery.set(displayVariant.imageUrl, {
      altText: product.name,
      id: `${displayVariant.id}-selected`,
      mediaType: getMediaType(displayVariant.imageUrl),
      url: displayVariant.imageUrl,
    });
  }

  for (const media of sharedMedia) {
    if (!media.url || gallery.has(media.url)) {
      continue;
    }

    gallery.set(media.url, {
      altText: media.altText ?? product.name,
      id: media.id,
      mediaType: getMediaType(media.url, media.mimeType),
      url: media.url,
    });
  }

  return [...gallery.values()].slice(0, 10);
}

function getGalleryMediaSpan(index: number, count: number) {
  if (count <= 2) {
    return "full";
  }

  if (index <= 1) {
    return "half";
  }

  if (index === 2) {
    return "full";
  }

  if (count >= 5 && index <= 4) {
    return "half";
  }

  return "full";
}

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

function normalizeInfoKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function compactInfoItems(items: Array<false | null | string | undefined>) {
  return items.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function getProductTypeLabel(productType: string | null, locale: Locale) {
  if (!productType) {
    return locale === "da" ? "Produkt" : "Product";
  }

  return productType
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getAttribute(product: ProductDetail, code: string) {
  const normalizedCode = normalizeInfoKey(code);

  return product.attributes.find((attribute) => normalizeInfoKey(attribute.code) === normalizedCode) ?? null;
}

function formatAttributeValue(product: ProductDetail, code: string, locale: Locale) {
  const attribute = getAttribute(product, code);

  if (!attribute || attribute.value === null) {
    return null;
  }

  if (typeof attribute.value === "boolean") {
    return attribute.value
      ? locale === "da" ? "Ja" : "Yes"
      : locale === "da" ? "Nej" : "No";
  }

  if (Array.isArray(attribute.value)) {
    return attribute.value.join(", ");
  }

  return `${attribute.value}${attribute.unit ? ` ${attribute.unit}` : ""}`;
}

function getSelectedOptionValue(
  product: ProductDetail,
  selectedOptions: Record<string, string>,
  codes: string[],
) {
  const normalizedCodes = new Set(codes.map(normalizeInfoKey));
  const option = product.options.find((entry) => (
    normalizedCodes.has(normalizeInfoKey(entry.code)) ||
    normalizedCodes.has(normalizeInfoKey(entry.name))
  ));

  return option ? selectedOptions[option.code] ?? null : null;
}

function getProductDetailInfoSections({
  locale,
  product,
  selectedOptions,
  variant,
}: {
  locale: Locale;
  product: ProductDetail;
  selectedOptions: Record<string, string>;
  variant: ProductVariant | null;
}): ProductInfoSection[] {
  const t = productInfoCopy[locale];
  const productType = normalizeInfoKey(product.productType ?? "");
  const goal = formatAttributeValue(product, "goal", locale);
  const servings = formatAttributeValue(product, "servings", locale);
  const protein = formatAttributeValue(product, "protein", locale);
  const material = formatAttributeValue(product, "material", locale);
  const isVegan = getAttribute(product, "vegan")?.value === true;
  const hasElectrolytes = getAttribute(product, "electrolytes")?.value === true;
  const isCaffeineFree = getAttribute(product, "caffeine")?.value === false;
  const isDishwasherSafe = getAttribute(product, "dishwasher_safe")?.value === true;
  const selectedFlavor = getSelectedOptionValue(product, selectedOptions, ["flavor", "flavour", "taste"]);
  const selectedSize = getSelectedOptionValue(product, selectedOptions, ["size", "count", "strength"]);
  const selectedColor = getSelectedOptionValue(product, selectedOptions, ["color", "colour", "shade"]);
  const selectedPack = getSelectedOptionValue(product, selectedOptions, ["pack", "bundle"]);
  const facts = compactInfoItems([
    variant?.title ? `${t.selectedVariant}: ${variant.title}` : null,
    goal ? `${t.goal}: ${goal}` : null,
    selectedFlavor ? `${t.flavor}: ${selectedFlavor}` : null,
    selectedColor ? `${t.color}: ${selectedColor}` : null,
    selectedSize ? `${t.size}: ${selectedSize}` : null,
    selectedPack ? `${t.pack}: ${selectedPack}` : null,
    variant?.sku ? `${t.sku}: ${variant.sku}` : null,
  ]);
  const factRows: ProductInfoFact[] = compactInfoItems([
    getProductTypeLabel(product.productType, locale),
    variant?.sku,
  ]).map((value, index) => ({
    label: index === 0 ? t.type : t.sku,
    value,
  }));

  if (productType === "apparel") {
    return [
      {
        body: product.description ?? product.shortDescription ?? t.apparelBody,
        heading: t.apparelHeading,
        list: compactInfoItems([
          selectedColor ? `${t.color}: ${selectedColor}` : null,
          selectedSize ? `${t.size}: ${selectedSize}` : null,
          material ? `${t.material}: ${material}` : null,
          t.washCold,
        ]),
      },
      {
        facts: factRows,
        heading: t.factsHeading,
      },
    ];
  }

  if (productType === "accessory") {
    return [
      {
        body: product.description ?? product.shortDescription ?? undefined,
        heading: t.accessoryHeading,
        list: compactInfoItems([
          selectedColor ? `${t.color}: ${selectedColor}` : null,
          selectedSize ? `${t.size}: ${selectedSize}` : null,
          isDishwasherSafe ? t.dishwasherSafe : null,
          t.accessoryCare,
        ]),
      },
      {
        facts: factRows,
        heading: t.factsHeading,
      },
    ];
  }

  if (productType === "capsules") {
    return [
      {
        body: product.description ?? product.shortDescription ?? undefined,
        heading: t.capsuleHeading,
        list: compactInfoItems([
          selectedSize ? `${t.size}: ${selectedSize}` : null,
          isVegan ? t.vegan : null,
          goal ? `${t.goal}: ${goal}` : null,
        ]),
      },
      {
        facts: factRows,
        heading: t.factsHeading,
      },
    ];
  }

  if (productType === "protein-snack") {
    return [
      {
        body: product.description ?? product.shortDescription ?? undefined,
        heading: t.proteinSnackHeading,
        list: compactInfoItems([
          selectedFlavor ? `${t.flavor}: ${selectedFlavor}` : null,
          selectedPack ? `${t.pack}: ${selectedPack}` : null,
          protein ? t.protein(protein) : null,
        ]),
      },
      {
        facts: factRows,
        heading: t.factsHeading,
      },
    ];
  }

  if (productType === "supplement-kit") {
    return [
      {
        body: product.description ?? product.shortDescription ?? undefined,
        heading: t.kitHeading,
        list: compactInfoItems([
          selectedPack ? `${t.variant}: ${selectedPack}` : null,
          servings ? `${servings} ${locale === "da" ? "serveringer" : "servings"}` : null,
          goal ? `${t.goal}: ${goal}` : null,
        ]),
      },
      {
        facts: factRows,
        heading: t.factsHeading,
      },
    ];
  }

  return [
    {
      body: product.description ?? product.shortDescription ?? undefined,
      heading: goal ? `${goal} ${locale === "da" ? "rutine" : "routine"}` : t.supplementHeading,
      list: compactInfoItems([
        selectedFlavor ? `${t.flavor}: ${selectedFlavor}` : null,
        selectedSize ? `${t.size}: ${selectedSize}` : null,
        servings ? `${servings} ${locale === "da" ? "serveringer" : "servings"}` : null,
        protein ? t.protein(protein) : null,
        hasElectrolytes ? t.electrolytes : null,
        isVegan ? t.vegan : null,
        isCaffeineFree ? t.caffeineFree : null,
      ]),
    },
    {
      facts: facts.map((fact) => {
        const [label = fact, ...valueParts] = fact.split(": ");

        return {
          label,
          value: valueParts.join(": "),
        };
      }),
      heading: t.factsHeading,
    },
  ];
}

function getBenefitsInfoSections(copy: ProductDetailCopy, locale: Locale): ProductInfoSection[] {
  const t = productInfoCopy[locale];

  return [
    {
      body: copy.howToUse,
      heading: t.howToUseHeading,
      list: [
        copy.membersEarn,
        copy.secureCheckout,
      ],
    },
    {
      heading: t.memberBenefitsHeading,
      list: [
        copy.membersEarn,
        copy.freeDelivery,
        copy.returnsHandled,
      ],
    },
  ];
}

function getDeliveryInfoSections(copy: ProductDetailCopy, locale: Locale): ProductInfoSection[] {
  const t = productInfoCopy[locale];

  return [
    {
      heading: t.deliveryStandard,
      list: [
        t.deliveryStandardTime,
        t.deliveryStandardFree,
      ],
    },
    {
      heading: t.deliveryExpress,
      list: [
        t.deliveryExpressTime,
        t.deliveryExpressFree,
      ],
    },
    {
      body: t.deliveryReturnsBody,
      heading: t.deliveryReturnsHeading,
      list: [
        copy.returnsHandled,
        copy.secureCheckout,
      ],
    },
  ];
}

function ProductInfoDrawerContent({ sections }: { sections: ProductInfoSection[] }) {
  return (
    <div className="productInfoDrawer__content__SW3e2">
      {sections.map((section) => (
        <Fragment key={section.heading}>
          <h3>{section.heading}</h3>
          {section.body ? <p>{section.body}</p> : null}
          {section.list && section.list.length > 0 ? (
            <ul>
              {section.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {section.facts && section.facts.length > 0 ? (
            <dl>
              {section.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}

function getReviewEligibilityCopy(copy: ProductDetailCopy, eligibility: ProductReviewEligibility) {
  if (eligibility.hasReviewed) {
    return copy.reviewAlreadySubmitted;
  }

  return copy.reviewIneligibleCopy;
}

export function ProductDetailClient({
  copy,
  initialVariantId,
  isSignedIn,
  likedVariantIds,
  locale,
  product,
  relatedProducts,
  reviewEligibility,
  reviewSummary,
  reviews,
}: ProductDetailClientProps) {
  const [selectedOptions, setSelectedOptions] = useState(() => getInitialOptions(product, initialVariantId));
  const [likedVariantIdSet, setLikedVariantIdSet] = useState(() => new Set(likedVariantIds));
  const [addingToBag, setAddingToBag] = useState(false);
  const [activeInfoPanelId, setActiveInfoPanelId] = useState<ProductInfoPanelId | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [zoomedImageId, setZoomedImageId] = useState<string | null>(null);
  const [reviewQuery, setReviewQuery] = useState("");
  const [reviewActionState, reviewFormAction, isReviewPending] = useActionState(
    submitProductReviewAction.bind(null, {
      locale,
      productId: product.id,
      productSlug: product.slug,
    }),
    initialReviewActionState,
  );
  const { addVariantToCart } = useCartDrawer();
  const defaultVariant = product.variants.find((variant) => variant.isDefault)
    ?? product.variants[0]
    ?? null;
  const selectedVariant = getVariantByOptions(product, selectedOptions);
  const displayVariant = selectedVariant ?? defaultVariant;
  const selectedVariantId = displayVariant?.id ?? null;
  const isSelectedVariantLiked = selectedVariantId ? likedVariantIdSet.has(selectedVariantId) : false;
  const galleryMedia = useMemo(
    () => getGalleryMedia(product, displayVariant),
    [displayVariant, product],
  );

  useEffect(() => {
    if (!zoomedImageId) {
      return;
    }

    function resetZoomIfPointerLeft(event: PointerEvent) {
      const zoomedElement = [...document.querySelectorAll<HTMLElement>("[data-gallery-media-id]")]
        .find((element) => element.dataset.galleryMediaId === zoomedImageId);

      if (!zoomedElement) {
        setZoomedImageId(null);
        return;
      }

      const bounds = zoomedElement.getBoundingClientRect();
      const isInside = event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom;

      if (!isInside) {
        setZoomedImageId(null);
      }
    }

    window.addEventListener("pointermove", resetZoomIfPointerLeft, { passive: true });

    return () => {
      window.removeEventListener("pointermove", resetZoomIfPointerLeft);
    };
  }, [zoomedImageId]);

  const formattedPrice = formatPrice(displayVariant, locale);
  const compareAtPrice = displayVariant?.price?.compareAtAmount &&
    displayVariant.price.compareAtAmount > displayVariant.price.amount
    ? formatMoney(displayVariant.price.compareAtAmount, displayVariant.price.currencyCode, locale)
    : null;
  const saveAmount = displayVariant?.price?.compareAtAmount &&
    displayVariant.price.compareAtAmount > displayVariant.price.amount
    ? formatMoney(
      displayVariant.price.compareAtAmount - displayVariant.price.amount,
      displayVariant.price.currencyCode,
      locale,
    )
    : null;
  const isPurchasable = Boolean(
    selectedVariant?.price &&
    selectedVariant.availability.isAvailable,
  );
  const visibleReviews = reviews.filter((review) => {
    const query = reviewQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return `${review.title} ${review.body} ${review.authorName}`.toLowerCase().includes(query);
  });
  const averageRating = reviewSummary.averageRating ?? 0;
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
  const productInfoPanels = [
    {
      id: "details",
      sections: getProductDetailInfoSections({
        locale,
        product,
        selectedOptions,
        variant: displayVariant,
      }),
      title: copy.details,
    },
    {
      id: "benefits",
      sections: getBenefitsInfoSections(copy, locale),
      title: copy.benefits,
    },
    {
      id: "deliveryReturns",
      sections: getDeliveryInfoSections(copy, locale),
      title: copy.deliveryReturns,
    },
  ] satisfies ProductInfoPanel[];
  const activeInfoPanel = productInfoPanels.find((panel) => panel.id === activeInfoPanelId) ?? null;

  useEffect(() => {
    if (reviewActionState.ok) {
      window.location.reload();
    }
  }, [reviewActionState.ok]);

  function selectOption(
    optionCode: string,
    value: string,
    options: { allowUnavailable?: boolean } = {},
  ) {
    const state = getOptionValueState(optionCode, value);

    if (!state.isPossible || (!options.allowUnavailable && !state.isAvailable)) {
      return;
    }

    setZoomedImageId(null);
    setSelectedOptions((current) => {
      const candidateSelection = {
        ...current,
        [optionCode]: value,
      };
      const directVariant = getVariantByOptions(product, candidateSelection);

      if (directVariant) {
        return candidateSelection;
      }

      const fallbackVariant = product.variants.find((variant) => (
        variant.availability.isAvailable &&
        variant.options.some((option) => option.optionCode === optionCode && option.value === value)
      )) ?? product.variants.find((variant) => (
        variant.options.some((option) => option.optionCode === optionCode && option.value === value)
      ));

      if (!fallbackVariant) {
        return candidateSelection;
      }

      return fallbackVariant.options.reduce<Record<string, string>>((nextOptions, option) => {
        nextOptions[option.optionCode] = option.value;

        return nextOptions;
      }, {});
    });
  }

  function getOptionValueState(optionCode: string, value: string) {
    const nextSelection = {
      ...selectedOptions,
      [optionCode]: value,
    };
    const matchingVariant = getVariantByOptions(product, nextSelection);
    const variantsWithValue = product.variants.filter((variant) => (
      variant.options.some((option) => option.optionCode === optionCode && option.value === value)
    ));

    return {
      isActive: selectedOptions[optionCode] === value,
      isAvailable: matchingVariant
        ? matchingVariant.availability.isAvailable
        : variantsWithValue.some((variant) => variant.availability.isAvailable),
      isPossible: variantsWithValue.length > 0,
    };
  }

  function getOptionValueImageUrl(
    optionCode: string,
    value: string,
    configuredImageUrl: string | null,
  ) {
    if (configuredImageUrl) {
      return configuredImageUrl;
    }

    const candidateSelection = {
      ...selectedOptions,
      [optionCode]: value,
    };
    const directVariant = getVariantByOptions(product, candidateSelection);
    const fallbackVariant = product.variants.find((variant) => (
      variant.availability.isAvailable &&
      variant.options.some((option) => option.optionCode === optionCode && option.value === value)
    )) ?? product.variants.find((variant) => (
      variant.options.some((option) => option.optionCode === optionCode && option.value === value)
    ));
    const displayVariant = directVariant ?? fallbackVariant;

    return displayVariant?.imageUrl ??
      displayVariant?.media.find((entry) => entry.url)?.url ??
      null;
  }

  async function handleAddToBag() {
    if (!selectedVariant) {
      return;
    }

    setAddingToBag(true);

    try {
      await addVariantToCart(selectedVariant.id);
    } finally {
      setAddingToBag(false);
    }
  }

  async function handleShare() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          url,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setShareStatus(copy.shared);
        window.setTimeout(() => {
          setShareStatus(null);
        }, 1800);
      }
    } catch {
      // Native share can be cancelled by the user.
    }
  }

  function handleGalleryPointerMove(event: MouseEvent<HTMLDivElement>) {
    event.currentTarget.style.setProperty("--product-gallery-cursor-x", `${event.clientX}px`);
    event.currentTarget.style.setProperty("--product-gallery-cursor-y", `${event.clientY}px`);

    const target = event.target instanceof Element ? event.target : null;
    const mediaToggle = target?.closest("[data-gallery-media-id]");

    if (!(mediaToggle instanceof HTMLElement) || !event.currentTarget.contains(mediaToggle)) {
      return;
    }

    const bounds = mediaToggle.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    mediaToggle.style.setProperty("--media-button-zoom-x", `${x}%`);
    mediaToggle.style.setProperty("--media-button-zoom-y", `${y}%`);
  }

  return (
    <div
      data-perf-ready="true"
      data-perf-surface="product-detail"
      data-perf-updating={addingToBag ? "true" : "false"}
    >
      <section className="product-detail__layout__SW3b2">
        <div
          aria-label={product.name}
          className="product-detail__gallery__SW3bk"
          data-count={galleryMedia.length}
          data-zoomed={zoomedImageId ? "true" : undefined}
          onMouseLeave={() => setZoomedImageId(null)}
          onMouseMove={handleGalleryPointerMove}
        >
          {galleryMedia.length > 0 ? galleryMedia.map((media, index) => (
            <figure
              className="product-detail__media__SW3b3"
              data-span={getGalleryMediaSpan(index, galleryMedia.length)}
              key={media.id}
            >
              {media.mediaType === "video" ? (
                <video
                  aria-label={media.altText}
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster={isPlayableVideoSource(media.url) ? undefined : media.url}
                  preload="metadata"
                  src={isPlayableVideoSource(media.url) ? media.url : undefined}
                />
              ) : (
                <MediaButton
                  aria-label={zoomedImageId === media.id ? copy.imageZoomOut : copy.imageZoomIn}
                  cursor="none"
                  data-gallery-media-id={media.id}
                  fit="cover"
                  isZoomed={zoomedImageId === media.id}
                  onClick={() => setZoomedImageId((current) => (current === media.id ? null : media.id))}
                  onMouseEnter={() => setZoomedImageId(null)}
                  onMouseLeave={() => setZoomedImageId(null)}
                  onPointerEnter={() => setZoomedImageId(null)}
                  onPointerLeave={() => setZoomedImageId(null)}
                  type="button"
                >
                  <StorefrontImage alt={media.altText} eager src={media.url} />
                </MediaButton>
              )}
            </figure>
          )) : (
            <figure className="product-detail__media__SW3b3" data-span="full">
              <span aria-hidden="true" />
            </figure>
          )}
        </div>

        <aside className="product-detail__panel__SW3b4" aria-label={product.name}>
          <div className="product-detail__headline__SW3bm">
            <div>
              <Heading as="h1" size="page" transform="uppercase">{product.name}</Heading>
              {product.shortDescription ? (
                <Text size="md">{product.shortDescription}</Text>
              ) : null}
            </div>

            <div className="product-detail__rating-actions__SW3bn">
              <RatingSummaryInline
                count={reviewSummary.reviewCount}
                label={`${averageRating.toFixed(1)} ${copy.reviews}`}
                rating={averageRating}
              />
              {selectedVariantId ? (
                <ProductDetailLikeControl
                  isLiked={isSelectedVariantLiked}
                  isSignedIn={isSignedIn}
                  locale={locale}
                  onLikedChange={(variantId, liked) => {
                    setLikedVariantIdSet((current) => {
                      const next = new Set(current);

                      if (liked) {
                        next.add(variantId);
                      } else {
                        next.delete(variantId);
                      }

                      return next;
                    });
                  }}
                  productId={product.id}
                  showText={false}
                  variantId={selectedVariantId}
                />
              ) : null}
              <Button
                aria-label={copy.share}
                iconOnly
                onClick={() => void handleShare()}
                size="md"
                tone="soft"
                type="button"
              >
                <ShareIcon />
              </Button>
            </div>
            {shareStatus ? <span className="product-detail__share-status__SW3bq">{shareStatus}</span> : null}
          </div>

          <div className="product-detail__price__SW3b7">
            <strong>
              {compareAtPrice ? <del>{compareAtPrice}</del> : null}
              {formattedPrice ?? copy.noPrice}
            </strong>
            {saveAmount ? <span>{copy.sale}: {saveAmount}</span> : null}
          </div>

          <div className="product-detail__options__SW3b9" aria-label={copy.options}>
            {product.options.map((option) => (
              <div className="product-option__root__SW3ba" key={option.id}>
                <div className="product-option__header__SW3br">
                  <span>{option.name}</span>
                  <strong>{selectedOptions[option.code]}</strong>
                  {product.showSizeGuide && option.code.toLowerCase().includes("size") ? (
                    <a href="#product-detail-description">
                      <RulerIcon size={14} />
                      {copy.fitGuide}
                    </a>
                  ) : null}
                </div>
                <VariantPicker display={option.pickerDisplay} selectedLabel={selectedOptions[option.code]}>
                  {option.values.map((value) => {
                    const state = getOptionValueState(option.code, value.value);
                    const allowsUnavailable = option.pickerDisplay === "media";
                    const isUnavailable = !state.isPossible || (!allowsUnavailable && !state.isAvailable);

                    return (
                      <VariantPickerOption
                        disabled={isUnavailable}
                        display={option.pickerDisplay}
                        imageUrl={option.pickerDisplay === "media"
                          ? getOptionValueImageUrl(option.code, value.value, value.imageUrl)
                          : undefined}
                        isSelected={state.isActive}
                        isUnavailable={isUnavailable}
                        key={value.id}
                        label={value.value}
                        onClick={() => selectOption(option.code, value.value, {
                          allowUnavailable: allowsUnavailable,
                        })}
                        type="button"
                      >
                        {value.value}
                      </VariantPickerOption>
                    );
                  })}
                </VariantPicker>
              </div>
            ))}
          </div>

          <Button
            disabled={!isPurchasable || addingToBag}
            fullWidth
            loading={addingToBag}
            onClick={() => void handleAddToBag()}
            size="lg"
            type="button"
          >
            {addingToBag ? copy.addingToBag : copy.addToBag}
          </Button>

          <div className="product-detail__benefits__SW3bu">
            <span>
              <BadgePercentIcon />
              {copy.membersEarn}
            </span>
            <span>
              <TruckIcon />
              {copy.freeDelivery}
            </span>
            <span>
              <ShieldCheckIcon />
              {copy.secureCheckout}
            </span>
          </div>

          <Accordion>
            {productInfoPanels.map((panel) => (
              <AccordionActionItem
                heading={panel.title}
                id={panel.id === "details" ? "product-detail-description" : undefined}
                key={panel.id}
                onClick={() => setActiveInfoPanelId(panel.id)}
              />
            ))}
          </Accordion>
        </aside>
      </section>

      <Drawer
        bodyClassName="productInfoDrawer__body__SW3e1"
        className="productInfoDrawer__dialog__SW3e0"
        closeLabel={copy.closeDrawer}
        onClose={() => setActiveInfoPanelId(null)}
        open={Boolean(activeInfoPanel)}
        placement="right"
        size="half"
        title={activeInfoPanel?.title ?? copy.details}
      >
        {activeInfoPanel ? <ProductInfoDrawerContent sections={activeInfoPanel.sections} /> : null}
      </Drawer>

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
            <strong>{averageRating.toFixed(1)}</strong>
            <ProductRatingStars rating={Math.round(averageRating)} />
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

        {reviewEligibility.canReview ? (
          <form action={reviewFormAction} className="productReviews__form__SW3da">
            <div>
              <h3>{copy.reviewFormTitle}</h3>
              <p>{copy.reviewFormBody}</p>
            </div>
            <input name="variantId" type="hidden" value={displayVariant?.id ?? ""} />
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
            {getReviewEligibilityCopy(copy, reviewEligibility)}
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

      <div className="product-detail__mobile-bar__SW3bz">
        <span>
          <strong>{formattedPrice ?? copy.noPrice}</strong>
          <small>{displayVariant?.title}</small>
        </span>
        <Button
          disabled={!isPurchasable || addingToBag}
          loading={addingToBag}
          onClick={() => void handleAddToBag()}
          type="button"
        >
          <PackageOpenIcon />
          {addingToBag ? copy.addingToBag : copy.addToBag}
        </Button>
      </div>
    </div>
  );
}
