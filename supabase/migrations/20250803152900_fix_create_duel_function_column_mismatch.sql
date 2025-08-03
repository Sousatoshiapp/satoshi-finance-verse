
CREATE OR REPLACE FUNCTION public.create_duel_with_invite(
  p_challenger_id UUID,
  p_challenged_id UUID,
  p_quiz_topic TEXT,
  p_questions JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_duel_id UUID;
BEGIN
  INSERT INTO public.duels (
    player1_id,
    player2_id,
    quiz_topic,  -- Correct column name (not 'topic')
    questions,
    status
  ) VALUES (
    p_challenger_id,
    p_challenged_id,
    p_quiz_topic,
    p_questions,
    'active'
  )
  RETURNING id INTO new_duel_id;
  
  -- Update invite status
  UPDATE public.duel_invites 
  SET status = 'accepted'
  WHERE challenger_id = p_challenger_id 
    AND challenged_id = p_challenged_id 
    AND status = 'pending';
  
  RETURN new_duel_id;
END;
$$;
