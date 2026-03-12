

# Replace Lovable Branding with Suvee Logo

## Problem
The favicon is Lovable's default `public/favicon.ico`. JSON-LD schema references `/favicon.ico` as the org logo. No custom auth email templates exist (default Lovable emails are used for verification).

## Changes

### 1. Replace favicon
- Copy `src/assets/logo-final.png` to `public/favicon.png`
- Update `index.html` to reference `/favicon.png` instead of the default `/favicon.ico`
- Delete or replace `public/favicon.ico`

### 2. Update JSON-LD logo references
- `src/pages/Index.tsx` and `src/pages/BlogPost.tsx` — change `/favicon.ico` to `/favicon.png`

### 3. Auth verification emails
The project uses default auth emails (no custom templates). To brand the verification email with the Suvee logo and remove Lovable branding, we need to scaffold custom auth email templates. This requires a custom email domain to be configured first.

**If no email domain is set up yet**, I'll note this as a follow-up step. The favicon and JSON-LD fixes can proceed immediately.

