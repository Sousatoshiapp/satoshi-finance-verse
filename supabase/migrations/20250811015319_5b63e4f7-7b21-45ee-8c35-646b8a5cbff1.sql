-- Drop all existing versions of create_duel_with_invite RPC to avoid conflicts
DROP FUNCTION IF EXISTS public.create_duel_with_invite(uuid, uuid);
DROP FUNCTION IF EXISTS public.create_duel_with_invite(uuid, uuid, text);
DROP FUNCTION IF EXISTS public.create_duel_with_invite(p_invite_id uuid, p_challenger_id uuid);
DROP FUNCTION IF EXISTS public.create_duel_with_invite(p_challenger_id uuid, p_challenged_id uuid, p_topic text);

-- Create the correct and unified version of create_duel_with_invite RPC
CREATE OR REPLACE FUNCTION public.create_duel_with_invite(
  p_invite_id uuid,
  p_challenger_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_record RECORD;
  new_duel_id uuid;
  duel_questions jsonb;
  result jsonb;
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
  
  -- Generate questions for the duel topic
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
    WHERE topic = invite_record.topic 
    AND is_approved = true 
    ORDER BY RANDOM() 
    LIMIT 10
  ) q;
  
  -- Create the duel
  INSERT INTO public.duels (
    challenger_id,
    challenged_id,
    topic,
    questions,
    status,
    bet_amount
  ) VALUES (
    invite_record.challenger_id,
    invite_record.challenged_id,
    invite_record.topic,
    COALESCE(duel_questions, '[]'::jsonb),
    'active',
    COALESCE(invite_record.bet_amount, 0)
  ) RETURNING id INTO new_duel_id;
  
  -- Update invite status to accepted
  UPDATE public.duel_invites 
  SET status = 'accepted', updated_at = now()
  WHERE id = p_invite_id;
  
  -- Return success response
  result := jsonb_build_object(
    'success', true,
    'duel_id', new_duel_id,
    'questions_count', jsonb_array_length(COALESCE(duel_questions, '[]'::jsonb))
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
$$;