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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { crisis_id, user_id, btz_amount, xp_amount, district_id } = await req.json()

    console.log(`Processing crisis contribution: ${btz_amount} BTZ, ${xp_amount} XP from user ${user_id}`)

    // Get user's current points and validate they have enough
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('points, xp')
      .eq('id', user_id)
      .single()

    if (profileError) {
      throw new Error(`Failed to get user profile: ${profileError.message}`)
    }

    if (profile.points < btz_amount) {
      return new Response(
        JSON.stringify({ error: 'Insufficient BTZ' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (profile.xp < xp_amount) {
      return new Response(
        JSON.stringify({ error: 'Insufficient XP' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Deduct BTZ and XP from user
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        points: profile.points - btz_amount,
        xp: profile.xp - xp_amount
      })
      .eq('id', user_id)

    if (updateError) {
      throw new Error(`Failed to update user points: ${updateError.message}`)
    }

    // Record the contribution (this will trigger the update_crisis_progress function)
    const { error: contributionError } = await supabase
      .from('crisis_contributions')
      .upsert({
        crisis_id,
        user_id,
        district_id,
        btz_contributed: btz_amount,
        xp_contributed: xp_amount,
        heroic_action: `Contribuiu ${btz_amount > 0 ? `${btz_amount} BTZ` : ''}${btz_amount > 0 && xp_amount > 0 ? ' e ' : ''}${xp_amount > 0 ? `${xp_amount} XP` : ''} para salvar Satoshi City!`
      }, {
        onConflict: 'crisis_id,user_id'
      })

    if (contributionError) {
      // Rollback user's points if contribution fails
      await supabase
        .from('profiles')
        .update({
          points: profile.points,
          xp: profile.xp
        })
        .eq('id', user_id)

      throw new Error(`Failed to record contribution: ${contributionError.message}`)
    }

    // Award badges and rewards for heroic contributions
    if (btz_amount >= 1000 || xp_amount >= 500) {
      await supabase
        .from('user_badges')
        .upsert({
          user_id,
          badge_name: 'crisis_hero',
          badge_type: 'heroic',
          badge_description: 'Herói que ajudou a salvar Satoshi City da crise',
          badge_data: {
            crisis_id,
            contribution: { btz: btz_amount, xp: xp_amount }
          }
        }, {
          onConflict: 'user_id,badge_name'
        })
    }

    console.log(`Crisis contribution successful for user ${user_id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Contribution recorded successfully',
        remaining_btz: profile.points - btz_amount,
        remaining_xp: profile.xp - xp_amount
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Crisis contribution error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})