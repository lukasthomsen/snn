import { boolean, index, integer, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import {
  collectionStatusEnum,
  countryCode,
  createdAt,
  currencyCode,
  foreignUuid,
  localeCode,
  primaryUuid,
  productStatusEnum,
  updatedAt,
} from "./shared";

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

export const collections = pgTable(
  "collection",
  {
    id: primaryUuid("id"),
    slug: text("slug").notNull(),
    status: collectionStatusEnum("status").notNull().default("draft"),
    sortOrder: integer("sort_order").notNull().default(0),
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
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("product_slug_unique").on(table.slug),
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
    name: text("name").notNull(),
    description: text("description"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("product_translation_unique").on(table.productId, table.locale),
  ],
);

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
    isDefault: boolean("is_default").notNull().default(false),
    requiresShipping: boolean("requires_shipping").notNull().default(true),
    weightGrams: integer("weight_grams"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("product_variant_sku_unique").on(table.sku),
    index("product_variant_product_idx").on(table.productId),
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
  ],
);

export const productOptionValues = pgTable("product_option_value", {
  id: primaryUuid("id"),
  optionId: foreignUuid("option_id")
    .notNull()
    .references(() => productOptions.id, { onDelete: "cascade" }),
  value: text("value").notNull(),
  position: integer("position").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

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
  ],
);
