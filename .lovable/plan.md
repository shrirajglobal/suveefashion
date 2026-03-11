

# CRO Audit & Feature Plan: Buyer Experience + Catalogue PDF

## Issues Found

### 1. Pricing Display Bug (Catalogues Page)
**Current**: Catalogues page shows raw WSP (`₹{product.wsp} WSP/pc`) without applying the buyer's discount. Cart page correctly applies `discountPercent` but the catalogue listing does not.
**Fix**: Apply `discountPercent` from `useAuth()` on the Catalogues page. Show discounted price as primary, WSP as strikethrough, and append "+ 5% GST" label.

### 2. GST Not Visible
**Current**: GST (5%) is only mentioned as a tiny label in Cart. Not shown in Catalogues or product detail dialog.
**Fix**: Add "+ 5% GST" next to all prices. In Cart order summary, compute and display GST amount as a line item before the grand total.

### 3. No Product Filters
**Current**: Only search + category filter. No fabric or price range filter.
**Fix**: Add collapsible filter sidebar (sheet on mobile) with:
- Fabric filter (checkboxes, dynamically populated from products)
- Price range slider (min/max from available products)
- Sort by: Price low-high, high-low, newest

### 4. Catalogue PDF Download (Admin Feature)
**New feature** for admin panel — "Download Catalogue PDF" with:
- Category selector
- Fabric filter
- Price range filter
- **Custom discount % input** (so PDF shows discounted prices only, not WSP)
- Generates a clean, branded PDF with product images, names, fabric, sizes, discounted prices
- Share via WhatsApp button (uses Web Share API or direct WhatsApp link with PDF)

### 5. CRO Improvements for Buyer Journey

| Area | Issue | Fix |
|------|-------|-----|
| **Catalogues** | No personalized welcome for logged-in buyers | Add "Welcome back, {business_name}" banner with discount badge |
| **Catalogues** | Price label says "WSP" — confusing for buyers | Change to "Your Price" for approved buyers |
| **Product Detail** | No "Add to Cart" confirmation feels | Add quantity selector in detail dialog before adding |
| **Cart** | GST total not computed as a number | Show subtotal, GST amount, and grand total as separate lines |
| **Cart** | No estimated delivery info | Add "Estimated delivery: 5-7 business days" note |
| **Dashboard** | No quick reorder option | Add "Reorder" button on past orders |
| **Dashboard** | Profile shows discount_percent but buyer doesn't see their tier | Show "Your Discount Tier: 20% off" badge on profile |

---

## Technical Implementation

### Files to Create
| File | Purpose |
|------|---------|
| `src/components/admin/AdminCatalogueDownload.tsx` | New admin tab for PDF generation with category/fabric/discount filters |
| `supabase/functions/generate-catalogue-pdf/index.ts` | Edge function to generate PDF HTML with filtered products and custom discount |

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/Catalogues.tsx` | Add fabric/price filters, apply discount to displayed prices, show GST, personalized welcome banner |
| `src/pages/Cart.tsx` | Compute GST as line items in summary (subtotal → GST 5% → grand total), store grand total with GST in order |
| `src/pages/Dashboard.tsx` | Show discount tier badge on profile, add reorder button |
| `src/pages/Admin.tsx` | Add "Catalogues" tab linking to AdminCatalogueDownload |
| `src/contexts/AuthContext.tsx` | No changes needed — `discountPercent` already available |

### Catalogue PDF Logic
- Edge function receives: `category_id`, `fabric[]`, `price_min`, `price_max`, `discount_percent`
- Queries products with filters using service role
- Generates clean HTML with Suvee branding, product grid (image, name, fabric, sizes, discounted price)
- Returns HTML string that frontend renders in a new window for print/save-as-PDF
- WhatsApp share: saves PDF as blob, uses Web Share API or falls back to WhatsApp deep link

### Filter Implementation
- Extract unique fabric values from fetched products
- Price range: compute min/max WSP dynamically
- Use Radix Sheet on mobile for filter panel, inline sidebar on desktop
- All filters are client-side (products already fetched)

### Price Display Formula (for approved buyers)
```
displayPrice = WSP × (1 - discountPercent/100)
Show: "₹{displayPrice}/pc + 5% GST"
If discount > 0: show WSP as strikethrough + green "{discount}% off" badge
```

### Cart GST Computation
```
subtotal = sum of (discountedPrice × quantity)
gstAmount = subtotal × 0.05
grandTotal = subtotal + gstAmount
```
Store `grandTotal` as `total_amount` in orders table (currently stores pre-GST amount).

