import { index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import {
  amount,
  cartStatusEnum,
  createdAt,
  currencyCode,
  foreignUuid,
  fulfillmentStatusEnum,
  localeCode,
  metadata,
  orderStatusEnum,
  paymentStatusEnum,
  primaryUuid,
  updatedAt,
} from "./shared";
import { productVariants, salesChannels } from "./catalog";
import { customerProfiles } from "./customer";
import { inventoryLocations } from "./inventory";

export const carts = pgTable(
  "cart",
  {
    id: primaryUuid("id"),
    customerId: foreignUuid("customer_id").references(() => customerProfiles.id, {
      onDelete: "set null",
    }),
    salesChannelId: foreignUuid("sales_channel_id").references(() => salesChannels.id, {
      onDelete: "set null",
    }),
    status: cartStatusEnum("status").notNull().default("open"),
    currencyCode: currencyCode("currency_code"),
    locale: localeCode("locale").default("da").notNull(),
    email: text("email"),
    subtotalAmount: amount("subtotal_amount"),
    taxAmount: amount("tax_amount"),
    totalAmount: amount("total_amount"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("cart_customer_idx").on(table.customerId),
  ],
);

export const cartItems = pgTable(
  "cart_item",
  {
    id: primaryUuid("id"),
    cartId: foreignUuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    variantId: foreignUuid("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),
    quantity: amount("quantity"),
    unitPriceAmount: amount("unit_price_amount"),
    titleSnapshot: text("title_snapshot").notNull(),
    skuSnapshot: text("sku_snapshot"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("cart_item_cart_idx").on(table.cartId),
  ],
);

export const orders = pgTable(
  "order",
  {
    id: primaryUuid("id"),
    cartId: foreignUuid("cart_id").references(() => carts.id, { onDelete: "set null" }),
    customerId: foreignUuid("customer_id").references(() => customerProfiles.id, {
      onDelete: "set null",
    }),
    salesChannelId: foreignUuid("sales_channel_id").references(() => salesChannels.id, {
      onDelete: "set null",
    }),
    orderNumber: text("order_number").notNull(),
    status: orderStatusEnum("status").notNull().default("pending"),
    currencyCode: currencyCode("currency_code"),
    locale: localeCode("locale").default("da").notNull(),
    email: text("email").notNull(),
    subtotalAmount: amount("subtotal_amount"),
    shippingAmount: amount("shipping_amount"),
    discountAmount: amount("discount_amount"),
    taxAmount: amount("tax_amount"),
    totalAmount: amount("total_amount"),
    placedAt: timestamp("placed_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("order_number_unique").on(table.orderNumber),
    uniqueIndex("order_cart_unique").on(table.cartId),
  ],
);

export const orderItems = pgTable(
  "order_item",
  {
    id: primaryUuid("id"),
    orderId: foreignUuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    variantId: foreignUuid("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),
    quantity: amount("quantity"),
    unitPriceAmount: amount("unit_price_amount"),
    totalAmount: amount("total_amount"),
    titleSnapshot: text("title_snapshot").notNull(),
    skuSnapshot: text("sku_snapshot"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("order_item_order_idx").on(table.orderId),
  ],
);

export const payments = pgTable(
  "payment",
  {
    id: primaryUuid("id"),
    orderId: foreignUuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    provider: text("provider").notNull().default("stripe"),
    externalReference: text("external_reference"),
    status: paymentStatusEnum("status").notNull().default("pending"),
    currencyCode: currencyCode("currency_code"),
    amount: amount("amount"),
    capturedAmount: amount("captured_amount"),
    metadata: metadata("metadata"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("payment_order_idx").on(table.orderId),
  ],
);

export const fulfillments = pgTable(
  "fulfillment",
  {
    id: primaryUuid("id"),
    orderId: foreignUuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    locationId: foreignUuid("location_id").references(() => inventoryLocations.id, {
      onDelete: "set null",
    }),
    status: fulfillmentStatusEnum("status").notNull().default("pending"),
    carrier: text("carrier"),
    trackingNumber: text("tracking_number"),
    trackingUrl: text("tracking_url"),
    shippedAt: timestamp("shipped_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("fulfillment_order_idx").on(table.orderId),
  ],
);
