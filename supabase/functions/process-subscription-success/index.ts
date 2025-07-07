import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-SUBSCRIPTION-SUCCESS] ${step}${detailsStr}`);
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
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const body = await req.json();
    const { session_id } = body;

    if (!session_id) {
      throw new Error("Missing session_id");
    }
    logStep("Session ID received", { sessionId: session_id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    logStep("Session retrieved", { 
      sessionId: session.id, 
      paymentStatus: session.payment_status,
      mode: session.mode 
    });

    if (session.payment_status !== 'paid') {
      throw new Error(`Payment not completed. Status: ${session.payment_status}`);
    }

    if (session.mode !== 'subscription') {
      throw new Error(`Invalid session mode: ${session.mode}`);
    }

    if (!session.subscription) {
      throw new Error("No subscription ID in session");
    }

    // Get session metadata
    const { user_id, profile_id, tier } = session.metadata || {};
    if (!user_id || !profile_id || !tier) {
      throw new Error("Missing required metadata in session");
    }

    // Verify the user matches
    if (user_id !== user.id) {
      throw new Error("User ID mismatch");
    }

    logStep("Processing subscription activation", { userId: user_id, profileId: profile_id, tier });

    // Get the Stripe subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    logStep("Subscription retrieved", { 
      subscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end 
    });

    // Update user profile with subscription tier
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({ 
        subscription_tier: tier,
        subscription_expires_at: null, // Active subscription
        updated_at: new Date().toISOString()
      })
      .eq('id', profile_id);

    if (profileError) {
      logStep("Error updating profile", { error: profileError });
      throw new Error(`Failed to update profile: ${profileError.message}`);
    }

    logStep("Profile updated successfully");

    // Create or update subscription record
    const { error: subscriptionError } = await supabaseClient
      .from('subscriptions')
      .upsert({
        user_id: profile_id,
        stripe_customer_id: session.customer,
        stripe_subscription_id: subscription.id,
        subscription_tier: tier,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (subscriptionError) {
      logStep("Error creating subscription record", { error: subscriptionError });
      throw new Error(`Failed to create subscription: ${subscriptionError.message}`);
    }

    logStep("Subscription record created successfully");

    // Award monthly Beetz based on tier
    const beetzAmount = tier === 'pro' ? 50 : tier === 'elite' ? 100 : 0;
    if (beetzAmount > 0) {
      const { error: beetzError } = await supabaseClient
        .from('profiles')
        .update({ 
          points: supabaseClient.sql`points + ${beetzAmount}`
        })
        .eq('id', profile_id);

      if (beetzError) {
        logStep("Error awarding Beetz", { error: beetzError });
      } else {
        logStep("Beetz awarded successfully", { amount: beetzAmount });
      }
    }

    // Log successful activation
    await supabaseClient
      .from('activity_feed')
      .insert({
        user_id: profile_id,
        activity_type: 'subscription_activated',
        activity_data: {
          tier: tier,
          subscription_id: subscription.id,
          beetz_awarded: beetzAmount,
          timestamp: new Date().toISOString()
        }
      });

    logStep("Subscription activation completed successfully");

    return new Response(JSON.stringify({ 
      success: true,
      tier: tier,
      beetz_awarded: beetzAmount,
      subscription_id: subscription.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-subscription-success", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});