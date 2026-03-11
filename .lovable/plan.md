

# Replace All Lovable URLs with suveewholesale.com

All shared links, canonical URLs, SEO meta tags, and JSON-LD structured data currently reference `suveefashion.lovable.app`. These need to be updated to `suveewholesale.com`.

## Changes

### 1. Create a central site URL constant
Add `const SITE_URL = "https://suveewholesale.com"` in a shared location (e.g. `src/lib/constants.ts`) so all files reference one place.

### 2. Update dynamic share links (use SITE_URL instead of `window.location.origin`)
- **`src/pages/Blog.tsx`** — `shareWhatsApp()` and `copyLink()` 
- **`src/pages/BlogPost.tsx`** — `postUrl` and share functions
- **`src/pages/Catalogues.tsx`** — `shareProduct()` function

### 3. Update SEO/canonical references
- **`src/components/SEOHead.tsx`** — default `ogImage` URL
- **`src/pages/Index.tsx`** — JSON-LD org schema + canonical
- **`src/pages/Blog.tsx`** — canonical URL
- **`src/pages/BlogPost.tsx`** — JSON-LD article schema URLs
- **`index.html`** — canonical link + OG meta tags

### 4. Update edge function
- **`supabase/functions/generate-blog-post/index.ts`** — social post URL

### 5. Email redirect
- **`src/pages/Register.tsx`** — `emailRedirectTo` stays as `window.location.origin` (this must match the actual running domain for auth to work, so no change needed here)

**Note**: You'll need to connect `suveewholesale.com` as a custom domain in project settings for the URLs to actually resolve. The code change ensures all *shared/displayed* links use the branded domain.

