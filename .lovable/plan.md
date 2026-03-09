

## Plan: Comprehensive Brand & Data Update (11 Items)

### Audit: All places where outdated data exists

| Data Point | Current Value | New Value | Files Affected |
|---|---|---|---|
| Logo | Maroon circle "S" | `logo-final.png` image | Header.tsx, Footer.tsx |
| Tagline below logo | None | "Kurtis & more..." animated | Header.tsx |
| Retailer count | 500+ | 3700+ | translations.ts, Footer.tsx, Index.tsx, Register.tsx |
| Design count | 2000+ | 850+ | translations.ts, Register.tsx, Login.tsx |
| Years | 10+ / "over a decade" | 7+ / "7 years" | translations.ts (stat + about.description) |
| GST Number | "GST Registered" / placeholder | 19AHOPL4954B1Z4 | translations.ts, Footer.tsx, About.tsx, generate-invoice/index.ts |
| Address | "Kolkata, West Bengal" / fake factory address | 20/21 Bhawan Ganguly Lane, 5th Floor, Howrah 711101 | translations.ts, generate-invoice/index.ts |
| WhatsApp Community | Not present | https://chat.whatsapp.com/EPcMwkcqbhXBSGL2ZhZInL | Footer.tsx, Index.tsx CTA |
| Google Maps / GMB | Not present | https://share.google/eY0h3fuAOBMvPACID | Footer.tsx, About.tsx, Contact.tsx |
| Instagram | Not present | suvee.fashion | Footer.tsx |
| YouTube on landing | Not present | Embed section | Index.tsx |
| Developer credit | Not present | "Curated & Developed by S R Global, Kolkata" | Footer.tsx |
| Page title/meta | "Lovable App" | "Suvee Fashion" | index.html |

---

### Implementation Details

**1. Logo + Animated Tagline (Header.tsx, Footer.tsx)**
- Copy uploaded `logo-final.png` to `src/assets/logo-final.png`
- Replace the maroon circle div with `<img src={logo} />` (h-10 rounded)
- Below "Suvee Fashion" text, add `<motion.span>` with "Kurtis & more..." using framer-motion fade-in + gentle pulse animation
- Same logo swap in Footer.tsx (without animation)

**2. Stats Update (translations.ts)**
- `about.stat_retailers`: "3700+ Retailers" / "3700+ रिटेलर्स" / "৩৭০০+ খুচরা বিক্রেতা"
- `about.stat_designs`: "850+ Designs" / "850+ डिज़ाइन" / "৮৫০+ ডিজাইন"
- `about.stat_years`: "7+ Years" / "7+ वर्ष" / "৭+ বছর"
- `hero.subtitle`: Update "500+" → "3700+" in all 3 languages
- `about.description`: Change "over a decade" → "7 years" in all 3 languages

**3. Hardcoded stat references**
- Footer.tsx: "500+ Retailers" → "3700+ Retailers"
- Index.tsx CTA: "500+ retailers already onboard" → "3700+"
- Register.tsx: "Join 500+ retailers" → "Join 3700+ retailers", "2000+ exclusive" → "850+ exclusive"
- Login.tsx: "2000+ exclusive designs" → "850+ exclusive designs"

**4. GST Number**
- `footer.gst`: "GST: 19AHOPL4954B1Z4" in all languages
- About.tsx: Update GST Registered value card to show actual GSTIN
- `generate-invoice/index.ts`: Replace placeholder GSTIN with "19AHOPL4954B1Z4"

**5. Address**
- `contact.address`: "20/21 Bhawan Ganguly Lane, 5th Floor, Howrah 711101" (all 3 langs)
- `generate-invoice/index.ts`: Update seller address

**6. WhatsApp Community**
- Footer.tsx: Add "Join WhatsApp Community" link below existing WhatsApp chat link
- Index.tsx CTA section: Add community link as a secondary button

**7. Google Maps / GMB**
- Footer.tsx: Add "View on Google Maps" link with MapPin icon
- Contact.tsx: Add Google Maps link/embed near address
- About.tsx: Add "Find us on Google" trust badge

**8. Instagram**
- Footer.tsx: Add Instagram link (instagram.com/suvee.fashion) with icon

**9. YouTube Section (Index.tsx)**
- Create a "Latest from YouTube" section between Testimonials and CTA
- Use embla-carousel (already installed) for horizontal scroll of embedded YouTube videos
- Create a backend function (`youtube-feed`) that fetches the RSS feed from `https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID` (resolve channel ID from @suveefashion), extracts latest 7 video IDs, and returns them
- Frontend calls this function, renders YouTube lite embeds (thumbnail + play button that loads iframe on click for performance)
- Fallback: if function fails, show a "Visit our YouTube" CTA button

**10. Meta Tags (index.html)**
- Title: "Suvee Fashion — Premium Wholesale Kurtis | Kolkata"
- og:title, og:description, twitter:title etc. updated accordingly

**11. Developer Credit (Footer.tsx)**
- Below copyright line: "Curated & Developed by S R Global, Kolkata" in smaller muted text

---

### Files to create/modify:
- `src/assets/logo-final.png` (copy from upload)
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/pages/Index.tsx`
- `src/pages/About.tsx`
- `src/pages/Contact.tsx`
- `src/pages/Register.tsx`
- `src/pages/Login.tsx`
- `src/i18n/translations.ts`
- `supabase/functions/generate-invoice/index.ts`
- `supabase/functions/youtube-feed/index.ts` (new)
- `index.html`

