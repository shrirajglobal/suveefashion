

# Fix Registration RLS Error + CRO Improvements

## Problem: RLS Policy Blocks Profile Insert

The registration flow calls `supabase.auth.signUp()` then immediately inserts into `buyer_profiles`. Since **email confirmation is required**, the user is NOT authenticated after signup -- `auth.uid()` returns null. The RLS policy `auth.uid() = user_id` therefore rejects the insert.

## Solution

### 1. Create an Edge Function for Registration

Create a `register-buyer` edge function that uses the **service role key** to insert the buyer profile after signup. This bypasses RLS safely since the function validates the user ID from the auth response.

**Flow:**
- Frontend calls `supabase.auth.signUp()` to create the auth user
- Frontend then calls the `register-buyer` edge function with the user ID and profile data
- Edge function uses service role to insert into `buyer_profiles`
- This avoids the RLS issue entirely

| File | Change |
|------|--------|
| `supabase/functions/register-buyer/index.ts` | New edge function: validates input, inserts buyer profile with service role client |
| `src/pages/Register.tsx` | Call edge function instead of direct Supabase insert; CRO improvements |

### 2. CRO Improvements for the Registration Form

Make the form simpler, friendlier, and higher-converting on mobile:

- **Step-based layout**: Split into 2 visual steps (Business Info → Account Setup) with a progress indicator, reducing perceived complexity
- **Friendlier field labels** with placeholder hints inside inputs
- **Move email/password to the top** -- users expect account fields first
- **Inline validation** with green checkmarks as fields are completed
- **Compact mobile layout**: Single column, tighter spacing, larger touch targets
- **Trust badges below the CTA**: "Free • No hidden charges • 24hr approval" in a single line
- **Remove the divider line** (the `<hr>`) -- it breaks visual flow
- **Better loading state**: Show a spinner + "Setting up your account..." message

### Edge Function Logic

```
POST /register-buyer
Body: { user_id, business_name, contact_person, phone, email, city, state, business_type, gst_number?, referral_source? }

1. Validate required fields
2. Create Supabase client with service role key
3. Insert into buyer_profiles
4. Return success/error
```

This is the minimal, secure fix. The edge function runs server-side with elevated privileges, so RLS doesn't block it.

