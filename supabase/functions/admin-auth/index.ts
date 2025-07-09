import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, sessionToken, userAgent, ipAddress } = await req.json();
    
    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "create_session") {
      // Verify user is admin
      const { data: isAdmin, error: adminError } = await supabase
        .rpc('is_admin', { user_uuid: user.id });

      if (adminError || !isAdmin) {
        console.log(`Unauthorized admin access attempt by user: ${user.id}`);
        return new Response(
          JSON.stringify({ error: "Access denied: Admin privileges required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create secure admin session
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours

      const { error: sessionError } = await supabase
        .from('admin_sessions')
        .insert({
          user_id: user.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString(),
          ip_address: ipAddress,
          user_agent: userAgent
        });

      if (sessionError) {
        console.error("Session creation error:", sessionError);
        return new Response(
          JSON.stringify({ error: "Failed to create session" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get admin role
      const { data: role } = await supabase
        .rpc('get_admin_role', { user_uuid: user.id });

      console.log(`Admin session created for user: ${user.email}, role: ${role}`);

      return new Response(
        JSON.stringify({ 
          success: true,
          sessionToken,
          role,
          expiresAt: expiresAt.toISOString()
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (action === "verify_session") {
      if (!sessionToken) {
        return new Response(
          JSON.stringify({ error: "Session token required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: isValid } = await supabase
        .rpc('verify_admin_session', { session_token: sessionToken });

      if (isValid) {
        // Update last activity
        await supabase
          .from('admin_sessions')
          .update({ last_activity: new Date().toISOString() })
          .eq('session_token', sessionToken);
      }

      return new Response(
        JSON.stringify({ valid: isValid }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (action === "revoke_session") {
      if (!sessionToken) {
        return new Response(
          JSON.stringify({ error: "Session token required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Delete the session
      const { error: revokeError } = await supabase
        .from('admin_sessions')
        .delete()
        .eq('session_token', sessionToken);

      if (revokeError) {
        console.error("Session revocation error:", revokeError);
        return new Response(
          JSON.stringify({ error: "Failed to revoke session" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Admin session revoked for user: ${user.email}`);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in admin-auth function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});