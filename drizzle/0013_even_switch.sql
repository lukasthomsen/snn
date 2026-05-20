CREATE INDEX "product_status_publish_created_idx" ON "product" USING btree ("status","publish_at","created_at");--> statement-breakpoint
CREATE INDEX "customer_product_like_user_created_idx" ON "customer_product_like" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "cart_customer_status_updated_idx" ON "cart" USING btree ("customer_id","status","updated_at");