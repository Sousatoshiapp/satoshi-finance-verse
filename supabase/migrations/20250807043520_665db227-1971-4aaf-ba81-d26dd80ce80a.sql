-- 3. Create improved find_btc_duel_opponent function with bot fallback
CREATE OR REPLACE FUNCTION public.find_btc_duel_opponent(p_user_id UUID, p_bet_amount INTEGER)
RETURNS TABLE(opponent_id UUID, queue_id UUID, is_bot BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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