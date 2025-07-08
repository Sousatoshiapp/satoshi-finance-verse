import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action } = await req.json();

    let result = {};

    switch (action) {
      case 'vacuum_analyze':
        // Run VACUUM ANALYZE on key tables for performance
        await supabase.rpc('vacuum_analyze_tables');
        result = { message: 'Database maintenance completed' };
        break;

      case 'update_bot_activities':
        // Background task to update bot activities
        const { data: botsData } = await supabase
          .from('profiles')
          .select('id')
          .eq('is_bot', true)
          .limit(50);

        if (botsData) {
          for (const bot of botsData) {
            // Update weekly leaderboard for bots
            await supabase.rpc('update_weekly_leaderboard', {
              profile_id: bot.id,
              xp_gained: Math.floor(Math.random() * 100),
              quiz_points: Math.floor(Math.random() * 50),
              duel_win: Math.random() > 0.7
            });
          }
        }
        result = { message: 'Bot activities updated', count: botsData?.length || 0 };
        break;

      case 'cleanup_old_data':
        // Clean up old data that's no longer needed
        const cleanupPromises = [
          // Delete old quiz sessions (older than 90 days)
          supabase
            .from('quiz_sessions')
            .delete()
            .lt('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()),
          
          // Delete old activity feed entries (older than 30 days)
          supabase
            .from('activity_feed')
            .delete()
            .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          
          // Delete expired daily missions
          supabase
            .from('daily_missions')
            .delete()
            .lt('expires_at', new Date().toISOString())
        ];

        await Promise.all(cleanupPromises);
        result = { message: 'Old data cleanup completed' };
        break;

      case 'cache_warming':
        // Pre-warm caches by running common queries
        const warmingPromises = [
          // Warm leaderboard cache
          supabase.rpc('get_weekly_leaderboard_optimized', { limit_count: 10 }),
          
          // Warm active missions cache
          supabase.rpc('get_active_missions_cached'),
          
          // Warm user counts
          supabase.from('profiles').select('count', { count: 'exact', head: true })
        ];

        await Promise.all(warmingPromises);
        result = { message: 'Cache warming completed' };
        break;

      default:
        result = { error: 'Unknown action' };
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Background task error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});