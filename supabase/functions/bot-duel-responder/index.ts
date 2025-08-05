import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar convites pendentes para bots
    const { data: pendingInvites, error: fetchError } = await supabaseClient
      .from('duel_invites')
      .select(`
        id, challenger_id, challenged_id, quiz_topic, created_at,
        challenged:profiles!challenged_id(id, nickname, is_bot, level),
        challenger:profiles!challenger_id(id, nickname, level)
      `)
      .eq('status', 'pending')
      .eq('challenged.is_bot', true)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Últimos 5 minutos

    if (fetchError) {
      console.error('Error fetching pending invites:', fetchError)
      return new Response(JSON.stringify({ error: 'Failed to fetch invites' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let responsesProcessed = 0

    for (const invite of pendingInvites || []) {
      try {
        // Determinar se o bot vai aceitar o convite (90% de chance)
        const willAccept = Math.random() < 0.9
        
        if (willAccept) {
          // Aceitar o convite
          const { error: acceptError } = await supabaseClient
            .from('duel_invites')
            .update({ 
              status: 'accepted',
              accepted_at: new Date().toISOString()
            })
            .eq('id', invite.id)

          if (acceptError) {
            console.error('Error accepting invite:', acceptError)
            continue
          }

          // Criar o duelo
          const { data: duel, error: duelError } = await supabaseClient
            .from('duels')
            .insert({
              player1_id: invite.challenger_id,
              player2_id: invite.challenged_id,
              quiz_topic: invite.quiz_topic,
              status: 'active',
              created_from_invite: true,
              invite_id: invite.id
            })
            .select()
            .single()

          if (duelError) {
            console.error('Error creating duel:', duelError)
            continue
          }

          console.log(`Bot ${invite.challenged.nickname} accepted duel from ${invite.challenger.nickname}`)
          responsesProcessed++

          // Simular um pequeno delay para parecer mais realista
          await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 1000))
        } else {
          // Rejeitar o convite (10% de chance)
          const { error: rejectError } = await supabaseClient
            .from('duel_invites')
            .update({ 
              status: 'rejected',
              rejected_at: new Date().toISOString()
            })
            .eq('id', invite.id)

          if (rejectError) {
            console.error('Error rejecting invite:', rejectError)
            continue
          }

          console.log(`Bot ${invite.challenged.nickname} rejected duel from ${invite.challenger.nickname}`)
          responsesProcessed++
        }
      } catch (error) {
        console.error('Error processing invite:', error)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: responsesProcessed,
        message: `Processed ${responsesProcessed} bot responses`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})