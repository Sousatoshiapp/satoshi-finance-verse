-- Allow NULL values in user_id column for bot profiles
-- This enables bots to have user_id = NULL while real users still have valid user_id
ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;