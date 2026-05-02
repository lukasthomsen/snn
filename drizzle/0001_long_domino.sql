CREATE TYPE "public"."media_asset_status" AS ENUM('draft', 'ready', 'failed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."media_provider" AS ENUM('cloudflare_images');--> statement-breakpoint
CREATE TYPE "public"."product_media_role" AS ENUM('featured', 'gallery', 'swatch', 'hero');--> statement-breakpoint
CREATE TABLE "media_asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" "media_provider" DEFAULT 'cloudflare_images' NOT NULL,
	"status" "media_asset_status" DEFAULT 'draft' NOT NULL,
	"provider_asset_id" text NOT NULL,
	"filename" text,
	"mime_type" text,
	"alt_text" text,
	"width" integer,
	"height" integer,
	"byte_size" integer,
	"delivery_url" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"uploaded_at" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid,
	"media_asset_id" uuid NOT NULL,
	"role" "product_media_role" DEFAULT 'gallery' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_variant_id_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variant"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_media_asset_id_media_asset_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_asset"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "media_asset_provider_asset_unique" ON "media_asset" USING btree ("provider","provider_asset_id");--> statement-breakpoint
CREATE INDEX "media_asset_status_idx" ON "media_asset" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "product_media_product_asset_unique" ON "product_media" USING btree ("product_id","media_asset_id");--> statement-breakpoint
CREATE INDEX "product_media_product_idx" ON "product_media" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_media_variant_idx" ON "product_media" USING btree ("variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_provider_external_reference_unique" ON "payment" USING btree ("provider","external_reference");