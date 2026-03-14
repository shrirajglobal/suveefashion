CREATE POLICY "Sub-admins can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND has_role(auth.uid(), 'sub_admin'::app_role)
);

CREATE POLICY "Sub-admins can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND has_role(auth.uid(), 'sub_admin'::app_role)
);