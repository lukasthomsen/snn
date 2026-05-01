import { integer, jsonb, pgEnum, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const collectionStatusEnum = pgEnum("collection_status", ["draft", "active", "archived"]);
export const fulfillmentStatusEnum = pgEnum("fulfillment_status", [
  "pending",
  "packed",
  "shipped",
  "delivered",
  "returned",
  "canceled",
]);
export const inventoryLocationStatusEnum = pgEnum("inventory_location_status", ["active", "archived"]);
export const orderStatusEnum = pgEnum("order_status", [
  "draft",
  "pending",
  "confirmed",
  "fulfilled",
  "partially_fulfilled",
  "canceled",
  "refunded",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "authorized",
  "captured",
  "failed",
  "refunded",
  "partially_refunded",
]);
export const productStatusEnum = pgEnum("product_status", ["draft", "active", "archived"]);
export const cartStatusEnum = pgEnum("cart_status", ["open", "converted", "expired", "abandoned"]);
export const staffAssignmentStatusEnum = pgEnum("staff_assignment_status", ["active", "suspended"]);

export function primaryUuid(name: string) {
  return uuid(name).defaultRandom().primaryKey();
}

export function foreignUuid(name: string) {
  return uuid(name);
}

export function createdAt() {
  return timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
}

export function updatedAt() {
  return timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();
}

export function amount(name: string) {
  return integer(name).notNull().default(0);
}

export function localeCode(name: string) {
  return varchar(name, { length: 5 }).notNull();
}

export function currencyCode(name: string) {
  return varchar(name, { length: 3 }).notNull().default("DKK");
}

export function countryCode(name: string) {
  return varchar(name, { length: 2 });
}

export function metadata(name: string) {
  return jsonb(name).$type<Record<string, unknown>>().default({}).notNull();
}

export function textId(name: string) {
  return text(name).primaryKey();
}
