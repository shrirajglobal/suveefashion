

# Fix: WhatsApp Share Links Still Showing SSL Error

## Root Cause (Deep Analysis)

The previous fix only updated `src/lib/constants.ts`. However, **5 other locations** still hardcode `suveewholesale.com`:

Additionally, when I navigated to `https://suveefashion.lovable.app`, it **redirects to `https://www.suveewholesale.com`** via your custom domain setup. The SSL certificate is valid for `www.suveewholesale.com` but **NOT for `suveewholesale.com`** (without `www`). So any link pointing to `suveewholesale.com` (no www) fails with the SSL error.

**The real fix has two parts:**

1. **Code fix**: Replace all remaining `suveewholesale.com` references with `www.suveewholesale.com` (which has a working SSL cert), OR keep using `suveefashion.lovable.app` until the bare domain SSL is fixed.

2. **Domain fix**: In your Lovable project settings under Domains, make sure both `suveewholesale.com` AND `www.suveewholesale.com` are added. Currently only `www` appears to be working.

## Files to Fix

| File | Current | Fix |
|------|---------|-----|
| `src/lib/constants.ts` | `https://suveefashion.lovable.app` | Keep as-is (redirects to www correctly) |
| `index.html` (line 15) | `https://suveewholesale.com` canonical | Change to `https://suveefashion.lovable.app` |
| `src/components/SEOHead.tsx` (line 15) | `https://suveewholesale.com/og-default.jpg` | Change to `https://suveefashion.lovable.app/og-default.jpg` |
| `public/robots.txt` (line 16) | `https://suveewholesale.com/sitemap.xml` | Change to `https://suveefashion.lovable.app/sitemap.xml` |
| `supabase/functions/generate-catalogue-pdf/index.ts` (line 8) | `const SITE_URL = "https://suveewholesale.com"` | Change to `https://suveefashion.lovable.app` |
| `supabase/functions/generate-blog-post/index.ts` (line 372) | `https://suveewholesale.com/blog/...` | Change to `https://suveefashion.lovable.app/blog/...` |

## Important Note
After these code fixes, you should also **republish** the app (click Update in the publish dialog) so the frontend changes go live. Backend function changes deploy automatically.

## Domain Recommendation
To permanently fix this, check your domain settings and ensure both `suveewholesale.com` (root) and `www.suveewholesale.com` are configured. You can check this in Project Settings > Domains.

