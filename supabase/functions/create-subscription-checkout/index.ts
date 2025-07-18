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
  console.log(`[CREATE-SUBSCRIPTION-CHECKOUT] ${step}${detailsStr}`);
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
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not found in environment");
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    logStep("Stripe key verified", { keyLength: stripeKey.length });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const body = await req.json();
    const { tier } = body;

    if (!tier || !['pro', 'elite'].includes(tier)) {
      throw new Error("Invalid subscription tier");
    }
    logStep("Subscription tier validated", { tier });

    // Get user profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('id, subscription_tier')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      throw new Error("User profile not found");
    }

    if (profile.subscription_tier === tier) {
      throw new Error("User already has this subscription tier");
    }
    logStep("User profile verified", { profileId: profile.id, currentTier: profile.subscription_tier });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
          profile_id: profile.id
        }
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // Define prices based on tier
    const prices = {
      pro: 1490, // R$ 14,90 in cents
      elite: 2990 // R$ 29,90 in cents
    };

    const origin = req.headers.get("origin") || "http://localhost:3000";
    
    // Create Stripe checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Satoshi ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
              description: tier === 'pro' 
                ? "Duelos ilimitados, XP 2x, avatares exclusivos e muito mais!"
                : "XP 3x, AI Trading Advisor, avatares lendários e benefícios premium!"
            },
            unit_amount: prices[tier as keyof typeof prices],
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
      cancel_url: `${origin}/subscription-plans?canceled=true`,
      metadata: {
        user_id: user.id,
        profile_id: profile.id,
        tier: tier,
        type: 'subscription'
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          profile_id: profile.id,
          tier: tier
        }
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-subscription-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});