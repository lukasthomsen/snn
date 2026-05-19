import { boolean, date, index, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { countryCode, createdAt, foreignUuid, primaryUuid, updatedAt } from "./shared";
import { users } from "./auth";
import { products, productVariants } from "./catalog";

export const customerProfiles = pgTable(
  "customer_profile",
  {
    id: primaryUuid("id"),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    email: text("email").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    dateOfBirth: date("date_of_birth", { mode: "string" }),
    phone: text("phone"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("customer_profile_email_unique").on(table.email),
    uniqueIndex("customer_profile_user_unique").on(table.userId),
  ],
);

export const addresses = pgTable(
  "address",
  {
    id: primaryUuid("id"),
    customerId: foreignUuid("customer_id").references(() => customerProfiles.id, {
      onDelete: "set null",
    }),
    label: text("label"),
    firstName: text("first_name"),
    lastName: text("last_name"),
    company: text("company"),
    line1: text("line_1").notNull(),
    line2: text("line_2"),
    postalCode: text("postal_code").notNull(),
    city: text("city").notNull(),
    region: text("region"),
    countryCode: countryCode("country_code").notNull(),
    phone: text("phone"),
    isDefaultShipping: boolean("is_default_shipping").notNull().default(false),
    isDefaultBilling: boolean("is_default_billing").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("address_customer_idx").on(table.customerId),
  ],
);

export const customerProductLikes = pgTable(
  "customer_product_like",
  {
    id: primaryUuid("id"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: foreignUuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: foreignUuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("customer_product_like_user_variant_unique").on(table.userId, table.variantId),
    index("customer_product_like_user_idx").on(table.userId),
    index("customer_product_like_product_idx").on(table.productId),
    index("customer_product_like_variant_idx").on(table.variantId),
  ],
);
