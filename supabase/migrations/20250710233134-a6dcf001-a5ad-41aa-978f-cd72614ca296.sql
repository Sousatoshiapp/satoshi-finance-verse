-- Enable realtime for profiles table to track points updates
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add profiles table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Enable realtime for weekly_leaderboards table
ALTER TABLE public.weekly_leaderboards REPLICA IDENTITY FULL;

-- Add weekly_leaderboards table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.weekly_leaderboards;