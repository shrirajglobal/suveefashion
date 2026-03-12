

# Catalogues Page: Sidebar Filter Layout

## Current State
The page has filters displayed in a horizontal bar below the category tabs on desktop, and in a slide-out sheet on mobile. Products span the full width. This makes filters hard to use and wastes vertical space.

## Proposed Layout

### Desktop (md+)
Two-column layout with a sticky left sidebar (width ~280px) containing all filters (Sort, Fabric checkboxes, Price slider, Clear button) and products in a scrollable right area. The category tabs and search stay at the top spanning full width. Product grid changes from 4 columns to 3 columns in the right area.

```text
┌─────────────────────────────────────────────┐
│  Search bar + Category tabs (full width)    │
├──────────┬──────────────────────────────────┤
│ Filters  │  Product count + chips           │
│ (sticky) │  ┌─────┐ ┌─────┐ ┌─────┐       │
│          │  │ Card │ │ Card │ │ Card │       │
│ Sort     │  └─────┘ └─────┘ └─────┘       │
│ Fabric   │  ┌─────┐ ┌─────┐ ┌─────┐       │
│ Price    │  │ Card │ │ Card │ │ Card │       │
│ Clear    │  └─────┘ └─────┘ └─────┘       │
└──────────┴──────────────────────────────────┘
```

### Mobile
Keep the existing sheet-based filter (slide from right). No sidebar. Product grid stays 2 columns.

## Changes

### `src/pages/Catalogues.tsx`
1. Remove the desktop horizontal filter bar (`hidden md:block border-b...` section, lines 669-680)
2. Wrap the products area (lines 682-717) in a flex container with a sticky left sidebar on `md+`
3. Left sidebar renders `<FilterContent>` + clear button + product count
4. Right side renders filter chips + product grids
5. Product grid: change `lg:grid-cols-4` to `lg:grid-cols-3` since sidebar takes space

No other files need changes. Mobile layout stays the same.

