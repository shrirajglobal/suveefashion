import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

    // Validate UUID format
    if (!UUID_RE.test(user_id)) {
      return new Response(
        JSON.stringify({ error: "Invalid user ID format" }),
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

    // Verify user actually exists in auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(user_id);
    if (authError || !authUser?.user) {
      console.error("User not found in auth:", user_id);
      return new Response(
        JSON.stringify({ error: "User account not found. Please try registering again." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upsert to handle idempotent retries (user_id has unique constraint via FK)
    const { error } = await supabaseAdmin.from("buyer_profiles").upsert(
      {
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
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("Profile upsert error:", error);
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
