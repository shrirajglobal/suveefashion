## Fix: Catalogues (and New Arrivals) fail to load for guests

### Root cause
The security hardening migration revoked `SELECT` on `products.wsp` from the `anon` role. Any anonymous query that touches `wsp` — including `select("*")` — is rejected by PostgREST with a column-permission error. That is exactly what's happening on `/catalogues` (shown as the red "Failed to load products" toast). `Index.tsx` and `NewArrivals.tsx` have the same bug but fail silently (no error handler), so guests see empty new-arrival sections too.

### Fix strategy
Only request `wsp` when the user is authenticated. Guests get every other column; the UI already gates price display behind login via `PriceDisplay`, so hiding the value at the query layer is safe.

### Changes

1. **`src/pages/Catalogues.tsx`** (fetch around line 454-480)
   - Replace `.select("*")` with an explicit column list containing every field the `Product` interface uses **except** `wsp`.
   - If `user` from `useAuth()` exists, include `wsp` in the select; otherwise omit it and treat `wsp` as `null` in state.
   - Add `user` to the effect deps so the query re-runs after login and prices become available without a refresh.

2. **`src/pages/Index.tsx`** (new-arrivals effect ~line 153)
   - Same treatment: drop `wsp` from the select when there's no `user`; include it when logged in. Add `user` to deps.

3. **`src/pages/NewArrivals.tsx`** (load function ~line 110)
   - Same treatment: conditional `wsp`, add `user` to deps.

4. **`src/components/admin/AdminCatalogueDownload.tsx`** and **`src/pages/Admin.tsx`**
   - These run inside the admin area (authenticated), so `select("*")` is fine — no change.

5. **Edge function `supabase/functions/generate-catalogue-pdf`**
   - Runs with the service role, unaffected — no change.

### Why not re-grant `SELECT` on `wsp` to `anon`?
That would undo the security fix that prevents scraping wholesale prices without login. The application already treats prices as auth-gated, so the correct fix is to align the query with that policy.

### Verification
- Load `/catalogues` while signed out → products render, prices show "Login to see prices".
- Load `/catalogues` while signed in as approved buyer → products render with prices.
- Home page and `/new-arrivals` both show cards for guests.
- No red error toast; no console permission-denied error.
