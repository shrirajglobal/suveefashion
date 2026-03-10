

## Issues to Fix

### 1. Cursor Jumping (Root Cause)
All `onChange` handlers in the form use `setForm({ ...form, field: value })` which captures `form` from the closure. When ColourPicker or any other field triggers a state update, the stale closure overwrites concurrent changes, causing React to re-render with incorrect state and lose input focus.

**Fix**: Convert every `setForm({ ...form, ... })` to `setForm(f => ({ ...f, ... }))` (functional updater pattern) throughout `AdminProducts.tsx`. This ensures each update reads the latest state.

### 2. Add "Multicolour" Option
Add "Multicolour" to the `GARMENT_COLOURS` array in `ColourPicker.tsx`. This gives it the same select/deselect behavior as any other colour.

### 3. Make All Fields Mandatory (Except Description)
Update validation in both `saveProduct` and `handleBulkAdd` to require:
- Name, Fabric, Category, Pcs per Set, WSP, Bundle Type, Sizes display text, Image (single add)
- For bulk add: also require at least 1 image uploaded

Mark labels with `*` for all mandatory fields. Description remains optional.

### Files Changed
- `src/components/admin/AdminProducts.tsx` — functional updaters + validation
- `src/components/admin/ColourPicker.tsx` — add "Multicolour"

