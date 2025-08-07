-- Create function to get real-time queue stats
CREATE OR REPLACE FUNCTION public.get_btc_queue_stats(p_bet_amount INTEGER)
RETURNS TABLE(
  queue_count INTEGER,
  estimated_wait_time INTEGER,
  active_duels INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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