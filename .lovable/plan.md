

# Fix: Product Images Missing in Catalogue PDF

## Root Cause

The edge function returns HTML as JSON, and the client opens it with:
```js
const w = window.open("", "_blank");
w.document.write(data.html);
```

This creates an `about:blank` page with a **null origin**. Cross-origin images (from Supabase storage) either fail to load or aren't rendered when printing to PDF from this context.

## Solution

Two changes needed:

### 1. Edge Function — Convert images to base64 (server-side)

In `supabase/functions/generate-catalogue-pdf/index.ts`, fetch each product image and convert it to a base64 data URL before embedding in the HTML. This eliminates cross-origin issues entirely since images are inlined.

- Add a helper function that fetches image URLs and returns `data:image/jpeg;base64,...`
- Use `Promise.allSettled` to fetch all images in parallel (with a timeout per image)
- Fall back to "No Image" placeholder if fetch fails
- Replace `<img src="${p.image_url}">` with `<img src="${base64DataUrl}">`

### 2. Client-side — Use Blob URL instead of about:blank

In `src/components/admin/AdminCatalogueDownload.tsx`, replace the `document.write` approach with a Blob URL:

```js
const blob = new Blob([data.html], { type: "text/html" });
const url = URL.createObjectURL(blob);
window.open(url, "_blank");
```

This gives the page a proper origin as a secondary safeguard.

### 3. Add image preload script in HTML

Add a small `<script>` at the end of the generated HTML that waits for all `<img>` elements to finish loading before showing the print button, preventing blank images if any base64 images are still decoding.

## Trade-offs

- Base64 encoding increases the HTML payload size (~33% larger than raw images)
- For 100+ products, the response may be several MB — but this is a one-time admin download, not user-facing
- Much more reliable than relying on external URLs loading in print context

## Files to Change

| File | Change |
|------|--------|
| `supabase/functions/generate-catalogue-pdf/index.ts` | Fetch images, convert to base64 data URLs, embed inline |
| `src/components/admin/AdminCatalogueDownload.tsx` | Use Blob URL instead of `document.write` on `about:blank` |

