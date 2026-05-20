import { randomBytes } from "node:crypto";

import { and, asc, desc, eq, inArray, isNull, lte, or, sql } from "drizzle-orm";

import { getDb, schema } from "@snn/db";

type CommerceDb = ReturnType<typeof getDb>;
type MarketRecord = typeof schema.markets.$inferSelect;
type ProductRecord = typeof schema.products.$inferSelect;
type ProductVariantRecord = typeof schema.productVariants.$inferSelect;
type PriceRecord = typeof schema.prices.$inferSelect;
type PriceListRecord = typeof schema.priceLists.$inferSelect;
type ProductOptionRecord = typeof schema.productOptions.$inferSelect;
type ProductOptionValueRecord = typeof schema.productOptionValues.$inferSelect;
type ProductMediaRecord = typeof schema.productMedia.$inferSelect;
type MediaAssetRecord = typeof schema.mediaAssets.$inferSelect;
type ProductAttributeRecord = typeof schema.productAttributes.$inferSelect;
type ProductAttributeValueRecord = typeof schema.productAttributeValues.$inferSelect;
type CategoryRecord = typeof schema.categories.$inferSelect;
type CategoryTranslationRecord = typeof schema.categoryTranslations.$inferSelect;
type CollectionRecord = typeof schema.collections.$inferSelect;
type CollectionTranslationRecord = typeof schema.collectionTranslations.$inferSelect;
type CartRecord = typeof schema.carts.$inferSelect;
type CartItemRecord = typeof schema.cartItems.$inferSelect;
type CustomerProfileRecord = typeof schema.customerProfiles.$inferSelect;
type ProductReviewRecord = typeof schema.productReviews.$inferSelect;

export type CommerceMarket = {
  id: string | null;
  code: string;
  countryCode: string | null;
  currencyCode: string;
  locale: string;
  name: string;
  pricesIncludeTax: boolean;
  salesChannelId: string | null;
};

export type Money = {
  amount: number;
  compareAtAmount: number | null;
  currencyCode: string;
  includesTax: boolean;
  isSale: boolean;
  priceListId: string | null;
};

export type ProductAvailability = {
  availableQuantity: number | null;
  isTracked: boolean;
  isAvailable: boolean;
};

export type ProductCard = {
  createdAt: Date;
  displayId: string;
  id: string;
  isLiked: boolean;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  secondaryImageUrl: string | null;
  status: ProductRecord["status"];
  variantId: string;
  variantTitle: string;
  price: Money;
  availability: ProductAvailability;
};

export type ProductSort =
  | "newest"
  | "name-asc"
  | "price-asc"
  | "price-desc";

export type ProductVariantOption = {
  optionCode: string;
  optionName: string;
  value: string;
};

export const productOptionPickerDisplays = ["default", "compact", "media"] as const;
export type ProductOptionPickerDisplay = (typeof productOptionPickerDisplays)[number];

export type ProductVariant = {
  id: string;
  sku: string;
  title: string;
  isDefault: boolean;
  options: ProductVariantOption[];
  media: Array<{
    altText: string | null;
    id: string;
    mimeType: string | null;
    role: ProductMediaRecord["role"];
    url: string | null;
  }>;
  price: Money | null;
  availability: ProductAvailability;
  imageUrl: string | null;
};

export type ProductDetailAttribute = {
  code: string;
  name: string;
  type: ProductAttributeRecord["type"];
  unit: string | null;
  value: boolean | number | string | string[] | null;
};

export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  productType: string | null;
  description: string | null;
  shortDescription: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  status: ProductRecord["status"];
  market: CommerceMarket;
  showSizeGuide: boolean;
  media: Array<{
    id: string;
    mimeType: string | null;
    role: ProductMediaRecord["role"];
    url: string | null;
    altText: string | null;
    variantId: string | null;
  }>;
  options: Array<{
    id: string;
    code: string;
    name: string;
    pickerDisplay: ProductOptionPickerDisplay;
    values: Array<{
      id: string;
      imageUrl: string | null;
      swatchColor: string | null;
      value: string;
    }>;
  }>;
  variants: ProductVariant[];
  attributes: ProductDetailAttribute[];
};

export type CartMoney = {
  amount: number;
  currencyCode: string;
};

export type CartLineItem = {
  id: string;
  imageUrl: string | null;
  isLiked: boolean;
  lineTotal: CartMoney;
  productId: string | null;
  productSlug: string | null;
  quantity: number;
  sku: string | null;
  title: string;
  unitPrice: CartMoney;
  variantId: string | null;
  variantTitle: string | null;
};

export type CartRecommendation = {
  id: string;
  imageUrl: string | null;
  name: string;
  price: CartMoney;
  slug: string;
  variantId: string;
  variantTitle: string;
};

export type CartDrawerLikeProduct = {
  id: string;
  imageUrl: string | null;
  name: string;
  price: CartMoney;
  slug: string;
  variantId: string;
};

export type CartShippingProgress = {
  amount: CartMoney | null;
  expressProgressPercent: number;
  freeExpressShippingThreshold: CartMoney;
  freeShippingThreshold: CartMoney;
  label: "calculated_at_checkout" | "free";
  progressPercent: number;
  qualifiedForFreeExpressShipping: boolean;
  qualifiedForFreeShipping: boolean;
  remainingExpressAmount: CartMoney;
  remainingAmount: CartMoney;
};

export type CartSnapshot = {
  currencyCode: string;
  id: string;
  itemCount: number;
  lines: CartLineItem[];
  recommendations: CartRecommendation[];
  shipping: CartShippingProgress;
  subtotal: CartMoney;
  total: CartMoney;
};

export type CartIdentityInput = {
  cartId?: string | null | undefined;
  countryCode?: string | undefined;
  customerId?: string | null | undefined;
  email?: string | null | undefined;
  likedUserId?: string | null | undefined;
  locale?: string | undefined;
  marketCode?: string | undefined;
};

export type CheckoutOrderContactInput = {
  addressLine1: string;
  addressLine2?: string | null | undefined;
  city: string;
  countryCode: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  postalCode: string;
};

export type CheckoutOrderSnapshot = {
  amount: CartMoney;
  cartId: string;
  email: string;
  id: string;
  orderNumber: string;
};

export type CheckoutOrderStatusSnapshot = {
  amount: CartMoney;
  orderId: string;
  orderNumber: string;
  orderStatus: typeof schema.orders.$inferSelect.status;
  paymentStatus: typeof schema.payments.$inferSelect.status | null;
};

export type CartErrorCode =
  | "CART_CHANGED"
  | "CART_NOT_FOUND"
  | "UNKNOWN"
  | "VARIANT_NOT_FOUND"
  | "VARIANT_UNAVAILABLE";

export type ProductListInput = {
  locale?: string | undefined;
  marketCode?: string | undefined;
  countryCode?: string | undefined;
  categorySlug?: string | undefined;
  collectionSlug?: string | undefined;
  likedOnlyUserId?: string | undefined;
  likedUserId?: string | undefined;
  optionValues?: Record<string, string[]> | undefined;
  onlyAvailable?: boolean | undefined;
  priceMaxAmount?: number | undefined;
  priceMinAmount?: number | undefined;
  sort?: ProductSort | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
};

export type ProductDetailInput = {
  slug: string;
  locale?: string | undefined;
  marketCode?: string | undefined;
  countryCode?: string | undefined;
};

export type RelatedProductCardsInput = {
  productId: string;
  locale?: string | undefined;
  marketCode?: string | undefined;
  countryCode?: string | undefined;
  likedUserId?: string | undefined;
  limit?: number | undefined;
};

export type ProductReview = {
  authorName: string;
  body: string;
  comfortScore: number;
  createdAt: Date;
  id: string;
  productId: string;
  qualityScore: number;
  rating: number;
  routineFitScore: number;
  title: string;
  valueScore: number;
  variantId: string | null;
  verifiedPurchase: boolean;
  wouldRecommend: boolean;
};

export type ProductReviewSummary = {
  averageRating: number | null;
  ratingBars: Array<{
    count: number;
    percent: number;
    rating: 1 | 2 | 3 | 4 | 5;
  }>;
  recommendationPercent: number | null;
  reviewCount: number;
  snapshots: {
    comfort: number | null;
    quality: number | null;
    routineFit: number | null;
    value: number | null;
  };
};

export type ProductReviewEligibility = {
  canReview: boolean;
  customerId: string | null;
  hasPurchased: boolean;
  hasReviewed: boolean;
  orderItemId: string | null;
  reason: "ALREADY_REVIEWED" | "AUTH_REQUIRED" | "ELIGIBLE" | "NOT_PURCHASED";
  variantId: string | null;
};

export type CreateProductReviewInput = {
  body: string;
  comfortScore: number;
  customerId: string;
  productId: string;
  qualityScore: number;
  rating: number;
  routineFitScore: number;
  title: string;
  valueScore: number;
  variantId?: string | null | undefined;
  wouldRecommend: boolean;
};

export type ProductReviewErrorCode =
  | "ALREADY_REVIEWED"
  | "INVALID_REVIEW"
  | "NOT_PURCHASED"
  | "UNKNOWN";

export type CatalogFilters = {
  categories: Array<{
    id: string;
    slug: string;
    name: string;
  }>;
  collections: Array<{
    id: string;
    slug: string;
    name: string;
  }>;
  options: Array<{
    code: string;
    name: string;
    values: string[];
  }>;
};

export type CatalogHealthIssue = {
  description: string;
  id: string;
  sampledIds: string[];
  severity: "danger" | "warning" | "info";
  title: string;
};

export type CatalogHealthReport = {
  generatedAt: Date;
  issues: CatalogHealthIssue[];
  market: CommerceMarket;
};

const fallbackMarket: CommerceMarket = {
  id: null,
  code: "dk",
  countryCode: "DK",
  currencyCode: "DKK",
  locale: "da",
  name: "Denmark",
  pricesIncludeTax: true,
  salesChannelId: null,
};
const marketCacheTtlMs = 5 * 60 * 1000;
const marketCache = new Map<string, {
  expiresAt: number;
  market: CommerceMarket;
}>();

function normalizeCode(value: string | null | undefined, fallback: string) {
  const normalized = value?.trim();

  return normalized ? normalized.toUpperCase() : fallback;
}

function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
}

function isVisibleProduct(product: ProductRecord, now = new Date()) {
  if (product.status === "active" || product.status === "published") {
    return !product.publishAt || product.publishAt <= now;
  }

  return false;
}

function isActivePriceList(priceList: PriceListRecord | null, now = new Date()) {
  if (!priceList) {
    return false;
  }

  if (priceList.status !== "active") {
    return false;
  }

  if (priceList.startsAt && priceList.startsAt > now) {
    return false;
  }

  if (priceList.endsAt && priceList.endsAt <= now) {
    return false;
  }

  return true;
}

function marketFromRecord(market: MarketRecord, countryCode: string | null): CommerceMarket {
  return {
    id: market.id,
    code: market.code,
    countryCode,
    currencyCode: market.defaultCurrencyCode ?? fallbackMarket.currencyCode,
    locale: market.defaultLocale,
    name: market.name,
    pricesIncludeTax: market.pricesIncludeTax,
    salesChannelId: market.defaultSalesChannelId,
  };
}

async function resolveMarket(
  input: {
    countryCode?: string | undefined;
    locale?: string | undefined;
    marketCode?: string | undefined;
  } = {},
  db: CommerceDb = getDb(),
): Promise<CommerceMarket> {
  const requestedCountryCode = input.countryCode ? normalizeCode(input.countryCode, "DK") : null;
  const cacheKey = [
    input.marketCode ? normalizeSlug(input.marketCode) : "",
    requestedCountryCode ?? "",
    input.locale ?? "",
  ].join(":");
  const cached = marketCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.market;
  }

  const cacheMarket = (market: CommerceMarket) => {
    marketCache.set(cacheKey, {
      expiresAt: Date.now() + marketCacheTtlMs,
      market,
    });

    return market;
  };

  if (input.marketCode) {
    const [market] = await db
      .select()
      .from(schema.markets)
      .where(and(eq(schema.markets.code, normalizeSlug(input.marketCode)), eq(schema.markets.status, "active")))
      .limit(1);

    if (market) {
      return cacheMarket({
        ...marketFromRecord(market, requestedCountryCode),
        locale: input.locale ?? market.defaultLocale,
      });
    }
  }

  if (requestedCountryCode) {
    const [row] = await db
      .select({
        countryCode: schema.marketCountries.countryCode,
        market: schema.markets,
      })
      .from(schema.marketCountries)
      .innerJoin(schema.markets, eq(schema.marketCountries.marketId, schema.markets.id))
      .where(
        and(
          eq(schema.marketCountries.countryCode, requestedCountryCode),
          eq(schema.markets.status, "active"),
        ),
      )
      .limit(1);

    if (row) {
      return cacheMarket({
        ...marketFromRecord(row.market, row.countryCode),
        locale: input.locale ?? row.market.defaultLocale,
      });
    }
  }

  const [market] = await db
    .select()
    .from(schema.markets)
    .where(eq(schema.markets.status, "active"))
    .orderBy(asc(schema.markets.code))
    .limit(1);

  if (!market) {
    return cacheMarket({
      ...fallbackMarket,
      locale: input.locale ?? fallbackMarket.locale,
    });
  }

  return cacheMarket({
    ...marketFromRecord(market, requestedCountryCode),
    locale: input.locale ?? market.defaultLocale,
  });
}

function chooseTranslation<T extends { locale: string }>(
  translations: T[],
  locale: string,
): T | null {
  return translations.find((translation) => translation.locale === locale) ?? translations[0] ?? null;
}

function chooseImageUrl(
  product: ProductRecord,
  variant: ProductVariantRecord | null,
  media: Array<ProductMediaRecord & { asset: MediaAssetRecord | null }>,
) {
  return chooseImageUrls(product, variant, media).primary;
}

function chooseImageUrls(
  product: ProductRecord,
  variant: ProductVariantRecord | null,
  media: Array<ProductMediaRecord & { asset: MediaAssetRecord | null }>,
) {
  const urls: string[] = [];

  function addUrl(url: string | null | undefined) {
    if (url && !urls.includes(url)) {
      urls.push(url);
    }
  }

  const variantMedia = variant
    ? media.filter((entry) => entry.variantId === variant.id && entry.asset?.deliveryUrl)
    : [];
  const sharedMedia = media.filter((entry) => !entry.variantId && entry.asset?.deliveryUrl);

  for (const entry of variantMedia) {
    addUrl(entry.asset?.deliveryUrl);
  }

  for (const entry of sharedMedia.filter((entry) => entry.role === "featured")) {
    addUrl(entry.asset?.deliveryUrl);
  }

  for (const entry of sharedMedia) {
    addUrl(entry.asset?.deliveryUrl);
  }

  addUrl(product.featuredImageUrl);

  return {
    primary: urls[0] ?? null,
    secondary: urls[1] ?? null,
  };
}

function getVariantMediaImages(
  variantId: string,
  media: Array<ProductMediaRecord & { asset: MediaAssetRecord | null }>,
) {
  return media
    .filter((entry) => entry.variantId === variantId)
    .map((entry) => ({
      altText: entry.asset?.altText ?? null,
      id: entry.id,
      mimeType: entry.asset?.mimeType ?? null,
      role: entry.role,
      url: entry.asset?.deliveryUrl ?? null,
    }));
}

const visualOptionCodes = new Set([
  "color",
  "colour",
  "flavor",
  "flavour",
  "scent",
  "shade",
  "finish",
  "bundle",
]);

const mediaPickerOptionCodes = new Set([
  "color",
  "colour",
  "flavor",
  "flavour",
  "scent",
  "shade",
  "finish",
  "taste",
]);

const compactOptionCodes = new Set([
  "count",
  "pack",
  "size",
  "strength",
]);

const sizeGuideProductTypes = new Set([
  "apparel",
  "clothing",
  "footwear",
  "shoes",
]);

function getRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function getBooleanMetadataValue(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function getProductSizeGuideVisibility(product: ProductRecord) {
  const metadata = product.metadata;
  const sizeGuide = getRecord(metadata.sizeGuide);
  const configured =
    getBooleanMetadataValue(metadata.showSizeGuide) ??
    getBooleanMetadataValue(metadata.sizeGuideEnabled) ??
    getBooleanMetadataValue(metadata.hasSizeGuide) ??
    getBooleanMetadataValue(sizeGuide?.enabled) ??
    getBooleanMetadataValue(sizeGuide?.visible);

  if (configured !== null) {
    return configured;
  }

  return sizeGuideProductTypes.has(normalizeSlug(product.productType ?? ""));
}

function readProductAttributeValue(value: ProductAttributeValueRecord): ProductDetailAttribute["value"] {
  if (value.valueJson !== null && Array.isArray(value.valueJson)) {
    return value.valueJson.filter((entry): entry is string => typeof entry === "string");
  }

  return value.valueText ?? value.valueNumber ?? value.valueBoolean ?? null;
}

function mapProductDetailAttributes(
  entries: Array<{
    attribute: ProductAttributeRecord;
    value: ProductAttributeValueRecord;
  }>,
  locale: string,
): ProductDetailAttribute[] {
  const preferredEntries = new Map<string, {
    attribute: ProductAttributeRecord;
    value: ProductAttributeValueRecord;
  }>();

  for (const entry of entries) {
    const current = preferredEntries.get(entry.attribute.code);
    const isLocaleMatch = entry.value.locale === locale;
    const isFallbackMatch = entry.value.locale === "da";

    if (!current || isLocaleMatch || (current.value.locale !== locale && isFallbackMatch)) {
      preferredEntries.set(entry.attribute.code, entry);
    }
  }

  return [...preferredEntries.values()].map((entry) => ({
    code: entry.attribute.code,
    name: entry.attribute.name,
    type: entry.attribute.type,
    unit: entry.attribute.unit,
    value: readProductAttributeValue(entry.value),
  }));
}

function isProductOptionPickerDisplay(value: unknown): value is ProductOptionPickerDisplay {
  return typeof value === "string" &&
    productOptionPickerDisplays.includes(value as ProductOptionPickerDisplay);
}

function getConfiguredOptionPickerDisplay(
  metadata: Record<string, unknown>,
  optionCode: string,
) {
  const displays = getRecord(metadata.variantPickerDisplays) ?? getRecord(metadata.optionPickerDisplays);
  const configured = displays?.[optionCode] ?? displays?.[normalizeSlug(optionCode)];

  return isProductOptionPickerDisplay(configured) ? configured : null;
}

function getConfiguredOptionValueRecord(
  metadata: Record<string, unknown>,
  optionCode: string,
  value: string,
) {
  const optionValueMetadata =
    getRecord(metadata.variantPickerValues) ??
    getRecord(metadata.optionPickerValues) ??
    getRecord(metadata.optionValueDisplays);
  const optionRecord = getRecord(optionValueMetadata?.[optionCode]) ?? getRecord(optionValueMetadata?.[normalizeSlug(optionCode)]);

  return getRecord(optionRecord?.[value]) ?? getRecord(optionRecord?.[normalizeSlug(value)]);
}

function getConfiguredOptionValueImageUrl(
  metadata: Record<string, unknown>,
  optionCode: string,
  value: string,
) {
  const record = getConfiguredOptionValueRecord(metadata, optionCode, value);
  const imageUrl = record?.imageUrl ?? record?.image;

  return typeof imageUrl === "string" ? imageUrl : null;
}

function getConfiguredOptionValueSwatchColor(
  metadata: Record<string, unknown>,
  optionCode: string,
  value: string,
) {
  const record = getConfiguredOptionValueRecord(metadata, optionCode, value);
  const color = record?.swatchColor ?? record?.color;

  return typeof color === "string" ? color : null;
}

function getOptionPickerDisplay(
  option: ProductOptionRecord,
  values: Array<{ value: ProductOptionValueRecord }>,
  metadata: Record<string, unknown>,
) {
  const configured = getConfiguredOptionPickerDisplay(metadata, option.code);

  if (configured) {
    return configured;
  }

  const normalizedCode = normalizeSlug(option.code);

  if (mediaPickerOptionCodes.has(normalizedCode)) {
    return "media";
  }

  if (compactOptionCodes.has(normalizedCode) || values.length > 4) {
    return "compact";
  }

  return "default";
}

function getVariantDisplayOptions(options: ProductVariantOption[]) {
  return options.filter((option) => visualOptionCodes.has(normalizeSlug(option.optionCode)));
}

function getVariantDisplayKey(options: ProductVariantOption[]) {
  const displayOptions = getVariantDisplayOptions(options);

  if (displayOptions.length === 0) {
    return "default";
  }

  return displayOptions
    .map((option) => `${normalizeSlug(option.optionCode)}:${option.value}`)
    .join("|");
}

function getVariantDisplayTitle(variant: ProductVariantRecord, options: ProductVariantOption[]) {
  const displayOptions = getVariantDisplayOptions(options);

  if (displayOptions.length === 0) {
    return variant.title;
  }

  return displayOptions.map((option) => option.value).join(" / ");
}

function variantMatchesOptionFilters(
  options: ProductVariantOption[],
  optionValues: ProductListInput["optionValues"],
) {
  if (!optionValues) {
    return true;
  }

  return Object.entries(optionValues).every(([code, values]) => {
    if (values.length === 0) {
      return true;
    }

    return options.some((option) => (
      normalizeSlug(option.optionCode) === normalizeSlug(code) &&
      values.includes(option.value)
    ));
  });
}

async function getVariantOptionsByVariantId(variantIds: string[], db: CommerceDb) {
  const optionsByVariantId = new Map<string, ProductVariantOption[]>();

  if (variantIds.length === 0) {
    return optionsByVariantId;
  }

  const rows = await db
    .select({
      option: schema.productOptions,
      value: schema.productOptionValues,
      variantId: schema.productVariantOptionValues.variantId,
    })
    .from(schema.productVariantOptionValues)
    .innerJoin(
      schema.productOptionValues,
      eq(schema.productVariantOptionValues.optionValueId, schema.productOptionValues.id),
    )
    .innerJoin(schema.productOptions, eq(schema.productOptionValues.optionId, schema.productOptions.id))
    .where(inArray(schema.productVariantOptionValues.variantId, variantIds))
    .orderBy(asc(schema.productOptions.position), asc(schema.productOptionValues.position));

  for (const row of rows) {
    const list = optionsByVariantId.get(row.variantId) ?? [];

    list.push({
      optionCode: row.option.code,
      optionName: row.option.name,
      value: row.value.value,
    });
    optionsByVariantId.set(row.variantId, list);
  }

  return optionsByVariantId;
}

async function getProductMedia(productIds: string[], db: CommerceDb) {
  if (productIds.length === 0) {
    return new Map<string, Array<ProductMediaRecord & { asset: MediaAssetRecord | null }>>();
  }

  const rows = await db
    .select({
      media: schema.productMedia,
      asset: schema.mediaAssets,
    })
    .from(schema.productMedia)
    .leftJoin(schema.mediaAssets, eq(schema.productMedia.mediaAssetId, schema.mediaAssets.id))
    .where(inArray(schema.productMedia.productId, productIds))
    .orderBy(asc(schema.productMedia.position));

  const mediaByProduct = new Map<string, Array<ProductMediaRecord & { asset: MediaAssetRecord | null }>>();

  for (const row of rows) {
    const list = mediaByProduct.get(row.media.productId) ?? [];
    list.push({
      ...row.media,
      asset: row.asset,
    });
    mediaByProduct.set(row.media.productId, list);
  }

  return mediaByProduct;
}

async function getActivePrice(
  priceSetId: string | null,
  market: CommerceMarket,
  db: CommerceDb,
) {
  if (!priceSetId) {
    return null;
  }

  const rows = await db
    .select({
      price: schema.prices,
      priceList: schema.priceLists,
    })
    .from(schema.prices)
    .leftJoin(schema.priceLists, eq(schema.prices.priceListId, schema.priceLists.id))
    .where(
      and(
        eq(schema.prices.priceSetId, priceSetId),
        eq(schema.prices.currencyCode, market.currencyCode),
        market.id
          ? or(eq(schema.prices.marketId, market.id), isNull(schema.prices.marketId))
          : isNull(schema.prices.marketId),
      ),
    )
    .orderBy(desc(schema.prices.createdAt));

  return getActiveMoneyFromPriceRows(rows, market);
}

function getActiveMoneyFromPriceRows(
  rows: Array<{ price: PriceRecord; priceList: PriceListRecord | null }>,
  market: CommerceMarket,
) {
  const activeCampaignRows = rows.filter((row) => isActivePriceList(row.priceList));
  const activeCampaignPrice =
    activeCampaignRows.find((row) => market.id && row.price.marketId === market.id)?.price
    ?? activeCampaignRows.find((row) => row.price.marketId === null)?.price
    ?? null;
  const baseMarketPrice =
    rows.find((row) => !row.priceList && row.price.marketId === market.id)?.price ?? null;
  const baseCurrencyPrice = rows.find((row) => !row.priceList && row.price.marketId === null)?.price ?? null;
  const price = activeCampaignPrice ?? baseMarketPrice ?? baseCurrencyPrice;

  return price ? moneyFromPrice(price) : null;
}

async function getActivePricesByPriceSetId(
  priceSetIds: string[],
  market: CommerceMarket,
  db: CommerceDb,
) {
  const uniquePriceSetIds = [...new Set(priceSetIds)];
  const pricesByPriceSetId = new Map<string, Money>();

  if (uniquePriceSetIds.length === 0) {
    return pricesByPriceSetId;
  }

  const rows = await db
    .select({
      price: schema.prices,
      priceList: schema.priceLists,
    })
    .from(schema.prices)
    .leftJoin(schema.priceLists, eq(schema.prices.priceListId, schema.priceLists.id))
    .where(
      and(
        inArray(schema.prices.priceSetId, uniquePriceSetIds),
        eq(schema.prices.currencyCode, market.currencyCode),
        market.id
          ? or(eq(schema.prices.marketId, market.id), isNull(schema.prices.marketId))
          : isNull(schema.prices.marketId),
      ),
    )
    .orderBy(desc(schema.prices.createdAt));

  const rowsByPriceSetId = new Map<string, Array<{ price: PriceRecord; priceList: PriceListRecord | null }>>();

  for (const row of rows) {
    const group = rowsByPriceSetId.get(row.price.priceSetId) ?? [];
    group.push(row);
    rowsByPriceSetId.set(row.price.priceSetId, group);
  }

  for (const [priceSetId, priceRows] of rowsByPriceSetId) {
    const activePrice = getActiveMoneyFromPriceRows(priceRows, market);

    if (activePrice) {
      pricesByPriceSetId.set(priceSetId, activePrice);
    }
  }

  return pricesByPriceSetId;
}

function moneyFromPrice(price: PriceRecord): Money {
  return {
    amount: price.amount,
    compareAtAmount: price.compareAtAmount,
    currencyCode: price.currencyCode,
    includesTax: price.includesTax,
    isSale: Boolean(
      price.priceListId ||
      (price.compareAtAmount && price.compareAtAmount > price.amount),
    ),
    priceListId: price.priceListId,
  };
}

function sortProductCards(cards: ProductCard[], sort: ProductSort | undefined) {
  const sorted = [...cards];

  if (sort === "name-asc") {
    sorted.sort((first, second) => first.name.localeCompare(second.name));
  } else if (sort === "price-asc") {
    sorted.sort((first, second) => first.price.amount - second.price.amount);
  } else if (sort === "price-desc") {
    sorted.sort((first, second) => second.price.amount - first.price.amount);
  } else {
    sorted.sort((first, second) => second.createdAt.getTime() - first.createdAt.getTime());
  }

  return sorted;
}

async function getAvailabilityByVariantId(
  variantIds: string[],
  market: CommerceMarket,
  db: CommerceDb,
) {
  const availabilityByVariantId = new Map<string, ProductAvailability>();

  for (const variantId of variantIds) {
    availabilityByVariantId.set(variantId, {
      availableQuantity: null,
      isAvailable: true,
      isTracked: false,
    });
  }

  if (variantIds.length === 0) {
    return availabilityByVariantId;
  }

  const variantItems = await db
    .select()
    .from(schema.variantInventoryItems)
    .where(inArray(schema.variantInventoryItems.variantId, variantIds));

  if (variantItems.length === 0) {
    const legacyLevels = await db
      .select()
      .from(schema.inventoryLevels)
      .where(inArray(schema.inventoryLevels.variantId, variantIds));

    for (const variantId of variantIds) {
      const levels = legacyLevels.filter((level) => level.variantId === variantId);
      const availableQuantity = levels.reduce((sum, level) => sum + Math.max(level.onHand - level.reserved, 0), 0);

      availabilityByVariantId.set(variantId, {
        availableQuantity,
        isAvailable: availableQuantity > 0,
        isTracked: levels.length > 0,
      });
    }

    return availabilityByVariantId;
  }

  const inventoryItemIds = [...new Set(variantItems.map((item) => item.inventoryItemId))];
  const levels = await db
    .select()
    .from(schema.inventoryLevels)
    .where(
      and(
        inArray(schema.inventoryLevels.inventoryItemId, inventoryItemIds),
        market.salesChannelId
          ? sql`(
            not exists (
              select 1
              from ${schema.salesChannelInventoryLocations}
              where ${schema.salesChannelInventoryLocations.salesChannelId} = ${market.salesChannelId}
            )
            or ${schema.inventoryLevels.locationId} in (
              select ${schema.salesChannelInventoryLocations.locationId}
              from ${schema.salesChannelInventoryLocations}
              where ${schema.salesChannelInventoryLocations.salesChannelId} = ${market.salesChannelId}
            )
          )`
          : undefined,
      ),
    );

  for (const variantId of variantIds) {
    const itemsForVariant = variantItems.filter((item) => item.variantId === variantId);

    if (itemsForVariant.length === 0) {
      continue;
    }

    const availableQuantities = itemsForVariant.map((item) => {
      const requiredQuantity = Math.max(item.requiredQuantity, 1);
      const itemAvailable = levels
        .filter((level) => level.inventoryItemId === item.inventoryItemId)
        .reduce((sum, level) => sum + Math.max(level.onHand - level.reserved, 0), 0);

      return Math.floor(itemAvailable / requiredQuantity);
    });
    const availableQuantity = Math.min(...availableQuantities);

    availabilityByVariantId.set(variantId, {
      availableQuantity,
      isAvailable: availableQuantity > 0,
      isTracked: true,
    });
  }

  return availabilityByVariantId;
}

async function getProductIdsForCollection(slug: string, locale: string, db: CommerceDb) {
  const rows = await db
    .select({ productId: schema.collectionProducts.productId })
    .from(schema.collectionProducts)
    .innerJoin(schema.collections, eq(schema.collectionProducts.collectionId, schema.collections.id))
    .leftJoin(
      schema.collectionTranslations,
      and(
        eq(schema.collectionTranslations.collectionId, schema.collections.id),
        eq(schema.collectionTranslations.locale, locale),
      ),
    )
    .where(
      or(
        eq(schema.collections.slug, normalizeSlug(slug)),
        eq(schema.collectionTranslations.name, slug),
      ),
    );

  return new Set(rows.map((row) => row.productId));
}

async function getProductIdsForCategory(slug: string, locale: string, db: CommerceDb) {
  const rows = await db
    .select({ productId: schema.productCategories.productId })
    .from(schema.productCategories)
    .innerJoin(schema.categories, eq(schema.productCategories.categoryId, schema.categories.id))
    .leftJoin(
      schema.categoryTranslations,
      and(
        eq(schema.categoryTranslations.categoryId, schema.categories.id),
        eq(schema.categoryTranslations.locale, locale),
      ),
    )
    .where(
      or(
        eq(schema.categories.slug, normalizeSlug(slug)),
        eq(schema.categoryTranslations.slug, normalizeSlug(slug)),
      ),
    );

  return new Set(rows.map((row) => row.productId));
}

async function getProductIdsForOptionValue(code: string, values: string[], db: CommerceDb) {
  if (values.length === 0) {
    return new Set<string>();
  }

  const rows = await db
    .select({ productId: schema.productVariants.productId })
    .from(schema.productVariants)
    .innerJoin(
      schema.productVariantOptionValues,
      eq(schema.productVariantOptionValues.variantId, schema.productVariants.id),
    )
    .innerJoin(
      schema.productOptionValues,
      eq(schema.productVariantOptionValues.optionValueId, schema.productOptionValues.id),
    )
    .innerJoin(schema.productOptions, eq(schema.productOptionValues.optionId, schema.productOptions.id))
    .where(
      and(
        eq(schema.productOptions.code, normalizeSlug(code)),
        inArray(schema.productOptionValues.value, values),
      ),
    );

  return new Set(rows.map((row) => row.productId));
}

export async function getProductCards(input: ProductListInput = {}, db: CommerceDb = getDb()) {
  const market = await resolveMarket(input, db);
  const locale = input.locale ?? market.locale;
  const limit = Math.min(Math.max(input.limit ?? 48, 1), 96);
  const offset = Math.max(input.offset ?? 0, 0);
  const candidateLimit = Math.min(Math.max(limit + offset + 48, 120), 240);
  const now = new Date();
  const likedOnlyRows = input.likedOnlyUserId
    ? (await db
      .select({
        productId: schema.customerProductLikes.productId,
        variantId: schema.customerProductLikes.variantId,
      })
      .from(schema.customerProductLikes)
      .where(eq(schema.customerProductLikes.userId, input.likedOnlyUserId))
      .orderBy(desc(schema.customerProductLikes.createdAt))
      .limit(500))
    : null;
  const likedOnlyProductIds = likedOnlyRows?.map((row) => row.productId) ?? null;
  const likedOnlyVariantIds = likedOnlyRows ? new Set(likedOnlyRows.map((row) => row.variantId)) : null;

  if (likedOnlyProductIds && likedOnlyProductIds.length === 0) {
    return {
      items: [],
      market,
    };
  }

  const productRows = await db
    .select({
      product: schema.products,
      translation: schema.productTranslations,
    })
    .from(schema.products)
    .leftJoin(
      schema.productTranslations,
      and(
        eq(schema.productTranslations.productId, schema.products.id),
        eq(schema.productTranslations.locale, locale),
      ),
    )
    .where(
      likedOnlyProductIds
        ? and(
          or(eq(schema.products.status, "active"), eq(schema.products.status, "published")),
          or(isNull(schema.products.publishAt), lte(schema.products.publishAt, now)),
          inArray(schema.products.id, likedOnlyProductIds),
        )
        : and(
          or(eq(schema.products.status, "active"), eq(schema.products.status, "published")),
          or(isNull(schema.products.publishAt), lte(schema.products.publishAt, now)),
        ),
    )
    .orderBy(desc(schema.products.createdAt))
    .limit(candidateLimit);

  let filteredProductRows = productRows;

  if (market.salesChannelId && filteredProductRows.length > 0) {
    const channelRows = await db
      .select({ productId: schema.productSalesChannels.productId })
      .from(schema.productSalesChannels)
      .where(
        and(
          inArray(schema.productSalesChannels.productId, filteredProductRows.map((row) => row.product.id)),
          eq(schema.productSalesChannels.salesChannelId, market.salesChannelId),
        ),
      );
    const channelProductIds = new Set(channelRows.map((row) => row.productId));
    filteredProductRows = filteredProductRows.filter((row) => channelProductIds.has(row.product.id));
  }

  if (input.collectionSlug) {
    const collectionProductIds = await getProductIdsForCollection(input.collectionSlug, locale, db);
    filteredProductRows = filteredProductRows.filter((row) => collectionProductIds.has(row.product.id));
  }

  if (input.categorySlug) {
    const categoryProductIds = await getProductIdsForCategory(input.categorySlug, locale, db);
    filteredProductRows = filteredProductRows.filter((row) => categoryProductIds.has(row.product.id));
  }

  if (input.optionValues) {
    for (const [code, values] of Object.entries(input.optionValues)) {
      const productIdsForOption = await getProductIdsForOptionValue(code, values, db);
      filteredProductRows = filteredProductRows.filter((row) => productIdsForOption.has(row.product.id));
    }
  }

  const productIds = filteredProductRows.map((row) => row.product.id);
  const variants = productIds.length > 0
    ? await db
      .select()
      .from(schema.productVariants)
      .where(inArray(schema.productVariants.productId, productIds))
      .orderBy(desc(schema.productVariants.isDefault), asc(schema.productVariants.createdAt))
    : [];
  const variantsByProductId = new Map<string, ProductVariantRecord[]>();

  for (const variant of variants) {
    const productVariants = variantsByProductId.get(variant.productId) ?? [];
    productVariants.push(variant);
    variantsByProductId.set(variant.productId, productVariants);
  }

  const variantIds = variants.map((variant) => variant.id);
  const [availabilityByVariantId, mediaByProduct, pricesByPriceSetId, optionsByVariantId] = await Promise.all([
    getAvailabilityByVariantId(variants.map((variant) => variant.id), market, db),
    getProductMedia(productIds, db),
    getActivePricesByPriceSetId(
      variants
        .map((variant) => variant.priceSetId)
        .filter((priceSetId): priceSetId is string => Boolean(priceSetId)),
      market,
      db,
    ),
    getVariantOptionsByVariantId(variantIds, db),
  ]);
  const likedStateUserId = input.likedUserId ?? input.likedOnlyUserId;
  const likedVariantIds = likedStateUserId && productIds.length > 0
    ? new Set(
      (await db
        .select({ variantId: schema.customerProductLikes.variantId })
        .from(schema.customerProductLikes)
        .where(
          and(
            eq(schema.customerProductLikes.userId, likedStateUserId),
            inArray(schema.customerProductLikes.productId, productIds),
          ),
        )).map((row) => row.variantId),
    )
    : new Set<string>();
  const cards: ProductCard[] = [];

  for (const row of filteredProductRows) {
    if (!isVisibleProduct(row.product)) {
      continue;
    }

    const productVariants = variantsByProductId.get(row.product.id) ?? [];
    const variantGroups = new Map<string, ProductVariantRecord[]>();

    for (const variant of productVariants) {
      const options = optionsByVariantId.get(variant.id) ?? [];

      if (likedOnlyVariantIds && !likedOnlyVariantIds.has(variant.id)) {
        continue;
      }

      if (!variantMatchesOptionFilters(options, input.optionValues)) {
        continue;
      }

      const displayKey = likedOnlyVariantIds
        ? variant.id
        : getVariantDisplayKey(options);
      const group = variantGroups.get(displayKey) ?? [];

      group.push(variant);
      variantGroups.set(displayKey, group);
    }

    if (variantGroups.size === 0) {
      continue;
    }

    const media = mediaByProduct.get(row.product.id) ?? [];

    for (const [displayKey, group] of variantGroups) {
      const defaultVariant = group.find((item) => item.isDefault);
      const defaultAvailablePricedVariant = group.find((item) => {
        const price = item.priceSetId ? pricesByPriceSetId.get(item.priceSetId) ?? null : null;
        const availability = availabilityByVariantId.get(item.id);

        return Boolean(item.isDefault && price && availability?.isAvailable);
      });
      const availablePricedVariant = group.find((item) => {
        const price = item.priceSetId ? pricesByPriceSetId.get(item.priceSetId) ?? null : null;
        const availability = availabilityByVariantId.get(item.id);

        return Boolean(price && availability?.isAvailable);
      });
      const pricedVariant = group.find((item) => (
        item.priceSetId ? pricesByPriceSetId.has(item.priceSetId) : false
      ));
      const defaultPricedVariant = defaultVariant?.priceSetId && pricesByPriceSetId.has(defaultVariant.priceSetId)
        ? defaultVariant
        : null;
      const variant = (
        defaultAvailablePricedVariant
          ?? availablePricedVariant
          ?? defaultPricedVariant
          ?? pricedVariant
          ?? group[0]
          ?? null
      );

      if (!variant) {
        continue;
      }

      const price = variant.priceSetId ? pricesByPriceSetId.get(variant.priceSetId) ?? null : null;

      if (!price) {
        continue;
      }

      if (typeof input.priceMinAmount === "number" && price.amount < input.priceMinAmount) {
        continue;
      }

      if (typeof input.priceMaxAmount === "number" && price.amount > input.priceMaxAmount) {
        continue;
      }

      const availability = availabilityByVariantId.get(variant.id) ?? {
        availableQuantity: null,
        isAvailable: true,
        isTracked: false,
      };

      if (input.onlyAvailable && !availability.isAvailable) {
        continue;
      }

      const imageUrls = chooseImageUrls(row.product, variant, media);
      const variantOptions = optionsByVariantId.get(variant.id) ?? [];

      cards.push({
        createdAt: row.product.createdAt,
        displayId: `${row.product.id}:${displayKey}`,
        id: row.product.id,
        isLiked: likedVariantIds.has(variant.id),
        slug: row.translation?.slug ?? row.product.slug,
        name: row.translation?.name ?? variant.title,
        description: row.translation?.shortDescription ?? row.translation?.description ?? null,
        imageUrl: imageUrls.primary,
        secondaryImageUrl: imageUrls.secondary,
        status: row.product.status,
        variantId: variant.id,
        variantTitle: getVariantDisplayTitle(variant, variantOptions),
        price,
        availability,
      });
    }
  }

  return {
    items: sortProductCards(cards, input.sort).slice(offset, offset + limit),
    market,
  };
}

export async function getCartDrawerLikes(
  input: {
    countryCode?: string | undefined;
    locale?: string | undefined;
    limit?: number | undefined;
    marketCode?: string | undefined;
    userId: string;
  },
  db: CommerceDb = getDb(),
): Promise<CartDrawerLikeProduct[]> {
  const market = await resolveMarket(input, db);
  const locale = input.locale ?? market.locale;
  const limit = Math.min(Math.max(input.limit ?? 12, 1), 24);
  const likedRows = await db
    .select({
      productId: schema.customerProductLikes.productId,
      variantId: schema.customerProductLikes.variantId,
    })
    .from(schema.customerProductLikes)
    .where(eq(schema.customerProductLikes.userId, input.userId))
    .orderBy(desc(schema.customerProductLikes.createdAt))
    .limit(limit);

  if (likedRows.length === 0) {
    return [];
  }

  const productIds = [...new Set(likedRows.map((row) => row.productId))];
  const variantIds = [...new Set(likedRows.map((row) => row.variantId))];
  const [rows, mediaByProduct] = await Promise.all([
    db
      .select({
        product: schema.products,
        translation: schema.productTranslations,
        variant: schema.productVariants,
      })
      .from(schema.productVariants)
      .innerJoin(schema.products, eq(schema.productVariants.productId, schema.products.id))
      .leftJoin(
        schema.productTranslations,
        and(
          eq(schema.productTranslations.productId, schema.products.id),
          eq(schema.productTranslations.locale, locale),
        ),
      )
      .where(inArray(schema.productVariants.id, variantIds)),
    getProductMedia(productIds, db),
  ]);

  let scopedProductIds = new Set(productIds);

  if (market.salesChannelId && productIds.length > 0) {
    const channelRows = await db
      .select({ productId: schema.productSalesChannels.productId })
      .from(schema.productSalesChannels)
      .where(
        and(
          inArray(schema.productSalesChannels.productId, productIds),
          eq(schema.productSalesChannels.salesChannelId, market.salesChannelId),
        ),
      );

    scopedProductIds = new Set(channelRows.map((row) => row.productId));
  }

  const pricesByPriceSetId = await getActivePricesByPriceSetId(
    rows
      .map((row) => row.variant.priceSetId)
      .filter((priceSetId): priceSetId is string => Boolean(priceSetId)),
    market,
    db,
  );
  const rowsByVariantId = new Map(rows.map((row) => [row.variant.id, row]));
  const items: CartDrawerLikeProduct[] = [];

  for (const likedRow of likedRows) {
    const row = rowsByVariantId.get(likedRow.variantId);

    if (!row || !isVisibleProduct(row.product) || !scopedProductIds.has(row.product.id)) {
      continue;
    }

    const price = row.variant.priceSetId
      ? pricesByPriceSetId.get(row.variant.priceSetId) ?? null
      : null;

    if (!price) {
      continue;
    }

    items.push({
      id: row.product.id,
      imageUrl: chooseImageUrl(row.product, row.variant, mediaByProduct.get(row.product.id) ?? []),
      name: row.translation?.name ?? row.variant.title,
      price: cartMoney(price.amount, price.currencyCode),
      slug: row.translation?.slug ?? row.product.slug,
      variantId: row.variant.id,
    });
  }

  return items;
}

export async function getRelatedProductCards(
  input: RelatedProductCardsInput,
  db: CommerceDb = getDb(),
): Promise<ProductCard[]> {
  const market = await resolveMarket(input, db);
  const locale = input.locale ?? market.locale;
  const limit = Math.min(Math.max(input.limit ?? 8, 1), 24);
  const relatedProductIds = new Set<string>();

  const [categoryRows, collectionRows] = await Promise.all([
    db
      .select({ categoryId: schema.productCategories.categoryId })
      .from(schema.productCategories)
      .where(eq(schema.productCategories.productId, input.productId)),
    db
      .select({ collectionId: schema.collectionProducts.collectionId })
      .from(schema.collectionProducts)
      .where(eq(schema.collectionProducts.productId, input.productId)),
  ]);
  const categoryIds = [...new Set(categoryRows.map((row) => row.categoryId))];
  const collectionIds = [...new Set(collectionRows.map((row) => row.collectionId))];
  const [relatedCategories, relatedCollections] = await Promise.all([
    categoryIds.length > 0
      ? db
        .select({ productId: schema.productCategories.productId })
        .from(schema.productCategories)
        .where(inArray(schema.productCategories.categoryId, categoryIds))
      : [],
    collectionIds.length > 0
      ? db
        .select({ productId: schema.collectionProducts.productId })
        .from(schema.collectionProducts)
        .where(inArray(schema.collectionProducts.collectionId, collectionIds))
      : [],
  ]);

  for (const row of [...relatedCategories, ...relatedCollections]) {
    if (row.productId !== input.productId) {
      relatedProductIds.add(row.productId);
    }
  }

  const productList = await getProductCards({
    countryCode: market.countryCode ?? input.countryCode,
    likedUserId: input.likedUserId,
    locale,
    marketCode: market.code,
    onlyAvailable: true,
    sort: "newest",
    limit: 96,
  }, db);
  const relatedCards = productList.items.filter((product) => (
    product.id !== input.productId &&
    (relatedProductIds.size === 0 || relatedProductIds.has(product.id))
  ));
  const fallbackCards = productList.items.filter((product) => (
    product.id !== input.productId &&
    !relatedCards.some((relatedProduct) => relatedProduct.id === product.id)
  ));

  return [...relatedCards, ...fallbackCards].slice(0, limit);
}

export async function getProductDetailBySlug(
  input: ProductDetailInput,
  db: CommerceDb = getDb(),
): Promise<ProductDetail | null> {
  const market = await resolveMarket(input, db);
  const locale = input.locale ?? market.locale;
  const slug = normalizeSlug(input.slug);
  const now = new Date();
  const [localizedProduct] = await db
    .select({
      product: schema.products,
      translation: schema.productTranslations,
    })
    .from(schema.productTranslations)
    .innerJoin(schema.products, eq(schema.productTranslations.productId, schema.products.id))
    .where(
      and(
        eq(schema.productTranslations.locale, locale),
        eq(schema.productTranslations.slug, slug),
        or(eq(schema.products.status, "active"), eq(schema.products.status, "published")),
        or(isNull(schema.products.publishAt), lte(schema.products.publishAt, now)),
      ),
    )
    .limit(1);

  const row = localizedProduct
    ?? (await db
      .select({
        product: schema.products,
        translation: schema.productTranslations,
      })
      .from(schema.products)
      .leftJoin(
        schema.productTranslations,
        and(
          eq(schema.productTranslations.productId, schema.products.id),
          eq(schema.productTranslations.locale, locale),
        ),
      )
      .where(
        and(
          eq(schema.products.slug, slug),
          or(eq(schema.products.status, "active"), eq(schema.products.status, "published")),
          or(isNull(schema.products.publishAt), lte(schema.products.publishAt, now)),
        ),
      )
      .limit(1))[0];

  if (!row) {
    return null;
  }

  const [translations, variants, options, optionValues, variantOptionValues, mediaByProduct, productAttributeValues] = await Promise.all([
    db
      .select()
      .from(schema.productTranslations)
      .where(eq(schema.productTranslations.productId, row.product.id)),
    db
      .select()
      .from(schema.productVariants)
      .where(eq(schema.productVariants.productId, row.product.id))
      .orderBy(desc(schema.productVariants.isDefault), asc(schema.productVariants.createdAt)),
    db
      .select()
      .from(schema.productOptions)
      .where(eq(schema.productOptions.productId, row.product.id))
      .orderBy(asc(schema.productOptions.position)),
    db
      .select({
        value: schema.productOptionValues,
        option: schema.productOptions,
      })
      .from(schema.productOptionValues)
      .innerJoin(schema.productOptions, eq(schema.productOptionValues.optionId, schema.productOptions.id))
      .where(eq(schema.productOptions.productId, row.product.id))
      .orderBy(asc(schema.productOptionValues.position)),
    db
      .select({
        variantId: schema.productVariantOptionValues.variantId,
        value: schema.productOptionValues,
        option: schema.productOptions,
      })
      .from(schema.productVariantOptionValues)
      .innerJoin(
        schema.productOptionValues,
        eq(schema.productVariantOptionValues.optionValueId, schema.productOptionValues.id),
      )
      .innerJoin(schema.productOptions, eq(schema.productOptionValues.optionId, schema.productOptions.id))
      .where(eq(schema.productOptions.productId, row.product.id)),
    getProductMedia([row.product.id], db),
    db
      .select({
        attribute: schema.productAttributes,
        value: schema.productAttributeValues,
      })
      .from(schema.productAttributeValues)
      .innerJoin(
        schema.productAttributes,
        eq(schema.productAttributeValues.attributeId, schema.productAttributes.id),
      )
      .where(eq(schema.productAttributeValues.productId, row.product.id))
      .orderBy(asc(schema.productAttributes.name)),
  ]);
  const translation = row.translation ?? chooseTranslation(translations, locale);
  const [availabilityByVariantId, pricesByPriceSetId] = await Promise.all([
    getAvailabilityByVariantId(variants.map((variant) => variant.id), market, db),
    getActivePricesByPriceSetId(
      variants
        .map((variant) => variant.priceSetId)
        .filter((priceSetId): priceSetId is string => Boolean(priceSetId)),
      market,
      db,
    ),
  ]);
  const media = mediaByProduct.get(row.product.id) ?? [];
  const productVariants = variants.map((variant) => {
    const price = variant.priceSetId ? pricesByPriceSetId.get(variant.priceSetId) ?? null : null;
    const selectedOptions = variantOptionValues
      .filter((entry) => entry.variantId === variant.id)
      .map((entry) => ({
        optionCode: entry.option.code,
        optionName: entry.option.name,
        value: entry.value.value,
      }));

    return {
      id: variant.id,
      sku: variant.sku,
      title: variant.title,
      isDefault: variant.isDefault,
      options: selectedOptions,
      media: getVariantMediaImages(variant.id, media),
      price,
      availability: availabilityByVariantId.get(variant.id) ?? {
        availableQuantity: null,
        isAvailable: true,
        isTracked: false,
      },
      imageUrl: chooseImageUrl(row.product, variant, media),
    } satisfies ProductVariant;
  });

  return {
    id: row.product.id,
    slug: translation?.slug ?? row.product.slug,
    name: translation?.name ?? row.product.slug,
    productType: row.product.productType,
    description: translation?.description ?? null,
    shortDescription: translation?.shortDescription ?? null,
    seoTitle: translation?.seoTitle ?? row.product.seoTitle,
    seoDescription: translation?.seoDescription ?? row.product.seoDescription,
    status: row.product.status,
    market,
    showSizeGuide: getProductSizeGuideVisibility(row.product),
    media: media.map((entry) => ({
      id: entry.id,
      mimeType: entry.asset?.mimeType ?? null,
      role: entry.role,
      url: entry.asset?.deliveryUrl ?? null,
      altText: entry.asset?.altText ?? null,
      variantId: entry.variantId,
    })),
    options: options.map((option: ProductOptionRecord) => {
      const values = optionValues.filter((entry) => entry.option.id === option.id);

      return {
        id: option.id,
        code: option.code,
        name: option.name,
        pickerDisplay: getOptionPickerDisplay(option, values, row.product.metadata),
        values: values.map((entry) => ({
          id: entry.value.id,
          imageUrl: getConfiguredOptionValueImageUrl(row.product.metadata, option.code, entry.value.value),
          swatchColor: getConfiguredOptionValueSwatchColor(row.product.metadata, option.code, entry.value.value),
          value: entry.value.value,
        })),
      };
    }),
    variants: productVariants,
    attributes: mapProductDetailAttributes(productAttributeValues, locale),
  };
}

const reviewRatings = [5, 4, 3, 2, 1] as const;

function clampReviewScore(value: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(Math.max(Math.trunc(value), 1), 5);
}

function normalizeReviewText(value: string, maxLength: number) {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function isUniqueConstraintError(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505";
}

function getReviewAuthorName(profile: CustomerProfileRecord | null) {
  if (!profile) {
    return "Verified customer";
  }

  const name = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (name) {
    return name;
  }

  const emailName = profile.email.split("@")[0]?.trim();

  return emailName || "Verified customer";
}

function mapProductReview(
  review: ProductReviewRecord,
  customer: CustomerProfileRecord | null,
): ProductReview {
  return {
    authorName: getReviewAuthorName(customer),
    body: review.body,
    comfortScore: review.comfortScore,
    createdAt: review.createdAt,
    id: review.id,
    productId: review.productId,
    qualityScore: review.qualityScore,
    rating: review.rating,
    routineFitScore: review.routineFitScore,
    title: review.title,
    valueScore: review.valueScore,
    variantId: review.variantId,
    verifiedPurchase: Boolean(review.orderItemId),
    wouldRecommend: review.wouldRecommend,
  };
}

function emptyProductReviewSummary(): ProductReviewSummary {
  return {
    averageRating: null,
    ratingBars: reviewRatings.map((rating) => ({
      count: 0,
      percent: 0,
      rating,
    })),
    recommendationPercent: null,
    reviewCount: 0,
    snapshots: {
      comfort: null,
      quality: null,
      routineFit: null,
      value: null,
    },
  };
}

export async function getProductReviewSummary(productId: string, db: CommerceDb = getDb()) {
  const reviews = await db
    .select()
    .from(schema.productReviews)
    .where(and(eq(schema.productReviews.productId, productId), eq(schema.productReviews.status, "published")));

  if (reviews.length === 0) {
    return emptyProductReviewSummary();
  }

  const reviewCount = reviews.length;
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount;
  const recommendationPercent = Math.round(
    (reviews.filter((review) => review.wouldRecommend).length / reviewCount) * 100,
  );
  const ratingBars = reviewRatings.map((rating) => {
    const countForRating = reviews.filter((review) => review.rating === rating).length;

    return {
      count: countForRating,
      percent: Math.round((countForRating / reviewCount) * 100),
      rating,
    };
  });

  return {
    averageRating,
    ratingBars,
    recommendationPercent,
    reviewCount,
    snapshots: {
      comfort: reviews.reduce((sum, review) => sum + review.comfortScore, 0) / reviewCount,
      quality: reviews.reduce((sum, review) => sum + review.qualityScore, 0) / reviewCount,
      routineFit: reviews.reduce((sum, review) => sum + review.routineFitScore, 0) / reviewCount,
      value: reviews.reduce((sum, review) => sum + review.valueScore, 0) / reviewCount,
    },
  } satisfies ProductReviewSummary;
}

export async function getProductReviews(
  input: {
    limit?: number | undefined;
    productId: string;
    query?: string | undefined;
    sort?: "highest" | "lowest" | "recent" | undefined;
  },
  db: CommerceDb = getDb(),
): Promise<ProductReview[]> {
  const rows = await db
    .select({
      customer: schema.customerProfiles,
      review: schema.productReviews,
    })
    .from(schema.productReviews)
    .leftJoin(schema.customerProfiles, eq(schema.productReviews.customerId, schema.customerProfiles.id))
    .where(and(eq(schema.productReviews.productId, input.productId), eq(schema.productReviews.status, "published")))
    .orderBy(desc(schema.productReviews.createdAt))
    .limit(Math.min(Math.max(input.limit ?? 24, 1), 100));
  const query = input.query?.trim().toLowerCase();
  const reviews = rows
    .map((row) => mapProductReview(row.review, row.customer))
    .filter((review) => {
      if (!query) {
        return true;
      }

      return `${review.title} ${review.body} ${review.authorName}`.toLowerCase().includes(query);
    });

  if (input.sort === "highest") {
    reviews.sort((first, second) => second.rating - first.rating || second.createdAt.getTime() - first.createdAt.getTime());
  } else if (input.sort === "lowest") {
    reviews.sort((first, second) => first.rating - second.rating || second.createdAt.getTime() - first.createdAt.getTime());
  }

  return reviews;
}

async function findReviewableOrderItem(customerId: string, productId: string, db: CommerceDb) {
  const rows = await db
    .select({
      order: schema.orders,
      orderItem: schema.orderItems,
      payment: schema.payments,
      variant: schema.productVariants,
    })
    .from(schema.orderItems)
    .innerJoin(schema.orders, eq(schema.orderItems.orderId, schema.orders.id))
    .innerJoin(schema.productVariants, eq(schema.orderItems.variantId, schema.productVariants.id))
    .leftJoin(schema.payments, eq(schema.payments.orderId, schema.orders.id))
    .where(
      and(
        eq(schema.orders.customerId, customerId),
        eq(schema.productVariants.productId, productId),
        or(
          eq(schema.orders.status, "fulfilled"),
          eq(schema.orders.status, "partially_fulfilled"),
          eq(schema.payments.status, "captured"),
        ),
      ),
    )
    .orderBy(desc(schema.orders.placedAt), desc(schema.orderItems.createdAt))
    .limit(1);

  return rows[0] ?? null;
}

export async function getProductReviewEligibility(
  input: {
    customerId?: string | null | undefined;
    productId: string;
  },
  db: CommerceDb = getDb(),
): Promise<ProductReviewEligibility> {
  if (!input.customerId) {
    return {
      canReview: false,
      customerId: null,
      hasPurchased: false,
      hasReviewed: false,
      orderItemId: null,
      reason: "AUTH_REQUIRED",
      variantId: null,
    };
  }

  const [existingReview, reviewableOrderItem] = await Promise.all([
    db
      .select({ id: schema.productReviews.id })
      .from(schema.productReviews)
      .where(
        and(
          eq(schema.productReviews.customerId, input.customerId),
          eq(schema.productReviews.productId, input.productId),
        ),
      )
      .limit(1),
    findReviewableOrderItem(input.customerId, input.productId, db),
  ]);
  const hasReviewed = existingReview.length > 0;
  const hasPurchased = Boolean(reviewableOrderItem);

  if (hasReviewed) {
    return {
      canReview: false,
      customerId: input.customerId,
      hasPurchased,
      hasReviewed: true,
      orderItemId: reviewableOrderItem?.orderItem.id ?? null,
      reason: "ALREADY_REVIEWED",
      variantId: reviewableOrderItem?.variant.id ?? null,
    };
  }

  if (!reviewableOrderItem) {
    return {
      canReview: false,
      customerId: input.customerId,
      hasPurchased: false,
      hasReviewed: false,
      orderItemId: null,
      reason: "NOT_PURCHASED",
      variantId: null,
    };
  }

  return {
    canReview: true,
    customerId: input.customerId,
    hasPurchased: true,
    hasReviewed: false,
    orderItemId: reviewableOrderItem.orderItem.id,
    reason: "ELIGIBLE",
    variantId: reviewableOrderItem.variant.id,
  };
}

export async function createProductReview(
  input: CreateProductReviewInput,
  db: CommerceDb = getDb(),
): Promise<{
  review: ProductReview;
  summary: ProductReviewSummary;
}> {
  const title = normalizeReviewText(input.title, 120);
  const body = normalizeReviewText(input.body, 1400);

  if (!title || !body) {
    throw new ProductReviewServiceError("INVALID_REVIEW", "Review title and body are required.");
  }

  const eligibility = await getProductReviewEligibility({
    customerId: input.customerId,
    productId: input.productId,
  }, db);

  if (eligibility.hasReviewed) {
    throw new ProductReviewServiceError("ALREADY_REVIEWED", "This product has already been reviewed.");
  }

  if (!eligibility.canReview) {
    throw new ProductReviewServiceError("NOT_PURCHASED", "Only verified purchasers can review this product.");
  }

  const [createdReview] = await db
    .insert(schema.productReviews)
    .values({
      body,
      comfortScore: clampReviewScore(input.comfortScore),
      customerId: input.customerId,
      orderItemId: eligibility.orderItemId,
      productId: input.productId,
      qualityScore: clampReviewScore(input.qualityScore),
      rating: clampReviewScore(input.rating),
      routineFitScore: clampReviewScore(input.routineFitScore),
      title,
      valueScore: clampReviewScore(input.valueScore),
      variantId: input.variantId ?? eligibility.variantId,
      wouldRecommend: input.wouldRecommend,
    })
    .returning()
    .catch((error: unknown) => {
      if (isUniqueConstraintError(error)) {
        throw new ProductReviewServiceError("ALREADY_REVIEWED", "This product has already been reviewed.");
      }

      throw error;
    });

  if (!createdReview) {
    throw new ProductReviewServiceError("UNKNOWN", "Unable to create review.");
  }

  const [customer, summary] = await Promise.all([
    db
      .select()
      .from(schema.customerProfiles)
      .where(eq(schema.customerProfiles.id, input.customerId))
      .limit(1),
    getProductReviewSummary(input.productId, db),
  ]);

  return {
    review: mapProductReview(createdReview, customer[0] ?? null),
    summary,
  };
}

export async function getCatalogFilters(
  input: {
    locale?: string | undefined;
  } = {},
  db: CommerceDb = getDb(),
): Promise<CatalogFilters> {
  const locale = input.locale ?? fallbackMarket.locale;
  const [categoryRows, collectionRows, optionRows] = await Promise.all([
    db
      .select({
        category: schema.categories,
        translation: schema.categoryTranslations,
      })
      .from(schema.categories)
      .leftJoin(
        schema.categoryTranslations,
        and(
          eq(schema.categoryTranslations.categoryId, schema.categories.id),
          eq(schema.categoryTranslations.locale, locale),
        ),
      )
      .where(eq(schema.categories.status, "active"))
      .orderBy(asc(schema.categories.sortOrder), asc(schema.categories.slug)),
    db
      .select({
        collection: schema.collections,
        translation: schema.collectionTranslations,
      })
      .from(schema.collections)
      .leftJoin(
        schema.collectionTranslations,
        and(
          eq(schema.collectionTranslations.collectionId, schema.collections.id),
          eq(schema.collectionTranslations.locale, locale),
        ),
      )
      .where(eq(schema.collections.status, "active"))
      .orderBy(asc(schema.collections.sortOrder), asc(schema.collections.slug)),
    db
      .select({
        option: schema.productOptions,
        value: schema.productOptionValues,
      })
      .from(schema.productOptionValues)
      .innerJoin(schema.productOptions, eq(schema.productOptionValues.optionId, schema.productOptions.id))
      .orderBy(asc(schema.productOptions.position), asc(schema.productOptionValues.position)),
  ]);

  const optionMap = new Map<string, { code: string; name: string; values: Set<string> }>();

  for (const row of optionRows) {
    const existing = optionMap.get(row.option.code) ?? {
      code: row.option.code,
      name: row.option.name,
      values: new Set<string>(),
    };

    existing.values.add(row.value.value);
    optionMap.set(row.option.code, existing);
  }

  return {
    categories: categoryRows.map((row: { category: CategoryRecord; translation: CategoryTranslationRecord | null }) => ({
      id: row.category.id,
      slug: row.translation?.slug ?? row.category.slug,
      name: row.translation?.name ?? row.category.slug,
    })),
    collections: collectionRows.map((row: { collection: CollectionRecord; translation: CollectionTranslationRecord | null }) => ({
      id: row.collection.id,
      slug: row.collection.slug,
      name: row.translation?.name ?? row.collection.slug,
    })),
    options: [...optionMap.values()].map((option) => ({
      code: option.code,
      name: option.name,
      values: [...option.values].sort(),
    })),
  };
}

function addHealthIssue(
  issues: CatalogHealthIssue[],
  input: Omit<CatalogHealthIssue, "sampledIds"> & { sampledIds?: string[] },
) {
  if ((input.sampledIds?.length ?? 0) === 0 && input.severity !== "info") {
    return;
  }

  issues.push({
    ...input,
    sampledIds: input.sampledIds ?? [],
  });
}

export async function getCatalogHealthReport(
  input: {
    countryCode?: string | undefined;
    locale?: string | undefined;
    marketCode?: string | undefined;
  } = {},
  db: CommerceDb = getDb(),
): Promise<CatalogHealthReport> {
  const market = await resolveMarket(input, db);
  const locale = input.locale ?? market.locale;
  const now = new Date();
  const issues: CatalogHealthIssue[] = [];

  const [
    visibleProductsMissingSalesChannel,
    visibleProductsMissingTranslation,
    visibleProductsMissingMedia,
    visibleVariantsMissingPriceSet,
    visibleVariantsMissingInventory,
    draftProducts,
  ] = await Promise.all([
    db
      .select({
        id: schema.products.id,
        slug: schema.products.slug,
      })
      .from(schema.products)
      .leftJoin(schema.productSalesChannels, eq(schema.productSalesChannels.productId, schema.products.id))
      .where(
        and(
          or(eq(schema.products.status, "active"), eq(schema.products.status, "published")),
          or(isNull(schema.products.publishAt), lte(schema.products.publishAt, now)),
          isNull(schema.productSalesChannels.id),
        ),
      )
      .limit(10),
    db
      .select({
        id: schema.products.id,
        slug: schema.products.slug,
      })
      .from(schema.products)
      .leftJoin(
        schema.productTranslations,
        and(
          eq(schema.productTranslations.productId, schema.products.id),
          eq(schema.productTranslations.locale, locale),
        ),
      )
      .where(
        and(
          or(eq(schema.products.status, "active"), eq(schema.products.status, "published")),
          or(isNull(schema.products.publishAt), lte(schema.products.publishAt, now)),
          or(isNull(schema.productTranslations.id), isNull(schema.productTranslations.slug)),
        ),
      )
      .limit(10),
    db
      .select({
        id: schema.products.id,
        slug: schema.products.slug,
      })
      .from(schema.products)
      .leftJoin(schema.productMedia, eq(schema.productMedia.productId, schema.products.id))
      .where(
        and(
          or(eq(schema.products.status, "active"), eq(schema.products.status, "published")),
          or(isNull(schema.products.publishAt), lte(schema.products.publishAt, now)),
          isNull(schema.productMedia.id),
        ),
      )
      .limit(10),
    db
      .select({
        id: schema.productVariants.id,
        sku: schema.productVariants.sku,
      })
      .from(schema.productVariants)
      .innerJoin(schema.products, eq(schema.productVariants.productId, schema.products.id))
      .where(
        and(
          or(eq(schema.products.status, "active"), eq(schema.products.status, "published")),
          or(isNull(schema.products.publishAt), lte(schema.products.publishAt, now)),
          isNull(schema.productVariants.priceSetId),
        ),
      )
      .limit(10),
    db
      .select({
        id: schema.productVariants.id,
        sku: schema.productVariants.sku,
      })
      .from(schema.productVariants)
      .innerJoin(schema.products, eq(schema.productVariants.productId, schema.products.id))
      .leftJoin(
        schema.variantInventoryItems,
        eq(schema.variantInventoryItems.variantId, schema.productVariants.id),
      )
      .where(
        and(
          or(eq(schema.products.status, "active"), eq(schema.products.status, "published")),
          or(isNull(schema.products.publishAt), lte(schema.products.publishAt, now)),
          eq(schema.productVariants.manageInventory, true),
          isNull(schema.variantInventoryItems.id),
        ),
      )
      .limit(10),
    db
      .select({
        id: schema.products.id,
        slug: schema.products.slug,
      })
      .from(schema.products)
      .where(eq(schema.products.status, "draft"))
      .limit(10),
  ]);

  const visibleProducts = await db
    .select({
      productId: schema.products.id,
      slug: schema.products.slug,
      variantId: schema.productVariants.id,
      priceSetId: schema.productVariants.priceSetId,
    })
    .from(schema.products)
    .innerJoin(schema.productVariants, eq(schema.productVariants.productId, schema.products.id))
    .where(
      and(
        or(eq(schema.products.status, "active"), eq(schema.products.status, "published")),
        or(isNull(schema.products.publishAt), lte(schema.products.publishAt, now)),
      ),
    )
    .limit(160);
  const productPriceStatus = new Map<string, { hasPrice: boolean; slug: string }>();

  for (const product of visibleProducts) {
    const status = productPriceStatus.get(product.productId) ?? {
      hasPrice: false,
      slug: product.slug,
    };

    if (product.priceSetId && await getActivePrice(product.priceSetId, market, db)) {
      status.hasPrice = true;
    }

    productPriceStatus.set(product.productId, status);
  }

  const visibleProductsMissingActivePrice = [...productPriceStatus.entries()]
    .filter(([, status]) => !status.hasPrice)
    .slice(0, 10)
    .map(([id, status]) => `${status.slug} (${id})`);

  addHealthIssue(issues, {
    description: "Published products must be assigned to a sales channel before storefront market availability is reliable.",
    id: "visible-products-missing-sales-channel",
    sampledIds: visibleProductsMissingSalesChannel.map((product) => `${product.slug} (${product.id})`),
    severity: "danger",
    title: "Visible products missing sales-channel scope",
  });
  addHealthIssue(issues, {
    description: "Published products need a localized slug/name for the active storefront locale.",
    id: "visible-products-missing-translation",
    sampledIds: visibleProductsMissingTranslation.map((product) => `${product.slug} (${product.id})`),
    severity: "danger",
    title: "Visible products missing localized content",
  });
  addHealthIssue(issues, {
    description: "Published products without media will fall back to placeholders.",
    id: "visible-products-missing-media",
    sampledIds: visibleProductsMissingMedia.map((product) => `${product.slug} (${product.id})`),
    severity: "warning",
    title: "Visible products missing media",
  });
  addHealthIssue(issues, {
    description: "Published variants need price sets; legacy variant prices are migration-only compatibility data.",
    id: "visible-variants-missing-price-set",
    sampledIds: visibleVariantsMissingPriceSet.map((variant) => `${variant.sku} (${variant.id})`),
    severity: "danger",
    title: "Visible variants missing price sets",
  });
  addHealthIssue(issues, {
    description: "Published variants need at least one active market price to appear in commerce listings.",
    id: "visible-products-missing-active-price",
    sampledIds: visibleProductsMissingActivePrice,
    severity: "danger",
    title: "Visible products missing active prices",
  });
  addHealthIssue(issues, {
    description: "Inventory-managed variants should link to inventory items so stock can be scoped by location and sales channel.",
    id: "visible-variants-missing-inventory-items",
    sampledIds: visibleVariantsMissingInventory.map((variant) => `${variant.sku} (${variant.id})`),
    severity: "warning",
    title: "Visible variants missing inventory items",
  });

  if (draftProducts.length > 0) {
    addHealthIssue(issues, {
      description: "Draft products are safe admin-only records and will stay hidden from storefront listings.",
      id: "draft-products-present",
      sampledIds: draftProducts.map((product) => `${product.slug} (${product.id})`),
      severity: "info",
      title: "Draft/admin-only products present",
    });
  }

  return {
    generatedAt: new Date(),
    issues,
    market,
  };
}

const cartCookieTtlMs = 30 * 24 * 60 * 60 * 1000;
const cartQuantityMax = 99;
const freeExpressShippingThresholdAmount = 130000;
const freeShippingThresholdAmount = 55000;
const recommendationLimit = 4;

export class CartServiceError extends Error {
  constructor(
    public readonly code: CartErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "CartServiceError";
  }
}

export class ProductReviewServiceError extends Error {
  constructor(
    public readonly code: ProductReviewErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ProductReviewServiceError";
  }
}

function cartMoney(amount: number, currencyCode: string): CartMoney {
  return {
    amount: Math.max(Math.trunc(amount), 0),
    currencyCode,
  };
}

function clampCartQuantity(value: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(Math.max(Math.trunc(value), 1), cartQuantityMax);
}

function getCartLocale(input: CartIdentityInput, market: CommerceMarket) {
  return input.locale ?? market.locale;
}

function getCartExpiry() {
  return new Date(Date.now() + cartCookieTtlMs);
}

function cleanCheckoutText(value: string | null | undefined, maxLength = 256) {
  return (value?.trim() ?? "").slice(0, maxLength);
}

function nullableCheckoutText(value: string | null | undefined, maxLength = 256) {
  const cleaned = cleanCheckoutText(value, maxLength);

  return cleaned.length > 0 ? cleaned : null;
}

function normalizeCheckoutEmail(value: string) {
  const email = cleanCheckoutText(value, 320).toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new CartServiceError("CART_CHANGED", "A valid email is required for checkout.");
  }

  return email;
}

function normalizeCheckoutCountryCode(value: string) {
  const countryCode = cleanCheckoutText(value, 2).toUpperCase();

  if (!/^[A-Z]{2}$/.test(countryCode)) {
    throw new CartServiceError("CART_CHANGED", "A valid country code is required for checkout.");
  }

  return countryCode;
}

function normalizeCheckoutContact(contact: CheckoutOrderContactInput) {
  const normalizedContact = {
    addressLine1: cleanCheckoutText(contact.addressLine1),
    addressLine2: nullableCheckoutText(contact.addressLine2),
    city: cleanCheckoutText(contact.city),
    countryCode: normalizeCheckoutCountryCode(contact.countryCode),
    email: normalizeCheckoutEmail(contact.email),
    firstName: cleanCheckoutText(contact.firstName),
    lastName: cleanCheckoutText(contact.lastName),
    phone: cleanCheckoutText(contact.phone, 64),
    postalCode: cleanCheckoutText(contact.postalCode, 32),
  };
  const requiredFields = [
    normalizedContact.addressLine1,
    normalizedContact.city,
    normalizedContact.firstName,
    normalizedContact.lastName,
    normalizedContact.phone,
    normalizedContact.postalCode,
  ];

  if (requiredFields.some((field) => field.length === 0)) {
    throw new CartServiceError("CART_CHANGED", "Contact and delivery details are required.");
  }

  return normalizedContact;
}

function createCheckoutOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = randomBytes(3).toString("hex").toUpperCase();

  return `SNN-${date}-${suffix}`;
}

function buildShippingProgress(subtotalAmount: number, currencyCode: string): CartShippingProgress {
  const remainingAmount = Math.max(freeShippingThresholdAmount - subtotalAmount, 0);
  const remainingExpressAmount = Math.max(freeExpressShippingThresholdAmount - subtotalAmount, 0);
  const qualifiedForFreeShipping = remainingAmount === 0;
  const qualifiedForFreeExpressShipping = remainingExpressAmount === 0;

  return {
    amount: qualifiedForFreeShipping ? cartMoney(0, currencyCode) : null,
    expressProgressPercent: Math.min(
      Math.round((subtotalAmount / freeExpressShippingThresholdAmount) * 100),
      100,
    ),
    freeExpressShippingThreshold: cartMoney(freeExpressShippingThresholdAmount, currencyCode),
    freeShippingThreshold: cartMoney(freeShippingThresholdAmount, currencyCode),
    label: qualifiedForFreeShipping ? "free" : "calculated_at_checkout",
    progressPercent: Math.min(Math.round((subtotalAmount / freeShippingThresholdAmount) * 100), 100),
    qualifiedForFreeExpressShipping,
    qualifiedForFreeShipping,
    remainingExpressAmount: cartMoney(remainingExpressAmount, currencyCode),
    remainingAmount: cartMoney(remainingAmount, currencyCode),
  };
}

async function findOpenCartById(
  cartId: string | null | undefined,
  customerId: string | null | undefined,
  db: CommerceDb,
) {
  if (!cartId) {
    return null;
  }

  const [cart] = await db
    .select()
    .from(schema.carts)
    .where(and(eq(schema.carts.id, cartId), eq(schema.carts.status, "open")))
    .limit(1);

  if (!cart) {
    return null;
  }

  if (!customerId && cart.customerId) {
    return null;
  }

  if (customerId && cart.customerId && cart.customerId !== customerId) {
    return null;
  }

  return cart;
}

async function findCustomerOpenCart(customerId: string | null | undefined, db: CommerceDb) {
  if (!customerId) {
    return null;
  }

  const [cart] = await db
    .select()
    .from(schema.carts)
    .where(and(eq(schema.carts.customerId, customerId), eq(schema.carts.status, "open")))
    .orderBy(desc(schema.carts.updatedAt))
    .limit(1);

  return cart ?? null;
}

async function syncCartContext(
  cart: CartRecord,
  input: CartIdentityInput,
  market: CommerceMarket,
  db: CommerceDb,
) {
  const nextLocale = getCartLocale(input, market);
  const nextCustomerId = input.customerId ?? cart.customerId;
  const nextEmail = input.email ?? cart.email;

  if (
    cart.customerId === nextCustomerId &&
    cart.email === nextEmail &&
    cart.currencyCode === market.currencyCode &&
    cart.locale === nextLocale &&
    cart.salesChannelId === market.salesChannelId
  ) {
    return cart;
  }

  const [updatedCart] = await db
    .update(schema.carts)
    .set({
      currencyCode: market.currencyCode,
      customerId: nextCustomerId,
      email: nextEmail,
      locale: nextLocale,
      salesChannelId: market.salesChannelId,
      updatedAt: new Date(),
    })
    .where(eq(schema.carts.id, cart.id))
    .returning();

  return updatedCart ?? cart;
}

async function createCart(input: CartIdentityInput, market: CommerceMarket, db: CommerceDb) {
  const [cart] = await db
    .insert(schema.carts)
    .values({
      currencyCode: market.currencyCode,
      customerId: input.customerId ?? null,
      email: input.email ?? null,
      expiresAt: getCartExpiry(),
      locale: getCartLocale(input, market),
      salesChannelId: market.salesChannelId,
    })
    .returning();

  if (!cart) {
    throw new CartServiceError("UNKNOWN", "Unable to create cart.");
  }

  return cart;
}

async function mergeCartLines(sourceCartId: string, targetCartId: string, db: CommerceDb) {
  const [sourceLines, targetLines] = await Promise.all([
    db.select().from(schema.cartItems).where(eq(schema.cartItems.cartId, sourceCartId)),
    db.select().from(schema.cartItems).where(eq(schema.cartItems.cartId, targetCartId)),
  ]);
  const targetLineByVariantId = new Map<string, CartItemRecord>();

  for (const line of targetLines) {
    if (line.variantId) {
      targetLineByVariantId.set(line.variantId, line);
    }
  }

  for (const sourceLine of sourceLines) {
    if (!sourceLine.variantId) {
      continue;
    }

    const targetLine = targetLineByVariantId.get(sourceLine.variantId);

    if (targetLine) {
      const nextQuantity = clampCartQuantity(targetLine.quantity + sourceLine.quantity);

      const [updatedLine] = await db
        .update(schema.cartItems)
        .set({
          quantity: nextQuantity,
          updatedAt: new Date(),
        })
        .where(eq(schema.cartItems.id, targetLine.id))
        .returning();

      targetLineByVariantId.set(sourceLine.variantId, updatedLine ?? {
        ...targetLine,
        quantity: nextQuantity,
      });
      continue;
    }

    const [createdLine] = await db
      .insert(schema.cartItems)
      .values({
        cartId: targetCartId,
        quantity: clampCartQuantity(sourceLine.quantity),
        skuSnapshot: sourceLine.skuSnapshot,
        titleSnapshot: sourceLine.titleSnapshot,
        unitPriceAmount: sourceLine.unitPriceAmount,
        variantId: sourceLine.variantId,
      })
      .returning();

    if (createdLine) {
      targetLineByVariantId.set(sourceLine.variantId, createdLine);
    }
  }

  await db
    .update(schema.carts)
    .set({
      status: "abandoned",
      updatedAt: new Date(),
    })
    .where(eq(schema.carts.id, sourceCartId));
}

async function resolveCart(
  input: CartIdentityInput,
  db: CommerceDb,
  createIfMissing: boolean,
) {
  const market = await resolveMarket({
    countryCode: input.countryCode ?? "DK",
    locale: input.locale,
    marketCode: input.marketCode,
  }, db);
  const cookieCart = await findOpenCartById(input.cartId, input.customerId, db);

  if (input.customerId) {
    const customerCart = await findCustomerOpenCart(input.customerId, db);

    if (customerCart && cookieCart && customerCart.id !== cookieCart.id && !cookieCart.customerId) {
      await mergeCartLines(cookieCart.id, customerCart.id, db);
      const syncedCart = await syncCartContext(customerCart, input, market, db);

      return {
        cart: syncedCart,
        market,
      };
    }

    const reusableCart = customerCart ?? cookieCart;

    if (reusableCart) {
      return {
        cart: await syncCartContext(reusableCart, input, market, db),
        market,
      };
    }
  } else if (cookieCart) {
    return {
      cart: await syncCartContext(cookieCart, input, market, db),
      market,
    };
  }

  if (!createIfMissing) {
    throw new CartServiceError("CART_NOT_FOUND", "Cart not found.");
  }

  return {
    cart: await createCart(input, market, db),
    market,
  };
}

async function getValidatedCartVariant(
  variantId: string,
  locale: string,
  market: CommerceMarket,
  db: CommerceDb,
) {
  const [row] = await db
    .select({
      channelProductId: schema.productSalesChannels.productId,
      product: schema.products,
      translation: schema.productTranslations,
      variant: schema.productVariants,
    })
    .from(schema.productVariants)
    .innerJoin(schema.products, eq(schema.productVariants.productId, schema.products.id))
    .leftJoin(
      schema.productTranslations,
      and(
        eq(schema.productTranslations.productId, schema.products.id),
        eq(schema.productTranslations.locale, locale),
      ),
    )
    .leftJoin(
      schema.productSalesChannels,
      and(
        eq(schema.productSalesChannels.productId, schema.products.id),
        market.salesChannelId
          ? eq(schema.productSalesChannels.salesChannelId, market.salesChannelId)
          : undefined,
      ),
    )
    .where(eq(schema.productVariants.id, variantId))
    .limit(1);

  if (
    !row ||
    !isVisibleProduct(row.product) ||
    (market.salesChannelId && !row.channelProductId)
  ) {
    throw new CartServiceError("VARIANT_NOT_FOUND", "This product is unavailable.");
  }

  const price = row.variant.priceSetId
    ? await getActivePrice(row.variant.priceSetId, market, db)
    : null;

  if (!price) {
    throw new CartServiceError("VARIANT_NOT_FOUND", "This product is missing an active price.");
  }

  const availability = row.variant.manageInventory
    ? (await getAvailabilityByVariantId([row.variant.id], market, db)).get(row.variant.id) ?? {
      availableQuantity: null,
      isAvailable: true,
      isTracked: false,
    }
    : {
      availableQuantity: null,
      isAvailable: true,
      isTracked: false,
    };

  if (!availability.isAvailable) {
    throw new CartServiceError("VARIANT_UNAVAILABLE", "This product is sold out.");
  }

  return {
    availability,
    price,
    product: row.product,
    titleSnapshot: row.translation?.name ?? row.product.slug,
    variant: row.variant,
  };
}

async function refreshCartLinesAndSubtotal(cartId: string, market: CommerceMarket, db: CommerceDb) {
  const locale = market.locale;
  const rows = await db
    .select({
      item: schema.cartItems,
      product: schema.products,
      translation: schema.productTranslations,
      variant: schema.productVariants,
    })
    .from(schema.cartItems)
    .leftJoin(schema.productVariants, eq(schema.cartItems.variantId, schema.productVariants.id))
    .leftJoin(schema.products, eq(schema.productVariants.productId, schema.products.id))
    .leftJoin(
      schema.productTranslations,
      and(
        eq(schema.productTranslations.productId, schema.products.id),
        eq(schema.productTranslations.locale, locale),
      ),
    )
    .where(eq(schema.cartItems.cartId, cartId));
  const variantIds = rows
    .map((row) => row.variant?.id)
    .filter((variantId): variantId is string => Boolean(variantId));
  const availabilityByVariantId = await getAvailabilityByVariantId(variantIds, market, db);
  let subtotalAmount = 0;

  for (const row of rows) {
    if (!row.variant || !row.product || !isVisibleProduct(row.product)) {
      await db.delete(schema.cartItems).where(eq(schema.cartItems.id, row.item.id));
      continue;
    }

    const price = row.variant.priceSetId
      ? await getActivePrice(row.variant.priceSetId, market, db)
      : null;

    if (!price) {
      await db.delete(schema.cartItems).where(eq(schema.cartItems.id, row.item.id));
      continue;
    }

    const availability = availabilityByVariantId.get(row.variant.id) ?? {
      availableQuantity: null,
      isAvailable: true,
      isTracked: false,
    };
    const availableQuantity = availability.isTracked
      ? Math.max(availability.availableQuantity ?? 0, 0)
      : cartQuantityMax;
    const quantity = Math.min(clampCartQuantity(row.item.quantity), availableQuantity);

    if (quantity <= 0) {
      await db.delete(schema.cartItems).where(eq(schema.cartItems.id, row.item.id));
      continue;
    }

    subtotalAmount += quantity * price.amount;

    await db
      .update(schema.cartItems)
      .set({
        quantity,
        skuSnapshot: row.variant.sku,
        titleSnapshot: row.translation?.name ?? row.product.slug,
        unitPriceAmount: price.amount,
        updatedAt: new Date(),
      })
      .where(eq(schema.cartItems.id, row.item.id));
  }

  return subtotalAmount;
}

async function recalculateCartTotals(cartId: string, market: CommerceMarket, db: CommerceDb) {
  const subtotalAmount = await refreshCartLinesAndSubtotal(cartId, market, db);
  const totalAmount = subtotalAmount;

  await db
    .update(schema.carts)
    .set({
      currencyCode: market.currencyCode,
      subtotalAmount,
      totalAmount,
      updatedAt: new Date(),
    })
    .where(eq(schema.carts.id, cartId));

  return {
    subtotalAmount,
    totalAmount,
  };
}

async function recalculateCartTotalsFromStoredLines(
  cartId: string,
  currencyCode: string,
  db: CommerceDb,
) {
  const subtotalAmount = sql<number>`coalesce((
    select sum(${schema.cartItems.quantity} * ${schema.cartItems.unitPriceAmount})
    from ${schema.cartItems}
    where ${schema.cartItems.cartId} = ${cartId}
  ), 0)`;
  const [updatedCart] = await db
    .update(schema.carts)
    .set({
      currencyCode,
      subtotalAmount,
      totalAmount: subtotalAmount,
      updatedAt: new Date(),
    })
    .where(eq(schema.carts.id, cartId))
    .returning();

  return updatedCart ?? null;
}

async function getCartRecommendations(
  cartProductIds: string[],
  market: CommerceMarket,
  locale: string,
  db: CommerceDb,
): Promise<CartRecommendation[]> {
  const excludedProductIds = new Set(cartProductIds);
  const uniqueCartProductIds = [...excludedProductIds];
  const relatedProductIds = new Set<string>();

  if (uniqueCartProductIds.length > 0) {
    const categoryRows = await db
      .select({ categoryId: schema.productCategories.categoryId })
      .from(schema.productCategories)
      .where(inArray(schema.productCategories.productId, uniqueCartProductIds));
    const collectionRows = await db
      .select({ collectionId: schema.collectionProducts.collectionId })
      .from(schema.collectionProducts)
      .where(inArray(schema.collectionProducts.productId, uniqueCartProductIds));
    const categoryIds = [...new Set(categoryRows.map((row) => row.categoryId))];
    const collectionIds = [...new Set(collectionRows.map((row) => row.collectionId))];
    const relatedCategories = categoryIds.length > 0
      ? await db
        .select({ productId: schema.productCategories.productId })
        .from(schema.productCategories)
        .where(inArray(schema.productCategories.categoryId, categoryIds))
      : [];
    const relatedCollections = collectionIds.length > 0
      ? await db
        .select({ productId: schema.collectionProducts.productId })
        .from(schema.collectionProducts)
        .where(inArray(schema.collectionProducts.collectionId, collectionIds))
      : [];

    for (const row of [...relatedCategories, ...relatedCollections]) {
      if (!excludedProductIds.has(row.productId)) {
        relatedProductIds.add(row.productId);
      }
    }
  }

  const productList = await getProductCards({
    countryCode: market.countryCode ?? "DK",
    locale,
    marketCode: market.code,
    onlyAvailable: true,
    sort: "newest",
    limit: Math.max(recommendationLimit * 6, 16),
  }, db);
  const relatedCards = productList.items.filter((product) => (
    !excludedProductIds.has(product.id) &&
    (relatedProductIds.size === 0 || relatedProductIds.has(product.id))
  ));
  const fallbackCards = productList.items.filter((product) => (
    !excludedProductIds.has(product.id) &&
    !relatedCards.some((relatedProduct) => relatedProduct.id === product.id)
  ));

  return [...relatedCards, ...fallbackCards].slice(0, recommendationLimit).map((product) => ({
    id: product.id,
    imageUrl: product.imageUrl,
    name: product.name,
    price: cartMoney(product.price.amount, product.price.currencyCode),
    slug: product.slug,
    variantId: product.variantId,
    variantTitle: product.variantTitle,
  }));
}

type ReadCartSnapshotOptions = {
  includeRecommendations?: boolean;
};

async function readCartSnapshotFromCart(
  cart: CartRecord,
  input: CartIdentityInput,
  db: CommerceDb,
  options: ReadCartSnapshotOptions = {},
): Promise<CartSnapshot> {
  const locale = input.locale ?? cart.locale;
  const currencyCode = cart.currencyCode;
  const rows = await db
    .select({
      item: schema.cartItems,
      product: schema.products,
      translation: schema.productTranslations,
      variant: schema.productVariants,
    })
    .from(schema.cartItems)
    .leftJoin(schema.productVariants, eq(schema.cartItems.variantId, schema.productVariants.id))
    .leftJoin(schema.products, eq(schema.productVariants.productId, schema.products.id))
    .leftJoin(
      schema.productTranslations,
      and(
        eq(schema.productTranslations.productId, schema.products.id),
        eq(schema.productTranslations.locale, locale),
      ),
    )
    .where(eq(schema.cartItems.cartId, cart.id))
    .orderBy(asc(schema.cartItems.createdAt));
  const productIds = rows
    .map((row) => row.product?.id)
    .filter((productId): productId is string => Boolean(productId));
  const variantIds = rows
    .map((row) => row.item.variantId)
    .filter((variantId): variantId is string => Boolean(variantId));
  const cartRecommendationMarket = {
    ...fallbackMarket,
    code: input.marketCode ?? fallbackMarket.code,
    currencyCode,
    locale,
    salesChannelId: cart.salesChannelId,
  };
  const likedVariantIds = input.likedUserId && variantIds.length > 0
    ? new Set((await db
      .select({ variantId: schema.customerProductLikes.variantId })
      .from(schema.customerProductLikes)
      .where(
        and(
          eq(schema.customerProductLikes.userId, input.likedUserId),
          inArray(schema.customerProductLikes.variantId, variantIds),
        ),
      )).map((row) => row.variantId))
    : new Set<string>();
  const mediaByProduct = await getProductMedia(productIds, db);
  const recommendations = options.includeRecommendations === false
    ? []
    : await getCartRecommendations(productIds, cartRecommendationMarket, locale, db);
  const lines = rows.map((row) => {
    const imageUrl = row.product && row.variant
      ? chooseImageUrl(row.product, row.variant, mediaByProduct.get(row.product.id) ?? [])
      : null;
    const title = row.translation?.name ?? row.item.titleSnapshot;
    const productSlug = row.translation?.slug ?? row.product?.slug ?? null;

    return {
      id: row.item.id,
      imageUrl,
      isLiked: row.item.variantId ? likedVariantIds.has(row.item.variantId) : false,
      lineTotal: cartMoney(row.item.quantity * row.item.unitPriceAmount, currencyCode),
      productId: row.product?.id ?? null,
      productSlug,
      quantity: row.item.quantity,
      sku: row.item.skuSnapshot,
      title,
      unitPrice: cartMoney(row.item.unitPriceAmount, currencyCode),
      variantId: row.item.variantId,
      variantTitle: row.variant?.title ?? null,
    } satisfies CartLineItem;
  });
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  return {
    currencyCode,
    id: cart.id,
    itemCount,
    lines,
    recommendations,
    shipping: buildShippingProgress(cart.subtotalAmount, currencyCode),
    subtotal: cartMoney(cart.subtotalAmount, currencyCode),
    total: cartMoney(cart.totalAmount, currencyCode),
  };
}

async function withCartRecommendations(
  snapshot: CartSnapshot,
  input: CartIdentityInput,
  market: CommerceMarket,
) {
  const productIds = snapshot.lines
    .map((line) => line.productId)
    .filter((productId): productId is string => Boolean(productId));

  if (productIds.length === 0) {
    return {
      ...snapshot,
      recommendations: [],
    } satisfies CartSnapshot;
  }

  return {
    ...snapshot,
    recommendations: await getCartRecommendations(
      productIds,
      market,
      getCartLocale(input, market),
      getDb(),
    ),
  } satisfies CartSnapshot;
}

export async function getCartSnapshot(
  input: CartIdentityInput,
  db: CommerceDb = getDb(),
): Promise<CartSnapshot> {
  let snapshot: CartSnapshot | null = null;
  let recommendationMarket: CommerceMarket | null = null;

  await db.transaction(async (tx) => {
    const transactionalDb = tx as unknown as CommerceDb;
    const { cart, market } = await resolveCart(input, transactionalDb, true);

    recommendationMarket = market;
    const updatedCart = await recalculateCartTotalsFromStoredLines(cart.id, market.currencyCode, transactionalDb);
    snapshot = await readCartSnapshotFromCart(updatedCart ?? cart, input, transactionalDb, {
      includeRecommendations: false,
    });
  });

  if (!snapshot) {
    throw new CartServiceError("CART_NOT_FOUND", "Cart not found.");
  }

  return recommendationMarket
    ? withCartRecommendations(snapshot, input, recommendationMarket)
    : snapshot;
}

export async function getExistingCartSnapshot(
  input: CartIdentityInput,
  db: CommerceDb = getDb(),
): Promise<CartSnapshot> {
  let snapshot: CartSnapshot | null = null;

  await db.transaction(async (tx) => {
    const transactionalDb = tx as unknown as CommerceDb;
    const { cart, market } = await resolveCart(input, transactionalDb, false);

    const updatedCart = await recalculateCartTotalsFromStoredLines(cart.id, market.currencyCode, transactionalDb);
    snapshot = await readCartSnapshotFromCart(updatedCart ?? cart, input, transactionalDb, {
      includeRecommendations: false,
    });
  });

  if (!snapshot) {
    throw new CartServiceError("CART_NOT_FOUND", "Cart not found.");
  }

  return snapshot;
}

export async function createCheckoutOrderFromCart(
  input: CartIdentityInput & {
    contact: CheckoutOrderContactInput;
  },
  db: CommerceDb = getDb(),
): Promise<CheckoutOrderSnapshot> {
  let checkoutOrder: CheckoutOrderSnapshot | null = null;

  await db.transaction(async (tx) => {
    const transactionalDb = tx as unknown as CommerceDb;
    const { cart, market } = await resolveCart(input, transactionalDb, false);

    await recalculateCartTotals(cart.id, market, transactionalDb);

    const [freshCart] = await transactionalDb
      .select()
      .from(schema.carts)
      .where(and(eq(schema.carts.id, cart.id), eq(schema.carts.status, "open")))
      .limit(1);

    if (!freshCart) {
      throw new CartServiceError("CART_NOT_FOUND", "Cart not found.");
    }

    const cartItems = await transactionalDb
      .select()
      .from(schema.cartItems)
      .where(eq(schema.cartItems.cartId, freshCart.id))
      .orderBy(asc(schema.cartItems.createdAt));

    if (cartItems.length === 0) {
      throw new CartServiceError("CART_NOT_FOUND", "Cart is empty.");
    }

    const contact = normalizeCheckoutContact(input.contact);
    const shipping = buildShippingProgress(freshCart.subtotalAmount, freshCart.currencyCode);
    const [existingOrder] = await transactionalDb
      .select({
        id: schema.orders.id,
        orderNumber: schema.orders.orderNumber,
        status: schema.orders.status,
      })
      .from(schema.orders)
      .where(eq(schema.orders.cartId, freshCart.id))
      .limit(1);

    if (existingOrder && existingOrder.status !== "pending") {
      throw new CartServiceError("CART_CHANGED", "This cart has already been checked out.");
    }

    await transactionalDb
      .update(schema.carts)
      .set({
        email: contact.email,
        updatedAt: new Date(),
      })
      .where(eq(schema.carts.id, freshCart.id));

    const orderValues = {
      cartId: freshCart.id,
      currencyCode: freshCart.currencyCode,
      customerId: freshCart.customerId,
      discountAmount: 0,
      email: contact.email,
      locale: getCartLocale(input, market),
      salesChannelId: freshCart.salesChannelId,
      shippingAmount: shipping.amount?.amount ?? 0,
      status: "pending" as const,
      subtotalAmount: freshCart.subtotalAmount,
      taxAmount: Math.round(freshCart.totalAmount * 0.2),
      totalAmount: freshCart.totalAmount,
      updatedAt: new Date(),
    };
    const [order] = existingOrder
      ? await transactionalDb
        .update(schema.orders)
        .set(orderValues)
        .where(eq(schema.orders.id, existingOrder.id))
        .returning({
          id: schema.orders.id,
          orderNumber: schema.orders.orderNumber,
        })
      : await transactionalDb
        .insert(schema.orders)
        .values({
          ...orderValues,
          orderNumber: createCheckoutOrderNumber(),
        })
        .returning({
          id: schema.orders.id,
          orderNumber: schema.orders.orderNumber,
        });

    if (!order) {
      throw new CartServiceError("UNKNOWN", "Failed to create checkout order.");
    }

    await transactionalDb
      .delete(schema.orderItems)
      .where(eq(schema.orderItems.orderId, order.id));

    await transactionalDb.insert(schema.orderItems).values(
      cartItems.map((item) => ({
        orderId: order.id,
        quantity: item.quantity,
        skuSnapshot: item.skuSnapshot,
        titleSnapshot: item.titleSnapshot,
        totalAmount: item.quantity * item.unitPriceAmount,
        unitPriceAmount: item.unitPriceAmount,
        variantId: item.variantId,
      })),
    );

    checkoutOrder = {
      amount: cartMoney(freshCart.totalAmount, freshCart.currencyCode),
      cartId: freshCart.id,
      email: contact.email,
      id: order.id,
      orderNumber: order.orderNumber,
    };
  });

  if (!checkoutOrder) {
    throw new CartServiceError("UNKNOWN", "Failed to prepare checkout order.");
  }

  return checkoutOrder;
}

export async function getCheckoutOrderStatus(
  orderId: string,
  db: CommerceDb = getDb(),
): Promise<CheckoutOrderStatusSnapshot | null> {
  const [order] = await db
    .select({
      currencyCode: schema.orders.currencyCode,
      orderId: schema.orders.id,
      orderNumber: schema.orders.orderNumber,
      orderStatus: schema.orders.status,
      paymentStatus: schema.payments.status,
      totalAmount: schema.orders.totalAmount,
    })
    .from(schema.orders)
    .leftJoin(
      schema.payments,
      and(
        eq(schema.payments.orderId, schema.orders.id),
        eq(schema.payments.provider, "stripe"),
      ),
    )
    .where(eq(schema.orders.id, orderId))
    .orderBy(desc(schema.payments.updatedAt))
    .limit(1);

  if (!order) {
    return null;
  }

  return {
    amount: cartMoney(order.totalAmount, order.currencyCode),
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
  };
}

export async function getOrCreateCart(input: CartIdentityInput, db: CommerceDb = getDb()) {
  return getCartSnapshot(input, db);
}

export async function mergeGuestCartIntoCustomerCart(
  input: CartIdentityInput,
  db: CommerceDb = getDb(),
) {
  return getCartSnapshot(input, db);
}

export async function addCartItem(
  input: CartIdentityInput & {
    quantity?: number | undefined;
    variantId: string;
  },
  db: CommerceDb = getDb(),
) {
  let snapshot: CartSnapshot | null = null;

  await db.transaction(async (tx) => {
    const transactionalDb = tx as unknown as CommerceDb;
    const { cart, market } = await resolveCart(input, transactionalDb, true);
    const locale = getCartLocale(input, market);
    const quantity = clampCartQuantity(input.quantity ?? 1);
    const validated = await getValidatedCartVariant(input.variantId, locale, market, transactionalDb);
    const availableQuantity = validated.availability.isTracked
      ? Math.max(validated.availability.availableQuantity ?? 0, 0)
      : cartQuantityMax;

    if (quantity > availableQuantity) {
      throw new CartServiceError("VARIANT_UNAVAILABLE", "Requested quantity is not available.");
    }

    await transactionalDb
      .insert(schema.cartItems)
      .values({
        cartId: cart.id,
        quantity,
        skuSnapshot: validated.variant.sku,
        titleSnapshot: validated.titleSnapshot,
        unitPriceAmount: validated.price.amount,
        variantId: validated.variant.id,
      })
      .onConflictDoUpdate({
        target: [schema.cartItems.cartId, schema.cartItems.variantId],
        set: {
          quantity: sql`least(${schema.cartItems.quantity} + ${quantity}, ${availableQuantity})`,
          skuSnapshot: validated.variant.sku,
          titleSnapshot: validated.titleSnapshot,
          unitPriceAmount: validated.price.amount,
          updatedAt: new Date(),
        },
      });

    const updatedCart = await recalculateCartTotalsFromStoredLines(cart.id, market.currencyCode, transactionalDb);
    snapshot = await readCartSnapshotFromCart(updatedCart ?? cart, input, transactionalDb, {
      includeRecommendations: false,
    });
  });

  if (!snapshot) {
    throw new CartServiceError("CART_NOT_FOUND", "Cart not found.");
  }

  return snapshot;
}

export async function updateCartItemQuantity(
  input: CartIdentityInput & {
    itemId: string;
    quantity: number;
  },
  db: CommerceDb = getDb(),
) {
  let snapshot: CartSnapshot | null = null;

  await db.transaction(async (tx) => {
    const transactionalDb = tx as unknown as CommerceDb;
    const { cart, market } = await resolveCart(input, transactionalDb, true);

    if (input.quantity <= 0) {
      await transactionalDb
        .delete(schema.cartItems)
        .where(and(eq(schema.cartItems.id, input.itemId), eq(schema.cartItems.cartId, cart.id)));
    } else {
      await transactionalDb
        .update(schema.cartItems)
        .set({
          quantity: clampCartQuantity(input.quantity),
          updatedAt: new Date(),
        })
        .where(and(eq(schema.cartItems.id, input.itemId), eq(schema.cartItems.cartId, cart.id)));
    }

    const updatedCart = await recalculateCartTotalsFromStoredLines(cart.id, market.currencyCode, transactionalDb);
    snapshot = await readCartSnapshotFromCart(updatedCart ?? cart, input, transactionalDb, {
      includeRecommendations: false,
    });
  });

  if (!snapshot) {
    throw new CartServiceError("CART_NOT_FOUND", "Cart not found.");
  }

  return snapshot;
}

export async function removeCartItem(
  input: CartIdentityInput & {
    itemId: string;
  },
  db: CommerceDb = getDb(),
) {
  return updateCartItemQuantity({
    ...input,
    quantity: 0,
  }, db);
}

export {
  getCommerceAdminOverview,
  recordCommerceAuditEvent,
  roadmapPhases,
  staffPermissionGroups,
} from "./admin";
export type {
  CommerceAdminOverview,
  CommerceAuditAction,
  CommerceAuditInput,
  StaffPermission,
} from "./admin";
export { resolveMarket };
