-- 2. Improve BTC duel queue with longer TTL and cleanup functions
ALTER TABLE public.btc_duel_queue 
  ALTER COLUMN expires_at SET DEFAULT (now() + INTERVAL '10 minutes');

-- Create function to clean expired queue entries
CREATE OR REPLACE FUNCTION public.clean_expired_btc_queue()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_btc_bots_active_bet_range 
  ON public.btc_bots(is_active, min_bet_amount, max_bet_amount)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_btc_queue_expires_bet 
  ON public.btc_duel_queue(expires_at, bet_amount)
  WHERE expires_at > now();