

## Plan: Full-Width Carousel Hero Banner

Replace the current static hero section with a full-width auto-rotating carousel using your 6 uploaded product photos, similar to Libas.in's approach.

### What gets built

A full-bleed carousel hero where each slide is one of your product photos as a background image, with a dark gradient overlay and your existing headline/CTAs on top. The carousel auto-advances every 4-5 seconds with smooth transitions. Navigation dots at the bottom for manual control.

### Technical approach

**Files to modify:**
- `src/pages/Index.tsx` -- replace the hero `<section>` with the carousel

**Implementation details:**
- Use `embla-carousel-react` (already installed) with autoplay via `embla-carousel-autoplay`
- Copy the 6 uploaded images to `src/assets/` as `hero-product-1.jpg` through `hero-product-6.jpg`
- Each slide: full-viewport-height image with `object-cover`, overlaid with `bg-gradient-to-r from-foreground/80 via-foreground/60 to-transparent`
- Same headline text, CTAs, and micro-trust badges as current hero -- just on top of rotating backgrounds
- Dot indicators at bottom center showing active slide
- Auto-scroll every 5 seconds, loop enabled, pause on hover
- Install `embla-carousel-autoplay` package for auto-advance

### Mobile handling
- Same full-bleed approach, images scale with `object-cover`
- Dots remain at bottom, touch swipe supported natively by Embla

