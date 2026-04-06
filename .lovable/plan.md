

# Add New Arrivals Page + Homepage Section

## Overview
Create a `/new-arrivals` page and a "New Arrivals This Season" section on the homepage, both driven by a static JSON data file for easy editing. Products will be fetched from the existing catalogue (products table) filtered by `is_new_arrival = true`, but the JSON file will provide curated display overrides (style name, price range text, MOQ text) for the landing page cards.

**Revised approach**: Since the user wants to fetch from existing live catalogues, we'll query the `products` table for `is_new_arrival = true` products directly. The JSON file will serve as an optional override/curation layer — but the primary data source is the database. This keeps things in sync with the live catalogue.

## Files to Create/Modify

### 1. `public/data/arrivals.json` (New)
Static JSON file with curated new arrival product IDs and optional display overrides:
```json
[
  { "productId": "uuid-from-db", "priceRange": "₹199–₹499", "moq": "1 Set (6 pcs)" },
  ...
]
```
If `productId` matches a DB product, the card pulls image/name/fabric from DB and uses JSON overrides for priceRange/moq. Fallback: if no JSON match, show DB `is_new_arrival` products directly.

### 2. `src/pages/NewArrivals.tsx` (New)
- Full page at `/new-arrivals`
- SEO: title "New Arrivals — Latest Kurti Designs | Suvee Wholesale", meta description, canonical
- Fetches products where `is_new_arrival = true` from DB
- Merges with `arrivals.json` overrides
- Product cards: image, style name, fabric, MOQ badge, price range, "Get Catalogue" WhatsApp button
- Product schema JSON-LD for each item (name, description, brand "Suvee Wholesale", offers with priceRange, availability InStock)

### 3. `src/pages/Index.tsx` (Modify)
- Add a "New Arrivals This Season" section after the Collections carousel
- Show up to 8 new arrival products in a responsive grid (2 cols mobile, 4 cols desktop)
- Each card mirrors the NewArrivals page card design
- "View All New Arrivals →" link to `/new-arrivals`

### 4. `src/App.tsx` (Modify)
- Add route: `<Route path="/new-arrivals" element={<NewArrivals />} />`

## Card Design
Each product card will show:
- Product image (from DB `image_url`)
- Style name (product `name`)
- Fabric badge
- MOQ badge (from JSON override or `pcs_per_set`)
- Price range text (from JSON override or formatted from `wsp`)
- Green "Get Catalogue" WhatsApp button linking to `wa.me/919831640808` with pre-filled product inquiry message

## JSON-LD Schema
On `/new-arrivals`, emit a combined JSON-LD with individual `Product` entries:
```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "Product",
      "name": "...",
      "description": "...",
      "brand": { "@type": "Brand", "name": "Suvee Wholesale" },
      "offers": { "@type": "AggregateOffer", "priceCurrency": "INR", "availability": "https://schema.org/InStock", "lowPrice": "...", "highPrice": "..." },
      "image": "..."
    }
  ]
}
```

## Technical Notes
- Reuses existing patterns: `supabase` client, `SEOHead`, `motion` animations, `Card`/`Badge` components, WhatsApp URL builder
- The JSON file at `public/data/arrivals.json` can be edited without touching code — just update product IDs and override fields

