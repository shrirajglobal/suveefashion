

# Fix Price Font + Size-wise Quantity Selector

## 1. Price Font Readability Fix

**Problem**: Prices use `font-display` (Playfair Display serif) which is decorative and hard to read for numbers, especially on mobile.

**Fix**: Change price text from `font-display` to `font-body` (Poppins sans-serif) in the `PriceDisplay` component. Keep bold weight but use a clean sans-serif for numbers.

**File**: `src/pages/Catalogues.tsx` — lines 126-133 in `PriceDisplay`, and similarly in `Cart.tsx`.

## 2. Size-wise Quantity Selector for Colour Charts

**Problem**: Currently, buyers can only select a total quantity (snapped to pcs_per_set). They cannot pick individual sizes like "1 set of L, 3 sets of XL, skip XXL."

**Solution**: When a product has `available_sizes`, show a per-size quantity picker in the product detail dialog. Each size gets its own +/- stepper (0 = skip that size). 1 size selected = 1 set, 2 sizes = 2 sets, etc. Buyer controls exactly how many sets per size.

### Database Change
Add a `size` column to `cart_items` so each size is a separate cart row:

```sql
ALTER TABLE cart_items ADD COLUMN size text;
-- Create unique constraint on (user_id, product_id, size) to prevent duplicates
ALTER TABLE cart_items ADD CONSTRAINT cart_items_user_product_size_unique 
  UNIQUE (user_id, product_id, size);
```

### Cart Items Data Model
- Product with sizes L, XL selected (1 set L, 3 sets XL, pcs_per_set=4):
  - Row 1: `product_id=X, size="L", quantity=4` (1 set × 4 pcs)
  - Row 2: `product_id=X, size="XL", quantity=12` (3 sets × 4 pcs)
- Products without available_sizes keep `size=null` (backward compatible)

### UI Changes

**Product Detail Dialog** (`src/pages/Catalogues.tsx`):
- When `available_sizes` exists and is non-empty, replace the single qty stepper with a per-size grid
- Each size row: `[Size Badge] [- qty +]` where qty is in sets (displayed as "× sets")
- "Add to Cart" button shows total pcs across all selected sizes
- If no sizes selected, button is disabled

**Cart Page** (`src/pages/Cart.tsx`):
- Show size label next to product name (e.g., "Product Name — Size L")
- Group visually by product if multiple sizes from same product
- Update quantity logic to respect per-size rows

**Order Items** (`src/pages/Cart.tsx` placeOrder):
- Include size in `product_name` field (e.g., "Product Name (L)") so order history is clear

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Catalogues.tsx` | Fix `font-display` → `font-body` in PriceDisplay; rebuild detail dialog qty selector to per-size grid |
| `src/pages/Cart.tsx` | Fix price font; show size labels; handle size-aware cart rows |
| DB migration | Add `size` column + unique constraint to `cart_items` |

