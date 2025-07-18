import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client using the anon key for user authentication.
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Parse request body
    const body = await req.json();
    const { productId, productName, amount, type } = body;

    // Enhanced input validation with security constraints
    if (!productId || typeof productId !== 'string' || productId.length > 100) {
      throw new Error('Invalid or missing productId');
    }
    if (!productName || typeof productName !== 'string' || productName.length > 200) {
      throw new Error('Invalid or missing productName');
    }
    if (!amount || typeof amount !== 'number' || amount <= 0 || amount > 1000000 || !Number.isInteger(amount)) {
      throw new Error('Invalid amount - must be positive integer under 1,000,000 cents');
    }
    if (type && (typeof type !== 'string' || type.length > 50)) {
      throw new Error('Invalid type parameter');
    }

    // Sanitize inputs
    const sanitizedProductId = productId.trim().slice(0, 100);
    const sanitizedProductName = productName.trim().slice(0, 200);
    const sanitizedType = type?.trim() || 'product';

    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if a Stripe customer record exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create a one-time payment session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: { name: sanitizedProductName },
            unit_amount: amount, // Amount in centavos
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/store?payment=success&product=${encodeURIComponent(sanitizedProductId)}&type=${encodeURIComponent(sanitizedType)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/store?payment=cancelled`,
      metadata: {
        productId: sanitizedProductId,
        userId: user.id,
        type: sanitizedType,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});