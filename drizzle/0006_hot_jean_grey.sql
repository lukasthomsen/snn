CREATE INDEX "collection_product_product_idx" ON "collection_product" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "price_scope_unique" ON "price" USING btree ("price_set_id","market_id","currency_code","price_list_id","min_quantity");--> statement-breakpoint
CREATE UNIQUE INDEX "product_option_value_unique" ON "product_option_value" USING btree ("option_id","value");--> statement-breakpoint
CREATE INDEX "product_option_value_option_idx" ON "product_option_value" USING btree ("option_id");--> statement-breakpoint
CREATE INDEX "product_variant_option_value_value_idx" ON "product_variant_option_value" USING btree ("option_value_id");--> statement-breakpoint
INSERT INTO "currency" ("code", "name", "symbol", "decimal_digits", "enabled")
VALUES ('DKK', 'Danish krone', 'kr.', 2, true)
ON CONFLICT ("code") DO NOTHING;--> statement-breakpoint
INSERT INTO "sales_channel" ("code", "name")
VALUES ('web', 'Web storefront')
ON CONFLICT ("code") DO NOTHING;--> statement-breakpoint
INSERT INTO "market" (
  "code",
  "name",
  "status",
  "default_locale",
  "default_currency_code",
  "default_sales_channel_id",
  "prices_include_tax"
)
SELECT 'dk', 'Denmark', 'active', 'da', 'DKK', "id", true
FROM "sales_channel"
WHERE "code" = 'web'
ON CONFLICT ("code") DO NOTHING;--> statement-breakpoint
INSERT INTO "market_country" ("market_id", "country_code")
SELECT "id", 'DK'
FROM "market"
WHERE "code" = 'dk'
ON CONFLICT ("country_code") DO NOTHING;
