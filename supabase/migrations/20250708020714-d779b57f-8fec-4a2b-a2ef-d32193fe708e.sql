-- Add is_bot field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_bot BOOLEAN DEFAULT FALSE;

-- Create index for better performance when filtering bots
CREATE INDEX idx_profiles_is_bot ON public.profiles(is_bot);

-- Create bot activity log table to track bot behaviors
CREATE TABLE IF NOT EXISTS public.bot_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on bot activity log
ALTER TABLE public.bot_activity_log ENABLE ROW LEVEL SECURITY;

-- Create policy for bot activity log (viewable by everyone for transparency)
CREATE POLICY "Bot activity is viewable by everyone" 
ON public.bot_activity_log 
FOR SELECT 
USING (true);

-- Create function to generate bot profiles with realistic data
CREATE OR REPLACE FUNCTION public.generate_bot_profile(bot_count INTEGER DEFAULT 1)
RETURNS TABLE(bot_id UUID, nickname TEXT, level INTEGER, xp INTEGER, points INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  i INTEGER;
  new_bot_id UUID;
  bot_nickname TEXT;
  bot_level INTEGER;
  bot_xp INTEGER;
  bot_points INTEGER;
  bot_avatar_id UUID;
BEGIN
  FOR i IN 1..bot_count LOOP
    -- Generate random avatar
    SELECT id INTO bot_avatar_id 
    FROM public.avatars 
    WHERE is_available = true 
    ORDER BY RANDOM() 
    LIMIT 1;
    
    -- Generate bot data
    bot_nickname := 'Bot_' || substring(md5(random()::text), 1, 8);
    bot_level := 1 + floor(random() * 50)::INTEGER;
    bot_xp := CASE 
      WHEN bot_level <= 10 THEN 100 + floor(random() * 900)::INTEGER
      WHEN bot_level <= 30 THEN 1000 + floor(random() * 9000)::INTEGER
      ELSE 10000 + floor(random() * 40000)::INTEGER
    END;
    bot_points := 100 + floor(random() * 9900)::INTEGER;
    
    -- Insert bot profile
    INSERT INTO public.profiles (
      user_id, nickname, level, xp, points, 
      is_bot, avatar_id, streak
    )
    VALUES (
      gen_random_uuid(), bot_nickname, bot_level, bot_xp, bot_points,
      true, bot_avatar_id, floor(random() * 30)::INTEGER
    )
    RETURNING id INTO new_bot_id;
    
    -- Create initial weekly leaderboard entry
    PERFORM public.get_or_create_weekly_entry(new_bot_id);
    
    -- Add some initial weekly activity
    PERFORM public.update_weekly_leaderboard(
      new_bot_id, 
      floor(random() * 200)::INTEGER, -- XP this week
      floor(random() * 100)::INTEGER, -- Quiz points
      random() > 0.7 -- 30% chance of duel win
    );
    
    RETURN QUERY SELECT new_bot_id, bot_nickname, bot_level, bot_xp, bot_points;
  END LOOP;
END;
$$;