

# Fix: Share Button to Open WhatsApp Directly

## Problem
The share button on product cards uses `navigator.share()` (native browser share sheet) on supported browsers, and falls back to clipboard copy on others. The user wants it to always open WhatsApp directly with a pre-filled message containing the product link.

Additionally, the shared URL (`https://suveefashion.lovable.app/catalogues?product=...`) redirects to `https://www.suveewholesale.com` which works, but the current share function doesn't reliably open WhatsApp.

## Fix

Change the `shareProduct` function in `Catalogues.tsx` to always open a WhatsApp share link (`wa.me/?text=...`) instead of using `navigator.share` or clipboard copy. Apply the same pattern to the Blog share buttons and BlogPost page for consistency.

## Files to Change

| File | Change |
|------|--------|
| `src/pages/Catalogues.tsx` | Replace `shareProduct()` — remove `navigator.share` and clipboard logic, use `window.open("https://wa.me/?text=...")` instead |
| `src/pages/Blog.tsx` | Already uses WhatsApp — no change needed |
| `src/pages/BlogPost.tsx` | Already uses WhatsApp — no change needed |

## Technical Detail

**Before** (Catalogues.tsx line 69-78):
```typescript
async function shareProduct(product: Product) {
  const url = `${SITE_URL}/catalogues?product=${product.id}`;
  const text = `...`;
  if (navigator.share) {
    try { await navigator.share({ title: product.name, text, url }); } catch {}
  } else {
    await navigator.clipboard.writeText(url);
    toast({ title: "Link copied!" });
  }
}
```

**After**:
```typescript
function shareProduct(product: Product) {
  const url = `${SITE_URL}/catalogues?product=${product.id}`;
  const msg = `🛍️ Check out *${product.name}*${product.fabric ? ` (${product.fabric})` : ""} | ${product.pcs_per_set} pcs/set\n\n${url}\n\nBrowse more at Suvee Fashion!`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
}
```

This ensures every tap on the share icon opens WhatsApp with a rich pre-filled message containing the product name, fabric, and direct link.

