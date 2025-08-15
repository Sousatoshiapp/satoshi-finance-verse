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

    // Check if answer is correct
    console.log('🔍 DEBUG: Question structure:', JSON.stringify(currentQuestion, null, 2));
    console.log('🔍 DEBUG: Selected answer (letter):', selectedAnswer);
    console.log('🔍 DEBUG: Question options:', currentQuestion.options);
    
    let isCorrect = false;
    let correctAnswerText = '';
    
    // Handle different question formats
    if (Array.isArray(currentQuestion.options)) {
      // Format: options is array of objects with {id, text, isCorrect}
      const selectedOption = currentQuestion.options.find(opt => opt.id === selectedAnswer);
      const correctOption = currentQuestion.options.find(opt => opt.isCorrect);
      
      if (selectedOption && correctOption) {
        isCorrect = selectedOption.id === correctOption.id || selectedOption.text === correctOption.text;
        correctAnswerText = correctOption.text;
      }
      
      console.log('🔍 DEBUG: Array format - Selected option:', selectedOption);
      console.log('🔍 DEBUG: Array format - Correct option:', correctOption);
    } else if (typeof currentQuestion.options === 'object' && currentQuestion.options !== null) {
      // Format: options is object with {a, b, c, d} and correct_answer is letter
      const optionText = currentQuestion.options[selectedAnswer];
      const correctLetter = currentQuestion.correct_answer;
      const correctOptionText = currentQuestion.options[correctLetter];
      
      isCorrect = selectedAnswer === correctLetter || optionText === correctOptionText;
      correctAnswerText = correctOptionText || currentQuestion.correct_answer;
      
      console.log('🔍 DEBUG: Object format - Option text:', optionText);
      console.log('🔍 DEBUG: Object format - Correct letter:', correctLetter);
      console.log('🔍 DEBUG: Object format - Correct option text:', correctOptionText);
    } else {
      // Fallback: try direct comparison
      isCorrect = selectedAnswer === currentQuestion.correct_answer;
      correctAnswerText = currentQuestion.correct_answer;
      
      console.log('🔍 DEBUG: Fallback format - Direct comparison');
    }
    
    console.log('✅ Final answer check:', { 
      selectedAnswer, 
      correctAnswerText, 
      isCorrect,
      questionFormat: Array.isArray(currentQuestion.options) ? 'array' : typeof currentQuestion.options
    });

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