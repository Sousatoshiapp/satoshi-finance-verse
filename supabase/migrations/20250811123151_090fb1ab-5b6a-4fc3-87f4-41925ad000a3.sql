-- Fix the create_duel_with_invite RPC to output questions in consistent object format
CREATE OR REPLACE FUNCTION public.create_duel_with_invite(
  p_challenger_id uuid,
  p_challenged_id uuid,
  p_bet_amount integer,
  p_topic text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  duel_id uuid;
  selected_questions jsonb := '[]'::jsonb;
  question_record RECORD;
  formatted_question jsonb;
  v_topic_mapped text;
BEGIN
  -- Map topic to district if needed (simplified)
  v_topic_mapped := CASE 
    WHEN p_topic = 'financas' THEN 'Finanças'
    WHEN p_topic = 'tecnologia' THEN 'Tecnologia'
    WHEN p_topic = 'negocios' THEN 'Negócios'
    WHEN p_topic = 'contabilidade' THEN 'Contabilidade'
    WHEN p_topic = 'marketing' THEN 'Marketing'
    ELSE 'Finanças'
  END;

  -- Get questions and format them consistently as objects
  FOR question_record IN 
    SELECT id, question, options, correct_answer, explanation
    FROM quiz_questions 
    WHERE district = v_topic_mapped 
    ORDER BY RANDOM() 
    LIMIT 10
  LOOP
    -- Always format as object with a, b, c, d keys
    formatted_question := jsonb_build_object(
      'id', question_record.id,
      'question', question_record.question,
      'options', jsonb_build_object(
        'a', COALESCE(question_record.options->0, question_record.options->>'a', ''),
        'b', COALESCE(question_record.options->1, question_record.options->>'b', ''),
        'c', COALESCE(question_record.options->2, question_record.options->>'c', ''),
        'd', COALESCE(question_record.options->3, question_record.options->>'d', '')
      ),
      'correct_answer', question_record.correct_answer,
      'explanation', question_record.explanation
    );
    
    selected_questions := selected_questions || formatted_question;
  END LOOP;

  -- If we don't have enough questions, repeat some
  WHILE jsonb_array_length(selected_questions) < 10 LOOP
    selected_questions := selected_questions || (selected_questions->0);
  END LOOP;

  -- Create the duel
  INSERT INTO casino_duels (
    player1_id, player2_id, bet_amount, topic, 
    questions, status, created_at
  ) VALUES (
    p_challenger_id, p_challenged_id, p_bet_amount, p_topic,
    selected_questions, 'active', NOW()
  ) RETURNING id INTO duel_id;

  RETURN jsonb_build_object(
    'success', true,
    'duel_id', duel_id,
    'questions_count', jsonb_array_length(selected_questions),
    'message', 'Duel created successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to create duel'
    );
END;
$function$;