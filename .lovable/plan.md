
Goal: fix registration/login end-to-end so users never get stuck on “Profile creation failed”, and make the auth journey simpler on mobile.

What I found
1) Root cause is confirmed in backend auth logs: repeated signups are happening (`user_repeated_signup`).
2) In that case, signup returns a non-usable user id pattern for profile insert flow, so `register-buyer` tries inserting `buyer_profiles.user_id` that doesn’t exist in `auth.users`, causing FK error 23503.
3) Existing affected users can have a real account but no buyer profile, so they loop between Register/Login.

Implementation plan

1) Harden registration decision logic in `src/pages/Register.tsx`
- Detect repeated-signup response before calling profile creation.
- If repeated signup is detected:
  - stop submission gracefully (no edge function call),
  - show clear message: “Account already exists. Please sign in to continue.”
  - route user to login with prefilled email.
- Keep email verification required (no auto-confirm change).

2) Make Register support “complete profile” mode for logged-in users
- If user is already authenticated and has no buyer profile:
  - skip email/password step,
  - show only business details step,
  - create/update profile directly for current `auth.uid()` (RLS-safe).
- This fixes already-created accounts that failed earlier.

3) Improve login flow recovery in `src/pages/Login.tsx`
- After successful sign-in:
  - check if buyer profile exists.
  - if missing, redirect to Register in “complete profile” mode with friendly toast.
  - if present, continue to catalog/dashboard as normal.
- Add better error messaging for:
  - unverified email,
  - wrong password,
  - account exists but needs profile completion.

4) Strengthen edge function resilience in `supabase/functions/register-buyer/index.ts`
- Validate UUID format and required fields more strictly.
- Verify user existence before insert (service-role check) and return 4xx with useful message instead of generic 500.
- Use idempotent insert/upsert behavior on `user_id` to avoid duplicate failure loops.
- Map known DB/auth errors to clean client-consumable responses.

5) Small auth state polish in `src/contexts/AuthContext.tsx`
- Add safe error handling for `fetchUserMeta` so auth UI never silently stalls.
- Keep buyer/admin status reset behavior consistent on sign-out and session transitions.

6) Routing updates in `src/App.tsx` (if needed for clean flow)
- Ensure Register page can handle:
  - new signup,
  - logged-in profile completion,
  - redirect away when user already fully onboarded.

Technical details
- No database schema migration required for this fix.
- RLS remains intact; we are not broadening table access.
- Core repeated-signup detection in client will use signup response shape (identities/session patterns) to prevent invalid profile inserts.
- We will keep email verification flow intact and avoid insecure shortcuts.
- We will preserve current design language and CRO structure, only improving friction/error states.

Validation checklist (must pass)
1) Brand-new email: signup succeeds, profile creation succeeds, user sees verify-email success.
2) Existing email on Register: gets friendly “already exists” path, no 500 edge-function toast.
3) Existing user with missing profile: login redirects to complete-profile mode and profile saves successfully.
4) Unverified account login: clear guidance shown (no confusing generic error).
5) Mobile (current viewport size): full flow works without clipped toasts/buttons.

Files to update
- `src/pages/Register.tsx`
- `src/pages/Login.tsx`
- `src/contexts/AuthContext.tsx`
- `supabase/functions/register-buyer/index.ts`
- `src/App.tsx` (only if route-mode handling is needed)
