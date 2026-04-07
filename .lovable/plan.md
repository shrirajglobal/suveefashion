

# Fix: Hide Prices for Non-Logged-In Users Across All Sections

## Problem
The Catalogues page correctly gates prices behind login (showing "Login to see prices" for guests), but the **New Arrivals page** and the **Homepage new arrivals section** display `₹{wsp} per piece` to everyone — no login check.

## Changes

### 1. `src/pages/NewArrivals.tsx`
- Import `useAuth` from `@/contexts/AuthContext`
- Pass `user` and `buyerStatus` into `NewArrivalCard`
- In the card, replace the unconditional `<p>{product.priceRange}</p>` with:
  - If approved buyer → show price
  - If not logged in → show "Login to see prices" link
  - If logged in but not approved → show nothing (or "Approval pending")

### 2. `src/pages/Index.tsx` — Homepage New Arrivals Section (~line 445)
- Import `useAuth` (already available via context)
- Replace the unconditional `{p.wsp && <p>₹{p.wsp} per piece</p>}` with the same login-gated logic:
  - Approved → show price
  - Not logged in → "Login to see prices"
  - Pending → hide

### 3. JSON-LD Schema (NewArrivals.tsx ~line 131)
- Keep the `price` in structured data (search engines need it for rich results) — this is not user-visible, so no change needed there.

## Summary
Two files modified. The price-gating logic mirrors what already exists in the `PriceDisplay` component on the Catalogues page.

