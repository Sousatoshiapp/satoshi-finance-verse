-- Create the missing clean_expired_btc_queue function
CREATE OR REPLACE FUNCTION public.clean_expired_btc_queue()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete expired entries from the btc_duel_queue
  DELETE FROM public.btc_duel_queue
  WHERE expires_at <= now();
  
  -- Get the number of deleted rows
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$function$;