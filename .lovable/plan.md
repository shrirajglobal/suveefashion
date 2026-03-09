

## Plan: Professional Header Logo Alignment (CRO-Focused)

### Current Problems
- Logo and tagline are stacked vertically with `flex-col items-center`, making the logo area tall and visually unbalanced in the header
- The logo takes too much vertical space relative to the 64px/80px header height
- "Kurtis & more..." as a centered column below creates a blocky, amateur layout
- The overall logo block doesn't align well with the nav and right-side icons

### CRO-Driven Approach
From a conversion rate optimization perspective, the header logo needs to:
1. **Be instantly recognizable** -- clean, left-aligned, properly sized
2. **Not compete with CTAs** -- the login/cart buttons are the conversion elements; the logo should anchor, not dominate
3. **Feel premium** -- a wholesale fashion brand needs elegant restraint

### Solution

**Header.tsx changes:**
- Switch from `flex-col items-center` to a **horizontal layout** with the tagline beside the logo (or a clean left-aligned vertical stack)
- Logo: `h-10 md:h-12` -- slightly smaller to fit cleanly within the header height without overflow
- Tagline "Kurtis & more..." placed to the **right of the logo** as a subtle secondary text, separated by a thin vertical divider -- or placed as a very small line below the logo **left-aligned** (not centered)
- Use `items-start` instead of `items-center` so text aligns to the left edge of the logo
- Remove the animation delay so the tagline doesn't flash in awkwardly on every page navigation

**Footer.tsx:**
- Keep logo at `h-10` with `object-contain`, left-aligned (already fine, just ensure size consistency)

### Files to modify
- `src/components/layout/Header.tsx` -- logo sizing, layout alignment, tagline positioning

