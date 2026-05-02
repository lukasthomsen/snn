import { index, integer, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { products, productVariants } from "./catalog";
import {
  createdAt,
  foreignUuid,
  mediaAssetStatusEnum,
  mediaProviderEnum,
  metadata,
  primaryUuid,
  productMediaRoleEnum,
  updatedAt,
} from "./shared";

export const mediaAssets = pgTable(
  "media_asset",
  {
    id: primaryUuid("id"),
    provider: mediaProviderEnum("provider").notNull().default("cloudflare_images"),
    status: mediaAssetStatusEnum("status").notNull().default("draft"),
    providerAssetId: text("provider_asset_id").notNull(),
    filename: text("filename"),
    mimeType: text("mime_type"),
    altText: text("alt_text"),
    width: integer("width"),
    height: integer("height"),
    byteSize: integer("byte_size"),
    deliveryUrl: text("delivery_url"),
    metadata: metadata("metadata"),
    uploadedAt: text("uploaded_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("media_asset_provider_asset_unique").on(table.provider, table.providerAssetId),
    index("media_asset_status_idx").on(table.status),
  ],
);

export const productMedia = pgTable(
  "product_media",
  {
    id: primaryUuid("id"),
    productId: foreignUuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: foreignUuid("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),
    mediaAssetId: foreignUuid("media_asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
    role: productMediaRoleEnum("role").notNull().default("gallery"),
    position: integer("position").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("product_media_product_asset_unique").on(table.productId, table.mediaAssetId),
    index("product_media_product_idx").on(table.productId),
    index("product_media_variant_idx").on(table.variantId),
  ],
);
