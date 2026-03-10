

# Phase 1: SEO Foundation + AI Blog System

This is a large but self-contained phase. Here's what will be built:

---

## 1. Database: `blog_posts` Table

```sql
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_hi text,
  title_bn text,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  content_hi text,
  content_bn text,
  excerpt text,
  excerpt_hi text,
  excerpt_bn text,
  cover_image_url text,
  meta_description text,
  keywords text[] DEFAULT '{}',
  category text DEFAULT 'business-tips',
  status text DEFAULT 'published',
  social_caption text,
  social_caption_hi text,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
```

- RLS: SELECT open to everyone (public blog), INSERT/UPDATE/DELETE admin-only
- Enable realtime not needed for blog

## 2. Edge Function: `generate-blog-post`

New edge function using Lovable AI (`google/gemini-3-flash-preview`):
- Picks a topic from a rotating bank of retailer challenges (sourced from `chat_insights` table + hardcoded topic list covering: starting kurti business, seasonal trends, display tips, pricing strategy, fabric guides, customer retention, digital marketing, festival preparation)
- Generates an 800-1200 word SEO-optimized post in simple Hindi-English mixed tone
- Auto-translates to Hindi and Bengali
- Generates excerpt, meta description, social caption, slug, keywords
- Saves with `status: 'published'`

Will be callable manually for now. Scheduling (pg_cron) deferred to Phase 2.

## 3. SEOHead Component

New `src/components/SEOHead.tsx` — a reusable component that uses `useEffect` to set:
- `document.title`
- Meta description via `document.querySelector('meta[name="description"]')`
- OG title, description, image via similar DOM manipulation
- Canonical URL

Applied to every page: Index, About, Contact, Catalogues, Blog, BlogPost, Advisor, Login, Register.

## 4. Blog Pages

**`src/pages/Blog.tsx`** — Listing page:
- Fetches published posts ordered by `published_at` desc
- Category filter chips (business-tips, seasonal-trends, fabric-guide, etc.)
- Search by title
- Beautiful card layout with cover image, title (in current language), excerpt, date, category badge
- Share button per card (WhatsApp + copy link)

**`src/pages/BlogPost.tsx`** — Detail page:
- Fetches by slug from URL params
- Renders content in current site language (auto-switches via `useLanguage`)
- Uses `react-markdown` for content rendering
- JSON-LD `BlogPosting` structured data
- SEOHead with post-specific title, description, OG image
- Share buttons (WhatsApp, copy link)
- Related posts section (same category, limit 3)
- CTA to catalogue or WhatsApp at bottom

## 5. Navigation & Routing

- Add `/blog` and `/blog/:slug` routes to `src/App.tsx`
- Add "Blog" to header nav in `src/components/layout/Header.tsx` (between Contact and Advisor)
- Add blog translations to `src/i18n/translations.ts`

## 6. Homepage "Latest from Blog" Section

Add a section to `src/pages/Index.tsx` (before the CTA section) showing 3 latest blog posts as cards with "Read More" links.

## 7. robots.txt Update

Add sitemap reference:
```
Sitemap: https://suveefashion.lovable.app/sitemap.xml
```

## 8. Structured Data on Key Pages

Add JSON-LD `Organization` schema to Index page and `BlogPosting` schema to each blog post page.

---

## Files Changed

| File | Change |
|------|--------|
| Migration SQL | Create `blog_posts` table with RLS |
| `supabase/functions/generate-blog-post/index.ts` | AI blog generation edge function |
| `src/components/SEOHead.tsx` | New reusable SEO component |
| `src/pages/Blog.tsx` | New blog listing page |
| `src/pages/BlogPost.tsx` | New blog post detail page |
| `src/App.tsx` | Add blog routes |
| `src/components/layout/Header.tsx` | Add Blog nav link |
| `src/i18n/translations.ts` | Blog translations |
| `src/pages/Index.tsx` | Latest from Blog section |
| `public/robots.txt` | Add sitemap reference |
| `src/pages/About.tsx`, `Contact.tsx`, `Catalogues.tsx` | Add SEOHead |

No new dependencies needed. `react-markdown` is already installed.

