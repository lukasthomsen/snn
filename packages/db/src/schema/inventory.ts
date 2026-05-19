import { boolean, index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { salesChannels, productVariants } from "./catalog";
import {
  countryCode,
  createdAt,
  foreignUuid,
  inventoryLocationStatusEnum,
  metadata,
  primaryUuid,
  updatedAt,
} from "./shared";

export const inventoryLocations = pgTable(
  "inventory_location",
  {
    id: primaryUuid("id"),
    code: text("code").notNull(),
    name: text("name").notNull(),
    status: inventoryLocationStatusEnum("status").notNull().default("active"),
    timezone: text("timezone"),
    countryCode: countryCode("country_code"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("inventory_location_code_unique").on(table.code),
  ],
);

export const inventoryItems = pgTable(
  "inventory_item",
  {
    id: primaryUuid("id"),
    sku: text("sku").notNull(),
    title: text("title"),
    tracked: boolean("tracked").notNull().default(true),
    requiresShipping: boolean("requires_shipping").notNull().default(true),
    metadata: metadata("metadata"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("inventory_item_sku_unique").on(table.sku),
  ],
);

export const variantInventoryItems = pgTable(
  "variant_inventory_item",
  {
    id: primaryUuid("id"),
    variantId: foreignUuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    inventoryItemId: foreignUuid("inventory_item_id")
      .notNull()
      .references(() => inventoryItems.id, { onDelete: "cascade" }),
    requiredQuantity: integer("required_quantity").notNull().default(1),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("variant_inventory_item_unique").on(table.variantId, table.inventoryItemId),
    index("variant_inventory_item_variant_idx").on(table.variantId),
    index("variant_inventory_item_item_idx").on(table.inventoryItemId),
  ],
);

export const salesChannelInventoryLocations = pgTable(
  "sales_channel_inventory_location",
  {
    id: primaryUuid("id"),
    salesChannelId: foreignUuid("sales_channel_id")
      .notNull()
      .references(() => salesChannels.id, { onDelete: "cascade" }),
    locationId: foreignUuid("location_id")
      .notNull()
      .references(() => inventoryLocations.id, { onDelete: "cascade" }),
    priority: integer("priority").notNull().default(0),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("sales_channel_inventory_location_unique").on(table.salesChannelId, table.locationId),
    index("sales_channel_inventory_location_channel_idx").on(table.salesChannelId),
    index("sales_channel_inventory_location_location_idx").on(table.locationId),
  ],
);

export const inventoryLevels = pgTable(
  "inventory_level",
  {
    id: primaryUuid("id"),
    variantId: foreignUuid("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),
    inventoryItemId: foreignUuid("inventory_item_id").references(() => inventoryItems.id, {
      onDelete: "cascade",
    }),
    locationId: foreignUuid("location_id")
      .notNull()
      .references(() => inventoryLocations.id, { onDelete: "cascade" }),
    onHand: integer("on_hand").notNull().default(0),
    reserved: integer("reserved").notNull().default(0),
    available: integer("available").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("inventory_level_unique")
      .on(table.variantId, table.locationId)
      .where(sql`${table.variantId} is not null`),
    uniqueIndex("inventory_level_item_location_unique")
      .on(table.inventoryItemId, table.locationId)
      .where(sql`${table.inventoryItemId} is not null`),
    index("inventory_level_variant_idx").on(table.variantId),
    index("inventory_level_item_idx").on(table.inventoryItemId),
    index("inventory_level_location_idx").on(table.locationId),
  ],
);

export const inventoryReservations = pgTable(
  "inventory_reservation",
  {
    id: primaryUuid("id"),
    inventoryItemId: foreignUuid("inventory_item_id")
      .notNull()
      .references(() => inventoryItems.id, { onDelete: "cascade" }),
    cartId: foreignUuid("cart_id"),
    orderId: foreignUuid("order_id"),
    quantity: integer("quantity").notNull().default(0),
    status: text("status").notNull().default("active"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    metadata: metadata("metadata"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("inventory_reservation_item_idx").on(table.inventoryItemId),
    index("inventory_reservation_status_idx").on(table.status),
    index("inventory_reservation_expires_idx").on(table.expiresAt),
  ],
);
