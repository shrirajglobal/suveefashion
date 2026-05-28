

# Code Audit Fixes — Suvee Fashion

I'll apply all critical, major, and relevant minor fixes from the audit report. No unrelated changes.

## Critical & Major Bugs

1. **WhatsApp share URLs (Bug #1)** — Replace `web.whatsapp.com/send?text=` with `wa.me/?text=` in `Catalogues.tsx`, `Blog.tsx`, `AdminCatalogueDownload.tsx`. Add `navigator.share()` fallback in product/blog share functions.

2. **Missing OG image (Bug #2)** — Generate a 1200×630 `og-default.jpg` (brand visual) into `/public/`. Add `og:image:width` and `og:image:height` meta tags in `SEOHead.tsx`.

3. **Catalogues error handling (Bug #3)** — Wrap `fetchData()` in `try/catch/finally` with toast on failure, `setLoading(false)` in finally.

4. **Dashboard guard (Bug #4)** — Add `buyerStatus` to useEffect deps; redirect rejected users to `/contact` with toast.

5. **Contact WhatsApp encoding (Bug #5)** — Use real `\n` newlines and wrap whole message in `encodeURIComponent()`.

6. **AuthContext race (Bug #6)** — Remove redundant `supabase.auth.getSession()` call; rely on `onAuthStateChange` INITIAL_SESSION event.

7. **Catalogues URL deep-link sync (Bug #7)** — Split into separate `useEffect` keyed on `[searchParams, products]`.

8. **Header language dropdown outside click (Bug #8)** — Add `useRef` + `mousedown` listener to close on outside click.

9. **SEOHead stale tags (Bug #9)** — In cleanup, reset `og:image` to default to prevent stale tags between routes.

## Minor Issues

- **M1** Install.tsx: replace `font-playfair` → `font-display`.
- **M2** Cart.tsx: add toast when redirecting non-approved buyers.
- **M3** BlogPost.tsx: hide related-posts section cleanly when empty (or show fallback).
- **M4** NewArrivals.tsx: add share button to product cards using fixed `wa.me` pattern.
- **M5** Advisor.tsx: disable Send button while a request is in-flight.
- **M6** Verify `public/robots.txt` and remove any `Disallow: /`.
- **M7** AdminBanners.tsx: add basic URL validation + image preview before save.
- **M8** Header.tsx: refresh cart count on cart mutations (listen to a custom `cart:updated` event dispatched from cart add/remove sites).

## Skipped

- **Bug #10 (.env in repo)** — Lovable-managed; `.env` is auto-generated and gitignored. No action needed in code.

## Files Touched

`src/pages/Catalogues.tsx`, `src/pages/Blog.tsx`, `src/pages/BlogPost.tsx`, `src/pages/Contact.tsx`, `src/pages/Dashboard.tsx`, `src/pages/Cart.tsx`, `src/pages/Install.tsx`, `src/pages/NewArrivals.tsx`, `src/pages/Advisor.tsx`, `src/components/SEOHead.tsx`, `src/components/layout/Header.tsx`, `src/components/admin/AdminCatalogueDownload.tsx`, `src/components/admin/AdminBanners.tsx`, `src/contexts/AuthContext.tsx`, `public/og-default.jpg` (generated), `public/robots.txt` (if needed).
