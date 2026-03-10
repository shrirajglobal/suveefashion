

## Plan: Multi-Image Support for Colour Chart Products

### Problem
Colour chart products need up to 8 images (one per colour), but currently only a single `image_url` is supported.

### Approach
Keep the existing `image_url` as the **primary/cover image** (used on cards, listings). Add a new `additional_images` text array column for up to 7 more images. Only show the multi-image uploader when `bundle_type === "colour_chart"`.

### Changes

**1. Database Migration**
Add `additional_images` column to `products` table:
```sql
ALTER TABLE public.products ADD COLUMN additional_images text[] DEFAULT '{}';
```

**2. Admin Form (`src/components/admin/AdminProducts.tsx`)**
- Add `additional_images: string[]` to `ProductForm` interface and `emptyForm`
- When bundle type is `colour_chart`, show a multi-image upload area below the main image (labeled "Colour Variant Photos (max 8 total)")
- Max 8 images total (1 primary + 7 additional). Show count feedback
- Each uploaded image shows a thumbnail with an X to remove
- Include `additional_images` in `saveProduct` and `handleBulkAdd` payloads
- Populate `additional_images` in `openEdit`

**3. Catalogue Detail Dialog (`src/pages/Catalogues.tsx`)**
- Update `Product` interface to include `additional_images: string[] | null`
- In `ProductDetailDialog`, if the product has additional images, replace the single image with a simple image gallery (thumbnails below the main image; click a thumbnail to swap it into the main view)
- Product cards remain unchanged — they always show `image_url` as cover

**4. No impact on other bundle types**
The multi-image upload section only appears for colour chart. Combo and assorted products continue with a single image. The card layout, WhatsApp messages, and sharing all continue using `image_url`.

### Files Changed
| File | Change |
|------|--------|
| Migration SQL | Add `additional_images text[]` column |
| `src/components/admin/AdminProducts.tsx` | Multi-image upload UI for colour chart |
| `src/pages/Catalogues.tsx` | Image gallery in detail dialog |

