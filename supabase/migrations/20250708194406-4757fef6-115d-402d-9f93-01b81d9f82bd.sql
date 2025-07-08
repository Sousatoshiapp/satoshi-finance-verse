-- Fix the assign_bot_achievements function by removing invalid COMMIT statements
CREATE OR REPLACE FUNCTION public.assign_bot_achievements()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bot_record RECORD;
  achievement_count INTEGER := 0;
  quiz_count INTEGER;
  bot_max_combo INTEGER;
  current_streak INTEGER;
  current_level INTEGER;
  achievement_id_var UUID;
  processed_count INTEGER := 0;
BEGIN
  -- Process only first 50 bots to avoid timeout (reduced from 100)
  FOR bot_record IN 
    SELECT id, nickname, level, streak, xp, created_at
    FROM public.profiles 
    WHERE is_bot = true
    ORDER BY id
    LIMIT 50
  LOOP
    current_level := bot_record.level;
    current_streak := bot_record.streak;
    
    -- Get quiz statistics for this bot
    SELECT 
      COUNT(*) as total_sessions,
      COALESCE(MAX(qs.max_combo), 0) as best_combo
    INTO quiz_count, bot_max_combo
    FROM public.quiz_sessions qs
    WHERE qs.user_id = bot_record.id;
    
    -- Achievement: First Steps (level 5+)
    IF current_level >= 5 THEN
      SELECT id INTO achievement_id_var FROM public.achievements WHERE name = 'first_steps';
      IF achievement_id_var IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.user_achievements 
        WHERE user_id = bot_record.id AND achievement_id = achievement_id_var
      ) THEN
        INSERT INTO public.user_achievements (user_id, achievement_id, progress_data)
        VALUES (bot_record.id, achievement_id_var, jsonb_build_object('level_achieved', current_level));
        achievement_count := achievement_count + 1;
      END IF;
    END IF;
    
    -- Achievement: Rising Star (level 10+)
    IF current_level >= 10 THEN
      SELECT id INTO achievement_id_var FROM public.achievements WHERE name = 'rising_star';
      IF achievement_id_var IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.user_achievements 
        WHERE user_id = bot_record.id AND achievement_id = achievement_id_var
      ) THEN
        INSERT INTO public.user_achievements (user_id, achievement_id, progress_data)
        VALUES (bot_record.id, achievement_id_var, jsonb_build_object('level_achieved', current_level));
        achievement_count := achievement_count + 1;
      END IF;
    END IF;
    
    -- Achievement: Expert (level 20+)
    IF current_level >= 20 THEN
      SELECT id INTO achievement_id_var FROM public.achievements WHERE name = 'expert';
      IF achievement_id_var IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.user_achievements 
        WHERE user_id = bot_record.id AND achievement_id = achievement_id_var
      ) THEN
        INSERT INTO public.user_achievements (user_id, achievement_id, progress_data)
        VALUES (bot_record.id, achievement_id_var, jsonb_build_object('level_achieved', current_level));
        achievement_count := achievement_count + 1;
      END IF;
    END IF;
    
    -- Achievement: Master (level 30+)
    IF current_level >= 30 THEN
      SELECT id INTO achievement_id_var FROM public.achievements WHERE name = 'master';
      IF achievement_id_var IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.user_achievements 
        WHERE user_id = bot_record.id AND achievement_id = achievement_id_var
      ) THEN
        INSERT INTO public.user_achievements (user_id, achievement_id, progress_data)
        VALUES (bot_record.id, achievement_id_var, jsonb_build_object('level_achieved', current_level));
        achievement_count := achievement_count + 1;
      END IF;
    END IF;
    
    -- Achievement: Streak Warrior (streak 7+)
    IF current_streak >= 7 THEN
      SELECT id INTO achievement_id_var FROM public.achievements WHERE name = 'streak_warrior';
      IF achievement_id_var IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.user_achievements 
        WHERE user_id = bot_record.id AND achievement_id = achievement_id_var
      ) THEN
        INSERT INTO public.user_achievements (user_id, achievement_id, progress_data)
        VALUES (bot_record.id, achievement_id_var, jsonb_build_object('streak_days', current_streak));
        achievement_count := achievement_count + 1;
      END IF;
    END IF;
    
    -- Achievement: Dedication (streak 30+)
    IF current_streak >= 30 THEN
      SELECT id INTO achievement_id_var FROM public.achievements WHERE name = 'dedication';
      IF achievement_id_var IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.user_achievements 
        WHERE user_id = bot_record.id AND achievement_id = achievement_id_var
      ) THEN
        INSERT INTO public.user_achievements (user_id, achievement_id, progress_data)
        VALUES (bot_record.id, achievement_id_var, jsonb_build_object('streak_days', current_streak));
        achievement_count := achievement_count + 1;
      END IF;
    END IF;
    
    processed_count := processed_count + 1;
    
  END LOOP;
  
  RETURN achievement_count;
END;
$$;