

# Fix Catalogue PDF & Slider Issues

## Root Causes Found

### 1. Slider only renders ONE thumb
The `src/components/ui/slider.tsx` component only has a single `<SliderPrimitive.Thumb>`. Radix Slider needs **two** `<Thumb>` elements to support range mode (dual handles). This is why the upper limit cannot be adjusted — there's no second handle to drag. This affects both the Admin Catalogue and Catalogues page filters.

### 2. PDF layout: 3-column grid with tiny images
The edge function generates a 3-column grid with `height:200px` images. Need to change to **1 product per page** with full-size image and compact details below.

### 3. No product links in PDF
The PDF cards have no links. Need to add clickable product URLs pointing to `suveewholesale.com/catalogues?product={id}`.

### 4. WhatsApp shares text only
The share button just opens `wa.me` with a text message. Since WhatsApp Web Share API doesn't support programmatic PDF attachment, the best approach is: generate the PDF first, then share a link with a call-to-action. We'll update the flow so "Share on WhatsApp" first generates the catalogue, then shares the catalogue link with a preview message.

## Changes

### `src/components/ui/slider.tsx`
Add a second `<SliderPrimitive.Thumb>` so range sliders work. Use dynamic thumb rendering based on the value array length.

### `supabase/functions/generate-catalogue-pdf/index.ts`
- Redesign layout: 1 product per page using `page-break-after: always`
- Full-width image (max ~500px height, `object-fit: contain`)
- Compact product details below: name, fabric, sizes, price
- Add product link: `https://suveewholesale.com/catalogues?product={product.id}`

### `src/components/admin/AdminCatalogueDownload.tsx`
- Update "Share on WhatsApp" to first generate the catalogue, then share a message with the catalogue page link + discount info
- The WhatsApp message will include a direct link to the website's catalogue page with the selected category pre-filtered

