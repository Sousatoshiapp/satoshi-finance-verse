-- Fix ambiguous column reference in assign_bot_achievements function
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
BEGIN
  -- Loop through all bots
  FOR bot_record IN 
    SELECT id, nickname, level, streak, xp, created_at
    FROM public.profiles 
    WHERE is_bot = true
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
    IF current_level >= 5 AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements 
      WHERE user_id = bot_record.id AND achievement_name = 'first_steps'
    ) THEN
      INSERT INTO public.user_achievements (user_id, achievement_type, achievement_name, description, metadata)
      VALUES (bot_record.id, 'level', 'first_steps', 'Alcançou nível 5', 
        jsonb_build_object('level_achieved', 5));
      achievement_count := achievement_count + 1;
    END IF;
    
    -- Achievement: Rising Star (level 10+)
    IF current_level >= 10 AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements 
      WHERE user_id = bot_record.id AND achievement_name = 'rising_star'
    ) THEN
      INSERT INTO public.user_achievements (user_id, achievement_type, achievement_name, description, metadata)
      VALUES (bot_record.id, 'level', 'rising_star', 'Alcançou nível 10', 
        jsonb_build_object('level_achieved', 10));
      achievement_count := achievement_count + 1;
    END IF;
    
    -- Achievement: Expert (level 20+)
    IF current_level >= 20 AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements 
      WHERE user_id = bot_record.id AND achievement_name = 'expert'
    ) THEN
      INSERT INTO public.user_achievements (user_id, achievement_type, achievement_name, description, metadata)
      VALUES (bot_record.id, 'level', 'expert', 'Alcançou nível 20', 
        jsonb_build_object('level_achieved', 20));
      achievement_count := achievement_count + 1;
    END IF;
    
    -- Achievement: Master (level 30+)
    IF current_level >= 30 AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements 
      WHERE user_id = bot_record.id AND achievement_name = 'master'
    ) THEN
      INSERT INTO public.user_achievements (user_id, achievement_type, achievement_name, description, metadata)
      VALUES (bot_record.id, 'level', 'master', 'Alcançou nível 30', 
        jsonb_build_object('level_achieved', 30));
      achievement_count := achievement_count + 1;
    END IF;
    
    -- Achievement: Legend (level 40+)
    IF current_level >= 40 AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements 
      WHERE user_id = bot_record.id AND achievement_name = 'legend'
    ) THEN
      INSERT INTO public.user_achievements (user_id, achievement_type, achievement_name, description, metadata)
      VALUES (bot_record.id, 'level', 'legend', 'Alcançou nível 40', 
        jsonb_build_object('level_achieved', 40));
      achievement_count := achievement_count + 1;
    END IF;
    
    -- Achievement: Quiz Enthusiast (10+ quiz sessions)
    IF quiz_count >= 10 AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements 
      WHERE user_id = bot_record.id AND achievement_name = 'quiz_enthusiast'
    ) THEN
      INSERT INTO public.user_achievements (user_id, achievement_type, achievement_name, description, metadata)
      VALUES (bot_record.id, 'quiz', 'quiz_enthusiast', 'Completou 10 quizzes', 
        jsonb_build_object('quizzes_completed', quiz_count));
      achievement_count := achievement_count + 1;
    END IF;
    
    -- Achievement: Quiz Master (50+ quiz sessions)
    IF quiz_count >= 50 AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements 
      WHERE user_id = bot_record.id AND achievement_name = 'quiz_master'
    ) THEN
      INSERT INTO public.user_achievements (user_id, achievement_type, achievement_name, description, metadata)
      VALUES (bot_record.id, 'quiz', 'quiz_master', 'Completou 50 quizzes', 
        jsonb_build_object('quizzes_completed', quiz_count));
      achievement_count := achievement_count + 1;
    END IF;
    
    -- Achievement: Combo Expert (combo 10+)
    IF bot_max_combo >= 10 AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements 
      WHERE user_id = bot_record.id AND achievement_name = 'combo_expert'
    ) THEN
      INSERT INTO public.user_achievements (user_id, achievement_type, achievement_name, description, metadata)
      VALUES (bot_record.id, 'combo', 'combo_expert', 'Conseguiu combo de 10', 
        jsonb_build_object('max_combo', bot_max_combo));
      achievement_count := achievement_count + 1;
    END IF;
    
    -- Achievement: Streak Warrior (streak 7+)
    IF current_streak >= 7 AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements 
      WHERE user_id = bot_record.id AND achievement_name = 'streak_warrior'
    ) THEN
      INSERT INTO public.user_achievements (user_id, achievement_type, achievement_name, description, metadata)
      VALUES (bot_record.id, 'streak', 'streak_warrior', 'Manteve streak de 7 dias', 
        jsonb_build_object('streak_days', current_streak));
      achievement_count := achievement_count + 1;
    END IF;
    
    -- Achievement: Dedication (streak 30+)
    IF current_streak >= 30 AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements 
      WHERE user_id = bot_record.id AND achievement_name = 'dedication'
    ) THEN
      INSERT INTO public.user_achievements (user_id, achievement_type, achievement_name, description, metadata)
      VALUES (bot_record.id, 'streak', 'dedication', 'Manteve streak de 30 dias', 
        jsonb_build_object('streak_days', current_streak));
      achievement_count := achievement_count + 1;
    END IF;
    
  END LOOP;
  
  RETURN achievement_count;
END;
$$;