import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Fetch the YouTube RSS feed for the channel
    // First resolve the channel ID from the handle @suveefashion
    const channelHandle = "suveefashion";
    
    // Try fetching via RSS with channel handle (YouTube supports this)
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?user=${channelHandle}`;
    let rssRes = await fetch(rssUrl);
    
    // If that fails, try with the @handle page to extract channel ID
    if (!rssRes.ok) {
      const pageRes = await fetch(`https://www.youtube.com/@${channelHandle}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      const pageText = await pageRes.text();
      
      // Extract channel ID from the page
      const channelIdMatch = pageText.match(/\"channelId\":\"(UC[^\"]+)\"/);
      if (!channelIdMatch) {
        throw new Error("Could not resolve channel ID");
      }
      
      const channelId = channelIdMatch[1];
      const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
      rssRes = await fetch(feedUrl);
    }

    if (!rssRes.ok) {
      throw new Error("Failed to fetch YouTube feed");
    }

    const xml = await rssRes.text();

    // Parse video IDs and titles from the XML
    const entries: { videoId: string; title: string; thumbnail: string }[] = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;

    while ((match = entryRegex.exec(xml)) !== null && entries.length < 7) {
      const entry = match[1];
      const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const titleMatch = entry.match(/<title>([^<]+)<\/title>/);

      if (videoIdMatch) {
        const videoId = videoIdMatch[1];
        entries.push({
          videoId,
          title: titleMatch ? titleMatch[1] : "",
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        });
      }
    }

    return new Response(JSON.stringify({ videos: entries }), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", videos: [] }), {
      status: 200, // Return 200 with empty array so frontend can fallback gracefully
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
