import { existsSync } from "node:fs";

import { and, eq, isNull } from "drizzle-orm";

import { getDb, schema } from "@snn/db";

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const shouldApply = process.argv.includes("--apply");
const isProduction =
  process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";

type CommerceDb = ReturnType<typeof getDb>;

async function getDefaultMarket(db: CommerceDb) {
  const [market] = await db
    .select()
    .from(schema.markets)
    .where(eq(schema.markets.status, "active"))
    .limit(1);

  return market ?? null;
}

async function ensurePriceSet(db: CommerceDb, name: string) {
  const [priceSet] = await db.insert(schema.priceSets).values({ name }).returning();

  if (!priceSet) {
    throw new Error(`Unable to create ${name}.`);
  }

  return priceSet;
}

async function ensureInventoryItem(db: CommerceDb, sku: string, title: string) {
  await db
    .insert(schema.inventoryItems)
    .values({ sku, title })
    .onConflictDoNothing();

  const [item] = await db
    .select()
    .from(schema.inventoryItems)
    .where(eq(schema.inventoryItems.sku, sku))
    .limit(1);

  if (!item) {
    throw new Error(`Unable to ensure inventory item ${sku}.`);
  }

  return item;
}

async function main() {
  if (isProduction && process.env.ALLOW_PRODUCTION_COMMERCE_BACKFILL !== "true") {
    throw new Error("Refusing to backfill commerce foundation in production.");
  }

  const db = getDb();
  const market = await getDefaultMarket(db);
  const variantsMissingPriceSets = await db
    .select()
    .from(schema.productVariants)
    .where(isNull(schema.productVariants.priceSetId));
  const legacyInventoryLevels = await db
    .select({
      level: schema.inventoryLevels,
      variant: schema.productVariants,
    })
    .from(schema.inventoryLevels)
    .innerJoin(schema.productVariants, eq(schema.inventoryLevels.variantId, schema.productVariants.id))
    .where(isNull(schema.inventoryLevels.inventoryItemId));

  console.log("Commerce foundation backfill");
  console.log(`Mode: ${shouldApply ? "apply" : "dry-run"}`);
  console.log(`Variants missing price sets: ${variantsMissingPriceSets.length}`);
  console.log(`Legacy inventory levels missing inventory items: ${legacyInventoryLevels.length}`);

  if (!shouldApply) {
    console.log("Run `pnpm db:backfill:commerce -- --apply` to apply these local backfills.");
    return;
  }

  for (const variant of variantsMissingPriceSets) {
    const priceSet = await ensurePriceSet(db, `${variant.sku} migrated price set`);

    await db
      .update(schema.productVariants)
      .set({
        priceSetId: priceSet.id,
        updatedAt: new Date(),
      })
      .where(eq(schema.productVariants.id, variant.id));

    if (market) {
      const [existingPrice] = await db
        .select()
        .from(schema.prices)
        .where(
          and(
            eq(schema.prices.priceSetId, priceSet.id),
            eq(schema.prices.marketId, market.id),
            eq(schema.prices.currencyCode, variant.currencyCode ?? market.defaultCurrencyCode ?? "DKK"),
            isNull(schema.prices.priceListId),
          ),
        )
        .limit(1);

      if (!existingPrice) {
        await db.insert(schema.prices).values({
          amount: variant.priceAmount,
          compareAtAmount: variant.compareAtAmount,
          currencyCode: variant.currencyCode ?? market.defaultCurrencyCode ?? "DKK",
          includesTax: market.pricesIncludeTax,
          marketId: market.id,
          priceSetId: priceSet.id,
        });
      }
    }
  }

  for (const row of legacyInventoryLevels) {
    const item = await ensureInventoryItem(db, row.variant.sku, row.variant.title);

    await db
      .insert(schema.variantInventoryItems)
      .values({
        inventoryItemId: item.id,
        requiredQuantity: 1,
        variantId: row.variant.id,
      })
      .onConflictDoNothing();

    await db
      .update(schema.inventoryLevels)
      .set({
        inventoryItemId: item.id,
        updatedAt: new Date(),
      })
      .where(eq(schema.inventoryLevels.id, row.level.id));
  }

  console.log("Commerce foundation backfill complete.");
}

main().catch((error) => {
  console.error("Commerce foundation backfill failed.");
  console.error(error);
  process.exitCode = 1;
});
