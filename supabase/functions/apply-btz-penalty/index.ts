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

    // This function runs periodically to check and apply penalties for inactive users
    console.log('Starting penalty check for inactive users...');

    // Get all users who haven't logged in for 2+ days
    const { data: inactiveUsers, error } = await supabaseClient
      .from('profiles')
      .select('id, user_id, nickname, last_login_date, points, protected_btz')
      .lt('last_login_date', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .gt('points', 0); // Only users with BTZ

    if (error) {
      console.error('Error fetching inactive users:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch inactive users' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${inactiveUsers?.length || 0} inactive users to check`);

    const results = [];

    if (inactiveUsers) {
      for (const user of inactiveUsers) {
        try {
          // Apply penalty for this user
          const { data: penaltyData, error: penaltyError } = await supabaseClient
            .rpc('apply_btz_penalty', { profile_id: user.id });

          if (penaltyError) {
            console.error(`Error applying penalty for user ${user.nickname}:`, penaltyError);
            continue;
          }

          const penaltyResult = penaltyData?.[0];
          if (penaltyResult?.penalty_applied && penaltyResult.penalty_amount > 0) {
            console.log(`Applied penalty to ${user.nickname}: -${penaltyResult.penalty_amount} BTZ (${penaltyResult.days_inactive} days inactive)`);
            
            results.push({
              user_id: user.user_id,
              nickname: user.nickname,
              penalty_amount: penaltyResult.penalty_amount,
              days_inactive: penaltyResult.days_inactive
            });
          }
        } catch (userError) {
          console.error(`Error processing user ${user.nickname}:`, userError);
        }
      }
    }

    console.log(`Penalty check completed. Applied penalties to ${results.length} users.`);

    return new Response(
      JSON.stringify({
        success: true,
        processed_users: inactiveUsers?.length || 0,
        penalties_applied: results.length,
        results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in apply-btz-penalty:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});