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

    const { duelId, userId, questionIndex, selectedAnswer } = await req.json();
    
    console.log('🔄 Processing answer:', { duelId, userId, questionIndex, selectedAnswer });
    
    // Additional logging for debugging
    console.log('📋 Request details:', {
      selectedAnswerType: typeof selectedAnswer,
      selectedAnswerLength: selectedAnswer?.length || 0,
      isEmptyString: selectedAnswer === '',
      isNull: selectedAnswer === null,
      isUndefined: selectedAnswer === undefined
    });

    // Get the duel with questions
    const { data: duel, error: duelError } = await supabase
      .from('casino_duels')
      .select('*')
      .eq('id', duelId)
      .single();

    if (duelError || !duel) {
      console.error('❌ Error fetching duel:', duelError);
      throw new Error('Duel not found');
    }

    // Parse questions
    let questions = [];
    try {
      questions = Array.isArray(duel.questions) ? duel.questions : JSON.parse(duel.questions);
    } catch (e) {
      console.error('❌ Error parsing questions:', e);
      throw new Error('Invalid questions format');
    }

    const currentQuestion = questions[questionIndex];
    if (!currentQuestion) {
      throw new Error('Question not found');
    }

    // Check if answer is correct - Simple comparison like Quiz Solo
    console.log('🔍 Processing answer - Selected:', selectedAnswer);
    console.log('🔍 Processing answer - Correct:', currentQuestion.correct_answer);
    console.log('🔍 Processing answer - Question structure:', JSON.stringify(currentQuestion, null, 2));
    
    // Handle empty answer case (time up)
    let isCorrect = false;
    if (selectedAnswer && selectedAnswer.trim() !== '') {
      isCorrect = selectedAnswer.trim() === currentQuestion.correct_answer?.trim();
    }
    
    const correctAnswerText = currentQuestion.correct_answer;
    
    console.log('✅ Answer result:', { selectedAnswer, correctAnswerText, isCorrect });

    // Update the answer record
    const { error: updateError } = await supabase
      .from('casino_duel_answers')
      .update({ is_correct: isCorrect })
      .eq('duel_id', duelId)
      .eq('user_id', userId)
      .eq('question_index', questionIndex);

    if (updateError) {
      console.error('❌ Error updating answer:', updateError);
    }

    // Update player scores
    const isPlayer1 = duel.player1_id === userId;
    const scoreField = isPlayer1 ? 'player1_score' : 'player2_score';
    const currentScore = isPlayer1 ? duel.player1_score : duel.player2_score;
    const newScore = isCorrect ? currentScore + 1 : currentScore;

    const { error: scoreError } = await supabase
      .from('casino_duels')
      .update({ [scoreField]: newScore })
      .eq('id', duelId);

    if (scoreError) {
      console.error('❌ Error updating score:', scoreError);
    }

    console.log('📊 Score updated:', { userId, isPlayer1, scoreField, newScore });

    return new Response(
      JSON.stringify({ 
        success: true, 
        isCorrect, 
        newScore,
        correctAnswer: correctAnswerText
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Process answer error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});