-- Create transfer_btz function for P2P transfers
CREATE OR REPLACE FUNCTION public.transfer_btz(
  sender_id uuid,
  receiver_id uuid,
  amount integer
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sender_profile RECORD;
  receiver_profile RECORD;
  transaction_id uuid;
BEGIN
  -- Get sender profile
  SELECT * INTO sender_profile FROM profiles WHERE id = sender_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sender not found');
  END IF;
  
  -- Get receiver profile
  SELECT * INTO receiver_profile FROM profiles WHERE id = receiver_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Receiver not found');
  END IF;
  
  -- Check if sender has enough BTZ
  IF sender_profile.points < amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;
  
  -- Start transaction
  BEGIN
    -- Deduct from sender
    UPDATE profiles 
    SET points = points - amount 
    WHERE id = sender_id;
    
    -- Add to receiver
    UPDATE profiles 
    SET points = points + amount 
    WHERE id = receiver_id;
    
    -- Create transaction record
    INSERT INTO transactions (
      user_id, 
      receiver_id, 
      amount_cents, 
      transfer_type, 
      status,
      currency
    ) VALUES (
      sender_profile.user_id,
      receiver_id,
      amount,
      'p2p',
      'completed',
      'BTZ'
    ) RETURNING id INTO transaction_id;
    
    -- Log wallet transactions for both users
    INSERT INTO wallet_transactions (user_id, transaction_type, amount, source_type, description)
    VALUES 
      (sender_id, 'transfer', -amount, 'p2p_send', 'P2P transfer sent to ' || receiver_profile.nickname),
      (receiver_id, 'transfer', amount, 'p2p_receive', 'P2P transfer received from ' || sender_profile.nickname);
    
    RETURN jsonb_build_object(
      'success', true,
      'transaction_id', transaction_id,
      'sender_new_balance', sender_profile.points - amount,
      'receiver_new_balance', receiver_profile.points + amount
    );
    
  EXCEPTION WHEN others THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
  END;
END;
$$;

-- Create duels table with betting system
CREATE TABLE IF NOT EXISTS public.duels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id uuid NOT NULL REFERENCES profiles(id),
  challenged_id uuid NOT NULL REFERENCES profiles(id),
  status text NOT NULL DEFAULT 'pending', -- pending, accepted, in_progress, completed, cancelled
  initial_bet_amount integer DEFAULT 0,
  final_bet_amount integer DEFAULT 0,
  counter_offer_amount integer,
  questions jsonb,
  challenger_score integer DEFAULT 0,
  challenged_score integer DEFAULT 0,
  challenger_time_taken integer DEFAULT 0, -- milliseconds
  challenged_time_taken integer DEFAULT 0, -- milliseconds
  winner_id uuid,
  reason text, -- 'score', 'time', 'forfeit'
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on duels
ALTER TABLE public.duels ENABLE ROW LEVEL SECURITY;

-- Create policies for duels
CREATE POLICY "Users can view duels they participate in"
ON public.duels FOR SELECT
USING (challenger_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) 
       OR challenged_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create duels as challenger"
ON public.duels FOR INSERT
WITH CHECK (challenger_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update duels they participate in"
ON public.duels FOR UPDATE
USING (challenger_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) 
       OR challenged_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create real-time duel answers table
CREATE TABLE IF NOT EXISTS public.duel_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  duel_id uuid NOT NULL REFERENCES duels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id),
  question_id integer NOT NULL,
  answer text NOT NULL,
  is_correct boolean NOT NULL,
  answered_at timestamp with time zone DEFAULT now(),
  response_time_ms integer
);

-- Enable RLS on duel_answers
ALTER TABLE public.duel_answers ENABLE ROW LEVEL SECURITY;

-- Create policies for duel_answers
CREATE POLICY "Users can view answers from their duels"
ON public.duel_answers FOR SELECT
USING (duel_id IN (SELECT id FROM duels WHERE challenger_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) 
                  OR challenged_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY "Users can insert their own answers"
ON public.duel_answers FOR INSERT
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Function to create a duel with betting
CREATE OR REPLACE FUNCTION public.create_duel_challenge(
  p_challenged_id uuid,
  p_bet_amount integer DEFAULT 0
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  challenger_profile_id uuid;
  duel_id uuid;
  random_questions jsonb;
BEGIN
  -- Get challenger profile
  SELECT id INTO challenger_profile_id
  FROM profiles
  WHERE user_id = auth.uid();
  
  IF challenger_profile_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
  END IF;
  
  -- Check if challenger has enough BTZ for bet
  IF p_bet_amount > 0 THEN
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = challenger_profile_id AND points >= p_bet_amount) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Insufficient BTZ for bet');
    END IF;
  END IF;
  
  -- Get random questions for the duel
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', row_number() over(),
      'question', question,
      'options', options,
      'correct_answer', correct_answer,
      'category', category,
      'difficulty', difficulty
    )
  ) INTO random_questions
  FROM (
    SELECT * FROM questions
    WHERE is_active = true
    ORDER BY RANDOM()
    LIMIT 10
  ) q;
  
  -- Create duel
  INSERT INTO duels (
    challenger_id,
    challenged_id,
    initial_bet_amount,
    final_bet_amount,
    questions
  ) VALUES (
    challenger_profile_id,
    p_challenged_id,
    p_bet_amount,
    p_bet_amount,
    random_questions
  ) RETURNING id INTO duel_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'duel_id', duel_id,
    'questions', random_questions
  );
END;
$$;

-- Function to accept/counter duel
CREATE OR REPLACE FUNCTION public.respond_to_duel(
  p_duel_id uuid,
  p_action text, -- 'accept', 'counter', 'reject'
  p_counter_amount integer DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile_id uuid;
  duel_record RECORD;
BEGIN
  -- Get user profile
  SELECT id INTO user_profile_id
  FROM profiles
  WHERE user_id = auth.uid();
  
  -- Get duel
  SELECT * INTO duel_record
  FROM duels
  WHERE id = p_duel_id AND challenged_id = user_profile_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Duel not found or not authorized');
  END IF;
  
  CASE p_action
    WHEN 'accept' THEN
      -- Check if user has enough BTZ
      IF duel_record.final_bet_amount > 0 THEN
        IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = user_profile_id AND points >= duel_record.final_bet_amount) THEN
          RETURN jsonb_build_object('success', false, 'error', 'Insufficient BTZ for bet');
        END IF;
      END IF;
      
      UPDATE duels
      SET status = 'accepted', started_at = now()
      WHERE id = p_duel_id;
      
      RETURN jsonb_build_object('success', true, 'action', 'accepted');
      
    WHEN 'counter' THEN
      IF p_counter_amount IS NULL OR p_counter_amount < 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid counter amount');
      END IF;
      
      -- Check if user has enough BTZ for counter offer
      IF p_counter_amount > 0 THEN
        IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = user_profile_id AND points >= p_counter_amount) THEN
          RETURN jsonb_build_object('success', false, 'error', 'Insufficient BTZ for counter bet');
        END IF;
      END IF;
      
      UPDATE duels
      SET counter_offer_amount = p_counter_amount, status = 'counter_offered'
      WHERE id = p_duel_id;
      
      RETURN jsonb_build_object('success', true, 'action', 'counter_offered', 'amount', p_counter_amount);
      
    WHEN 'reject' THEN
      UPDATE duels
      SET status = 'rejected'
      WHERE id = p_duel_id;
      
      RETURN jsonb_build_object('success', true, 'action', 'rejected');
      
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Invalid action');
  END CASE;
END;
$$;

-- Function to finalize duel and transfer prizes
CREATE OR REPLACE FUNCTION public.complete_duel(
  p_duel_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  duel_record RECORD;
  challenger_stats RECORD;
  challenged_stats RECORD;
  winner_id uuid;
  reason text;
  total_prize integer;
BEGIN
  -- Get duel with participant stats
  SELECT d.*, 
         (SELECT COUNT(*) FROM duel_answers WHERE duel_id = d.id AND user_id = d.challenger_id AND is_correct = true) as challenger_correct,
         (SELECT AVG(response_time_ms) FROM duel_answers WHERE duel_id = d.id AND user_id = d.challenger_id) as challenger_avg_time,
         (SELECT COUNT(*) FROM duel_answers WHERE duel_id = d.id AND user_id = d.challenged_id AND is_correct = true) as challenged_correct,
         (SELECT AVG(response_time_ms) FROM duel_answers WHERE duel_id = d.id AND user_id = d.challenged_id) as challenged_avg_time
  INTO duel_record
  FROM duels d
  WHERE d.id = p_duel_id AND d.status = 'in_progress';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Duel not found or not in progress');
  END IF;
  
  -- Determine winner
  IF duel_record.challenger_correct > duel_record.challenged_correct THEN
    winner_id := duel_record.challenger_id;
    reason := 'score';
  ELSIF duel_record.challenged_correct > duel_record.challenger_correct THEN
    winner_id := duel_record.challenged_id;
    reason := 'score';
  ELSE
    -- Tie - check response time
    IF duel_record.challenger_avg_time < duel_record.challenged_avg_time THEN
      winner_id := duel_record.challenger_id;
      reason := 'time';
    ELSE
      winner_id := duel_record.challenged_id;
      reason := 'time';
    END IF;
  END IF;
  
  -- Calculate total prize
  total_prize := duel_record.final_bet_amount * 2;
  
  -- Transfer prize to winner if there was a bet
  IF total_prize > 0 THEN
    UPDATE profiles
    SET points = points + total_prize
    WHERE id = winner_id;
    
    -- Log the prize transfer
    INSERT INTO wallet_transactions (user_id, transaction_type, amount, source_type, description)
    VALUES (winner_id, 'earn', total_prize, 'duel_win', 'Duel victory prize: ' || total_prize || ' BTZ');
  END IF;
  
  -- Update duel with results
  UPDATE duels
  SET 
    status = 'completed',
    challenger_score = duel_record.challenger_correct,
    challenged_score = duel_record.challenged_correct,
    challenger_time_taken = duel_record.challenger_avg_time,
    challenged_time_taken = duel_record.challenged_avg_time,
    winner_id = winner_id,
    reason = reason,
    completed_at = now()
  WHERE id = p_duel_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'winner_id', winner_id,
    'reason', reason,
    'prize_amount', total_prize,
    'challenger_score', duel_record.challenger_correct,
    'challenged_score', duel_record.challenged_correct
  );
END;
$$;

-- Enable realtime for duels and duel_answers
ALTER PUBLICATION supabase_realtime ADD TABLE duels;
ALTER PUBLICATION supabase_realtime ADD TABLE duel_answers;
ALTER TABLE duels REPLICA IDENTITY FULL;
ALTER TABLE duel_answers REPLICA IDENTITY FULL;