

# Catalogue UX & CRO Optimization Plan

## Current State Assessment

The catalogue currently has: search, category filters, product cards with hover actions, a detail dialog with WhatsApp inquiry, and a bottom CTA for non-logged-in users. The WhatsApp button exists globally but is generic. There is no sharing capability, no product-specific quick inquiry, and the detail dialog requires extra taps to reach WhatsApp.

## Problems to Solve

1. **Too many taps to ask about a product** -- customer must open detail dialog, scroll down, then click WhatsApp
2. **No sharing** -- a buyer can't send a product to their partner/team for decision-making
3. **WhatsApp message is generic** -- doesn't include product details like fabric, sizes, price context
4. **Product card has no instant inquiry** -- only shows on hover, and only eye + cart icons
5. **Detail dialog is text-heavy** -- no clear visual hierarchy for decision-making
6. **No "back to top" or results count feedback** -- browsing fatigue on large catalogues

---

## Plan: 7 Improvements

### 1. One-Tap WhatsApp Inquiry on Every Product Card
Add a small green WhatsApp icon button directly on every product card (always visible, not just on hover). Clicking it opens WhatsApp with a **rich pre-filled message** including product name, fabric, sizes, and pcs/set.

**Pre-filled message format:**
```
Hi Suvee Fashion! I'm interested in:
📦 {Product Name}
🧵 {Fabric} | {Sizes} | {Pcs/Set} pcs
Please share availability and best price.
```

**File:** `src/pages/Catalogues.tsx` — ProductCard component

### 2. Share Button on Product Cards + Detail Dialog
Add a **Share** button (lucide `Share2` icon) on each product card and prominently in the detail dialog. Uses the Web Share API (native on mobile) with fallback to copy-link-to-clipboard.

Share content:
- **Text:** "{Product Name} - {Fabric} | {Pcs/Set} pcs/set"
- **URL:** Current page URL with `?product={product.id}` query param

On page load, if `?product=` param exists, auto-open that product's detail dialog (deep-linking).

**Files:** `src/pages/Catalogues.tsx`

### 3. Richer Detail Dialog with Clear Decision Hierarchy
Restructure the product detail dialog for faster decision-making:

```text
┌─────────────────────────────┐
│  [Product Image - full width]│
│                              │
│  Product Name          [Share]│
│  Fabric • Sizes • Pcs/Set   │
│                              │
│  ┌─────────┐ ┌─────────────┐│
│  │ Colours  │ │ Sizes Grid  ││
│  └─────────┘ └─────────────┘│
│                              │
│  ₹XXX WSP/pc  (if approved) │
│                              │
│  [💬 Ask on WhatsApp] [🛒]  │
│  ← full-width green button   │
└─────────────────────────────┘
```

Key changes:
- WhatsApp button is **full-width, green, prominent** — primary CTA
- Add to Cart is secondary (outline) next to it
- Share icon in the header row
- Product specs shown as a clean grid, not scattered badges

**File:** `src/pages/Catalogues.tsx` — Dialog section

### 4. Sticky "Ask About This" WhatsApp Bar on Catalogue Page
On mobile, when scrolling through catalogues, show a **sticky bottom bar** (above the existing MobileCTABar) that says "Have questions? 💬 Ask on WhatsApp" — a single-tap gateway. This replaces the generic floating WhatsApp button with a contextual one on the catalogues page.

**Files:** `src/pages/Catalogues.tsx` (add sticky bar), `src/components/layout/WhatsAppButton.tsx` (hide on /catalogues route)

### 5. Product Count & Active Filter Feedback
Show results count in real-time as user filters: "Showing 24 of 150 products". When a category is selected, show a dismissible chip: "Cotton Kurtis ✕" so the user always knows their context.

**File:** `src/pages/Catalogues.tsx`

### 6. WhatsApp Pre-fill with Product Image Link
When sending WhatsApp inquiry from the detail dialog, include the product image URL in the message so the customer's message to Suvee includes context without needing to describe the product.

Updated message:
```
Hi Suvee! Interested in this product:
📦 {Name} | 🧵 {Fabric}
📏 {Sizes} | {Pcs/Set} pcs/set
🖼 {image_url}
Please share availability & price.
```

**File:** `src/pages/Catalogues.tsx` — helper function for WhatsApp URL generation

### 7. Deep-Link Support for Product Sharing
When someone shares a product link (`/catalogues?product=abc123`), on page load:
- Parse the `product` query param
- Find the matching product from the fetched list
- Auto-open the detail dialog

This ensures shared links land directly on the product, reducing friction for the recipient.

**File:** `src/pages/Catalogues.tsx` — add `useEffect` with `useSearchParams`

---

## Files Changed

| File | Changes |
|------|---------|
| `src/pages/Catalogues.tsx` | WhatsApp button on cards, share button, dialog redesign, sticky inquiry bar, deep-linking, results count, rich WhatsApp URL helper |
| `src/components/layout/WhatsAppButton.tsx` | Hide on `/catalogues` route (replaced by contextual bar) |

No database changes needed. No new dependencies required (Web Share API is native).

