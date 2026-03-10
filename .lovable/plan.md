

## Colour Chart Flow Redesign

### Problem
Currently, when "Colour Chart" is selected, the admin only picks sizes. But the actual business logic is: each bundle has N pieces of **different colours** in the **same size**. The admin needs to specify which colours are in the set.

### Proposed UX Flow (Step-by-step, guided)

When **Colour Chart** is selected:

```text
Step 1: Set "Pcs per Bundle" (e.g., 4)
Step 2: Pick exactly 4 colours via searchable multi-select (with validation)
Step 3: Pick available sizes (checkboxes S–10XL)
```

The form enforces that the number of selected colours **must equal** `pcs_per_set`. A visual counter shows "2 of 4 colours selected" so the admin knows exactly what's needed.

### Technical Plan

**1. Database Migration**
- Add `available_colours` column (text array) to `products` table

**2. Colour Picker Component**
- Create a searchable multi-select using `cmdk` (already installed) inside a Popover
- Predefined colour list: ~30 common Indian garment colours (Maroon, Navy Blue, Teal, Mustard, Peach, Coral, Wine, Bottle Green, Rani Pink, Rust, Magenta, Olive, Beige, Off White, Black, White, Grey, Red, Royal Blue, Sky Blue, Lavender, Mint Green, Cream, Dusty Pink, Burgundy, Emerald, Plum, Tan, Chocolate, Sea Green)
- Allow typing to filter/search
- Show selected colours as removable badges/chips
- Validation: exactly `pcs_per_set` colours must be selected before saving

**3. Updated Form Flow in AdminProducts.tsx**
- When `bundle_type === "colour_chart"`:
  - Show colour picker **first** with label: "Select {pcs_per_set} colours in this set"
  - Show counter: "{n} of {pcs_per_set} selected" (green when matched, red when not)
  - Show size checkboxes **below** colours with label: "Available sizes (customer picks)"
- When `bundle_type === "combo"`: unchanged (sizes only)
- When `bundle_type === "assorted"`: unchanged (description only)

**4. Save Validation**
- Block save if `bundle_type === "colour_chart"` and `available_colours.length !== pcs_per_set`
- Toast error: "Please select exactly {N} colours for the colour chart"

**5. Product Form State**
- Add `available_colours: string[]` to `ProductForm` interface and `emptyForm`
- Persist to/from `products.available_colours` column

**6. Display**
- Show selected colours in the product card list view as small text below bundle type

