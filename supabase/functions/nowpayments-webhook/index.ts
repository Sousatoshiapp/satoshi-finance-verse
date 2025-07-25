import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[NOWPAYMENTS-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    logStep("Webhook received");

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const webhookData = await req.json();
    logStep("Webhook data received", webhookData);

    const { payment_id, payment_status, pay_amount, pay_currency, outcome_amount, outcome_currency } = webhookData;

    if (!payment_id) {
      logStep("No payment_id in webhook data");
      return new Response("Invalid webhook data", { status: 400 });
    }

    // Update crypto payment record
    const { data: cryptoPayment, error: updateError } = await supabaseService
      .from('crypto_payments')
      .update({
        status: payment_status,
        crypto_amount: pay_amount,
        crypto_currency: pay_currency,
        updated_at: new Date().toISOString(),
        ...(payment_status === 'finished' && { confirmed_at: new Date().toISOString() })
      })
      .eq('payment_id', payment_id)
      .select('*')
      .single();

    if (updateError) {
      logStep("Error updating crypto payment", updateError);
      return new Response("Error updating payment", { status: 500 });
    }

    logStep("Crypto payment updated", { payment_id, status: payment_status });

    // If payment is finished, award the user with Beetz
    if (payment_status === 'finished' && cryptoPayment) {
      const beetzAmount = Math.round(cryptoPayment.amount_usd * 100); // Convert back to beetz amount from the product

      // Extract beetz amount from product_id (format: beetz-{amount})
      const beetzMatch = cryptoPayment.product_id.match(/beetz-(\d+)/);
      const actualBeetzAmount = beetzMatch ? parseInt(beetzMatch[1]) : beetzAmount;

      // Award beetz to user
      const { error: awardError } = await supabaseService
        .from('profiles')
        .update({
          points: supabaseService.raw(`points + ${actualBeetzAmount}`)
        })
        .eq('id', cryptoPayment.user_id);

      if (awardError) {
        logStep("Error awarding beetz", awardError);
      } else {
        logStep("Beetz awarded", { user_id: cryptoPayment.user_id, amount: actualBeetzAmount });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in nowpayments-webhook", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});