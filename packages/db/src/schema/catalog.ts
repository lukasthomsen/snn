import {
  type AnyPgColumn,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import {
  collectionStatusEnum,
  countryCode,
  createdAt,
  currencyCode,
  foreignUuid,
  localeCode,
  marketStatusEnum,
  metadata,
  priceListStatusEnum,
  priceListTypeEnum,
  primaryUuid,
  productAttributeTypeEnum,
  productStatusEnum,
  updatedAt,
} from "./shared";

export const currencies = pgTable(
  "currency",
  {
    id: primaryUuid("id"),
    code: varchar("code", { length: 3 }).notNull(),
    name: text("name").notNull(),
    symbol: text("symbol"),
    decimalDigits: integer("decimal_digits").notNull().default(2),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("currency_code_unique").on(table.code),
  ],
);

export const salesChannels = pgTable(
  "sales_channel",
  {
    id: primaryUuid("id"),
    code: text("code").notNull(),
    name: text("name").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("sales_channel_code_unique").on(table.code),
  ],
);

export const markets = pgTable(
  "market",
  {
    id: primaryUuid("id"),
    code: text("code").notNull(),
    name: text("name").notNull(),
    status: marketStatusEnum("status").notNull().default("draft"),
    defaultLocale: localeCode("default_locale").default("da").notNull(),
    defaultCurrencyCode: currencyCode("default_currency_code").references(() => currencies.code, {
      onDelete: "restrict",
    }),
    defaultSalesChannelId: foreignUuid("default_sales_channel_id").references(() => salesChannels.id, {
      onDelete: "set null",
    }),
    pricesIncludeTax: boolean("prices_include_tax").notNull().default(true),
    metadata: metadata("metadata"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("market_code_unique").on(table.code),
    index("market_sales_channel_idx").on(table.defaultSalesChannelId),
  ],
);

export const marketCountries = pgTable(
  "market_country",
  {
    id: primaryUuid("id"),
    marketId: foreignUuid("market_id")
      .notNull()
      .references(() => markets.id, { onDelete: "cascade" }),
    countryCode: countryCode("country_code").notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("market_country_country_unique").on(table.countryCode),
    uniqueIndex("market_country_market_country_unique").on(table.marketId, table.countryCode),
    index("market_country_market_idx").on(table.marketId),
  ],
);

export const collections = pgTable(
  "collection",
  {
    id: primaryUuid("id"),
    slug: text("slug").notNull(),
    status: collectionStatusEnum("status").notNull().default("draft"),
    sortOrder: integer("sort_order").notNull().default(0),
    publishAt: timestamp("publish_at", { withTimezone: true }),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("collection_slug_unique").on(table.slug),
  ],
);

export const collectionTranslations = pgTable(
  "collection_translation",
  {
    id: primaryUuid("id"),
    collectionId: foreignUuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    locale: localeCode("locale"),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("collection_translation_unique").on(table.collectionId, table.locale),
  ],
);

export const categories = pgTable(
  "category",
  {
    id: primaryUuid("id"),
    parentId: foreignUuid("parent_id").references((): AnyPgColumn => categories.id, {
      onDelete: "set null",
    }),
    slug: text("slug").notNull(),
    status: collectionStatusEnum("status").notNull().default("draft"),
    sortOrder: integer("sort_order").notNull().default(0),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    metadata: metadata("metadata"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("category_slug_unique").on(table.slug),
    index("category_parent_idx").on(table.parentId),
  ],
);

export const categoryTranslations = pgTable(
  "category_translation",
  {
    id: primaryUuid("id"),
    categoryId: foreignUuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    locale: localeCode("locale"),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("category_translation_unique").on(table.categoryId, table.locale),
    uniqueIndex("category_translation_slug_unique").on(table.locale, table.slug),
    index("category_translation_locale_idx").on(table.locale),
  ],
);

export const products = pgTable(
  "product",
  {
    id: primaryUuid("id"),
    slug: text("slug").notNull(),
    status: productStatusEnum("status").notNull().default("draft"),
    productType: text("product_type"),
    vendor: text("vendor"),
    featuredImageUrl: text("featured_image_url"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    defaultCountryCode: countryCode("default_country_code"),
    currencyCode: currencyCode("currency_code"),
    publishAt: timestamp("publish_at", { withTimezone: true }),
    metadata: metadata("metadata"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("product_slug_unique").on(table.slug),
    index("product_status_publish_created_idx").on(table.status, table.publishAt, table.createdAt),
  ],
);

export const productTranslations = pgTable(
  "product_translation",
  {
    id: primaryUuid("id"),
    productId: foreignUuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    locale: localeCode("locale"),
    slug: text("slug"),
    name: text("name").notNull(),
    description: text("description"),
    shortDescription: text("short_description"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("product_translation_unique").on(table.productId, table.locale),
    uniqueIndex("product_translation_slug_unique").on(table.locale, table.slug),
    index("product_translation_locale_idx").on(table.locale),
  ],
);

export const priceSets = pgTable("price_set", {
  id: primaryUuid("id"),
  name: text("name"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const productVariants = pgTable(
  "product_variant",
  {
    id: primaryUuid("id"),
    productId: foreignUuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sku: text("sku").notNull(),
    barcode: text("barcode"),
    title: text("title").notNull(),
    priceAmount: integer("price_amount").notNull(),
    compareAtAmount: integer("compare_at_amount"),
    currencyCode: currencyCode("currency_code"),
    priceSetId: foreignUuid("price_set_id").references(() => priceSets.id, {
      onDelete: "set null",
    }),
    isDefault: boolean("is_default").notNull().default(false),
    manageInventory: boolean("manage_inventory").notNull().default(true),
    requiresShipping: boolean("requires_shipping").notNull().default(true),
    weightGrams: integer("weight_grams"),
    metadata: metadata("metadata"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("product_variant_sku_unique").on(table.sku),
    index("product_variant_product_idx").on(table.productId),
    index("product_variant_price_set_idx").on(table.priceSetId),
  ],
);

export const priceLists = pgTable(
  "price_list",
  {
    id: primaryUuid("id"),
    code: text("code").notNull(),
    name: text("name").notNull(),
    status: priceListStatusEnum("status").notNull().default("draft"),
    type: priceListTypeEnum("type").notNull().default("sale"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    metadata: metadata("metadata"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("price_list_code_unique").on(table.code),
    index("price_list_status_idx").on(table.status),
  ],
);

export const prices = pgTable(
  "price",
  {
    id: primaryUuid("id"),
    priceSetId: foreignUuid("price_set_id")
      .notNull()
      .references(() => priceSets.id, { onDelete: "cascade" }),
    priceListId: foreignUuid("price_list_id").references(() => priceLists.id, {
      onDelete: "cascade",
    }),
    marketId: foreignUuid("market_id").references(() => markets.id, { onDelete: "cascade" }),
    currencyCode: currencyCode("currency_code").references(() => currencies.code, {
      onDelete: "restrict",
    }),
    amount: integer("amount").notNull(),
    compareAtAmount: integer("compare_at_amount"),
    minQuantity: integer("min_quantity").notNull().default(1),
    includesTax: boolean("includes_tax").notNull().default(true),
    metadata: metadata("metadata"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("price_base_market_unique")
      .on(table.priceSetId, table.marketId, table.currencyCode, table.minQuantity)
      .where(sql`${table.priceListId} is null and ${table.marketId} is not null`),
    uniqueIndex("price_base_currency_unique")
      .on(table.priceSetId, table.currencyCode, table.minQuantity)
      .where(sql`${table.priceListId} is null and ${table.marketId} is null`),
    uniqueIndex("price_list_market_unique")
      .on(
        table.priceSetId,
        table.marketId,
        table.currencyCode,
        table.priceListId,
        table.minQuantity,
      )
      .where(sql`${table.priceListId} is not null and ${table.marketId} is not null`),
    uniqueIndex("price_list_currency_unique").on(
      table.priceSetId,
      table.currencyCode,
      table.priceListId,
      table.minQuantity,
    ).where(sql`${table.priceListId} is not null and ${table.marketId} is null`),
    index("price_price_set_idx").on(table.priceSetId),
    index("price_market_currency_idx").on(table.marketId, table.currencyCode),
    index("price_list_idx").on(table.priceListId),
  ],
);

export const productOptions = pgTable(
  "product_option",
  {
    id: primaryUuid("id"),
    productId: foreignUuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    position: integer("position").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("product_option_code_unique").on(table.productId, table.code),
    index("product_option_product_idx").on(table.productId),
  ],
);

export const productOptionValues = pgTable(
  "product_option_value",
  {
    id: primaryUuid("id"),
    optionId: foreignUuid("option_id")
      .notNull()
      .references(() => productOptions.id, { onDelete: "cascade" }),
    value: text("value").notNull(),
    position: integer("position").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("product_option_value_unique").on(table.optionId, table.value),
    index("product_option_value_option_idx").on(table.optionId),
  ],
);

export const productVariantOptionValues = pgTable(
  "product_variant_option_value",
  {
    id: primaryUuid("id"),
    variantId: foreignUuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    optionValueId: foreignUuid("option_value_id")
      .notNull()
      .references(() => productOptionValues.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("product_variant_option_value_unique").on(table.variantId, table.optionValueId),
    index("product_variant_option_value_value_idx").on(table.optionValueId),
  ],
);

export const productCategories = pgTable(
  "product_category",
  {
    id: primaryUuid("id"),
    productId: foreignUuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    categoryId: foreignUuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("product_category_unique").on(table.productId, table.categoryId),
    index("product_category_product_idx").on(table.productId),
    index("product_category_category_idx").on(table.categoryId),
  ],
);

export const productSalesChannels = pgTable(
  "product_sales_channel",
  {
    id: primaryUuid("id"),
    productId: foreignUuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    salesChannelId: foreignUuid("sales_channel_id")
      .notNull()
      .references(() => salesChannels.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("product_sales_channel_unique").on(table.productId, table.salesChannelId),
    index("product_sales_channel_product_idx").on(table.productId),
    index("product_sales_channel_channel_idx").on(table.salesChannelId),
  ],
);

export const productAttributes = pgTable(
  "product_attribute",
  {
    id: primaryUuid("id"),
    code: text("code").notNull(),
    name: text("name").notNull(),
    type: productAttributeTypeEnum("type").notNull().default("text"),
    filterable: boolean("filterable").notNull().default(false),
    searchable: boolean("searchable").notNull().default(false),
    unit: text("unit"),
    metadata: metadata("metadata"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("product_attribute_code_unique").on(table.code),
  ],
);

export const productAttributeValues = pgTable(
  "product_attribute_value",
  {
    id: primaryUuid("id"),
    productId: foreignUuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    attributeId: foreignUuid("attribute_id")
      .notNull()
      .references(() => productAttributes.id, { onDelete: "cascade" }),
    locale: localeCode("locale").default("da").notNull(),
    valueText: text("value_text"),
    valueNumber: integer("value_number"),
    valueBoolean: boolean("value_boolean"),
    valueJson: jsonb("value_json").$type<unknown>(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("product_attribute_value_unique").on(table.productId, table.attributeId, table.locale),
    index("product_attribute_value_product_idx").on(table.productId),
    index("product_attribute_value_attribute_idx").on(table.attributeId),
  ],
);

export const collectionProducts = pgTable(
  "collection_product",
  {
    id: primaryUuid("id"),
    collectionId: foreignUuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    productId: foreignUuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("collection_product_unique").on(table.collectionId, table.productId),
    index("collection_product_product_idx").on(table.productId),
  ],
);
