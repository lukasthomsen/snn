import { index, integer, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { countryCode, createdAt, foreignUuid, inventoryLocationStatusEnum, primaryUuid, updatedAt } from "./shared";
import { productVariants } from "./catalog";

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

export const inventoryLevels = pgTable(
  "inventory_level",
  {
    id: primaryUuid("id"),
    variantId: foreignUuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
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
    uniqueIndex("inventory_level_unique").on(table.variantId, table.locationId),
    index("inventory_level_variant_idx").on(table.variantId),
  ],
);
