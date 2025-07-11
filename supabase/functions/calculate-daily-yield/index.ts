import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile ID
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update login streak first
    const { data: streakData } = await supabaseClient
      .rpc('update_login_streak', { profile_id: profile.id });

    console.log('Streak updated:', streakData);

    // Calculate and apply daily yield
    const { data: yieldData, error: yieldError } = await supabaseClient
      .rpc('calculate_daily_yield', { profile_id: profile.id });

    if (yieldError) {
      console.error('Yield calculation error:', yieldError);
      return new Response(
        JSON.stringify({ error: 'Failed to calculate yield' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Apply penalties for inactivity
    const { data: penaltyData } = await supabaseClient
      .rpc('apply_btz_penalty', { profile_id: profile.id });

    console.log('Penalty check:', penaltyData);

    return new Response(
      JSON.stringify({
        success: true,
        yield: yieldData?.[0] || null,
        streak: streakData?.[0] || null,
        penalty: penaltyData?.[0] || null,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in calculate-daily-yield:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});