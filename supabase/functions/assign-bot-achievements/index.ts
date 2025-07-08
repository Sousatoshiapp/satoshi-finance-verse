import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let achievementCount = 0
    
    // Get all bots first
    const { data: bots, error: botsError } = await supabase
      .from('profiles')
      .select('id, level, streak')
      .eq('is_bot', true)

    if (botsError) {
      throw botsError
    }

    // Get all achievement definitions
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('id, name, requirement_data')

    if (achievementsError) {
      throw achievementsError
    }

    const achievementMap = achievements.reduce((acc, achievement) => {
      acc[achievement.name] = achievement
      return acc
    }, {} as Record<string, any>)

    // Process each bot
    for (const bot of bots) {
      // Get quiz statistics for this bot
      const { data: quizData } = await supabase
        .from('quiz_sessions')
        .select('max_combo')
        .eq('user_id', bot.id)
      
      const quizCount = quizData?.length || 0
      const maxCombo = Math.max(...(quizData?.map(qs => qs.max_combo) || [0]))

      const achievementsToAdd = []

      // Level achievements
      if (bot.level >= 5 && achievementMap['first_steps']) {
        achievementsToAdd.push({
          user_id: bot.id,
          achievement_id: achievementMap['first_steps'].id,
          progress_data: { level_achieved: bot.level }
        })
      }
      if (bot.level >= 10 && achievementMap['rising_star']) {
        achievementsToAdd.push({
          user_id: bot.id,
          achievement_id: achievementMap['rising_star'].id,
          progress_data: { level_achieved: bot.level }
        })
      }
      if (bot.level >= 20 && achievementMap['expert']) {
        achievementsToAdd.push({
          user_id: bot.id,
          achievement_id: achievementMap['expert'].id,
          progress_data: { level_achieved: bot.level }
        })
      }
      if (bot.level >= 30 && achievementMap['master']) {
        achievementsToAdd.push({
          user_id: bot.id,
          achievement_id: achievementMap['master'].id,
          progress_data: { level_achieved: bot.level }
        })
      }

      // Quiz achievements
      if (quizCount >= 10 && achievementMap['quiz_enthusiast']) {
        achievementsToAdd.push({
          user_id: bot.id,
          achievement_id: achievementMap['quiz_enthusiast'].id,
          progress_data: { quizzes_completed: quizCount }
        })
      }

      // Combo achievements
      if (maxCombo >= 10 && achievementMap['combo_expert']) {
        achievementsToAdd.push({
          user_id: bot.id,
          achievement_id: achievementMap['combo_expert'].id,
          progress_data: { max_combo: maxCombo }
        })
      }

      // Streak achievements
      if (bot.streak >= 7 && achievementMap['streak_warrior']) {
        achievementsToAdd.push({
          user_id: bot.id,
          achievement_id: achievementMap['streak_warrior'].id,
          progress_data: { streak_days: bot.streak }
        })
      }
      if (bot.streak >= 30 && achievementMap['dedication']) {
        achievementsToAdd.push({
          user_id: bot.id,
          achievement_id: achievementMap['dedication'].id,
          progress_data: { streak_days: bot.streak }
        })
      }

      // Insert achievements (ignore conflicts)
      if (achievementsToAdd.length > 0) {
        const { error: insertError } = await supabase
          .from('user_achievements')
          .upsert(achievementsToAdd, {
            onConflict: 'user_id,achievement_id',
            ignoreDuplicates: true
          })

        if (insertError) {
          console.error(`Error inserting achievements for bot ${bot.id}:`, insertError)
        } else {
          achievementCount += achievementsToAdd.length
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `${achievementCount} conquistas atribuídas aos bots com sucesso!`,
      achievementCount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})