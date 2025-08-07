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
    
    // Importar configurações centralizadas
    const YIELD_CONFIG = {
      BASE_RATE: 0.001, // 0.1% ao dia
      ABSOLUTE_DAILY_CAP: 5, // 5 BTZ máximo por dia
      SUBSCRIPTION_BONUS: {
        free: 0,
        pro: 0.0005, // +0.05%
        elite: 0.001  // +0.1%
      },
      STREAK_BONUS: {
        DAYS_PER_TIER: 5,
        BONUS_PER_TIER: 0.0001, // +0.01% por tier
        MAX_BONUS: 0.003 // Máximo 0.3%
      }
    };
    
    const DAILY_YIELD_CAP = YIELD_CONFIG.ABSOLUTE_DAILY_CAP;

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

    // Calculate and apply daily yield with cap
    const { data: yieldData, error: yieldError } = await supabaseClient
      .rpc('calculate_daily_yield', { profile_id: profile.id });
    
    // Apply yield cap and validate
    if (yieldData?.[0]) {
      const originalAmount = yieldData[0].yield_amount;
      const cappedAmount = Math.min(originalAmount, DAILY_YIELD_CAP);
      
      if (originalAmount > DAILY_YIELD_CAP) {
        console.log(`YIELD CAP APPLIED: Original ${originalAmount} BTZ capped to ${cappedAmount} BTZ`);
        
        // Recalculate new total with capped amount
        const correctedTotal = yieldData[0].new_total - originalAmount + cappedAmount;
        
        // Update with capped amount
        await supabaseClient
          .from('profiles')
          .update({ 
            points: correctedTotal
          })
          .eq('id', profile.id);
        
        // Update response data
        yieldData[0].yield_amount = cappedAmount;
        yieldData[0].new_total = correctedTotal;
        
        // Log for monitoring
        console.log(`Profile ${profile.id}: Yield corrected from ${originalAmount} to ${cappedAmount} BTZ`);
      } else {
        console.log(`Yield within cap: ${originalAmount} BTZ (cap: ${DAILY_YIELD_CAP})`);
      }
    }

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