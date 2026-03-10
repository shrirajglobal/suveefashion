import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      user_id,
      business_name,
      contact_person,
      phone,
      email,
      city,
      state,
      business_type,
      gst_number,
      referral_source,
    } = body;

    // Validate required fields
    if (!user_id || !business_name || !contact_person || !phone || !email || !city) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate field lengths
    if (business_name.length > 100 || contact_person.length > 100 || phone.length > 15 || email.length > 255 || city.length > 50) {
      return new Response(
        JSON.stringify({ error: "Field exceeds maximum length" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate business_type enum
    if (business_type && !["retailer", "wholesaler"].includes(business_type)) {
      return new Response(
        JSON.stringify({ error: "Invalid business type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabaseAdmin.from("buyer_profiles").insert({
      user_id,
      business_name: business_name.trim(),
      contact_person: contact_person.trim(),
      phone: phone.trim(),
      email: email.trim(),
      city: city.trim(),
      state: (state || "West Bengal").trim(),
      business_type: business_type || "retailer",
      gst_number: gst_number?.trim() || null,
      referral_source: referral_source?.trim() || null,
    });

    if (error) {
      console.error("Profile insert error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
