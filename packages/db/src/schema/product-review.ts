import { boolean, index, integer, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { products, productVariants } from "./catalog";
import { customerProfiles } from "./customer";
import { orderItems } from "./order";
import {
  createdAt,
  foreignUuid,
  primaryUuid,
  productReviewStatusEnum,
  updatedAt,
} from "./shared";

export const productReviews = pgTable(
  "product_review",
  {
    id: primaryUuid("id"),
    productId: foreignUuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: foreignUuid("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),
    customerId: foreignUuid("customer_id")
      .notNull()
      .references(() => customerProfiles.id, { onDelete: "cascade" }),
    orderItemId: foreignUuid("order_item_id").references(() => orderItems.id, {
      onDelete: "set null",
    }),
    rating: integer("rating").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    wouldRecommend: boolean("would_recommend").notNull().default(true),
    qualityScore: integer("quality_score").notNull(),
    valueScore: integer("value_score").notNull(),
    comfortScore: integer("comfort_score").notNull(),
    routineFitScore: integer("routine_fit_score").notNull(),
    status: productReviewStatusEnum("status").notNull().default("published"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("product_review_customer_product_unique").on(table.customerId, table.productId),
    index("product_review_product_status_idx").on(table.productId, table.status),
    index("product_review_customer_idx").on(table.customerId),
    index("product_review_order_item_idx").on(table.orderItemId),
  ],
);
