

# Fix: Catalogue PDF Images — RangeError & CPU Timeout

## Root Cause

Two issues in `fetchImageAsBase64`:

1. **`RangeError: Maximum call stack size exceeded`** on line 19: `btoa(String.fromCharCode(...new Uint8Array(buf)))` — the spread operator (`...`) pushes every byte onto the call stack. For images >100KB this exceeds the stack limit.

2. **CPU Time exceeded** — with 385 products, fetching and encoding all images server-side overwhelms the edge function's CPU budget.

## Solution: Skip server-side base64, use direct URLs + Blob origin

Since product images are in a **public** storage bucket, they load fine from any origin — the original problem was the `about:blank` null origin from `document.write()`. The client already uses Blob URLs now, which provides a valid origin. So base64 encoding is unnecessary.

### Changes

**File: `supabase/functions/generate-catalogue-pdf/index.ts`**
- Remove the `fetchImageAsBase64` function entirely
- Remove the `Promise.allSettled` image-fetching block
- Use `p.image_url` directly in `<img src="">` tags
- Add `crossorigin="anonymous"` to img tags for print compatibility

**No changes needed** to `AdminCatalogueDownload.tsx` — it already uses Blob URLs correctly.

### Why this works
- Images are in a public bucket — no auth needed
- Blob URL gives the page a real origin (not `about:blank`)
- No server-side image processing = no CPU timeout, no stack overflow
- The print button script already waits for all images to load before showing

