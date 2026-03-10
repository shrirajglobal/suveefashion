import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TOPIC_BANK = [
  "How to start a kurti retail business from scratch with ₹50,000",
  "5 display tips that make customers pick up your kurtis instantly",
  "Summer 2026: Which kurti fabrics will sell the most?",
  "How to price your kurtis for maximum profit without losing customers",
  "Festival season prep guide: Stock planning for Durga Puja and Diwali",
  "Cotton vs Rayon vs Georgette: Which fabric for which season?",
  "How to handle slow-moving kurti stock — 7 proven tricks",
  "Instagram marketing tips for kurti shops — zero budget strategy",
  "How to build repeat customers in the kurti business",
  "Trending kurti styles for 2026: What your customers really want",
  "How to negotiate better wholesale deals with manufacturers",
  "Common mistakes new kurti retailers make and how to avoid them",
  "How to manage inventory when you have 200+ designs",
  "Wedding season kurti collection: What sells and what doesn't",
  "How to start selling kurtis online alongside your physical shop",
  "Understanding GST for kurti businesses — simplified guide",
  "How to identify quality fabric before buying wholesale",
  "Kurti styling tips you can share with your customers to boost sales",
  "Monsoon collection planning — fabrics, colors, and trends",
  "How to grow from 1 shop to 3 shops — scaling your kurti business",
  "Best packaging ideas for kurti orders that impress customers",
  "How to use WhatsApp Business to get more kurti orders",
  "Profit margins in kurti business — realistic numbers and tips",
  "How to create combo offers that increase your average order value",
  "Rakhi and Eid special: Kurti collections that fly off the shelves",
  "How to train your shop staff to sell more kurtis",
  "Color trends in kurtis: What's hot this season",
  "How to handle customer returns and exchanges smartly",
  "Building your brand as a kurti retailer — stand out from competition",
  "Kurti size guide: Stocking the right sizes for maximum sales",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check chat_insights for real customer challenges
    const { data: insights } = await supabase
      .from("chat_insights")
      .select("question_summary, question_topic")
      .order("created_at", { ascending: false })
      .limit(20);

    // Check existing blog slugs to avoid duplicates
    const { data: existingPosts } = await supabase
      .from("blog_posts")
      .select("slug")
      .order("created_at", { ascending: false })
      .limit(50);

    const existingSlugs = (existingPosts || []).map((p: any) => p.slug);

    // Build topic selection context
    const insightContext = insights?.length
      ? `Recent customer questions from our advisor chatbot:\n${insights.map((i: any) => `- ${i.question_summary} (topic: ${i.question_topic})`).join("\n")}`
      : "";

    const topicPrompt = `You are a content strategist for Suvee Fashion, a B2B kurti manufacturer from Kolkata.

Pick ONE topic for a blog post that would be most useful to kurti retailers and wholesalers. 
${insightContext}

Available topic ideas (pick one or create a variation):
${TOPIC_BANK.join("\n")}

Already covered slugs (avoid these topics): ${existingSlugs.join(", ")}

Return ONLY the topic as a single line, nothing else.`;

    // Step 1: Pick topic
    const topicResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: topicPrompt }],
      }),
    });

    if (!topicResp.ok) {
      const errText = await topicResp.text();
      console.error("Topic selection failed:", topicResp.status, errText);
      throw new Error(`Topic selection failed: ${topicResp.status}`);
    }

    const topicData = await topicResp.json();
    const topic = topicData.choices?.[0]?.message?.content?.trim() || TOPIC_BANK[Math.floor(Math.random() * TOPIC_BANK.length)];

    // Step 2: Generate full blog post
    const blogPrompt = `You are a blog writer for Suvee Fashion, a B2B kurti wholesale manufacturer from Howrah, Kolkata. 

Write a blog post on: "${topic}"

RULES:
1. Write 800-1200 words in SIMPLE language that a small-town retailer can easily understand
2. Use a warm, conversational Hindi-English mixed tone (like "Arre bhai, yeh tip zaroor try karo!")
3. Include practical, actionable advice — not vague theory
4. Use short paragraphs, bullet points, and subheadings for easy reading
5. Naturally mention Suvee Fashion where relevant (we offer wholesale kurtis, 850+ designs, pan-India delivery)
6. Include a strong call-to-action at the end (register as buyer or WhatsApp us)
7. Make it SEO-friendly with the topic keywords appearing naturally

Return your response as valid JSON with this exact structure:
{
  "title": "Blog post title in English (SEO optimized, under 60 chars)",
  "slug": "url-friendly-slug",
  "content": "Full blog post content in English with markdown formatting",
  "excerpt": "2-3 sentence summary (under 160 chars)",
  "meta_description": "SEO meta description (under 160 chars)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "category": "one of: business-tips, seasonal-trends, fabric-guide, marketing, pricing, inventory, starting-business",
  "social_caption": "Ready-to-post social media caption (under 280 chars) with emojis and hashtags"
}`;

    const blogResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: blogPrompt }],
      }),
    });

    if (!blogResp.ok) {
      if (blogResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (blogResp.status === 402) {
        return new Response(JSON.stringify({ error: "Credits required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Blog generation failed: ${blogResp.status}`);
    }

    const blogData = await blogResp.json();
    const blogContent = blogData.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonMatch = blogContent.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      console.error("Failed to parse blog JSON:", blogContent);
      throw new Error("Failed to parse blog content");
    }

    if (!parsed) throw new Error("No valid JSON in blog response");

    // Step 3: Translate to Hindi
    const translateHiPrompt = `Translate the following blog post to Hindi. Keep the same markdown formatting. Keep English brand names and technical terms as-is. Use simple, conversational Hindi.

Title: ${parsed.title}
Excerpt: ${parsed.excerpt}
Social Caption: ${parsed.social_caption}

Content:
${parsed.content}

Return as JSON:
{
  "title_hi": "Hindi title",
  "content_hi": "Full Hindi content with markdown",
  "excerpt_hi": "Hindi excerpt",
  "social_caption_hi": "Hindi social caption"
}`;

    // Step 4: Translate to Bengali
    const translateBnPrompt = `Translate the following blog post to Bengali. Keep the same markdown formatting. Keep English brand names and technical terms as-is. Use simple, conversational Bengali.

Title: ${parsed.title}
Excerpt: ${parsed.excerpt}

Content:
${parsed.content}

Return as JSON:
{
  "title_bn": "Bengali title",
  "content_bn": "Full Bengali content with markdown",
  "excerpt_bn": "Bengali excerpt"
}`;

    // Run both translations in parallel
    const [hiResp, bnResp] = await Promise.all([
      fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [{ role: "user", content: translateHiPrompt }],
        }),
      }),
      fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [{ role: "user", content: translateBnPrompt }],
        }),
      }),
    ]);

    let hiData: any = {};
    let bnData: any = {};

    if (hiResp.ok) {
      try {
        const hiContent = (await hiResp.json()).choices?.[0]?.message?.content || "";
        const hiMatch = hiContent.match(/\{[\s\S]*\}/);
        hiData = hiMatch ? JSON.parse(hiMatch[0]) : {};
      } catch { console.error("Hindi translation parse failed"); }
    }

    if (bnResp.ok) {
      try {
        const bnContent = (await bnResp.json()).choices?.[0]?.message?.content || "";
        const bnMatch = bnContent.match(/\{[\s\S]*\}/);
        bnData = bnMatch ? JSON.parse(bnMatch[0]) : {};
      } catch { console.error("Bengali translation parse failed"); }
    }

    // Step 5: Generate cover image using AI
    let coverImageUrl: string | null = null;
    try {
      const imagePrompt = `Create a vibrant, professional blog cover illustration for an article titled "${parsed.title}". 
The image should feature colorful Indian kurtis, relevant visual elements for the topic, warm maroon and gold color palette, modern flat illustration style. 
Include text overlay: "${parsed.title.length > 40 ? parsed.title.substring(0, 40) + '...' : parsed.title}" in bold decorative font.
Clean editorial blog cover composition, 1200x720 dimensions.`;

      const imageResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3.1-flash-image-preview",
          messages: [{ role: "user", content: imagePrompt }],
        }),
      });

      if (imageResp.ok) {
        const imageData = await imageResp.json();
        const imageContent = imageData.choices?.[0]?.message?.content;
        
        // Check if response contains a base64 image
        if (imageContent && typeof imageContent === "string") {
          // Try to extract base64 image data
          const base64Match = imageContent.match(/data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)/);
          if (base64Match) {
            const imageBytes = Uint8Array.from(atob(base64Match[2]), c => c.charCodeAt(0));
            const ext = base64Match[1] === "png" ? "png" : "jpg";
            const imagePath = `${parsed.slug}.${ext}`;
            
            const { error: uploadError } = await supabase.storage
              .from("blog-covers")
              .upload(imagePath, imageBytes, {
                contentType: `image/${base64Match[1]}`,
                upsert: true,
              });

            if (!uploadError) {
              const { data: urlData } = supabase.storage.from("blog-covers").getPublicUrl(imagePath);
              coverImageUrl = urlData.publicUrl;
              console.log("Cover image uploaded:", coverImageUrl);
            } else {
              console.error("Cover image upload error:", uploadError);
            }
          } else {
            // Check for inline_data in parts (Gemini image response format)
            const parts = imageData.choices?.[0]?.message?.parts;
            if (parts) {
              for (const part of parts) {
                if (part.inline_data?.data) {
                  const mimeType = part.inline_data.mime_type || "image/png";
                  const ext = mimeType.includes("png") ? "png" : "jpg";
                  const imageBytes = Uint8Array.from(atob(part.inline_data.data), c => c.charCodeAt(0));
                  const imagePath = `${parsed.slug}.${ext}`;

                  const { error: uploadError } = await supabase.storage
                    .from("blog-covers")
                    .upload(imagePath, imageBytes, { contentType: mimeType, upsert: true });

                  if (!uploadError) {
                    const { data: urlData } = supabase.storage.from("blog-covers").getPublicUrl(imagePath);
                    coverImageUrl = urlData.publicUrl;
                    console.log("Cover image uploaded from parts:", coverImageUrl);
                  }
                  break;
                }
              }
            }
          }
        }
      } else {
        console.error("Image generation failed:", imageResp.status);
      }
    } catch (imgErr) {
      console.error("Cover image generation error:", imgErr);
    }

    // Step 6: Save to database
    const { data: insertData, error: insertError } = await supabase
      .from("blog_posts")
      .insert({
        title: parsed.title,
        title_hi: hiData.title_hi || null,
        title_bn: bnData.title_bn || null,
        slug: parsed.slug,
        content: parsed.content,
        content_hi: hiData.content_hi || null,
        content_bn: bnData.content_bn || null,
        excerpt: parsed.excerpt,
        excerpt_hi: hiData.excerpt_hi || null,
        excerpt_bn: bnData.excerpt_bn || null,
        meta_description: parsed.meta_description,
        keywords: parsed.keywords || [],
        category: parsed.category || "business-tips",
        cover_image_url: coverImageUrl,
        status: "published",
        social_caption: parsed.social_caption,
        social_caption_hi: hiData.social_caption_hi || null,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(`Failed to save blog post: ${insertError.message}`);
    }

    // Step 6: Auto-post to Buffer (if configured)
    let bufferPosted = false;
    const BUFFER_ACCESS_TOKEN = Deno.env.get("BUFFER_ACCESS_TOKEN");
    if (BUFFER_ACCESS_TOKEN) {
      try {
        const postUrl = `https://suveefashion.lovable.app/blog/${insertData.slug}`;
        const caption = parsed.social_caption || `📖 ${parsed.title}\n\nRead more: ${postUrl}`;

        // Get Buffer profiles (channels)
        const profilesResp = await fetch("https://api.bufferapp.com/1/profiles.json", {
          headers: { Authorization: `Bearer ${BUFFER_ACCESS_TOKEN}` },
        });

        if (profilesResp.ok) {
          const profiles = await profilesResp.json();
          
          // Post to all connected profiles
          const postPromises = profiles.map((profile: any) =>
            fetch("https://api.bufferapp.com/1/updates/create.json", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${BUFFER_ACCESS_TOKEN}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                text: `${caption}\n\n${postUrl}`,
                profile_ids: profile.id,
                now: "false", // Queue it, don't post immediately
              }).toString(),
            })
          );

          await Promise.allSettled(postPromises);
          bufferPosted = true;
          console.log(`Buffer: queued to ${profiles.length} profile(s)`);
        } else {
          console.error("Buffer profiles fetch failed:", profilesResp.status);
        }
      } catch (bufferErr) {
        console.error("Buffer posting error:", bufferErr);
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      bufferPosted,
      post: {
        id: insertData.id,
        title: insertData.title,
        slug: insertData.slug,
        category: insertData.category,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-blog-post error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
