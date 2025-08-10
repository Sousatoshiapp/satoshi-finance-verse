-- Remove the old create_duel_with_invite function that creates entries in the 'duels' table
-- This function is incorrect and conflicts with the casino duel system

DROP FUNCTION IF EXISTS public.create_duel_with_invite(uuid, uuid, text, jsonb);

-- Keep only the newer create_duel_with_invite function that works with casino_duels table
-- This function should remain as it correctly creates casino duels

-- Add additional logging to verify which function is being used
COMMENT ON FUNCTION public.create_duel_with_invite(uuid, uuid) IS 'Creates a casino duel from a duel invite - returns jsonb with duel data';