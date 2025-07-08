-- Fix the generate_bot_profile function to avoid foreign key constraint violation
-- by setting user_id to NULL for bots instead of generating random UUIDs

CREATE OR REPLACE FUNCTION public.generate_bot_profile(bot_count integer DEFAULT 1)
RETURNS TABLE(bot_id uuid, nickname text, level integer, xp integer, points integer)
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
    
    -- Insert bot profile with user_id as NULL to avoid foreign key constraint
    INSERT INTO public.profiles (
      user_id, nickname, level, xp, points, 
      is_bot, avatar_id, streak
    )
    VALUES (
      NULL, bot_nickname, bot_level, bot_xp, bot_points,
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