-- Fix create_duel_with_invite RPC to use correct column name
CREATE OR REPLACE FUNCTION public.create_duel_with_invite(
  p_challenger_id uuid,
  p_challenged_id uuid,
  p_topic text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_invite_id uuid;
  v_duel_id uuid;
  v_questions jsonb;
  v_challenger_profile jsonb;
  v_challenged_profile jsonb;
  v_result jsonb;
BEGIN
  -- Get 5 random questions for the topic
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'question', question,
      'options', options,
      'correct_answer', correct_answer,
      'explanation', explanation,
      'difficulty', difficulty
    )
  ) INTO v_questions
  FROM (
    SELECT * FROM quiz_questions 
    WHERE 
      topic = p_topic 
      AND is_approved = true  -- Fixed: was is_active
      AND jsonb_array_length(options) >= 2
    ORDER BY RANDOM() 
    LIMIT 5
  ) random_questions;

  -- Check if we have enough questions
  IF v_questions IS NULL OR jsonb_array_length(v_questions) < 5 THEN
    -- Fallback: get general questions if topic-specific ones are not available
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', id,
        'question', question,
        'options', options,
        'correct_answer', correct_answer,
        'explanation', explanation,
        'difficulty', difficulty
      )
    ) INTO v_questions
    FROM (
      SELECT * FROM quiz_questions 
      WHERE 
        is_approved = true  -- Fixed: was is_active
        AND jsonb_array_length(options) >= 2
      ORDER BY RANDOM() 
      LIMIT 5
    ) fallback_questions;
  END IF;

  -- Final check for questions availability
  IF v_questions IS NULL OR jsonb_array_length(v_questions) = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Não há perguntas suficientes disponíveis',
      'questions_count', 0
    );
  END IF;

  -- Get challenger profile
  SELECT jsonb_build_object(
    'id', id,
    'nickname', nickname,
    'current_avatar_id', current_avatar_id,
    'level', level,
    'xp', xp
  ) INTO v_challenger_profile
  FROM profiles WHERE id = p_challenger_id;

  -- Get challenged profile  
  SELECT jsonb_build_object(
    'id', id,
    'nickname', nickname,
    'current_avatar_id', current_avatar_id,
    'level', level,
    'xp', xp
  ) INTO v_challenged_profile
  FROM profiles WHERE id = p_challenged_id;

  -- Insert invite first
  INSERT INTO duel_invites (
    challenger_id,
    challenged_id,
    quiz_topic,
    status
  ) VALUES (
    p_challenger_id,
    p_challenged_id,
    p_topic,
    'accepted'
  ) RETURNING id INTO v_invite_id;

  -- Create the actual duel
  INSERT INTO duels (
    challenger_id,
    challenged_id,
    quiz_topic,
    questions,
    status,
    invite_id
  ) VALUES (
    p_challenger_id,
    p_challenged_id,
    p_topic,
    v_questions,
    'waiting',
    v_invite_id
  ) RETURNING id INTO v_duel_id;

  -- Build success response
  v_result := jsonb_build_object(
    'success', true,
    'duel_id', v_duel_id,
    'invite_id', v_invite_id,
    'questions', v_questions,
    'challenger_profile', v_challenger_profile,
    'challenged_profile', v_challenged_profile,
    'questions_count', jsonb_array_length(v_questions)
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_detail', SQLSTATE
    );
END;
$function$;