import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { activityType = 'all', batchOffset = 0 } = await req.json();
    
    console.log(`Running bot activities: ${activityType}`);

    // Get active bots (sample a subset to avoid overwhelming the system)
    const { data: bots, error: botsError } = await supabase
      .from('profiles')
      .select('id, nickname, level, xp, points, streak')
      .eq('is_bot', true)
      .order('created_at', { ascending: false })
      .range(batchOffset, batchOffset + 599) // Process 600 bots at a time with offset
      .limit(600);

    if (botsError) {
      throw botsError;
    }

    const activitiesCreated = [];

    for (const bot of bots || []) {
      // Skip some bots randomly to simulate realistic activity patterns
      if (Math.random() < 0.3) continue; // 70% activity rate

      const activities = [];

      // Quiz Activity (most common)
      if (activityType === 'all' || activityType === 'quiz') {
        if (Math.random() < 0.6) { // 60% chance
          const questionsTotal = Math.floor(Math.random() * 8) + 3;
          const accuracy = 0.65 + (Math.random() * 0.3); // 65-95% accuracy
          const questionsCorrect = Math.floor(questionsTotal * accuracy);
          const xpGained = questionsCorrect * (5 + Math.floor(Math.random() * 10));

          // Create quiz session
          const { data: session } = await supabase
            .from('quiz_sessions')
            .insert({
              user_id: bot.id,
              questions_total: questionsTotal,
              questions_correct: questionsCorrect,
              questions_incorrect: questionsTotal - questionsCorrect,
              time_spent: Math.floor(Math.random() * 240) + 60,
              completed_at: new Date().toISOString(),
              performance_score: accuracy * 100,
              session_type: 'practice'
            })
            .select()
            .single();

          // Award XP and update weekly leaderboard
          if (session) {
            await supabase
              .from('profiles')
              .update({ 
                xp: bot.xp + xpGained,
                level: Math.floor((bot.xp + xpGained) / 1000) + 1
              })
              .eq('id', bot.id);

            await supabase.rpc('update_weekly_leaderboard', {
              profile_id: bot.id,
              xp_gained: xpGained,
              quiz_points: questionsCorrect * 10,
              duel_win: false
            });

            activities.push('quiz_completed');
          }
        }
      }

      // Duel Activity
      if (activityType === 'all' || activityType === 'duel') {
        if (Math.random() < 0.15) { // 15% chance
          // Find another bot to duel with
          const { data: otherBots } = await supabase
            .from('profiles')
            .select('id')
            .eq('is_bot', true)
            .neq('id', bot.id)
            .limit(10);

          if (otherBots && otherBots.length > 0) {
            const opponent = otherBots[Math.floor(Math.random() * otherBots.length)];
            
            // Create duel invite
            const { data: invite } = await supabase
              .from('duel_invites')
              .insert({
                challenger_id: bot.id,
                challenged_id: opponent.id,
                quiz_topic: 'random',
                status: 'accepted'
              })
              .select()
              .single();

            if (invite) {
              // Simulate duel completion
              const winner = Math.random() > 0.5 ? bot.id : opponent.id;
              
              await supabase
                .from('duels')
                .insert({
                  invite_id: invite.id,
                  player1_id: bot.id,
                  player2_id: opponent.id,
                  quiz_topic: 'random',
                  status: 'completed',
                  winner_id: winner,
                  player1_score: Math.floor(Math.random() * 100),
                  player2_score: Math.floor(Math.random() * 100),
                  finished_at: new Date().toISOString(),
                  questions: []
                });

              // Update weekly leaderboard for winner
              if (winner === bot.id) {
                await supabase.rpc('update_weekly_leaderboard', {
                  profile_id: bot.id,
                  xp_gained: 0,
                  quiz_points: 0,
                  duel_win: true
                });
                activities.push('duel_won');
              } else {
                activities.push('duel_lost');
              }
            }
          }
        }
      }

      // Social Activity
      if (activityType === 'all' || activityType === 'social') {
        if (Math.random() < 0.05) { // 5% chance
          const socialPosts = [
            "Acabei de completar um quiz difícil! 💪",
            "Bora para mais um duelo! Quem aceita? ⚔️",
            "Subindo de nível no Satoshi Finance! 🚀",
            "Que quiz interessante sobre DeFi! 📈",
            "Conquistando novos achievements! 🏆"
          ];

          await supabase
            .from('social_posts')
            .insert({
              user_id: bot.id,
              content: socialPosts[Math.floor(Math.random() * socialPosts.length)],
              post_type: 'text'
            });

          activities.push('social_post');
        }
      }

      // Streak Activity
      if (Math.random() < 0.8) { // 80% chance to maintain streak
        await supabase.rpc('update_user_streak', {
          profile_id: bot.id
        });
        activities.push('streak_updated');
      }

      // Log activities
      if (activities.length > 0) {
        await supabase
          .from('bot_activity_log')
          .insert({
            bot_id: bot.id,
            activity_type: 'daily_activities',
            activity_data: {
              activities: activities,
              timestamp: new Date().toISOString()
            }
          });

        activitiesCreated.push({
          botId: bot.id,
          nickname: bot.nickname,
          activities: activities
        });
      }
    }

    console.log(`Bot activities completed. ${activitiesCreated.length} bots were active.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        activeBots: activitiesCreated.length,
        activities: activitiesCreated
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in bot-activities function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});