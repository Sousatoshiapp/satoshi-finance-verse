import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { duelId } = await req.json();
    
    console.log('🏁 Completing duel:', duelId);

    // Get the duel with player data
    const { data: duel, error: duelError } = await supabase
      .from('casino_duels')
      .select(`
        *,
        player1:profiles!casino_duels_player1_id_fkey(id, points),
        player2:profiles!casino_duels_player2_id_fkey(id, points)
      `)
      .eq('id', duelId)
      .single();

    if (duelError || !duel) {
      console.error('❌ Error fetching duel:', duelError);
      throw new Error('Duel not found');
    }

    // Determine winner
    let winnerId = null;
    const player1Score = duel.player1_score;
    const player2Score = duel.player2_score;
    
    if (player1Score > player2Score) {
      winnerId = duel.player1_id;
    } else if (player2Score > player1Score) {
      winnerId = duel.player2_id;
    }
    // If scores are equal, it's a tie (winnerId remains null)

    console.log('🏆 Duel result:', { 
      player1Score, 
      player2Score, 
      winnerId,
      betAmount: duel.bet_amount 
    });

    // Calculate BTZ transfers (bets were already debited at start)
    const betAmount = duel.bet_amount;
    let player1BtzChange = 0;
    let player2BtzChange = 0;

    if (winnerId === duel.player1_id) {
      // Player 1 wins: gets both bets (already debited at start)
      player1BtzChange = betAmount * 2; // Winner gets both bets
      player2BtzChange = 0; // Loser keeps nothing (already debited)
    } else if (winnerId === duel.player2_id) {
      // Player 2 wins: gets both bets (already debited at start)
      player1BtzChange = 0; // Loser keeps nothing (already debited)
      player2BtzChange = betAmount * 2; // Winner gets both bets
    } else {
      // Tie: both get their bets back (refund)
      player1BtzChange = betAmount;
      player2BtzChange = betAmount;
    }

    // Update player points
    if (player1BtzChange !== 0) {
      const { error: p1Error } = await supabase
        .from('profiles')
        .update({ 
          points: Math.max(0, duel.player1.points + player1BtzChange)
        })
        .eq('id', duel.player1_id);

      if (p1Error) {
        console.error('❌ Error updating player1 points:', p1Error);
      }
    }

    if (player2BtzChange !== 0) {
      const { error: p2Error } = await supabase
        .from('profiles')
        .update({ 
          points: Math.max(0, duel.player2.points + player2BtzChange)
        })
        .eq('id', duel.player2_id);

      if (p2Error) {
        console.error('❌ Error updating player2 points:', p2Error);
      }
    }

    // Update duel status
    const { error: updateError } = await supabase
      .from('casino_duels')
      .update({ 
        status: 'completed',
        winner_id: winnerId,
        completed_at: new Date().toISOString()
      })
      .eq('id', duelId);

    if (updateError) {
      console.error('❌ Error updating duel:', updateError);
    }

    console.log('✅ Duel completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        winnerId,
        player1Score,
        player2Score,
        player1BtzChange,
        player2BtzChange,
        betAmount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Complete duel error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});