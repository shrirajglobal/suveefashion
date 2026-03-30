

# Fix: WhatsApp Share Links Broken Due to SSL Issue

## Problem
The share button on product cards builds URLs using `SITE_URL = "https://suveewholesale.com"`. This domain has an SSL certificate error (`ERR_SSL_VERSION_OR_CIPHER_MISMATCH`), so anyone who receives the shared WhatsApp link gets an error page.

## Root Cause
The custom domain `suveewholesale.com` does not have a valid SSL certificate. This is a hosting/DNS configuration issue, not a code bug.

## Recommended Fix
**Option A (temporary):** Update `SITE_URL` in `src/lib/constants.ts` to `https://suveefashion.lovable.app` so shared links work immediately while the custom domain SSL is being resolved.

**Option B (permanent):** Fix the custom domain SSL by ensuring DNS records are correctly pointed to Lovable's servers. Once SSL is active, `SITE_URL` can stay as `https://suveewholesale.com`.

## Plan (Option A - Temporary)

| File | Change |
|------|--------|
| `src/lib/constants.ts` | Change `SITE_URL` from `https://suveewholesale.com` to `https://suveefashion.lovable.app` |

Once the custom domain SSL is working, we switch it back.

## Affected Features
All share links across the app use `SITE_URL`:
- Product share buttons on Catalogues page
- Blog post share buttons
- Admin catalogue WhatsApp share
- Any other WhatsApp/share links

