CREATE TYPE "public"."product_review_status" AS ENUM('published', 'hidden');--> statement-breakpoint
CREATE TABLE "product_review" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid,
	"customer_id" uuid NOT NULL,
	"order_item_id" uuid,
	"rating" integer NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"would_recommend" boolean DEFAULT true NOT NULL,
	"quality_score" integer NOT NULL,
	"value_score" integer NOT NULL,
	"comfort_score" integer NOT NULL,
	"routine_fit_score" integer NOT NULL,
	"status" "product_review_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_review" ADD CONSTRAINT "product_review_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_review" ADD CONSTRAINT "product_review_variant_id_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variant"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_review" ADD CONSTRAINT "product_review_customer_id_customer_profile_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_review" ADD CONSTRAINT "product_review_order_item_id_order_item_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_item"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "product_review_customer_product_unique" ON "product_review" USING btree ("customer_id","product_id");--> statement-breakpoint
CREATE INDEX "product_review_product_status_idx" ON "product_review" USING btree ("product_id","status");--> statement-breakpoint
CREATE INDEX "product_review_customer_idx" ON "product_review" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "product_review_order_item_idx" ON "product_review" USING btree ("order_item_id");