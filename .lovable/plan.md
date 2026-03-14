

# Fix: Sub-Admin Cannot Upload Product Images

## Problem
The storage bucket `product-images` has an INSERT policy that only allows users with the `admin` role to upload. Sub-admins get "new row violates row-level security policy" when trying to create products with images.

Current policy: `(bucket_id = 'product-images') AND has_role(auth.uid(), 'admin')`

## Fix
Add a new storage INSERT policy for sub-admins on the `product-images` bucket:

```sql
CREATE POLICY "Sub-admins can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND has_role(auth.uid(), 'sub_admin'::app_role)
);
```

Also add DELETE policy for sub-admins so they can replace/remove images:

```sql
CREATE POLICY "Sub-admins can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND has_role(auth.uid(), 'sub_admin'::app_role)
);
```

### Files Changed
- **Migration only** — one new SQL migration adding two storage policies

