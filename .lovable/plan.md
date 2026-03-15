

# Fix: Mobile Responsiveness, PDF Download, and Old Banners

## Summary of Issues & Fixes

### 1. Remove Old Fallback Banners
The homepage code imports 6 hardcoded hero images (`hero-product-1.jpg` through `hero-product-6.jpg`) as fallback slides. The database has only 1 active banner. When DB banners load, they replace the fallback, but the old images still flash briefly and add unnecessary bundle weight.

**Fix:** Remove all `heroProduct` imports and the `fallbackSlides` array. Use a simple loading state — show nothing (or a skeleton) until DB banners load. If DB returns empty, show a single gradient placeholder instead of 6 old product images.

### 2. Admin Panel — Mobile-Friendly Tabs
The admin panel uses `grid-cols-4 md:grid-cols-10` for the TabsList with 10 tabs. On mobile this creates 4 columns of tiny, unreadable tab buttons.

**Fix:** Replace the grid-based TabsList with a horizontally scrollable flex container using `overflow-x-auto` and `whitespace-nowrap`. Each tab trigger gets `flex-shrink-0`. This lets users swipe through tabs on mobile. Also hide tab label text on small screens, showing only icons (with tooltips or aria-labels).

### 3. PDF Download on Mobile (Ctrl+P Issue)
The catalogue PDF opens in a new browser tab with an HTML page and a "Print / Save PDF" button that calls `window.print()`. The admin UI says "Use Ctrl+P to save as PDF" which doesn't work on mobile.

**Fix in `AdminCatalogueDownload.tsx`:** Change the toast message from "Use Ctrl+P" to "Use the Print/Save PDF button at the top of the page". The edge function already has a `<button onclick="window.print()">` which works on mobile Safari/Chrome, so the actual PDF generation works — only the user instruction is wrong.

### 4. Landing Page Mobile Improvements
The landing page is already fairly responsive, but a few tweaks:
- The category carousel nav buttons (`-left-2`, `-right-2`) can overlap content on small screens — adjust positioning
- Ensure the bottom CTA section buttons don't get cut off by the MobileCTABar (already has `pb-16 md:pb-0`)

### 5. Other Pages — Minor Mobile Fixes
- About/Contact pages look acceptable but will benefit from slightly smaller heading text on mobile (already using responsive classes mostly)

## Files to Change

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Remove 6 hero image imports and `fallbackSlides`. Use empty array + loading skeleton until DB banners load. |
| `src/pages/Admin.tsx` | Replace grid TabsList with scrollable flex layout. Show icon-only on mobile, icon+text on `sm:` and up. |
| `src/components/admin/AdminCatalogueDownload.tsx` | Fix toast message: remove "Ctrl+P" reference, say "Use the Print/Save PDF button". |
| `src/assets/hero-product-*.jpg` | Delete these 6 files to reduce bundle size. |

## Technical Details

**Admin TabsList scrollable pattern:**
```text
TabsList: flex overflow-x-auto w-full (no grid)
TabsTrigger: flex-shrink-0, icon only on mobile, sm:inline text
```

**Hero banner loading state:**
```text
heroSlides starts as [] 
→ fetch DB banners 
→ if data.length > 0: setHeroSlides(data) 
→ if empty: show gradient placeholder
→ while loading: show skeleton/shimmer
```

