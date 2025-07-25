import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CRYPTO-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const nowPaymentsApiKey = Deno.env.get("NOWPAYMENTS_API_KEY");
    if (!nowPaymentsApiKey) {
      logStep("ERROR: NOWPAYMENTS_API_KEY not found");
      throw new Error("NOWPAYMENTS_API_KEY is not set");
    }

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { productId, productName, amount, currency = "USD", type } = await req.json();
    
    if (!productId || !productName || !amount || !type) {
      throw new Error("Missing required parameters");
    }

    logStep("Payment request received", { productId, productName, amount, currency, type });

    // Create payment with NOWPayments
    const nowPaymentsResponse = await fetch("https://api.nowpayments.io/v1/payment", {
      method: "POST",
      headers: {
        "x-api-key": nowPaymentsApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: amount / 100, // Convert cents to dollars
        price_currency: currency.toLowerCase(),
        pay_currency: "btc", // Default to Bitcoin, can be made configurable
        order_id: `${type}_${productId}_${Date.now()}`,
        order_description: productName,
        ipn_callback_url: `${req.headers.get("origin")}/api/nowpayments-webhook`,
        success_url: `${req.headers.get("origin")}/store?payment=success&product=${encodeURIComponent(productId)}&type=${encodeURIComponent(type)}&provider=crypto`,
        cancel_url: `${req.headers.get("origin")}/store?payment=cancelled`,
      }),
    });

    if (!nowPaymentsResponse.ok) {
      const errorText = await nowPaymentsResponse.text();
      logStep("NOWPayments API error", { status: nowPaymentsResponse.status, error: errorText });
      throw new Error(`NOWPayments API error: ${errorText}`);
    }

    const paymentData = await nowPaymentsResponse.json();
    logStep("NOWPayments response received", { paymentId: paymentData.payment_id });

    // Store payment info in database for tracking
    const { error: insertError } = await supabaseClient
      .from('crypto_payments')
      .insert({
        user_id: user.id,
        payment_id: paymentData.payment_id,
        product_id: productId,
        product_name: productName,
        amount_usd: amount / 100,
        crypto_amount: paymentData.pay_amount,
        crypto_currency: paymentData.pay_currency,
        status: 'waiting',
        payment_url: paymentData.invoice_url,
        type: type,
      });

    if (insertError) {
      logStep("Database insert error", insertError);
      // Don't fail the request, just log the error
    }

    return new Response(JSON.stringify({
      success: true,
      payment_url: paymentData.invoice_url,
      payment_id: paymentData.payment_id,
      crypto_amount: paymentData.pay_amount,
      crypto_currency: paymentData.pay_currency,
      address: paymentData.pay_address,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-crypto-payment", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});