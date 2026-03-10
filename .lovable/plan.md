

## Advisor ("Dada se Puch") CRO & UX Fix Plan

### Problems Identified

1. **Scroll jump during chat**: `scrollIntoView` fires on every `messages` update (including streaming chunks), causing the page to jump. On mobile, the outer page scrolls instead of just the chat container.
2. **Layout not locked**: The chat uses `height: calc(100vh - 5rem)` but is inside `Layout` which has Header + Footer + MobileCTABar. Footer renders below the chat, the page is scrollable, and the mobile CTA bar overlaps the input.
3. **No `dvh` usage**: On mobile Safari, `100vh` includes the URL bar, pushing the input below the visible area.
4. **Footer & WhatsApp button visible on advisor page**: Unnecessary clutter for a full-screen chat experience.
5. **MobileCTABar already hidden** on `/advisor` (good), but WhatsApp floating button still shows.
6. **Input not sticky on mobile**: When keyboard opens, the input can scroll out of view.
7. **Onboarding not optimized for mobile**: Long list of states as chips can feel overwhelming on small screens.

### Plan

**1. Hide Footer & WhatsApp button on `/advisor`**
- `Layout.tsx`: Conditionally hide `<Footer />` and `<WhatsAppButton />` when pathname starts with `/advisor`.
- Remove `pb-16 md:pb-0` padding on main for advisor route.

**2. Fix chat container to use `dvh` and fill the viewport properly**
- `Advisor.tsx`: Change height from `calc(100vh - 5rem)` to `calc(100dvh - 4rem)` (header height). Use `overflow-hidden` on the outer div to prevent any page-level scroll.
- Add `flex flex-col overflow-hidden` to ensure the three sections (header, messages, input) stay in a fixed layout.

**3. Fix auto-scroll to only scroll the messages container, not the page**
- Replace `messagesEndRef.scrollIntoView()` with a ref on the messages scroll container and use `scrollTop = scrollHeight` on that container element.
- Only auto-scroll when the user is already near the bottom (within ~100px), so reading older messages isn't disrupted by streaming updates.

**4. Mobile keyboard handling**
- Use `visualViewport` API: listen to `resize` events and adjust the input bar position so it stays visible above the keyboard.
- Add CSS `overscroll-behavior: none` on the chat container to prevent pull-to-refresh and bounce.

**5. Onboarding UX improvement**
- Group states by region (North, East, South, West, Northeast) with small headings for faster scanning.
- Make chips slightly larger on mobile for easier tap targets.

**6. Quick chips placement**
- Move quick chips inside the messages area (above the input) instead of a separate border section, so they don't push the layout around.

**7. Minor CRO polish**
- Add a subtle "Powered by Suvee Fashion" or branding below the input on desktop.
- Ensure the loading indicator ("Dada soch raha hai...") doesn't cause layout shift.

### Files to Edit
- `src/pages/Advisor.tsx` — scroll fix, dvh, keyboard handling, chips placement
- `src/components/layout/Layout.tsx` — hide footer/whatsapp on advisor
- `src/components/advisor/AdvisorOnboarding.tsx` — grouped states, better mobile tap targets

