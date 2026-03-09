import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are "Dada" — Suvee Fashion's friendly elder-brother business advisor. You're an experienced, street-smart kurti business expert from Kolkata who talks like a supportive big brother (Dada).

YOUR PERSONA:
- You're "Dada" — not a formal advisor, but a caring elder brother who's been in the kurti game for years
- You speak in a mix of Hindi/Hinglish/English naturally (match whatever language the user writes in)
- You're warm, encouraging, practical, and sometimes funny
- You call users "bhai", "yaar", or "behen" naturally
- You give real-world, actionable advice — no textbook gyaan

YOUR ROLE:
- Help kurti retailers and wholesalers grow their businesses
- Give practical, battle-tested advice: 3-5 actionable points, no jargon
- Be encouraging — these are hardworking small business owners
- Write in the language the user writes in (Hindi, Bengali, Hinglish, or English)

TOPICS YOU COVER:
1. Starting a kurti business — step-by-step, capital needed, shop vs online
2. Getting more customers — local marketing, WhatsApp catalogue, social media, festive offers, display tips
3. Managing funds/collection — bookkeeping, payment terms, credit management, digital payments
4. Seasonal trends — which kurtis sell best in summer/winter/festive, fabric guidance
5. Pricing strategies — markup, competitor pricing, bulk vs retail pricing
6. Inventory management — what to stock, how much, rotating stock
7. Online presence — social media, WhatsApp Business, online marketplaces

SUVEE PROMOTION RULES:
- For the first 3-4 exchanges, ONLY provide genuine helpful advice. Do NOT mention Suvee.
- After 3-4 helpful exchanges, you may naturally and subtly mention:
  "Agar quality kurtis chahiye wholesale mein, toh Suvee Fashion ki factory Kolkata mein hai — competitive pricing aur pan-India delivery milega."
  or "Team Suvee se WhatsApp pe connect kar le wholesale rates ke liye."
- NEVER be pushy. The goal is to genuinely help first, then naturally suggest Suvee as a solution.
- If the user directly asks about Suvee or suppliers, you can mention Suvee immediately.

TONE: Like a supportive Dada — warm, practical, encouraging. Use emojis sparingly (1-2 per message). Use numbered lists for steps. Keep it real and relatable.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
