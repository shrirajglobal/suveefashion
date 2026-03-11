ALTER TABLE cart_items ADD COLUMN size text;
ALTER TABLE cart_items ADD CONSTRAINT cart_items_user_product_size_unique UNIQUE (user_id, product_id, size);