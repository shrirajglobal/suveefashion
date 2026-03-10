
-- Remove bulk price columns
ALTER TABLE public.products DROP COLUMN IF EXISTS bulk_price_50;
ALTER TABLE public.products DROP COLUMN IF EXISTS bulk_price_100;
ALTER TABLE public.products DROP COLUMN IF EXISTS bulk_price_500;

-- Rename moq to pcs_per_set
ALTER TABLE public.products RENAME COLUMN moq TO pcs_per_set;
ALTER TABLE public.products ALTER COLUMN pcs_per_set SET DEFAULT 4;

-- Add new columns
ALTER TABLE public.products ADD COLUMN bundle_type text DEFAULT 'combo';
ALTER TABLE public.products ADD COLUMN available_sizes text[] DEFAULT '{}'::text[];
ALTER TABLE public.products ADD COLUMN combo_description text;
