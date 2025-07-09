-- Fix the column name in user_challenge_progress table to match our code
ALTER TABLE public.user_challenge_progress RENAME COLUMN current_progress TO progress;