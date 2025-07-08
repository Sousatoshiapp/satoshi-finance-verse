import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get request parameters
    const { batchSize = 50, offset = 0 } = await req.json().catch(() => ({}));

    console.log(`Processing bot realism batch: size=${batchSize}, offset=${offset}`);

    // Execute the batch processing function
    const { data, error } = await supabaseClient.rpc('enhance_bot_realism_batch', {
      batch_size: batchSize,
      offset_value: offset
    });

    if (error) {
      console.error('Error enhancing bot realism batch:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    const result = data[0]; // Function returns a single row with results

    console.log(`Batch completed: processed=${result.processed}, total=${result.total_bots}, has_more=${result.has_more}`);

    return new Response(
      JSON.stringify({ 
        success: result.success,
        processed: result.processed,
        total: result.total_bots,
        hasMore: result.has_more,
        nextOffset: offset + batchSize,
        error: result.error_message || null,
        progress: {
          processed: offset + result.processed,
          total: result.total_bots,
          percentage: Math.round(((offset + result.processed) / result.total_bots) * 100)
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in enhance-bot-realism-batch function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});