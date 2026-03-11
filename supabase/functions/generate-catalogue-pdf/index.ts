import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Also get category name if filtered
    let categoryName = "All Categories";
    if (category_id) {
      const { data: cat } = await supabase.from("categories").select("name").eq("id", category_id).single();
      if (cat) categoryName = cat.name;
    }

    const productCards = (products || []).map((p: any, i: number) => {
      const wsp = Number(p.wsp) || 0;
      const price = disc > 0 ? Math.round(wsp * (1 - disc / 100)) : wsp;
      return `
        <div style="break-inside:avoid;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;background:#fff">
          ${p.image_url ? `<img src="${p.image_url}" style="width:100%;height:200px;object-fit:cover" />` : `<div style="height:200px;background:#f5f5f5;display:flex;align-items:center;justify-content:center;color:#999">No Image</div>`}
          <div style="padding:12px">
            <h3 style="margin:0;font-size:14px;font-weight:600;color:#333">${p.name}</h3>
            ${p.fabric ? `<p style="margin:4px 0 0;font-size:11px;color:#888">${p.fabric}</p>` : ""}
            <p style="margin:4px 0 0;font-size:11px;color:#888">${p.sizes} • ${p.pcs_per_set} pcs/set</p>
            <div style="margin-top:8px">
              ${disc > 0 ? `<span style="text-decoration:line-through;color:#999;font-size:12px">₹${wsp}</span> ` : ""}
              <span style="font-size:16px;font-weight:700;color:#5a1a2a">₹${price}/pc</span>
              <span style="font-size:10px;color:#888"> + 5% GST</span>
            </div>
          </div>
        </div>`;
    }).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Suvee Fashion - ${categoryName} Catalogue</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#333;padding:20px}
      .header{text-align:center;border-bottom:3px solid #5a1a2a;padding-bottom:20px;margin-bottom:24px}
      .header h1{color:#5a1a2a;font-size:28px;margin-bottom:4px}
      .header p{color:#888;font-size:13px}
      .meta{display:flex;justify-content:space-between;margin-bottom:20px;font-size:12px;color:#666}
      .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
      .footer{margin-top:30px;text-align:center;border-top:2px solid #5a1a2a;padding-top:15px;font-size:11px;color:#888}
      @media print{
        body{padding:10px}
        .grid{grid-template-columns:repeat(3,1fr);gap:10px}
        .no-print{display:none}
      }
      @media (max-width:600px){.grid{grid-template-columns:repeat(2,1fr)}}
    </style></head><body>
      <button class="no-print" onclick="window.print()" style="float:right;padding:10px 20px;background:#5a1a2a;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px">🖨️ Print / Save PDF</button>
      <div class="header">
        <h1>Suvee Fashion</h1>
        <p>Premium Kurti Manufacturer — Kolkata</p>
        <p style="margin-top:8px;font-size:16px;font-weight:600;color:#5a1a2a">${categoryName} Catalogue</p>
      </div>
      <div class="meta">
        <span>${products?.length || 0} Products</span>
        ${disc > 0 ? `<span style="color:#16a34a;font-weight:600">${disc}% Special Discount Applied</span>` : ""}
        <span>Generated: ${new Date().toLocaleDateString("en-IN")}</span>
      </div>
      <div class="grid">${productCards}</div>
      <div class="footer">
        <p><strong>Suvee Fashion</strong> • Kolkata, India • WhatsApp: +91 98316 40808</p>
        <p>All prices exclusive of 5% GST • Minimum order in set quantities</p>
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
