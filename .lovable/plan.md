

# Super Admin + Sub-Admin Roles

## Current State
- `suvee.fashion@gmail.com` already has the `admin` role in `user_roles`
- The `app_role` enum has: `admin`, `buyer`
- All admin checks use `has_role(uid, 'admin')` — no role hierarchy exists

## Plan

### 1. Database: Add `sub_admin` to `app_role` enum
Add a new enum value `sub_admin` via migration. No new tables needed — sub-admins are just users with role `sub_admin` in `user_roles`.

### 2. Update `AuthContext.tsx`
- Add `isSubAdmin` boolean (checks for `sub_admin` role)
- Keep `isAdmin` as-is (only true for `admin` role = super admin)

### 3. Update `Admin.tsx` — role-based tab visibility
- **Super admin (`admin` role)**: Sees all 9 tabs + a new "Sub-Admins" tab to manage sub-admins
- **Sub-admin (`sub_admin` role)**: Sees only Categories, Products, Catalogue tabs. No access to Buyers, Orders, Inquiries, Analytics, Insights, Banners, or Sub-Admins management

### 4. Create `AdminSubAdmins.tsx` component (super admin only)
- Lists current sub-admins (query `user_roles` where role = `sub_admin`, join with `buyer_profiles` or `auth.users` email)
- "Add Sub-Admin" form: enter email of an existing registered user → inserts `sub_admin` role
- "Remove" button to delete the sub_admin role entry
- Uses an edge function to look up user by email (since `auth.users` isn't accessible from client)

### 5. Edge function: `manage-sub-admin`
- Accepts `{ action: "list" | "add" | "remove", email?: string }`
- Uses service role key to query `auth.users` by email, then insert/delete from `user_roles`
- Validates caller is `admin` role before proceeding

### 6. RLS: Add policies for sub_admin
- Add SELECT policies on `products`, `categories` for sub_admin (already public, so no change needed)
- Add INSERT/UPDATE/DELETE on `products` and `categories` for sub_admin users
- No changes to other tables — sub-admins won't have access

### Files Changed
- **Migration**: ALTER TYPE app_role ADD VALUE 'sub_admin'; new RLS policies on products/categories for sub_admin
- **`src/contexts/AuthContext.tsx`**: Add `isSubAdmin` field
- **`src/pages/Admin.tsx`**: Conditional tab rendering based on role; add Sub-Admins tab
- **New `src/components/admin/AdminSubAdmins.tsx`**: Sub-admin management UI
- **New `supabase/functions/manage-sub-admin/index.ts`**: Edge function for user lookup and role management

