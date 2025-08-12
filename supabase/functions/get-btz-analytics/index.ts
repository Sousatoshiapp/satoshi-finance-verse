import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Authenticate user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get BTZ yield history for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: yieldHistory } = await supabaseClient
      .from('btz_yield_history')
      .select('*')
      .eq('user_id', profile.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    const { data: penaltyHistory } = await supabaseClient
      .from('btz_penalty_history')
      .select('*')
      .eq('user_id', profile.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    // Calculate analytics
    const totalYield = yieldHistory?.reduce((sum, record) => sum + (record.yield_amount || 0), 0) || 0;
    const totalPenalties = penaltyHistory?.reduce((sum, record) => sum + (record.penalty_amount || 0), 0) || 0;
    const netGain = totalYield - totalPenalties;

    // Calculate current yield rate
    const YIELD_CONFIG = {
      baseRate: 0.001, // 0.1% daily
      streakBonus: Math.min(0.003, (profile.consecutive_login_days / 5) * 0.0001),
      subscriptionBonus: profile.subscription_tier === 'pro' ? 0.0005 : profile.subscription_tier === 'elite' ? 0.001 : 0,
    };

    const currentYieldRate = YIELD_CONFIG.baseRate + YIELD_CONFIG.streakBonus + YIELD_CONFIG.subscriptionBonus;
    const nextYieldAmount = profile.points * currentYieldRate;

    const analytics = {
      totalYield,
      totalPenalties,
      netGain,
      currentYieldRate,
      nextYieldAmount,
      yieldHistory: yieldHistory?.slice(0, 7) || [], // Last 7 records
      penaltyHistory: penaltyHistory?.slice(0, 7) || [], // Last 7 records
      streakBonus: YIELD_CONFIG.streakBonus,
      subscriptionBonus: YIELD_CONFIG.subscriptionBonus,
      consecutiveLoginDays: profile.consecutive_login_days,
    };

    return new Response(
      JSON.stringify(analytics),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in get-btz-analytics:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})