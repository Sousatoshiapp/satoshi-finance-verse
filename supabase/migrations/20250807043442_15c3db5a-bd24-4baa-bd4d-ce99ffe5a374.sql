-- 2. Improve BTC duel queue with longer TTL
ALTER TABLE public.btc_duel_queue 
  ALTER COLUMN expires_at SET DEFAULT (now() + INTERVAL '10 minutes');