

## Root Cause: Cursor Losing Focus

The `ProductFormFields` is defined as **a React component inside the render body** of `AdminProducts` (line 224). Every keystroke updates `form` state, which re-renders the parent, which **recreates `ProductFormFields` as a brand-new component**. React unmounts and remounts the entire form, causing the cursor to jump away from the input.

## Fix

**Convert `ProductFormFields` from an inline component to inline JSX.** Instead of `<ProductFormFields />`, directly render the JSX where it's used (in both the single-add and bulk-add dialogs). This prevents React from treating it as a new component on every render.

### Approach
1. Remove the `const ProductFormFields = () => (...)` wrapper (lines 224-343).
2. Extract the JSX content and paste it directly inside both dialog bodies (replacing `<ProductFormFields />` on lines 398 and 449).
3. Since the JSX is identical in both places, create a helper variable (`const formFieldsJSX = (...)`) that returns JSX **without being a component** — just a variable holding JSX, not a function component. This avoids duplication while keeping React's reconciliation stable.

### File Changed
- `src/components/admin/AdminProducts.tsx` — replace inline component with JSX variable

No database or other file changes needed.

