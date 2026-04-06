

# Fix: Invisible Buttons + Masked Phone Numbers in Blog Content

## Problem 1: Invisible Buttons on Dark Backgrounds
Outline buttons using `border-white/30` are nearly invisible on `gradient-maroon` backgrounds across:
- **Index.tsx line 280**: Hero "Register Free" button
- **Index.tsx line 644**: Bottom CTA "WhatsApp Us" button  
- **Index.tsx line 649**: Bottom CTA "Join WhatsApp Community" button

**Fix**: Change `border-white/30` to `border-white/60` on all three buttons for clear visibility.

## Problem 2: Masked Phone Numbers in Existing Blog Posts
Two published blog posts contain `+91-XXXXXXXXXX` instead of the real number in their content (English, Hindi, and Bengali versions):
- "Scale Your Kurti Business: From Local to Meesho Top Seller" (id: `20678612-...`)
- "How to Identify High-Quality Wholesale Kurtis" (id: `b8e12348-...`)

**Fix**: Run a database migration to replace all `XXXXXXXXXX` occurrences with `9831640808` across `content`, `content_hi`, and `content_bn` columns for these posts.

## Problem 3: Future Blog Posts May Also Mask the Number
The `generate-blog-post` edge function prompt tells the AI to include a CTA with "WhatsApp us" but doesn't provide the actual phone number, so the AI model redacts it.

**Fix**: Add an explicit instruction in the blog generation prompt:
> "Always use the real WhatsApp number +91-9831640808 in CTAs. Never mask or redact it."

## Changes Summary

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | `border-white/30` → `border-white/60` on 3 buttons |
| DB migration | Replace `XXXXXXXXXX` with `9831640808` in 2 blog posts (all language columns) |
| `supabase/functions/generate-blog-post/index.ts` | Add phone number instruction to blog prompt |

