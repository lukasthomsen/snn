DROP INDEX IF EXISTS "customer_product_like_user_product_unique";--> statement-breakpoint
ALTER TABLE "customer_product_like" ADD COLUMN "variant_id" uuid;--> statement-breakpoint
UPDATE "customer_product_like"
SET "variant_id" = (
	SELECT "product_variant"."id"
	FROM "product_variant"
	WHERE "product_variant"."product_id" = "customer_product_like"."product_id"
	ORDER BY "product_variant"."is_default" DESC, "product_variant"."created_at" ASC
	LIMIT 1
)
WHERE "variant_id" IS NULL;--> statement-breakpoint
DELETE FROM "customer_product_like" WHERE "variant_id" IS NULL;--> statement-breakpoint
ALTER TABLE "customer_product_like" ALTER COLUMN "variant_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "customer_product_like" ADD CONSTRAINT "customer_product_like_variant_id_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "customer_product_like_user_variant_unique" ON "customer_product_like" USING btree ("user_id","variant_id");--> statement-breakpoint
CREATE INDEX "customer_product_like_variant_idx" ON "customer_product_like" USING btree ("variant_id");
