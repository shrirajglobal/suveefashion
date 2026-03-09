

## Plan: Location-Aware Dada + Chat Learnings System

### Problem
When users ask seasonal/trend questions like "Garmi me kya sell hoga?", Dada gives generic advice. But kurti trends vary hugely by region — fabric, colors, designs all differ between Rajasthan, Bengal, UP, South India, etc. Additionally, there's no mechanism to capture learnings from chats to improve Dada over time.

### Part 1: Location-Aware Advice

**A. Onboarding Flow** (`src/pages/Advisor.tsx`)
- Before the first message, show a quick onboarding card asking the user's **state/region** and **business type** (retailer/wholesaler/new starter)
- Simple dropdown or chip-based selection — not a form
- Store this in component state and pass it with every API call as `userContext`

**B. System Prompt Enhancement** (`supabase/functions/business-advisor/index.ts`)
- Add a detailed **regional knowledge base** to the system prompt covering:
  - **North India** (UP, Rajasthan, MP): Heavy embroidery, bright colors, cotton in summer, velvet/wool-blend in winter
  - **East India** (WB, Bihar, Jharkhand, Odisha): Cotton/tant preference, pastels, festival-heavy buying patterns
  - **South India** (TN, Karnataka, Kerala, AP): Longer kurtis, sober colors, silk-cotton blends
  - **West India** (Gujarat, Maharashtra): Bandhani prints, mirror work, bright festive colors
  - **Northeast**: Lighter fabrics, subtle patterns
- Inject user's location as a system-level context message so Dada automatically tailors advice
- If location is unknown, Dada should **ask** before giving seasonal/trend advice

**C. Edge Function Update** (`supabase/functions/business-advisor/index.ts`)
- Accept `userContext: { state, businessType }` in the request body
- Prepend a context message: `"[Context: User is a {businessType} from {state}. Tailor all advice — fabric, colors, designs, pricing — to this region.]"`

### Part 2: Chat Learnings Capture System

**A. New Database Table** — `chat_insights`
- Columns: `id`, `created_at`, `user_state`, `business_type`, `question_topic` (seasonal/pricing/inventory/marketing), `question_summary`, `key_insight`
- This stores distilled learnings, not raw chats (privacy-friendly)

**B. Insight Extraction Edge Function** — `supabase/functions/extract-chat-insights/index.ts`
- After each conversation (triggered when chat has 4+ exchanges), call the AI to extract:
  - What topic was discussed
  - What region-specific insight emerged
  - What common pain point was revealed
- Store in `chat_insights` table
- This runs asynchronously — doesn't block the chat

**C. Admin Dashboard View** (`src/components/admin/AdminInsights.tsx`)
- New tab in Admin panel showing:
  - Top questions by topic and region
  - Common pain points
  - Trending queries
- This gives Suvee team visibility into what retailers are asking, enabling manual prompt improvements

**D. Feedback Mechanism in Chat** (`src/pages/Advisor.tsx`)
- After each Dada response, show subtle thumbs-up/thumbs-down buttons
- Store feedback in a `chat_feedback` table (`id`, `created_at`, `message_content`, `rating`, `user_state`)
- Helps identify which advice works and which doesn't

### Part 3: Files to Create/Modify

| File | Change |
|---|---|
| `src/pages/Advisor.tsx` | Add location onboarding, pass context, add feedback buttons |
| `supabase/functions/business-advisor/index.ts` | Accept userContext, add regional knowledge to prompt |
| `supabase/functions/extract-chat-insights/index.ts` | New — extract and store learnings after conversations |
| `src/components/admin/AdminInsights.tsx` | New — admin view for chat insights |
| `src/pages/Admin.tsx` | Add Insights tab |

**Database changes**: 2 new tables (`chat_insights`, `chat_feedback`) with appropriate RLS policies.

