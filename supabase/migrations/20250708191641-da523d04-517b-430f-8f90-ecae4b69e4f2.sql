-- Create function to assign achievements to bots based on their data
CREATE OR REPLACE FUNCTION public.assign_bot_achievements()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bot_record RECORD;
  achievement_count INTEGER := 0;
  quiz_count INTEGER;
  max_combo INTEGER;
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
      COALESCE(MAX(max_combo), 0) as best_combo
    INTO quiz_count, max_combo
    FROM public.quiz_sessions 
    WHERE user_id = bot_record.id;
    
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
    IF max_combo >= 10 AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements 
      WHERE user_id = bot_record.id AND achievement_name = 'combo_expert'
    ) THEN
      INSERT INTO public.user_achievements (user_id, achievement_type, achievement_name, description, metadata)
      VALUES (bot_record.id, 'combo', 'combo_expert', 'Conseguiu combo de 10', 
        jsonb_build_object('max_combo', max_combo));
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

-- Create function to improve bot data for more realistic achievements
CREATE OR REPLACE FUNCTION public.improve_bot_data()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bot_record RECORD;
  improved_count INTEGER := 0;
  new_streak INTEGER;
  additional_sessions INTEGER;
BEGIN
  -- Improve streaks for some high-level bots
  FOR bot_record IN 
    SELECT id, level, streak
    FROM public.profiles 
    WHERE is_bot = true 
    AND level >= 20 
    AND streak < 30
    ORDER BY RANDOM()
    LIMIT 50 -- Only improve 50 bots to keep it realistic
  LOOP
    -- Give them longer streaks (30-90 days)
    new_streak := 30 + floor(random() * 60);
    
    UPDATE public.profiles 
    SET streak = new_streak
    WHERE id = bot_record.id;
    
    improved_count := improved_count + 1;
  END LOOP;
  
  -- Add more quiz sessions with better combos for some bots
  FOR bot_record IN 
    SELECT id, level
    FROM public.profiles 
    WHERE is_bot = true 
    AND level >= 15
    ORDER BY RANDOM()
    LIMIT 30 -- Only improve 30 bots
  LOOP
    -- Add 10-20 additional quiz sessions with better performance
    additional_sessions := 10 + floor(random() * 10);
    
    FOR i IN 1..additional_sessions LOOP
      INSERT INTO public.quiz_sessions (
        user_id, 
        session_type, 
        questions_total, 
        questions_correct,
        questions_incorrect,
        combo_count,
        max_combo,
        performance_score,
        completed_at,
        created_at
      ) VALUES (
        bot_record.id,
        'practice',
        10,
        8 + floor(random() * 2), -- 8-9 correct (high performance)
        0 + floor(random() * 2), -- 0-1 incorrect
        7 + floor(random() * 4), -- 7-10 combo
        8 + floor(random() * 7), -- 8-14 max combo (some will hit 10+)
        0.80 + (random() * 0.20), -- 80-100% performance
        NOW() - (INTERVAL '1 day') * floor(random() * 30), -- Random recent date
        NOW() - (INTERVAL '1 day') * floor(random() * 30)
      );
    END LOOP;
  END LOOP;
  
  RETURN improved_count;
END;
$$;