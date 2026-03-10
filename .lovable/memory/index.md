# Suvee Fashion — Project Memory

## Design System
- **Palette**: Maroon (345 60% 30%), Gold (38 70% 50%), Cream (30 30% 95%), Soft Pink (350 40% 90%)
- **Fonts**: Playfair Display (headings), Poppins (body), Noto Sans Bengali + Devanagari
- **Brand**: B2B kurti manufacturer from Kolkata

## Architecture
- Multilingual: English, Hindi, Bengali via `src/i18n/LanguageContext.tsx`
- Auth: `src/contexts/AuthContext.tsx` — tracks user, buyerStatus, isAdmin
- Layout: Header (with cart badge) + Footer + WhatsApp button
- SEO: `src/components/SEOHead.tsx` — per-page title, meta, OG, JSON-LD

## Database (Lovable Cloud)
- Tables: categories, products, buyer_profiles, inquiries, user_roles, orders, order_items, cart_items, sample_requests, blog_posts, chat_feedback, chat_insights, hero_banners
- blog_posts: multilingual (title/content/excerpt in en/hi/bn), public SELECT, admin INSERT/UPDATE/DELETE
- Enums: buyer_status, business_type, app_role, order_status, sample_status

## Blog System (Phase 1 ✅ + Phase 2 ✅)
- Edge function: `supabase/functions/generate-blog-post/index.ts` — AI content gen + auto-translation + Buffer auto-posting
- pg_cron: Tue/Thu/Sat at 00:30 UTC (6:00 AM IST) — `generate-blog-tue-thu-sat`
- Buffer: Auto-queues posts to all connected Buffer profiles
- Pages: `/blog` (listing), `/blog/:slug` (detail with JSON-LD)
- Homepage: "Latest from Blog" section with 3 cards
- Phase 2 TODO: pg_cron scheduling (Tue/Thu/Sat), Buffer API auto-posting

## Pages
- Public: Home, About, Contact, Catalogues, Blog, BlogPost, Advisor, Login, Register
- Auth: Cart, Dashboard, Admin

## Key Decisions
- WhatsApp: +91 9831640808
- Email verification required, no auto-confirm
- Buyer registration requires admin approval
- Payment offline (bank transfer/COD)
