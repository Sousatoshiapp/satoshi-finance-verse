import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { duelId, userId } = await req.json();
    
    console.log('🏃 Processing duel abandonment:', { duelId, userId });

    // Get the current duel data
    const { data: duel, error: duelError } = await supabase
      .from('casino_duels')
      .select('*')
      .eq('id', duelId)
      .single();

    if (duelError || !duel) {
      console.error('❌ Error fetching duel:', duelError);
      return new Response(JSON.stringify({ error: 'Duel not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // Check if duel is already completed or abandoned
    if (duel.status !== 'active') {
      return new Response(JSON.stringify({ error: 'Duel is not active' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Determine who is abandoning and who gets the reward
    const isPlayer1 = duel.player1_id === userId;
    const isPlayer2 = duel.player2_id === userId;
    
    if (!isPlayer1 && !isPlayer2) {
      return new Response(JSON.stringify({ error: 'User is not a participant in this duel' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    const winnerId = isPlayer1 ? duel.player2_id : duel.player1_id;
    const loserId = userId;
    
    console.log('💰 Transferring bet amount to winner:', { winnerId, betAmount: duel.bet_amount });

    // Update the duel status to abandoned
    const { error: updateError } = await supabase
      .from('casino_duels')
      .update({
        status: 'abandoned',
        winner_id: winnerId,
        completed_at: new Date().toISOString(),
        // Set final scores - winner gets full score, abandoner gets 0
        player1_score: isPlayer1 ? 0 : 8, // Max score for winner
        player2_score: isPlayer2 ? 0 : 8,
      })
      .eq('id', duelId);

    if (updateError) {
      console.error('❌ Error updating duel:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to abandon duel' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Transfer the bet amount from loser to winner (winner gets 2x bet amount)
    const prizeAmount = duel.bet_amount * 2; // Winner gets their bet back + loser's bet

    // Update winner's BTZ (they get the full prize)
    const { error: winnerUpdateError } = await supabase
      .from('profiles')
      .update({
        points: supabase.raw(`points + ${prizeAmount}`)
      })
      .eq('id', winnerId);

    if (winnerUpdateError) {
      console.error('❌ Error updating winner BTZ:', winnerUpdateError);
    }

    // Note: The loser already lost their bet when the duel was created, so no need to deduct again

    // Log the transaction for audit
    console.log('✅ Duel abandonment processed successfully:', {
      duelId,
      winnerId,
      loserId,
      prizeAmount,
      betAmount: duel.bet_amount
    });

    return new Response(JSON.stringify({
      success: true,
      duel: {
        id: duelId,
        status: 'abandoned',
        winner_id: winnerId,
        loser_id: loserId,
        bet_amount: duel.bet_amount,
        prize_amount: prizeAmount
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in abandon-casino-duel:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});