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

    // Check if yield was applied today
    const today = new Date().toISOString().split('T')[0];
    const yieldAppliedToday = yieldHistory?.some(record => 
      record.created_at?.split('T')[0] === today
    ) || false;

    // Calculate time until next yield (24 hours from last yield or from now if no yields)
    const lastYieldDate = yieldHistory?.[0]?.created_at ? new Date(yieldHistory[0].created_at) : new Date();
    const nextYieldTime = new Date(lastYieldDate);
    nextYieldTime.setHours(24, 0, 0, 0); // Next day at midnight
    const timeUntilNextYield = Math.max(0, nextYieldTime.getTime() - new Date().getTime());

    // Return data in the expected structure
    const analytics = {
      current: {
        total_btz: profile.points || 0,
        protected_btz: profile.protected_btz || 0,
        unprotected_btz: Math.max(0, (profile.points || 0) - (profile.protected_btz || 0)),
        consecutive_login_days: profile.consecutive_login_days || 0,
        current_yield_rate: currentYieldRate,
        next_yield_amount: nextYieldAmount,
        time_until_next_yield_ms: timeUntilNextYield,
        yield_applied_today: yieldAppliedToday,
      },
      historical: {
        total_yield_earned: totalYield,
        yield_last_30_days: totalYield,
        penalty_last_30_days: totalPenalties,
        net_gain_last_30_days: netGain,
      },
      charts: {
        yield_history: yieldHistory?.slice(0, 7)?.map(record => ({
          id: record.id || '',
          yield_amount: record.yield_amount || 0,
          yield_rate: record.yield_rate || 0,
          streak_bonus: record.streak_bonus || 0,
          subscription_bonus: record.subscription_bonus || 0,
          created_at: record.created_at || '',
        })) || [],
        penalty_history: penaltyHistory?.slice(0, 7)?.map(record => ({
          id: record.id || '',
          penalty_amount: record.penalty_amount || 0,
          days_inactive: record.days_inactive || 0,
          penalty_rate: record.penalty_rate || 0,
          created_at: record.created_at || '',
        })) || [],
      },
      bonuses: {
        base_rate: YIELD_CONFIG.baseRate,
        subscription_bonus: YIELD_CONFIG.subscriptionBonus,
        streak_bonus: YIELD_CONFIG.streakBonus,
        subscription_tier: profile.subscription_tier || 'free',
      },
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