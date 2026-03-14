
-- RLS: Sub-admins can insert categories
CREATE POLICY "Sub-admins can insert categories" ON public.categories
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'sub_admin'::app_role));

-- RLS: Sub-admins can update categories
CREATE POLICY "Sub-admins can update categories" ON public.categories
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'sub_admin'::app_role));

-- RLS: Sub-admins can delete categories
CREATE POLICY "Sub-admins can delete categories" ON public.categories
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'sub_admin'::app_role));

-- RLS: Sub-admins can insert products
CREATE POLICY "Sub-admins can insert products" ON public.products
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'sub_admin'::app_role));

-- RLS: Sub-admins can update products
CREATE POLICY "Sub-admins can update products" ON public.products
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'sub_admin'::app_role));

-- RLS: Sub-admins can delete products
CREATE POLICY "Sub-admins can delete products" ON public.products
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'sub_admin'::app_role));
