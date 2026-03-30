import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://suveefashion.lovable.app";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { category_id, fabrics, price_min, price_max, discount_percent } = await req.json();
    const disc = Number(discount_percent) || 0;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let query = supabase.from("products").select("*, categories(name)").order("name");
    if (category_id) query = query.eq("category_id", category_id);
    if (fabrics?.length) query = query.in("fabric", fabrics);
    if (price_min != null) query = query.gte("wsp", price_min);
    if (price_max != null) query = query.lte("wsp", price_max);

    const { data: products, error } = await query;
    if (error) throw error;

    let categoryName = "All Categories";
    if (category_id) {
      const { data: cat } = await supabase.from("categories").select("name").eq("id", category_id).single();
      if (cat) categoryName = cat.name;
    }

    const productPages = (products || []).map((p: any, i: number) => {
      const wsp = Number(p.wsp) || 0;
      const price = disc > 0 ? Math.round(wsp * (1 - disc / 100)) : wsp;
      const productUrl = `${SITE_URL}/catalogues?product=${p.id}`;
      const isLast = i === (products || []).length - 1;

      return `
        <div class="product-page" ${!isLast ? 'style="page-break-after:always"' : ''}>
          <div class="product-image">
            ${p.image_url
              ? `<img src="${p.image_url}" alt="${p.name}" />`
              : `<div class="no-image">No Image Available</div>`}
          </div>
          <div class="product-details">
            <h2>${p.name}</h2>
            <div class="product-meta">
              ${p.fabric ? `<span class="chip">${p.fabric}</span>` : ""}
              <span class="chip">${p.sizes}</span>
              <span class="chip">${p.pcs_per_set} pcs/set</span>
            </div>
            <div class="product-price">
              ${disc > 0 ? `<span class="original-price">₹${wsp}</span>` : ""}
              <span class="final-price">₹${price}/pc</span>
              <span class="gst">+ 5% GST</span>
            </div>
            <a href="${productUrl}" class="product-link" target="_blank">View on Suvee Fashion →</a>
          </div>
        </div>`;
    }).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Suvee Fashion — ${categoryName} Catalogue</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#333}
      .cover{height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;page-break-after:always;padding:40px}
      .cover h1{color:#5a1a2a;font-size:36px;margin-bottom:8px}
      .cover .subtitle{color:#888;font-size:15px;margin-bottom:24px}
      .cover .cat-name{font-size:22px;font-weight:600;color:#5a1a2a;margin-bottom:8px}
      .cover .meta-info{font-size:13px;color:#666}
      .cover .discount-badge{display:inline-block;margin-top:16px;padding:6px 18px;background:#16a34a;color:#fff;border-radius:20px;font-size:14px;font-weight:600}

      .product-page{height:100vh;display:flex;flex-direction:column;padding:20px 30px}
      .product-image{flex:1;display:flex;align-items:center;justify-content:center;overflow:hidden;min-height:0}
      .product-image img{max-width:100%;max-height:100%;object-fit:contain}
      .no-image{width:100%;height:300px;background:#f5f5f5;display:flex;align-items:center;justify-content:center;color:#999;border-radius:8px}

      .product-details{padding:16px 0;border-top:2px solid #5a1a2a;margin-top:12px;flex-shrink:0}
      .product-details h2{font-size:18px;color:#333;margin-bottom:6px}
      .product-meta{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px}
      .chip{font-size:11px;background:#f5f0f2;color:#5a1a2a;padding:2px 10px;border-radius:12px}
      .product-price{margin-bottom:6px}
      .original-price{text-decoration:line-through;color:#999;font-size:13px;margin-right:8px}
      .final-price{font-size:20px;font-weight:700;color:#5a1a2a}
      .gst{font-size:11px;color:#888;margin-left:4px}
      .product-link{display:inline-block;margin-top:4px;font-size:12px;color:#5a1a2a;text-decoration:underline}

      .footer-page{text-align:center;padding:60px 20px;font-size:12px;color:#888}
      .footer-page p{margin-bottom:4px}

      .no-print{position:fixed;top:16px;right:16px;padding:12px 24px;background:#5a1a2a;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;z-index:99}
      @media print{.no-print{display:none}}
    </style></head><body>
      <button class="no-print" onclick="window.print()">🖨️ Print / Save PDF</button>

      <div class="cover">
        <h1>Suvee Fashion</h1>
        <p class="subtitle">Premium Kurti Manufacturer — Kolkata</p>
        <p class="cat-name">${categoryName} Catalogue</p>
        <p class="meta-info">${products?.length || 0} Products • Generated ${new Date().toLocaleDateString("en-IN")}</p>
        ${disc > 0 ? `<span class="discount-badge">${disc}% Special Discount</span>` : ""}
      </div>

      ${productPages}

      <div class="footer-page">
        <p><strong>Suvee Fashion</strong> • Kolkata, India • WhatsApp: +91 98316 40808</p>
        <p>All prices exclusive of 5% GST • Minimum order in set quantities</p>
        <p style="margin-top:8px"><a href="${SITE_URL}" style="color:#5a1a2a">${SITE_URL}</a></p>
      </div>
    </body></html>`;

    return new Response(JSON.stringify({ html }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
