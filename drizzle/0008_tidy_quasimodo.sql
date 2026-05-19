WITH duplicate_cart_lines AS (
	SELECT
		"id",
		"cart_id",
		"variant_id",
		LEAST(SUM("quantity") OVER (PARTITION BY "cart_id", "variant_id"), 99) AS "merged_quantity",
		ROW_NUMBER() OVER (PARTITION BY "cart_id", "variant_id" ORDER BY "created_at", "id") AS "line_rank"
	FROM "cart_item"
	WHERE "variant_id" IS NOT NULL
)
UPDATE "cart_item"
SET
	"quantity" = duplicate_cart_lines."merged_quantity",
	"updated_at" = now()
FROM duplicate_cart_lines
WHERE "cart_item"."id" = duplicate_cart_lines."id"
	AND duplicate_cart_lines."line_rank" = 1;--> statement-breakpoint
WITH duplicate_cart_lines AS (
	SELECT
		"id",
		"cart_id",
		"variant_id",
		ROW_NUMBER() OVER (PARTITION BY "cart_id", "variant_id" ORDER BY "created_at", "id") AS "line_rank"
	FROM "cart_item"
	WHERE "variant_id" IS NOT NULL
)
DELETE FROM "cart_item"
USING duplicate_cart_lines
WHERE "cart_item"."id" = duplicate_cart_lines."id"
	AND duplicate_cart_lines."line_rank" > 1;--> statement-breakpoint
CREATE UNIQUE INDEX "cart_item_cart_variant_unique" ON "cart_item" USING btree ("cart_id","variant_id");
