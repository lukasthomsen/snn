CREATE TYPE "public"."promotion_discount_type" AS ENUM('percentage', 'fixed_amount');--> statement-breakpoint
CREATE TYPE "public"."promotion_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TABLE "cart_promotion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" uuid NOT NULL,
	"promotion_id" uuid,
	"code_snapshot" text NOT NULL,
	"discount_type" "promotion_discount_type" NOT NULL,
	"discount_value" integer DEFAULT 0 NOT NULL,
	"discount_amount" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promotion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"status" "promotion_status" DEFAULT 'draft' NOT NULL,
	"currency_code" varchar(3) DEFAULT 'DKK' NOT NULL,
	"discount_type" "promotion_discount_type" NOT NULL,
	"discount_value" integer DEFAULT 0 NOT NULL,
	"minimum_subtotal_amount" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cart" ADD COLUMN "discount_amount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "cart_promotion" ADD CONSTRAINT "cart_promotion_cart_id_cart_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."cart"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_promotion" ADD CONSTRAINT "cart_promotion_promotion_id_promotion_id_fk" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotion"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cart_promotion_cart_unique" ON "cart_promotion" USING btree ("cart_id");--> statement-breakpoint
CREATE INDEX "cart_promotion_promotion_idx" ON "cart_promotion" USING btree ("promotion_id");--> statement-breakpoint
CREATE UNIQUE INDEX "promotion_code_unique" ON "promotion" USING btree ("code");--> statement-breakpoint
CREATE INDEX "promotion_status_idx" ON "promotion" USING btree ("status");--> statement-breakpoint
CREATE INDEX "promotion_currency_idx" ON "promotion" USING btree ("currency_code");--> statement-breakpoint
CREATE UNIQUE INDEX "cart_item_cart_variant_unique" ON "cart_item" USING btree ("cart_id","variant_id");