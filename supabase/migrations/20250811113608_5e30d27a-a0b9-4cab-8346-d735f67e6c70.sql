-- Fix create_duel_with_invite function to remove updated_at column reference
CREATE OR REPLACE FUNCTION public.create_duel_with_invite(p_invite_id uuid, p_challenger_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  invite_record RECORD;
  new_duel_id uuid;
  duel_questions jsonb;
  result jsonb;
  mapped_category text;
BEGIN
  -- Get invite details
  SELECT * INTO invite_record
  FROM public.duel_invites 
  WHERE id = p_invite_id 
  AND challenged_id = p_challenger_id 
  AND status = 'pending';
  
  IF invite_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invite');
  END IF;
  
  -- Map quiz_topic to correct category names
  mapped_category := CASE invite_record.quiz_topic
    WHEN 'financas' THEN 'Finanças do Dia a Dia'
    WHEN 'cripto' THEN 'Cripto'
    WHEN 'abc_financas' THEN 'ABC das Finanças'
    ELSE 'Finanças do Dia a Dia' -- Default fallback
  END;
  
  -- Generate questions for the duel topic using correct column name 'category'
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', q.id,
      'question', q.question,
      'options', q.options,
      'correct_answer', q.correct_answer,
      'explanation', q.explanation,
      'difficulty', q.difficulty
    )
  ) INTO duel_questions
  FROM (
    SELECT * FROM public.quiz_questions 
    WHERE category = mapped_category
    AND is_approved = true 
    ORDER BY RANDOM() 
    LIMIT 10
  ) q;
  
  -- If no questions found for specific category, get from any category as fallback
  IF duel_questions IS NULL THEN
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', q.id,
        'question', q.question,
        'options', q.options,
        'correct_answer', q.correct_answer,
        'explanation', q.explanation,
        'difficulty', q.difficulty
      )
    ) INTO duel_questions
    FROM (
      SELECT * FROM public.quiz_questions 
      WHERE is_approved = true 
      ORDER BY RANDOM() 
      LIMIT 10
    ) q;
  END IF;
  
  -- Create the duel using correct column names for casino_duels table
  INSERT INTO public.casino_duels (
    player1_id,
    player2_id,
    topic,
    questions,
    status,
    bet_amount
  ) VALUES (
    invite_record.challenger_id,
    invite_record.challenged_id,
    invite_record.quiz_topic,
    COALESCE(duel_questions, '[]'::jsonb),
    'waiting',
    COALESCE(invite_record.bet_amount, 0)
  ) RETURNING id INTO new_duel_id;
  
  -- Update invite status to accepted (removed updated_at reference)
  UPDATE public.duel_invites 
  SET status = 'accepted'
  WHERE id = p_invite_id;
  
  -- Return success response
  result := jsonb_build_object(
    'success', true,
    'duel_id', new_duel_id,
    'questions_count', jsonb_array_length(COALESCE(duel_questions, '[]'::jsonb)),
    'mapped_category', mapped_category
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and return failure
    RAISE LOG 'Error in create_duel_with_invite: %', SQLERRM;
    RETURN jsonb_build_object(
      'success', false, 
      'error', SQLERRM,
      'error_detail', 'Database error occurred while creating duel'
    );
END;
$function$;