DROP INDEX "price_scope_unique";--> statement-breakpoint
DROP INDEX "inventory_level_unique";--> statement-breakpoint
DROP INDEX "inventory_level_item_location_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "price_base_market_unique" ON "price" USING btree ("price_set_id","market_id","currency_code","min_quantity") WHERE "price"."price_list_id" is null and "price"."market_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "price_base_currency_unique" ON "price" USING btree ("price_set_id","currency_code","min_quantity") WHERE "price"."price_list_id" is null and "price"."market_id" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "price_list_market_unique" ON "price" USING btree ("price_set_id","market_id","currency_code","price_list_id","min_quantity") WHERE "price"."price_list_id" is not null and "price"."market_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "price_list_currency_unique" ON "price" USING btree ("price_set_id","currency_code","price_list_id","min_quantity") WHERE "price"."price_list_id" is not null and "price"."market_id" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_level_unique" ON "inventory_level" USING btree ("variant_id","location_id") WHERE "inventory_level"."variant_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_level_item_location_unique" ON "inventory_level" USING btree ("inventory_item_id","location_id") WHERE "inventory_level"."inventory_item_id" is not null;