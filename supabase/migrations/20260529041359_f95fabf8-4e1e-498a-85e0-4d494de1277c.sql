
-- 1. Remove permissive blog_posts insert policy (edge functions use service role which bypasses RLS)
DROP POLICY IF EXISTS "Edge functions can insert blog posts" ON public.blog_posts;

-- 2. Restrict blog-covers uploads to admins only
DROP POLICY IF EXISTS "Admins and service role can upload blog covers" ON storage.objects;
CREATE POLICY "Admins can upload blog covers"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'blog-covers' AND public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Add UPDATE policies on storage buckets
CREATE POLICY "Admins can update blog covers"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'blog-covers' AND public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'blog-covers' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update banner images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'hero-banners' AND public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'hero-banners' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Sub-admins can update product images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'sub_admin'::app_role))
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'sub_admin'::app_role));

-- 4. Remove broad public listing on public buckets (direct public URLs still work for public buckets)
DROP POLICY IF EXISTS "Anyone can view banner images" ON storage.objects;
DROP POLICY IF EXISTS "Blog covers are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;

-- 5. Hide wsp column from anonymous visitors (column-level grants)
REVOKE SELECT ON public.products FROM anon;
GRANT SELECT (
  id, category_id, name, description, fabric, sizes, pcs_per_set,
  image_url, is_featured, is_new_arrival, created_at, updated_at,
  bundle_type, available_sizes, combo_description, available_colours, additional_images
) ON public.products TO anon;

-- 6. Hardening trigger: prevent privilege escalation via user_roles
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service role (no auth.uid()) full control
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Only admins may insert admin or sub_admin roles
  IF NEW.role IN ('admin'::app_role, 'sub_admin'::app_role)
     AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can assign privileged roles';
  END IF;

  -- Users may never insert a role for someone else (unless admin)
  IF NEW.user_id <> auth.uid()
     AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Cannot assign roles to other users';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.user_roles;
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();
