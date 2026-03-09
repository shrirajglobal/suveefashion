

## CRO Optimization + "Dada Se Pucho" Rebrand Plan

### 1. Rebrand Business Advisor to "Dada Se Pucho" (High Priority)

The advisor feature will be renamed and elevated across the entire site:

**A. Translation Updates** (`src/i18n/translations.ts`)
- `nav.advisor`: "Dada Se Pucho" (en/hi), "দাদা সে পুছো" (bn)
- `advisor.title`: "Dada Se Pucho" across all languages
- `advisor.welcome`: Rewrite to match the "Dada" persona — friendly, elder-brother tone
- `advisor.placeholder`: "Dada se kuch bhi pucho..." / "দাদাকে কিছু জিজ্ঞাসা করুন..."
- Update all chip texts to match the new casual tone

**B. System Prompt Update** (`supabase/functions/business-advisor/index.ts`)
- Rename persona from "Suvee Fashion's Business Advisor" to "Dada" — a friendly, experienced elder-brother figure in the kurti business
- Make tone more conversational and relatable (Hinglish-friendly)

**C. Advisor Page Visual Rebrand** (`src/pages/Advisor.tsx`)
- Replace the generic Sparkles icon with a custom "Dada" avatar/icon
- Update header text to "Dada Se Pucho" with subtitle "Apna business badhao, Dada se pucho!"
- Add a warm gradient or distinct branding color to make it feel special

**D. Homepage "Dada Se Pucho" Highlight Section** (`src/pages/Index.tsx`)
- Add a dedicated, eye-catching CTA section on the homepage (between Testimonials and YouTube sections)
- Design: A card/banner with conversational copy like "Business mein koi problem? Dada se pucho — FREE!"
- Include a prominent button linking to `/advisor`
- Make it visually distinct from other sections (unique background, animation)

**E. Navigation & Footer Updates**
- `src/components/layout/Header.tsx`: Nav link shows "Dada Se Pucho" with a subtle highlight badge (e.g., "FREE" or sparkle indicator)
- `src/components/layout/Footer.tsx`: Update footer link text

---

### 2. CRO Optimizations (Mobile + Desktop)

**A. Sticky Mobile CTA Bar**
- Add a fixed bottom bar on mobile (visible on homepage) with two buttons: "Browse Catalogues" and "Dada Se Pucho"
- This replaces scrolling back to find CTAs — keeps conversion actions always accessible
- Hide on `/advisor`, `/cart`, `/admin` pages

**B. Hero Section Improvements** (`src/pages/Index.tsx`)
- Reduce hero height on mobile from `70vh` to `60vh` to show more content above the fold
- Make CTA buttons larger on mobile with full-width styling
- Add "Dada Se Pucho" as a secondary CTA in the hero section

**C. Trust Signals Enhancement**
- Move stats section higher (closer to hero) and make numbers bolder
- Add a thin trust bar below hero: "GST Verified | 7+ Years | 3700+ Retailers"

**D. Faster Page Load Perception**
- Add skeleton loading states for New Arrivals and YouTube sections
- Lazy-load below-fold sections (YouTube, Testimonials)

**E. Mobile Navigation Improvements** (`src/components/layout/Header.tsx`)
- In mobile menu, highlight "Dada Se Pucho" with a colored badge or different styling to draw attention
- Add "Dada Se Pucho" to the mobile menu with a "FREE" tag

**F. WhatsApp Button Adjustment** (`src/components/layout/WhatsAppButton.tsx`)
- On mobile, reposition WhatsApp button to not overlap with the new sticky CTA bar
- Move it slightly higher when the sticky bar is present

---

### 3. Files to Create/Modify

| File | Change |
|---|---|
| `src/i18n/translations.ts` | Rename all advisor keys to "Dada Se Pucho" |
| `src/pages/Advisor.tsx` | Rebrand UI, update avatar, colors |
| `src/pages/Index.tsx` | Add "Dada Se Pucho" highlight section, hero tweaks, mobile CTA bar |
| `src/components/layout/Header.tsx` | Highlight "Dada Se Pucho" nav link with badge |
| `src/components/layout/Footer.tsx` | Update link text |
| `src/components/layout/WhatsAppButton.tsx` | Adjust mobile positioning |
| `src/components/layout/Layout.tsx` | Add sticky mobile CTA bar component |
| `supabase/functions/business-advisor/index.ts` | Update system prompt persona to "Dada" |
| `src/components/layout/MobileCTABar.tsx` | New — sticky bottom bar for mobile |

No database changes required.

