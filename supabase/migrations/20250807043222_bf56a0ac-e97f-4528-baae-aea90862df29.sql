-- Improve BTC matchmaking system for real users

-- 1. Create bots table for fallback opponents
CREATE TABLE IF NOT EXISTS public.btc_bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) NOT NULL,
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  min_bet_amount INTEGER DEFAULT 100,
  max_bet_amount INTEGER DEFAULT 5000,
  win_rate DECIMAL(3,2) DEFAULT 0.50,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Improve BTC duel queue with longer TTL and cleanup
ALTER TABLE public.btc_duel_queue 
  ALTER COLUMN expires_at SET DEFAULT (now() + INTERVAL '10 minutes');

-- 3. Create function to clean expired queue entries
CREATE OR REPLACE FUNCTION public.clean_expired_btc_queue()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.btc_duel_queue 
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$function$

-- 4. Improve find_btc_duel_opponent function with bot fallback
CREATE OR REPLACE FUNCTION public.find_btc_duel_opponent(p_user_id UUID, p_bet_amount INTEGER)
RETURNS TABLE(opponent_id UUID, queue_id UUID, is_bot BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  found_opponent UUID;
  found_queue_id UUID;
  bot_opponent UUID;
  new_queue_id UUID;
BEGIN
  -- Clean expired entries first
  PERFORM public.clean_expired_btc_queue();
  
  -- Find an opponent with the same bet amount (excluding the current user)
  SELECT user_id, id INTO found_opponent, found_queue_id
  FROM public.btc_duel_queue
  WHERE bet_amount = p_bet_amount 
    AND user_id != p_user_id
    AND expires_at > now()
  ORDER BY created_at ASC
  LIMIT 1;

  IF found_opponent IS NOT NULL THEN
    -- Remove matched opponent from queue
    DELETE FROM public.btc_duel_queue 
    WHERE id = found_queue_id;
    
    RETURN QUERY SELECT found_opponent, found_queue_id, false;
    RETURN;
  END IF;

  -- Check if user is already in queue
  SELECT id INTO found_queue_id
  FROM public.btc_duel_queue
  WHERE user_id = p_user_id 
    AND bet_amount = p_bet_amount
    AND expires_at > now();

  IF found_queue_id IS NULL THEN
    -- Add user to queue with longer TTL (10 minutes)
    INSERT INTO public.btc_duel_queue (user_id, bet_amount, expires_at)
    VALUES (p_user_id, p_bet_amount, now() + INTERVAL '10 minutes')
    RETURNING id INTO new_queue_id;
  ELSE
    new_queue_id := found_queue_id;
  END IF;

  -- After 30 seconds in queue, try to find a bot opponent
  IF EXISTS (
    SELECT 1 FROM public.btc_duel_queue 
    WHERE user_id = p_user_id 
      AND bet_amount = p_bet_amount
      AND created_at < (now() - INTERVAL '30 seconds')
  ) THEN
    -- Find suitable bot opponent
    SELECT bb.profile_id INTO bot_opponent
    FROM public.btc_bots bb
    JOIN public.profiles p ON bb.profile_id = p.id
    WHERE bb.is_active = true
      AND p_bet_amount BETWEEN bb.min_bet_amount AND bb.max_bet_amount
      AND (bb.last_used_at IS NULL OR bb.last_used_at < (now() - INTERVAL '5 minutes'))
    ORDER BY RANDOM()
    LIMIT 1;

    IF bot_opponent IS NOT NULL THEN
      -- Update bot last used time
      UPDATE public.btc_bots 
      SET last_used_at = now() 
      WHERE profile_id = bot_opponent;
      
      -- Remove user from queue
      DELETE FROM public.btc_duel_queue 
      WHERE user_id = p_user_id AND bet_amount = p_bet_amount;
      
      RETURN QUERY SELECT bot_opponent, new_queue_id, true;
      RETURN;
    END IF;
  END IF;

  -- No opponent found, return queue info
  RETURN QUERY SELECT NULL::UUID, new_queue_id, false;
END;
$function$

-- 5. Create function to get real-time queue stats
CREATE OR REPLACE FUNCTION public.get_btc_queue_stats(p_bet_amount INTEGER)
RETURNS TABLE(
  queue_count INTEGER,
  estimated_wait_time INTEGER,
  active_duels INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  queue_size INTEGER;
  wait_time INTEGER;
  active_count INTEGER;
BEGIN
  -- Clean expired entries first
  PERFORM public.clean_expired_btc_queue();
  
  -- Count users in queue for this bet amount
  SELECT COUNT(*) INTO queue_size
  FROM public.btc_duel_queue
  WHERE bet_amount = p_bet_amount
    AND expires_at > now();
  
  -- Calculate estimated wait time (30 seconds per person ahead)
  wait_time := GREATEST(30, queue_size * 30);
  
  -- Count active duels
  SELECT COUNT(*) INTO active_count
  FROM public.btc_prediction_duels
  WHERE status IN ('waiting_predictions', 'active')
    AND bet_amount = p_bet_amount;
  
  RETURN QUERY SELECT queue_size, wait_time, active_count;
END;
$function$

-- 6. Enable RLS on btc_bots table
ALTER TABLE public.btc_bots ENABLE ROW LEVEL SECURITY;

-- RLS policies for btc_bots (read-only for all authenticated users)
CREATE POLICY "Anyone can view active bots" ON public.btc_bots
  FOR SELECT USING (is_active = true);

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_btc_bots_active_bet_range 
  ON public.btc_bots(is_active, min_bet_amount, max_bet_amount)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_btc_queue_expires_bet 
  ON public.btc_duel_queue(expires_at, bet_amount)
  WHERE expires_at > now();