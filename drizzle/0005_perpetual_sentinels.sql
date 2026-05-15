CREATE TYPE "public"."market_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."price_list_status" AS ENUM('draft', 'scheduled', 'active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."price_list_type" AS ENUM('sale', 'override');--> statement-breakpoint
CREATE TYPE "public"."product_attribute_type" AS ENUM('text', 'number', 'boolean', 'select', 'multi_select');--> statement-breakpoint
ALTER TYPE "public"."product_status" ADD VALUE 'scheduled' BEFORE 'active';--> statement-breakpoint
ALTER TYPE "public"."product_status" ADD VALUE 'published' BEFORE 'active';--> statement-breakpoint
CREATE TABLE "category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"slug" text NOT NULL,
	"status" "collection_status" DEFAULT 'draft' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category_translation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"locale" varchar(5) NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "currency" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(3) NOT NULL,
	"name" text NOT NULL,
	"symbol" text,
	"decimal_digits" integer DEFAULT 2 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "currency_code_unique" ON "currency" USING btree ("code");--> statement-breakpoint
CREATE TABLE "market_country" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_id" uuid NOT NULL,
	"country_code" varchar(2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"status" "market_status" DEFAULT 'draft' NOT NULL,
	"default_locale" varchar(5) DEFAULT 'da' NOT NULL,
	"default_currency_code" varchar(3) DEFAULT 'DKK' NOT NULL,
	"default_sales_channel_id" uuid,
	"prices_include_tax" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_list" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"status" "price_list_status" DEFAULT 'draft' NOT NULL,
	"type" "price_list_type" DEFAULT 'sale' NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_set" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"price_set_id" uuid NOT NULL,
	"price_list_id" uuid,
	"market_id" uuid,
	"currency_code" varchar(3) DEFAULT 'DKK' NOT NULL,
	"amount" integer NOT NULL,
	"compare_at_amount" integer,
	"min_quantity" integer DEFAULT 1 NOT NULL,
	"includes_tax" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_attribute_value" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"attribute_id" uuid NOT NULL,
	"locale" varchar(5) DEFAULT 'da' NOT NULL,
	"value_text" text,
	"value_number" integer,
	"value_boolean" boolean,
	"value_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_attribute" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"type" "product_attribute_type" DEFAULT 'text' NOT NULL,
	"filterable" boolean DEFAULT false NOT NULL,
	"searchable" boolean DEFAULT false NOT NULL,
	"unit" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_sales_channel" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"sales_channel_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sku" text NOT NULL,
	"title" text,
	"tracked" boolean DEFAULT true NOT NULL,
	"requires_shipping" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_reservation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inventory_item_id" uuid NOT NULL,
	"cart_id" uuid,
	"order_id" uuid,
	"quantity" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"expires_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_channel_inventory_location" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sales_channel_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "variant_inventory_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"inventory_item_id" uuid NOT NULL,
	"required_quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inventory_level" DROP CONSTRAINT "inventory_level_variant_id_product_variant_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory_level" ALTER COLUMN "variant_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "collection" ADD COLUMN "publish_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "product_translation" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "product_translation" ADD COLUMN "short_description" text;--> statement-breakpoint
ALTER TABLE "product_translation" ADD COLUMN "seo_title" text;--> statement-breakpoint
ALTER TABLE "product_translation" ADD COLUMN "seo_description" text;--> statement-breakpoint
ALTER TABLE "product_variant" ADD COLUMN "price_set_id" uuid;--> statement-breakpoint
ALTER TABLE "product_variant" ADD COLUMN "manage_inventory" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variant" ADD COLUMN "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "publish_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_level" ADD COLUMN "inventory_item_id" uuid;--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_parent_id_category_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_translation" ADD CONSTRAINT "category_translation_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_country" ADD CONSTRAINT "market_country_market_id_market_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."market"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market" ADD CONSTRAINT "market_default_currency_code_currency_code_fk" FOREIGN KEY ("default_currency_code") REFERENCES "public"."currency"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market" ADD CONSTRAINT "market_default_sales_channel_id_sales_channel_id_fk" FOREIGN KEY ("default_sales_channel_id") REFERENCES "public"."sales_channel"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price" ADD CONSTRAINT "price_price_set_id_price_set_id_fk" FOREIGN KEY ("price_set_id") REFERENCES "public"."price_set"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price" ADD CONSTRAINT "price_price_list_id_price_list_id_fk" FOREIGN KEY ("price_list_id") REFERENCES "public"."price_list"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price" ADD CONSTRAINT "price_market_id_market_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."market"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price" ADD CONSTRAINT "price_currency_code_currency_code_fk" FOREIGN KEY ("currency_code") REFERENCES "public"."currency"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attribute_value" ADD CONSTRAINT "product_attribute_value_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attribute_value" ADD CONSTRAINT "product_attribute_value_attribute_id_product_attribute_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."product_attribute"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_category" ADD CONSTRAINT "product_category_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_category" ADD CONSTRAINT "product_category_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_sales_channel" ADD CONSTRAINT "product_sales_channel_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_sales_channel" ADD CONSTRAINT "product_sales_channel_sales_channel_id_sales_channel_id_fk" FOREIGN KEY ("sales_channel_id") REFERENCES "public"."sales_channel"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservation" ADD CONSTRAINT "inventory_reservation_inventory_item_id_inventory_item_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_channel_inventory_location" ADD CONSTRAINT "sales_channel_inventory_location_sales_channel_id_sales_channel_id_fk" FOREIGN KEY ("sales_channel_id") REFERENCES "public"."sales_channel"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_channel_inventory_location" ADD CONSTRAINT "sales_channel_inventory_location_location_id_inventory_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."inventory_location"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_inventory_item" ADD CONSTRAINT "variant_inventory_item_variant_id_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_inventory_item" ADD CONSTRAINT "variant_inventory_item_inventory_item_id_inventory_item_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "category_slug_unique" ON "category" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "category_parent_idx" ON "category" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "category_translation_unique" ON "category_translation" USING btree ("category_id","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "category_translation_slug_unique" ON "category_translation" USING btree ("locale","slug");--> statement-breakpoint
CREATE INDEX "category_translation_locale_idx" ON "category_translation" USING btree ("locale");--> statement-breakpoint
CREATE UNIQUE INDEX "market_country_country_unique" ON "market_country" USING btree ("country_code");--> statement-breakpoint
CREATE UNIQUE INDEX "market_country_market_country_unique" ON "market_country" USING btree ("market_id","country_code");--> statement-breakpoint
CREATE INDEX "market_country_market_idx" ON "market_country" USING btree ("market_id");--> statement-breakpoint
CREATE UNIQUE INDEX "market_code_unique" ON "market" USING btree ("code");--> statement-breakpoint
CREATE INDEX "market_sales_channel_idx" ON "market" USING btree ("default_sales_channel_id");--> statement-breakpoint
CREATE UNIQUE INDEX "price_list_code_unique" ON "price_list" USING btree ("code");--> statement-breakpoint
CREATE INDEX "price_list_status_idx" ON "price_list" USING btree ("status");--> statement-breakpoint
CREATE INDEX "price_price_set_idx" ON "price" USING btree ("price_set_id");--> statement-breakpoint
CREATE INDEX "price_market_currency_idx" ON "price" USING btree ("market_id","currency_code");--> statement-breakpoint
CREATE INDEX "price_list_idx" ON "price" USING btree ("price_list_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_attribute_value_unique" ON "product_attribute_value" USING btree ("product_id","attribute_id","locale");--> statement-breakpoint
CREATE INDEX "product_attribute_value_product_idx" ON "product_attribute_value" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_attribute_value_attribute_idx" ON "product_attribute_value" USING btree ("attribute_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_attribute_code_unique" ON "product_attribute" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "product_category_unique" ON "product_category" USING btree ("product_id","category_id");--> statement-breakpoint
CREATE INDEX "product_category_product_idx" ON "product_category" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_category_category_idx" ON "product_category" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_sales_channel_unique" ON "product_sales_channel" USING btree ("product_id","sales_channel_id");--> statement-breakpoint
CREATE INDEX "product_sales_channel_product_idx" ON "product_sales_channel" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_sales_channel_channel_idx" ON "product_sales_channel" USING btree ("sales_channel_id");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_item_sku_unique" ON "inventory_item" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "inventory_reservation_item_idx" ON "inventory_reservation" USING btree ("inventory_item_id");--> statement-breakpoint
CREATE INDEX "inventory_reservation_status_idx" ON "inventory_reservation" USING btree ("status");--> statement-breakpoint
CREATE INDEX "inventory_reservation_expires_idx" ON "inventory_reservation" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sales_channel_inventory_location_unique" ON "sales_channel_inventory_location" USING btree ("sales_channel_id","location_id");--> statement-breakpoint
CREATE INDEX "sales_channel_inventory_location_channel_idx" ON "sales_channel_inventory_location" USING btree ("sales_channel_id");--> statement-breakpoint
CREATE INDEX "sales_channel_inventory_location_location_idx" ON "sales_channel_inventory_location" USING btree ("location_id");--> statement-breakpoint
CREATE UNIQUE INDEX "variant_inventory_item_unique" ON "variant_inventory_item" USING btree ("variant_id","inventory_item_id");--> statement-breakpoint
CREATE INDEX "variant_inventory_item_variant_idx" ON "variant_inventory_item" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "variant_inventory_item_item_idx" ON "variant_inventory_item" USING btree ("inventory_item_id");--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_price_set_id_price_set_id_fk" FOREIGN KEY ("price_set_id") REFERENCES "public"."price_set"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_level" ADD CONSTRAINT "inventory_level_inventory_item_id_inventory_item_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_level" ADD CONSTRAINT "inventory_level_variant_id_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variant"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "product_option_product_idx" ON "product_option" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_translation_slug_unique" ON "product_translation" USING btree ("locale","slug");--> statement-breakpoint
CREATE INDEX "product_translation_locale_idx" ON "product_translation" USING btree ("locale");--> statement-breakpoint
CREATE INDEX "product_variant_price_set_idx" ON "product_variant" USING btree ("price_set_id");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_level_item_location_unique" ON "inventory_level" USING btree ("inventory_item_id","location_id");--> statement-breakpoint
CREATE INDEX "inventory_level_item_idx" ON "inventory_level" USING btree ("inventory_item_id");--> statement-breakpoint
CREATE INDEX "inventory_level_location_idx" ON "inventory_level" USING btree ("location_id");
