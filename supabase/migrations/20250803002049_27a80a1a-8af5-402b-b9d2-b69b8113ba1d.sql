-- Create function to determine duel winner correctly
CREATE OR REPLACE FUNCTION public.determine_duel_winner(
  p_duel_id UUID,
  p_player1_answers JSONB,
  p_player2_answers JSONB,
  p_player1_time INTEGER,
  p_player2_time INTEGER
)
RETURNS TABLE(
  winner_id UUID,
  player1_score INTEGER,
  player2_score INTEGER,
  tie_broken_by TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  duel_record RECORD;
  questions JSONB;
  p1_score INTEGER := 0;
  p2_score INTEGER := 0;
  p1_total_time INTEGER := 0;
  p2_total_time INTEGER := 0;
  question JSONB;
  p1_answer JSONB;
  p2_answer JSONB;
  final_winner_id UUID := NULL;
  tie_breaker TEXT := NULL;
BEGIN
  -- Get duel data
  SELECT * INTO duel_record FROM public.duels WHERE id = p_duel_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Duel not found';
  END IF;
  
  questions := duel_record.questions;
  
  -- Calculate scores and total time for each player
  FOR i IN 0..(jsonb_array_length(questions) - 1) LOOP
    question := questions->i;
    
    -- Player 1 answer
    IF jsonb_array_length(p_player1_answers) > i THEN
      p1_answer := p_player1_answers->i;
      IF (p1_answer->>'correct')::boolean = true THEN
        p1_score := p1_score + 1;
      END IF;
      p1_total_time := p1_total_time + COALESCE((p1_answer->>'responseTime')::integer, 30000);
    END IF;
    
    -- Player 2 answer
    IF jsonb_array_length(p_player2_answers) > i THEN
      p2_answer := p_player2_answers->i;
      IF (p2_answer->>'correct')::boolean = true THEN
        p2_score := p2_score + 1;
      END IF;
      p2_total_time := p2_total_time + COALESCE((p2_answer->>'responseTime')::integer, 30000);
    END IF;
  END LOOP;
  
  -- Determine winner
  -- 1. Higher score wins
  IF p1_score > p2_score THEN
    final_winner_id := duel_record.player1_id;
    tie_breaker := 'score';
  ELSIF p2_score > p1_score THEN
    final_winner_id := duel_record.player2_id;
    tie_breaker := 'score';
  ELSE
    -- 2. In case of tie, faster time wins
    IF p1_total_time < p2_total_time THEN
      final_winner_id := duel_record.player1_id;
      tie_breaker := 'time';
    ELSIF p2_total_time < p1_total_time THEN
      final_winner_id := duel_record.player2_id;
      tie_breaker := 'time';
    ELSE
      -- Perfect tie (same score and time)
      tie_breaker := 'perfect_tie';
    END IF;
  END IF;
  
  RETURN QUERY SELECT final_winner_id, p1_score, p2_score, tie_breaker;
END;
$$;

-- Update the create_duel_with_invite function to use proper winner determination
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
  -- Create the duel
  INSERT INTO public.duels (
    player1_id,
    player2_id,
    topic,
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