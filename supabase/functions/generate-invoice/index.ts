import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function numberToWords(n: number): string {
  if (n === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convert(num: number): string {
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
    if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " and " + convert(num % 100) : "");
    if (num < 100000) return convert(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + convert(num % 1000) : "");
    if (num < 10000000) return convert(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + convert(num % 100000) : "");
    return convert(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + convert(num % 10000000) : "");
  }

  const rupees = Math.floor(n);
  const paise = Math.round((n - rupees) * 100);
  let result = "Rupees " + convert(rupees);
  if (paise > 0) result += " and " + convert(paise) + " Paise";
  return result + " Only";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { order_id } = await req.json();
    if (!order_id) throw new Error("order_id required");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const headers = {
      "apikey": SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    };

    // Fetch order
    const orderRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${order_id}&select=*`, { headers });
    const orders = await orderRes.json();
    if (!orders.length) throw new Error("Order not found");
    const order = orders[0];

    // Fetch order items
    const itemsRes = await fetch(`${SUPABASE_URL}/rest/v1/order_items?order_id=eq.${order_id}&select=*`, { headers });
    const items = await itemsRes.json();

    // Fetch buyer profile
    const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/buyer_profiles?user_id=eq.${order.user_id}&select=*`, { headers });
    const profiles = await profileRes.json();
    const buyer = profiles[0] || {};

    const totalAmount = Number(order.total_amount);
    const cgst = totalAmount * 0.025; // 2.5% CGST
    const sgst = totalAmount * 0.025; // 2.5% SGST (intra-state assumed)
    const grandTotal = totalAmount + cgst + sgst;

    const invoiceDate = new Date(order.created_at).toLocaleDateString("en-IN");
    const invoiceNumber = `INV-${order.order_number.replace("SVF-", "")}`;

    const invoice = {
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      order_number: order.order_number,
      seller: {
        name: "Suvee Fashion",
        address: "20/21 Bhawan Ganguly Lane, 5th Floor, Howrah 711101",
        state: "West Bengal",
        gstin: "19AHOPL4954B1Z4",
        phone: "+91 98316 40808",
      },
      buyer: {
        name: buyer.business_name || "N/A",
        contact: buyer.contact_person || "N/A",
        address: order.shipping_address || `${buyer.city || ""}, ${buyer.state || ""}`,
        gstin: buyer.gst_number || "N/A",
        phone: buyer.phone || "N/A",
        state: buyer.state || "N/A",
      },
      items: items.map((item: any, idx: number) => ({
        sno: idx + 1,
        name: item.product_name,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        total: Number(item.total_price),
      })),
      subtotal: totalAmount,
      cgst_rate: 2.5,
      cgst_amount: cgst,
      sgst_rate: 2.5,
      sgst_amount: sgst,
      grand_total: grandTotal,
      amount_in_words: numberToWords(grandTotal),
    };

    return new Response(JSON.stringify(invoice), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
