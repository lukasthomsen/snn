import { headers } from "next/headers";
import { notFound } from "next/navigation";

import {
  getProductReviewEligibility,
  getRelatedProductCards,
} from "@snn/commerce";
import { ensureCustomerProfile, getCustomerLikedProductVariantIds, getCustomerSession } from "@snn/customer";
import { isLocale, type Locale } from "@snn/i18n";

import { ProductDetailClient } from "./product-detail-client";
import {
  getCachedProductDetailBySlug,
  getCachedProductReviews,
  getCachedProductReviewSummary,
  getCachedRelatedProductCards,
} from "../catalog-data";

export const dynamic = "force-dynamic";

type ProductDetailPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
  searchParams: Promise<{
    variant?: string | string[] | undefined;
  }>;
};

const detailCopy = {
  da: {
    addToBag: "Læg i kurv",
    addingToBag: "Lægger i kurv",
    available: "På lager",
    benefits: "Fordele / sådan bruges den",
    closeDrawer: "Luk",
    back: "Tilbage til shop",
    deliveryReturns: "Levering & returnering",
    details: "Produktdetaljer",
    emptyRelated: "Ingen anbefalinger fundet endnu.",
    fitGuide: "Størrelsesguide",
    freeDelivery: "Gratis standardlevering over 550 DKK",
    howToUse: "Vælg den variant, der passer til din rutine, og brug produktet som del af din daglige træning, restitution eller ernæring.",
    imageZoomIn: "Zoom ind på billedet",
    imageZoomOut: "Zoom ud af billedet",
    membersEarn: "Tjen XP og adgang til medlemsfordele",
    marketPrice: "Markedpris",
    noPrice: "Afventer pris",
    options: "Valgmuligheder",
    relatedTitle: "Du vil måske også synes om",
    reviewAlreadySubmitted: "Du har allerede anmeldt dette produkt.",
    reviewComfort: "Komfort",
    reviewEmptyBody: "Når verificerede købere anmelder produktet, vises deres vurderinger her.",
    reviewEmptyTitle: "Ingen anmeldelser endnu",
    reviewFormBody: "Skriv hvad der fungerede, hvad der kunne være bedre, og hvordan produktet passer ind i din rutine.",
    reviewFormTitle: "Skriv en anmeldelse",
    reviewIneligibleCopy: "Anmeldelser er åbne for kunder, der har købt produktet.",
    reviewNoMatches: "Ingen anmeldelser matcher din søgning.",
    reviewQuality: "Kvalitet",
    reviewRatingLabel: "Samlet vurdering",
    reviewRecommendLabel: "Jeg vil anbefale dette produkt",
    reviewRoutineFit: "Rutinematch",
    reviewSearch: "Søg i anmeldelser og emner",
    reviewSubmit: "Send anmeldelse",
    reviewSubmitting: "Sender anmeldelse",
    reviewBodyLabel: "Din anmeldelse",
    reviewTitleLabel: "Titel",
    reviewValue: "Værdi",
    reviewVerifiedPurchase: "Verificeret køb",
    reviews: "Anmeldelser",
    returnsHandled: "Retur og gavekortkoder håndteres ved checkout.",
    sale: "Tilbud",
    saved: "Gemt",
    save: "Gem",
    secureCheckout: "Sikker checkout. Klarna kan vælges ved betaling.",
    share: "Del",
    shared: "Link kopieret",
    sortRecent: "Sorter efter: Nyeste",
    soldOut: "Udsolgt",
    unavailableCombination: "Den valgte kombination er ikke tilgængelig endnu.",
    unsave: "Fjern",
    verifiedBuyers: "Verificerede købere",
    variants: "Varianter",
  },
  en: {
    addToBag: "Add to bag",
    addingToBag: "Adding...",
    available: "In stock",
    benefits: "Benefits / how to use",
    closeDrawer: "Close",
    back: "Back to shop",
    deliveryReturns: "Delivery & returns",
    details: "Product details",
    emptyRelated: "No recommendations found yet.",
    fitGuide: "Size guide",
    freeDelivery: "Free standard delivery over 550 DKK",
    howToUse: "Choose the variant that fits your routine, then use it as part of daily training, recovery, or nutrition.",
    imageZoomIn: "Zoom image in",
    imageZoomOut: "Zoom image out",
    membersEarn: "Earn XP and unlock member benefits",
    marketPrice: "Market price",
    noPrice: "Price pending",
    options: "Options",
    relatedTitle: "You might like",
    reviewAlreadySubmitted: "You have already reviewed this product.",
    reviewComfort: "Comfort",
    reviewEmptyBody: "When verified buyers review this product, their ratings will appear here.",
    reviewEmptyTitle: "No reviews yet",
    reviewFormBody: "Share what worked, what could be better, and how the product fits your routine.",
    reviewFormTitle: "Write a review",
    reviewIneligibleCopy: "Reviews are open to customers who bought this product.",
    reviewNoMatches: "No reviews match your search.",
    reviewQuality: "Quality",
    reviewRatingLabel: "Overall rating",
    reviewRecommendLabel: "I would recommend this product",
    reviewRoutineFit: "Routine fit",
    reviewSearch: "Search reviews and topics",
    reviewSubmit: "Submit review",
    reviewSubmitting: "Submitting...",
    reviewBodyLabel: "Your review",
    reviewTitleLabel: "Title",
    reviewValue: "Value",
    reviewVerifiedPurchase: "Verified purchase",
    reviews: "Reviews",
    returnsHandled: "Returns and gift card codes are handled at checkout.",
    sale: "Sale",
    saved: "Saved",
    save: "Save",
    secureCheckout: "Secure checkout. Klarna available at payment.",
    share: "Share",
    shared: "Link copied",
    sortRecent: "Sort by: Most recent",
    soldOut: "Sold out",
    unavailableCombination: "This option combination is not available yet.",
    unsave: "Remove",
    verifiedBuyers: "Verified buyers",
    variants: "Variants",
  },
} as const;

function getSingleSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductDetailPage({ params, searchParams }: ProductDetailPageProps) {
  const [{ locale, slug }, query] = await Promise.all([params, searchParams]);
  const safeLocale: Locale = isLocale(locale) ? locale : "da";
  const copy = detailCopy[safeLocale];
  const product = await getCachedProductDetailBySlug({
    countryCode: "DK",
    locale: safeLocale,
    slug,
  });

  if (!product) {
    notFound();
  }

  const session = await getCustomerSession(await headers());
  const isSignedIn = Boolean(session?.user.emailVerified && !session.user.banned);
  const customerProfile = isSignedIn && session ? await ensureCustomerProfile(session.user) : null;
  const [likedVariantIds, relatedProducts, reviewSummary, reviews, reviewEligibility] = await Promise.all([
    isSignedIn && session
      ? getCustomerLikedProductVariantIds(session.user, product.id)
      : [],
    isSignedIn && session
      ? getRelatedProductCards({
        countryCode: "DK",
        likedUserId: session.user.id,
        limit: 8,
        locale: safeLocale,
        productId: product.id,
      })
      : getCachedRelatedProductCards({
      countryCode: "DK",
      limit: 8,
      locale: safeLocale,
      productId: product.id,
    }),
    getCachedProductReviewSummary(product.id),
    getCachedProductReviews({
      productId: product.id,
    }),
    getProductReviewEligibility({
      customerId: customerProfile?.id,
      productId: product.id,
    }),
  ]);
  const relatedGridItems = relatedProducts.map((relatedProduct) => ({
    availability: relatedProduct.availability,
    description: relatedProduct.description,
    displayId: relatedProduct.displayId,
    id: relatedProduct.id,
    imageUrl: relatedProduct.imageUrl,
    isLiked: relatedProduct.isLiked,
    name: relatedProduct.name,
    price: relatedProduct.price,
    secondaryImageUrl: relatedProduct.secondaryImageUrl,
    slug: relatedProduct.slug,
    status: relatedProduct.status,
    variantId: relatedProduct.variantId,
    variantTitle: relatedProduct.variantTitle,
  }));

  return (
    <main className="product-detail__root__SW3b0">
      <ProductDetailClient
        copy={copy}
        isSignedIn={isSignedIn}
        initialVariantId={getSingleSearchValue(query.variant)}
        likedVariantIds={likedVariantIds}
        locale={safeLocale}
        product={product}
        relatedProducts={relatedGridItems}
        reviewEligibility={reviewEligibility}
        reviewSummary={reviewSummary}
        reviews={reviews}
      />
    </main>
  );
}
