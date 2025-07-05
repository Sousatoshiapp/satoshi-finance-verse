import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.json();
    const { sessionId } = body;

    // Input validation
    if (!sessionId || typeof sessionId !== 'string') {
      throw new Error('Invalid or missing sessionId');
    }

    // Sanitize sessionId
    const sanitizedSessionId = sessionId.trim();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sanitizedSessionId);

    if (session.payment_status !== 'paid') {
      return new Response(JSON.stringify({ error: 'Payment not completed' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { productId, userId, type } = session.metadata!;

    if (type === 'beetz') {
      // Validate and extract Beetz amount from productId (e.g., "beetz-100" -> 100)
      if (!productId || !productId.includes('-')) {
        throw new Error('Invalid productId format for beetz');
      }
      const beetzAmount = parseInt(productId.split('-')[1]);
      if (isNaN(beetzAmount) || beetzAmount <= 0 || beetzAmount > 10000) {
        throw new Error('Invalid beetz amount');
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('points')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return new Response(JSON.stringify({ error: 'User profile not found' }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        });
      }

      // Update user points
      const newPoints = (profile.points || 0) + beetzAmount;
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ points: newPoints })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating points:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to update points' }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      console.log(`Added ${beetzAmount} Beetz to user ${userId}. New total: ${newPoints}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});