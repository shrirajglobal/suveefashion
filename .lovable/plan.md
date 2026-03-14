

# Fix Mobile Input Issues in Product Forms

## Problem
The product add/edit dialogs use `grid grid-cols-2` layouts for fields like "Pcs per Set" and "WSP", making them too cramped on mobile screens. Number inputs with `type="number"` can also behave poorly on mobile browsers (scroll interference, tiny steppers, hard to tap).

## Changes

### `src/components/admin/AdminProducts.tsx`

1. **Make grid layouts responsive**: Change `grid grid-cols-2 gap-3` to `grid grid-cols-1 gap-3 sm:grid-cols-2` for the Fabric/Category row (line 258) and Pcs/WSP row (line 282). This stacks fields vertically on mobile for easier tapping.

2. **Improve number inputs**: Add `inputMode="numeric"` to number fields (pcs_per_set, wsp) so mobile browsers show the numeric keypad without the problematic native number spinner. Consider switching from `type="number"` to `type="text" inputMode="numeric"` to avoid scroll-hijacking by number inputs on mobile.

3. **Increase touch targets**: Ensure inputs have adequate height on mobile — the existing `h-10` from the Input component should be sufficient, but the label + input pairs need breathing room in single-column layout.

These are small CSS and attribute changes in the shared `formFieldsJSX` block, which affects both the single-add and bulk-add dialogs automatically.

