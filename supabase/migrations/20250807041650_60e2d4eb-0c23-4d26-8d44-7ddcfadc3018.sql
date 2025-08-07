-- Create BTC Prediction Duels table for Quick PvP battles
CREATE TABLE public.btc_prediction_duels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player1_id UUID NOT NULL,
  player2_id UUID NOT NULL,
  bet_amount INTEGER NOT NULL CHECK (bet_amount >= 5 AND bet_amount <= 50),
  initial_btc_price NUMERIC(12,2) NOT NULL,
  final_btc_price NUMERIC(12,2),
  prediction_duration INTEGER NOT NULL DEFAULT 300, -- 5 minutes in seconds
  player1_prediction TEXT NOT NULL CHECK (player1_prediction IN ('up', 'down')),
  player2_prediction TEXT NOT NULL CHECK (player2_prediction IN ('up', 'down')),
  winner_id UUID,
  status TEXT NOT NULL DEFAULT 'waiting_predictions' CHECK (status IN ('waiting_predictions', 'active', 'completed', 'cancelled')),
  price_source TEXT NOT NULL DEFAULT 'binance_websocket',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '10 minutes'),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.btc_prediction_duels ENABLE ROW LEVEL SECURITY;

-- Create policies for BTC duels
CREATE POLICY "Users can view their own BTC duels" 
ON public.btc_prediction_duels 
FOR SELECT 
USING (player1_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()) 
       OR player2_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Users can create BTC duels" 
ON public.btc_prediction_duels 
FOR INSERT 
WITH CHECK (player1_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Users can update their own BTC duels" 
ON public.btc_prediction_duels 
FOR UPDATE 
USING (player1_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()) 
       OR player2_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

-- Create index for faster queries
CREATE INDEX idx_btc_duels_status ON public.btc_prediction_duels(status);
CREATE INDEX idx_btc_duels_players ON public.btc_prediction_duels(player1_id, player2_id);
CREATE INDEX idx_btc_duels_created_at ON public.btc_prediction_duels(created_at);

-- Create BTC duel queue table for matchmaking
CREATE TABLE public.btc_duel_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bet_amount INTEGER NOT NULL CHECK (bet_amount >= 5 AND bet_amount <= 50),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '2 minutes')
);

-- Enable RLS for queue
ALTER TABLE public.btc_duel_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for queue
CREATE POLICY "Users can manage their own queue entry" 
ON public.btc_duel_queue 
FOR ALL 
USING (user_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

-- Create index for queue
CREATE INDEX idx_btc_queue_bet_amount ON public.btc_duel_queue(bet_amount);
CREATE INDEX idx_btc_queue_created_at ON public.btc_duel_queue(created_at);

-- Function to find BTC duel opponent
CREATE OR REPLACE FUNCTION public.find_btc_duel_opponent(p_user_id UUID, p_bet_amount INTEGER)
RETURNS TABLE(opponent_id UUID, queue_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  found_opponent UUID;
  found_queue_id UUID;
BEGIN
  -- Find an opponent with the same bet amount (excluding the current user)
  SELECT bq.user_id, bq.id 
  INTO found_opponent, found_queue_id
  FROM public.btc_duel_queue bq
  WHERE bq.bet_amount = p_bet_amount 
  AND bq.user_id != p_user_id
  AND bq.expires_at > now()
  ORDER BY bq.created_at ASC
  LIMIT 1;

  -- If found, remove both users from queue
  IF found_opponent IS NOT NULL THEN
    DELETE FROM public.btc_duel_queue 
    WHERE (user_id = p_user_id OR user_id = found_opponent) 
    AND bet_amount = p_bet_amount;
    
    RETURN QUERY SELECT found_opponent, found_queue_id;
  ELSE
    -- Add current user to queue if not already there
    INSERT INTO public.btc_duel_queue (user_id, bet_amount)
    VALUES (p_user_id, p_bet_amount)
    ON CONFLICT DO NOTHING;
    
    RETURN QUERY SELECT NULL::UUID, NULL::UUID;
  END IF;
END;
$function$;

-- Function to complete BTC duel and distribute prizes
CREATE OR REPLACE FUNCTION public.complete_btc_duel(p_duel_id UUID, p_final_price NUMERIC)
RETURNS TABLE(winner_profile_id UUID, prize_amount INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  duel_record RECORD;
  actual_winner UUID;
  prize INTEGER;
  price_movement TEXT;
BEGIN
  -- Get duel data
  SELECT * INTO duel_record
  FROM public.btc_prediction_duels
  WHERE id = p_duel_id AND status = 'active';

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, 0;
    RETURN;
  END IF;

  -- Determine price movement
  IF p_final_price > duel_record.initial_btc_price THEN
    price_movement := 'up';
  ELSE
    price_movement := 'down';
  END IF;

  -- Determine winner
  IF duel_record.player1_prediction = price_movement AND duel_record.player2_prediction != price_movement THEN
    actual_winner := duel_record.player1_id;
  ELSIF duel_record.player2_prediction = price_movement AND duel_record.player1_prediction != price_movement THEN
    actual_winner := duel_record.player2_id;
  ELSE
    -- Tie - return bets to both players
    UPDATE public.profiles 
    SET points = points + duel_record.bet_amount
    WHERE id IN (duel_record.player1_id, duel_record.player2_id);
    
    -- Update duel as completed with no winner
    UPDATE public.btc_prediction_duels
    SET status = 'completed', final_btc_price = p_final_price, completed_at = now()
    WHERE id = p_duel_id;
    
    RETURN QUERY SELECT NULL::UUID, 0;
    RETURN;
  END IF;

  -- Calculate prize (total bets minus 5% fee)
  prize := FLOOR((duel_record.bet_amount * 2) * 0.95);

  -- Award prize to winner
  UPDATE public.profiles 
  SET points = points + prize
  WHERE id = actual_winner;

  -- Update duel as completed
  UPDATE public.btc_prediction_duels
  SET status = 'completed', 
      winner_id = actual_winner, 
      final_btc_price = p_final_price,
      completed_at = now()
  WHERE id = p_duel_id;

  RETURN QUERY SELECT actual_winner, prize;
END;
$function$;