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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check caller has admin role
    const { data: callerRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin");

    if (!callerRoles || callerRoles.length === 0) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, email, user_id } = await req.json();

    if (action === "list") {
      // Get all sub_admin roles
      const { data: subAdminRoles, error } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "sub_admin");

      if (error) throw error;

      // Look up emails from auth.users
      const subAdmins = [];
      for (const role of subAdminRoles || []) {
        const { data: { user } } = await supabase.auth.admin.getUserById(role.user_id);
        if (user) {
          subAdmins.push({ user_id: user.id, email: user.email });
        }
      }

      return new Response(JSON.stringify({ subAdmins }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "add") {
      if (!email) {
        return new Response(JSON.stringify({ error: "Email required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Find user by email
      const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
      if (listErr) throw listErr;

      const targetUser = users.find((u) => u.email === email);
      if (!targetUser) {
        return new Response(
          JSON.stringify({ error: "No registered user found with this email" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check not already sub_admin
      const { data: existing } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", targetUser.id)
        .eq("role", "sub_admin");

      if (existing && existing.length > 0) {
        return new Response(
          JSON.stringify({ error: "User is already a sub-admin" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Insert sub_admin role
      const { error: insertErr } = await supabase
        .from("user_roles")
        .insert({ user_id: targetUser.id, role: "sub_admin" });

      if (insertErr) throw insertErr;

      return new Response(
        JSON.stringify({ success: true, email: targetUser.email, user_id: targetUser.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "remove") {
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: delErr } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", user_id)
        .eq("role", "sub_admin");

      if (delErr) throw delErr;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
