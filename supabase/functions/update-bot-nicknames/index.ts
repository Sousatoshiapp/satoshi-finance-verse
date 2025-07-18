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

    console.log('Starting bot nickname update...');

    // Execute the update_bot_nicknames function
    const { data, error } = await supabaseClient.rpc('update_bot_nicknames');

    if (error) {
      console.error('Error updating bot nicknames:', error);
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

    const updatedCount = data || 0;
    const message = updatedCount === 0 
      ? 'Todos os bots já possuem nomes realistas. Nenhuma atualização necessária.'
      : `${updatedCount} bots tiveram seus nicknames atualizados com sucesso`;

    console.log(`Bot nickname update completed. Updated: ${updatedCount}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: message,
        updated_count: updatedCount,
        progress: {
          processed: updatedCount,
          total: updatedCount,
          percentage: 100
        },
        updated: updatedCount,
        failed: 0,
        remaining: 0,
        sample_updates: []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in update-bot-nicknames function:', error);
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