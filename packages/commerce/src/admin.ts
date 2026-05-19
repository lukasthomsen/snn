import { asc, count, eq, isNull } from "drizzle-orm";

import { getDb, schema } from "@snn/db";

type CommerceDb = ReturnType<typeof getDb>;
type MarketRecord = typeof schema.markets.$inferSelect;

export const roadmapPhases = [
  "Foundation",
  "Theme system",
  "Front page",
  "Header and footer",
  "Auth pages",
  "Commerce foundation",
] as const;

export const staffPermissionGroups = {
  catalog: [
    "catalog:read",
    "catalog:write",
    "catalog:publish",
  ],
  inventory: [
    "inventory:read",
    "inventory:write",
    "inventory:adjust",
  ],
  orders: [
    "orders:read",
    "orders:write",
    "orders:fulfill",
    "orders:refund",
  ],
  customers: [
    "customers:read",
    "customers:write",
  ],
  settings: [
    "settings:read",
    "settings:write",
    "staff:manage",
  ],
} as const;

export type StaffPermission = (typeof staffPermissionGroups)[keyof typeof staffPermissionGroups][number];

export type CommerceAuditAction =
  | "catalog.product.created"
  | "catalog.product.updated"
  | "catalog.product.published"
  | "catalog.product.archived"
  | "catalog.price.changed"
  | "catalog.media.changed"
  | "inventory.stock.adjusted"
  | "inventory.reservation.created"
  | "inventory.reservation.released";

export type CommerceAuditInput = {
  action: CommerceAuditAction | (string & {});
  actorType?: "user" | "system" | "integration" | undefined;
  actorUserId?: string | null | undefined;
  entityId: string;
  entityType:
    | "product"
    | "product_variant"
    | "price"
    | "price_list"
    | "inventory_item"
    | "inventory_level"
    | "media_asset"
    | (string & {});
  metadata?: Record<string, unknown> | undefined;
};

export type CommerceAdminOverview = {
  counts: {
    activeMarkets: number;
    categories: number;
    collections: number;
    currencies: number;
    inventoryItems: number;
    inventoryLocations: number;
    prices: number;
    products: number;
    variants: number;
  };
  markets: Array<{
    code: string;
    currencyCode: string;
    locale: string;
    name: string;
    pricesIncludeTax: boolean;
    salesChannelId: string | null;
    status: MarketRecord["status"];
  }>;
  warnings: Array<{
    description: string;
    id: string;
    label: string;
    tone: "danger" | "warning" | "info";
  }>;
};

export async function recordCommerceAuditEvent(input: CommerceAuditInput, db: CommerceDb = getDb()) {
  const [event] = await db
    .insert(schema.auditLogs)
    .values({
      action: input.action,
      actorType: input.actorType ?? "system",
      actorUserId: input.actorUserId ?? null,
      entityId: input.entityId,
      entityType: input.entityType,
      metadata: input.metadata ?? {},
    })
    .returning({
      id: schema.auditLogs.id,
    });

  return event;
}

export async function getCommerceAdminOverview(db: CommerceDb = getDb()): Promise<CommerceAdminOverview> {
  const [
    activeMarketsCount,
    categoriesCount,
    collectionsCount,
    currenciesCount,
    inventoryItemsCount,
    inventoryLocationsCount,
    pricesCount,
    productsCount,
    variantsCount,
    markets,
    variantsMissingPriceSet,
    productsMissingSalesChannel,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(schema.markets)
      .where(eq(schema.markets.status, "active")),
    db.select({ value: count() }).from(schema.categories),
    db.select({ value: count() }).from(schema.collections),
    db.select({ value: count() }).from(schema.currencies),
    db.select({ value: count() }).from(schema.inventoryItems),
    db.select({ value: count() }).from(schema.inventoryLocations),
    db.select({ value: count() }).from(schema.prices),
    db.select({ value: count() }).from(schema.products),
    db.select({ value: count() }).from(schema.productVariants),
    db
      .select({
        code: schema.markets.code,
        currencyCode: schema.markets.defaultCurrencyCode,
        locale: schema.markets.defaultLocale,
        name: schema.markets.name,
        pricesIncludeTax: schema.markets.pricesIncludeTax,
        salesChannelId: schema.markets.defaultSalesChannelId,
        status: schema.markets.status,
      })
      .from(schema.markets)
      .orderBy(asc(schema.markets.code)),
    db
      .select({
        id: schema.productVariants.id,
        sku: schema.productVariants.sku,
      })
      .from(schema.productVariants)
      .where(isNull(schema.productVariants.priceSetId))
      .limit(5),
    db
      .select({
        id: schema.products.id,
        slug: schema.products.slug,
      })
      .from(schema.products)
      .leftJoin(schema.productSalesChannels, eq(schema.productSalesChannels.productId, schema.products.id))
      .where(isNull(schema.productSalesChannels.id))
      .limit(5),
  ]);

  const counts = {
    activeMarkets: activeMarketsCount[0]?.value ?? 0,
    categories: categoriesCount[0]?.value ?? 0,
    collections: collectionsCount[0]?.value ?? 0,
    currencies: currenciesCount[0]?.value ?? 0,
    inventoryItems: inventoryItemsCount[0]?.value ?? 0,
    inventoryLocations: inventoryLocationsCount[0]?.value ?? 0,
    prices: pricesCount[0]?.value ?? 0,
    products: productsCount[0]?.value ?? 0,
    variants: variantsCount[0]?.value ?? 0,
  };
  const warnings: CommerceAdminOverview["warnings"] = [];

  if (counts.activeMarkets === 0) {
    warnings.push({
      description: "Create at least one active market before products can resolve storefront prices.",
      id: "active-market-missing",
      label: "No active market",
      tone: "danger",
    });
  }

  if (counts.prices === 0) {
    warnings.push({
      description: "Products without market prices stay hidden from storefront commerce listings.",
      id: "prices-missing",
      label: "No market prices",
      tone: "warning",
    });
  }

  if (variantsMissingPriceSet.length > 0) {
    warnings.push({
      description: `${variantsMissingPriceSet.length} sampled variant(s) are not linked to a price set.`,
      id: "variant-price-set-missing",
      label: "Variant price sets missing",
      tone: "warning",
    });
  }

  if (productsMissingSalesChannel.length > 0) {
    warnings.push({
      description: `${productsMissingSalesChannel.length} sampled product(s) are not scoped to a sales channel.`,
      id: "product-sales-channel-missing",
      label: "Product channel scope missing",
      tone: "info",
    });
  }

  return {
    counts,
    markets,
    warnings,
  };
}
