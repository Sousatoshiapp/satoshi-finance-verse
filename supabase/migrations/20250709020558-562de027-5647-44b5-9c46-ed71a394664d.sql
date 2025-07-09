-- Create function to create duel with proper permissions
CREATE OR REPLACE FUNCTION public.create_duel_with_invite(
  p_challenger_id uuid,
  p_challenged_id uuid,
  p_quiz_topic text,
  p_questions jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_id uuid;
  new_duel_id uuid;
BEGIN
  -- Create duel invite
  INSERT INTO public.duel_invites (challenger_id, challenged_id, quiz_topic, status)
  VALUES (p_challenger_id, p_challenged_id, p_quiz_topic, 'accepted')
  RETURNING id INTO invite_id;
  
  -- Create duel
  INSERT INTO public.duels (
    invite_id, 
    player1_id, 
    player2_id, 
    quiz_topic, 
    questions, 
    status, 
    current_turn, 
    turn_started_at
  )
  VALUES (
    invite_id,
    p_challenger_id,
    p_challenged_id,
    p_quiz_topic,
    p_questions,
    'active',
    p_challenger_id,
    now()
  )
  RETURNING id INTO new_duel_id;
  
  RETURN new_duel_id;
END;
$$;