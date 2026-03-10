

## Chat Text & Language-Aware Response Plan

### Problems
1. **Chat text readability**: The message bubbles use `text-sm` (14px) uniformly — fine for desktop but cramped on mobile. Markdown prose styling needs better spacing, font sizing, and line-height for comfortable reading.
2. **AI doesn't know user's language**: The edge function receives `userContext` (state, businessType) but not the selected website language. So Dada always defaults to Hinglish regardless of whether the user picked Bengali or Hindi on the site.

### Changes

**1. Pass language to the edge function (`src/pages/Advisor.tsx`)**
- Include `language` in the `userContext` object sent to `business-advisor` edge function (e.g., `{ state, businessType, language: "bn" }`).

**2. Use language in system prompt (`supabase/functions/business-advisor/index.ts`)**
- Read `userContext.language` and add a system message instructing the model to respond in that language:
  - `"en"` → respond in English/Hinglish
  - `"hi"` → respond in Hindi (Devanagari script)
  - `"bn"` → respond in Bengali (Bengali script)

**3. Improve chat text readability (`src/pages/Advisor.tsx`)**
- Increase base font size: `text-sm` → `text-[15px]` on message bubbles for better mobile readability.
- Improve line-height: add `leading-relaxed` to prose container.
- Add proper prose list styling: `[&_li]:ml-4` for indentation, `[&_h3]:font-semibold [&_h3]:mt-2` for headings.
- Slightly increase bubble padding on mobile.
- Use appropriate font family for Bengali/Hindi text by adding a `lang` attribute on the message div based on language selection (browsers render Noto Sans Bengali/Devanagari correctly with `lang="bn"`/`lang="hi"`).

**4. Localize static UI text**
- "Dada soch raha hai..." loading text → use translated string.
- "Powered by Suvee Fashion" footer → translate.
- Error fallback message → translate based on language.

### Files to Edit
- `src/pages/Advisor.tsx` — pass language, improve text styling, localize static strings
- `supabase/functions/business-advisor/index.ts` — use language context in system prompt
- `src/i18n/translations.ts` — add keys for loading text and error message

