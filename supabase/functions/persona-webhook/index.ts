import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PERSONA-WEBHOOK] ${step}${detailsStr}`);
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

    const { type, data } = webhookData;

    if (!data?.inquiry_id) {
      logStep("No inquiry_id in webhook data");
      return new Response("Invalid webhook data", { status: 400 });
    }

    if (type === 'verification.completed') {
      logStep("Processing verification completed", { inquiry_id: data.inquiry_id });
      
      const { error: updateError } = await supabaseService
        .from('profiles')
        .update({ 
          kyc_status: 'approved', 
          kyc_completed_at: new Date().toISOString() 
        })
        .eq('persona_inquiry_id', data.inquiry_id);

      if (updateError) {
        logStep("Error updating profile for completed verification", updateError);
        return new Response("Error updating profile", { status: 500 });
      }

      logStep("KYC status updated to approved", { inquiry_id: data.inquiry_id });
    }
    
    if (type === 'verification.failed' || type === 'verification.declined') {
      logStep("Processing verification failed/declined", { inquiry_id: data.inquiry_id });
      
      const { error: updateError } = await supabaseService
        .from('profiles')
        .update({ kyc_status: 'rejected' })
        .eq('persona_inquiry_id', data.inquiry_id);

      if (updateError) {
        logStep("Error updating profile for failed verification", updateError);
        return new Response("Error updating profile", { status: 500 });
      }

      logStep("KYC status updated to rejected", { inquiry_id: data.inquiry_id });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in persona-webhook", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
