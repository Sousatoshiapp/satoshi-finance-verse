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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select(`
        id, points, protected_btz, consecutive_login_days, 
        total_yield_earned, last_yield_date, last_login_date,
        subscription_tier
      `)
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get yield history (last 30 days)
    const { data: yieldHistory } = await supabaseClient
      .from('btz_yield_history')
      .select('*')
      .eq('user_id', profile.id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    // Get penalty history (last 30 days)
    const { data: penaltyHistory } = await supabaseClient
      .from('btz_penalty_history')
      .select('*')
      .eq('user_id', profile.id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    // Calculate analytics
    const totalYieldLast30Days = yieldHistory?.reduce((sum, record) => sum + record.yield_amount, 0) || 0;
    const totalPenaltyLast30Days = penaltyHistory?.reduce((sum, record) => sum + record.penalty_amount, 0) || 0;
    
    // Calculate current yield rate
    const baseRate = 0.005; // 0.5%
    const subscriptionBonus = profile.subscription_tier === 'pro' ? 0.005 : 
                             profile.subscription_tier === 'elite' ? 0.010 : 0;
    const streakBonus = Math.min(0.015, Math.floor(profile.consecutive_login_days / 5) * 0.001);
    const currentYieldRate = baseRate + subscriptionBonus + streakBonus;

    // Calculate next yield amount
    const nextYieldAmount = Math.floor(profile.points * currentYieldRate);

    // Time until next yield (if not applied today)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilNextYield = tomorrow.getTime() - now.getTime();

    const analytics = {
      current: {
        total_btz: profile.points,
        protected_btz: profile.protected_btz,
        unprotected_btz: profile.points - profile.protected_btz,
        consecutive_login_days: profile.consecutive_login_days,
        current_yield_rate: currentYieldRate,
        next_yield_amount: nextYieldAmount,
        time_until_next_yield_ms: timeUntilNextYield,
        yield_applied_today: profile.last_yield_date === new Date().toISOString().split('T')[0]
      },
      historical: {
        total_yield_earned: profile.total_yield_earned,
        yield_last_30_days: totalYieldLast30Days,
        penalty_last_30_days: totalPenaltyLast30Days,
        net_gain_last_30_days: totalYieldLast30Days - totalPenaltyLast30Days
      },
      charts: {
        yield_history: yieldHistory || [],
        penalty_history: penaltyHistory || []
      },
      bonuses: {
        base_rate: baseRate,
        subscription_bonus: subscriptionBonus,
        streak_bonus: streakBonus,
        subscription_tier: profile.subscription_tier
      }
    };

    return new Response(
      JSON.stringify(analytics),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in get-btz-analytics:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});