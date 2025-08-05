import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🤖 Bot Duel Responder iniciado');

    // Buscar convites de duelo pendentes para bots
    const { data: pendingInvites, error: invitesError } = await supabaseClient
      .from('duel_invites')
      .select(`
        id,
        challenger_id,
        challenged_id,
        quiz_topic,
        created_at,
        profiles:challenged_id (
          id,
          nickname,
          is_bot
        )
      `)
      .eq('status', 'pending')
      .lt('created_at', new Date(Date.now() - 3000).toISOString()) // Mais de 3 segundos

    if (invitesError) {
      console.error('Erro ao buscar convites:', invitesError);
      throw invitesError;
    }

    if (!pendingInvites || pendingInvites.length === 0) {
      console.log('Nenhum convite pendente encontrado');
      return new Response(
        JSON.stringify({ processed: 0, message: 'Nenhum convite pendente' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let processedCount = 0;

    // Processar cada convite
    for (const invite of pendingInvites) {
      try {
        const isBot = invite.profiles?.is_bot;
        
        if (!isBot) {
          console.log(`Convite ${invite.id} não é para bot, pulando`);
          continue;
        }

        // 85% de chance de aceitar o duelo (bots são ativos)
        const shouldAccept = Math.random() < 0.85;
        
        if (shouldAccept) {
          // Aceitar o convite
          const { error: acceptError } = await supabaseClient
            .from('duel_invites')
            .update({
              status: 'accepted',
              responded_at: new Date().toISOString()
            })
            .eq('id', invite.id);

          if (acceptError) {
            console.error(`Erro ao aceitar convite ${invite.id}:`, acceptError);
            continue;
          }

          // Criar o duelo
          const { data: newDuel, error: duelError } = await supabaseClient
            .from('duels')
            .insert({
              challenger_id: invite.challenger_id,
              opponent_id: invite.challenged_id,
              quiz_topic: invite.quiz_topic,
              status: 'active',
              questions_total: 10,
              started_at: new Date().toISOString()
            })
            .select()
            .single();

          if (duelError) {
            console.error(`Erro ao criar duelo para convite ${invite.id}:`, duelError);
            continue;
          }

          console.log(`✅ Bot ${invite.profiles?.nickname} aceitou duelo do convite ${invite.id}`);
          processedCount++;

          // Notificar o challenger que o duelo foi aceito
          try {
            await supabaseClient.functions.invoke('send-social-notification', {
              body: {
                type: 'duel_accepted',
                targetUserId: invite.challenger_id,
                data: {
                  opponentName: invite.profiles?.nickname,
                  topic: invite.quiz_topic,
                  duelId: newDuel.id
                }
              }
            });
          } catch (notificationError) {
            console.error('Erro ao enviar notificação:', notificationError);
          }

        } else {
          // Recusar o convite (15% de chance)
          const { error: rejectError } = await supabaseClient
            .from('duel_invites')
            .update({
              status: 'declined',
              responded_at: new Date().toISOString()
            })
            .eq('id', invite.id);

          if (rejectError) {
            console.error(`Erro ao recusar convite ${invite.id}:`, rejectError);
            continue;
          }

          console.log(`❌ Bot ${invite.profiles?.nickname} recusou duelo do convite ${invite.id}`);
          processedCount++;
        }

      } catch (error) {
        console.error(`Erro ao processar convite ${invite.id}:`, error);
      }
    }

    console.log(`🏁 Processados ${processedCount} convites de ${pendingInvites.length} encontrados`);

    return new Response(
      JSON.stringify({ 
        processed: processedCount, 
        total: pendingInvites.length,
        message: `Processados ${processedCount} convites de duelo` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro no bot duel responder:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});