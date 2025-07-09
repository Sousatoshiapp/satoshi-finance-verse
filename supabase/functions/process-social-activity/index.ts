import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId, activityType } = await req.json()

    if (!userId || !activityType) {
      return new Response(
        JSON.stringify({ error: 'Missing userId or activityType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Process social challenges based on activity type
    switch (activityType) {
      case 'create_post':
        await processChallengeProgress(supabaseClient, userId, 'create_posts', 1)
        break
      case 'like_posts':
        await processChallengeProgress(supabaseClient, userId, 'like_posts', 1)
        break
      case 'comment_posts':
        await processChallengeProgress(supabaseClient, userId, 'comment_posts', 1)
        break
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing social activity:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function processChallengeProgress(supabase: any, userId: string, challengeType: string, progress: number) {
  try {
    // Get active social challenges of this type
    const { data: challenges } = await supabase
      .from('social_challenges')
      .select('*')
      .eq('challenge_type', challengeType)
      .eq('is_active', true)
      .gte('end_date', new Date().toISOString())

    if (!challenges || challenges.length === 0) {
      return
    }

    for (const challenge of challenges) {
      // Update or create progress
      const { data: existingProgress } = await supabase
        .from('social_challenge_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_id', challenge.id)
        .single()

      if (existingProgress) {
        const newProgress = existingProgress.progress + progress
        const isCompleted = newProgress >= challenge.target_value

        await supabase
          .from('social_challenge_progress')
          .update({
            progress: newProgress,
            completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null
          })
          .eq('id', existingProgress.id)

        // Award rewards if completed
        if (isCompleted && !existingProgress.completed) {
          await awardChallengeRewards(supabase, userId, challenge)
        }
      } else {
        const isCompleted = progress >= challenge.target_value

        await supabase
          .from('social_challenge_progress')
          .insert({
            user_id: userId,
            challenge_id: challenge.id,
            progress: progress,
            completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null
          })

        // Award rewards if completed
        if (isCompleted) {
          await awardChallengeRewards(supabase, userId, challenge)
        }
      }
    }
  } catch (error) {
    console.error('Error processing challenge progress:', error)
  }
}

async function awardChallengeRewards(supabase: any, userId: string, challenge: any) {
  try {
    const rewards = challenge.rewards || {}

    // Award XP
    if (rewards.xp) {
      await supabase.rpc('award_xp', {
        profile_id: userId,
        xp_amount: rewards.xp,
        activity_type: 'social_challenge'
      })
    }

    // Award Beetz
    if (rewards.beetz) {
      await supabase
        .from('profiles')
        .update({
          points: supabase.raw(`points + ${rewards.beetz}`)
        })
        .eq('id', userId)
    }

    // Log activity
    await supabase
      .from('activity_feed')
      .insert({
        user_id: userId,
        activity_type: 'challenge_completed',
        activity_data: {
          challenge_name: challenge.title,
          rewards: rewards
        }
      })

  } catch (error) {
    console.error('Error awarding challenge rewards:', error)
  }
}