-- Fix the foreign key relationship issue for weekly_leaderboards
ALTER TABLE public.weekly_leaderboards DROP CONSTRAINT IF EXISTS weekly_leaderboards_user_id_fkey;
ALTER TABLE public.weekly_leaderboards ADD CONSTRAINT weekly_leaderboards_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;