
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

-- Update the enhance_bot_realism_batch function to include achievements
CREATE OR REPLACE FUNCTION public.enhance_bot_realism_batch(batch_size integer DEFAULT 50, offset_value integer DEFAULT 0)
RETURNS TABLE(processed integer, total_bots integer, has_more boolean, success boolean, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bot_record RECORD;
  random_date DATE;
  days_since_join INTEGER;
  weekly_xp INTEGER;
  quiz_sessions INTEGER;
  social_interactions INTEGER;
  total_count INTEGER;
  current_processed INTEGER := 0;
  error_occurred BOOLEAN := FALSE;
  current_error TEXT := '';
  max_combo_for_session INTEGER;
  achievements_to_add TEXT[];
BEGIN
  -- Get total bot count
  SELECT COUNT(*) INTO total_count
  FROM public.profiles 
  WHERE is_bot = true;
  
  -- Process bots in batch
  FOR bot_record IN 
    SELECT id, nickname, level, xp, points, streak, created_at
    FROM public.profiles 
    WHERE is_bot = true
    ORDER BY id
    LIMIT batch_size OFFSET offset_value
  LOOP
    BEGIN
      -- Generate realistic member since date (between 6 months to 2 years ago)
      random_date := CURRENT_DATE - (INTERVAL '180 days') - (INTERVAL '1 day') * floor(random() * 550);
      days_since_join := CURRENT_DATE - random_date;
      
      -- Only update created_at if it's newer than our random date
      IF bot_record.created_at > random_date THEN
        UPDATE public.profiles 
        SET created_at = random_date
        WHERE id = bot_record.id;
      END IF;
      
      -- Create realistic quiz sessions based on bot level
      quiz_sessions := CASE 
        WHEN bot_record.level <= 10 THEN 3 + floor(random() * 8)
        WHEN bot_record.level <= 30 THEN 8 + floor(random() * 15)
        ELSE 15 + floor(random() * 25)
      END;
      
      -- Insert quiz sessions with achievement-worthy combos for some bots
      FOR i IN 1..quiz_sessions LOOP
        -- Some high-level bots get better combos
        IF bot_record.level >= 20 AND random() > 0.7 THEN
          max_combo_for_session := 10 + floor(random() * 5); -- 10-14 combo for achievements
        ELSE
          max_combo_for_session := 4 + floor(random() * 8); -- 4-11 normal combo
        END IF;
        
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
          (ARRAY['review', 'practice', 'challenge'])[floor(random() * 3) + 1]::character varying,
          10,
          6 + floor(random() * 4),
          1 + floor(random() * 4),
          LEAST(max_combo_for_session, 6 + floor(random() * 4)),
          max_combo_for_session,
          0.60 + (random() * 0.35),
          random_date + (INTERVAL '1 day') * floor(random() * days_since_join),
          random_date + (INTERVAL '1 day') * floor(random() * days_since_join)
        ) ON CONFLICT DO NOTHING;
      END LOOP;
      
      -- Assign level-based achievements immediately
      achievements_to_add := ARRAY[]::TEXT[];
      
      IF bot_record.level >= 5 THEN
        achievements_to_add := achievements_to_add || 'first_steps';
      END IF;
      IF bot_record.level >= 10 THEN
        achievements_to_add := achievements_to_add || 'rising_star';
      END IF;
      IF bot_record.level >= 20 THEN
        achievements_to_add := achievements_to_add || 'expert';
      END IF;
      IF bot_record.level >= 30 THEN
        achievements_to_add := achievements_to_add || 'master';
      END IF;
      IF bot_record.level >= 40 THEN
        achievements_to_add := achievements_to_add || 'legend';
      END IF;
      
      -- Add quiz-based achievements
      IF quiz_sessions >= 10 THEN
        achievements_to_add := achievements_to_add || 'quiz_enthusiast';
      END IF;
      IF quiz_sessions >= 50 THEN
        achievements_to_add := achievements_to_add || 'quiz_master';
      END IF;
      
      -- Add streak achievements for some bots
      IF bot_record.streak >= 7 THEN
        achievements_to_add := achievements_to_add || 'streak_warrior';
      END IF;
      IF bot_record.streak >= 30 THEN
        achievements_to_add := achievements_to_add || 'dedication';
      END IF;
      
      -- Insert achievements
      FOR j IN 1..array_length(achievements_to_add, 1) LOOP
        INSERT INTO public.user_achievements (user_id, achievement_type, achievement_name, description, metadata)
        VALUES (
          bot_record.id,
          CASE achievements_to_add[j]
            WHEN 'first_steps', 'rising_star', 'expert', 'master', 'legend' THEN 'level'
            WHEN 'quiz_enthusiast', 'quiz_master' THEN 'quiz'
            WHEN 'combo_expert' THEN 'combo'
            WHEN 'streak_warrior', 'dedication' THEN 'streak'
            ELSE 'general'
          END,
          achievements_to_add[j],
          CASE achievements_to_add[j]
            WHEN 'first_steps' THEN 'Alcançou nível 5'
            WHEN 'rising_star' THEN 'Alcançou nível 10'
            WHEN 'expert' THEN 'Alcançou nível 20'
            WHEN 'master' THEN 'Alcançou nível 30'
            WHEN 'legend' THEN 'Alcançou nível 40'
            WHEN 'quiz_enthusiast' THEN 'Completou 10 quizzes'
            WHEN 'quiz_master' THEN 'Completou 50 quizzes'
            WHEN 'combo_expert' THEN 'Conseguiu combo de 10'
            WHEN 'streak_warrior' THEN 'Manteve streak de 7 dias'
            WHEN 'dedication' THEN 'Manteve streak de 30 dias'
            ELSE 'Conquista especial'
          END,
          jsonb_build_object('level', bot_record.level, 'assigned_at', NOW())
        ) ON CONFLICT (user_id, achievement_name) DO NOTHING;
      END LOOP;
      
      -- Rest of the existing logic (social posts, weekly leaderboards, portfolios)
      social_interactions := CASE
        WHEN bot_record.level <= 10 THEN floor(random() * 3)
        WHEN bot_record.level <= 30 THEN 1 + floor(random() * 5)
        ELSE 3 + floor(random() * 8)
      END;
      
      FOR i IN 1..social_interactions LOOP
        INSERT INTO public.social_posts (
          user_id,
          content,
          post_type,
          likes_count,
          comments_count,
          created_at
        ) VALUES (
          bot_record.id,
          (ARRAY[
            'Acabei de completar um quiz incrível! 🎯',
            'Subindo no ranking! 🚀',
            'Nova sequência de vitórias! 🔥',
            'Aprendendo muito sobre finanças 📈',
            'Quem quer duelar? 💪',
            'Conquistei um novo troféu! 🏆'
          ])[floor(random() * 6) + 1],
          'text',
          floor(random() * 20),
          floor(random() * 5),
          random_date + (INTERVAL '1 day') * floor(random() * days_since_join)
        ) ON CONFLICT DO NOTHING;
      END LOOP;
      
      -- Create weekly leaderboard entries
      FOR week_offset IN 0..3 LOOP
        weekly_xp := 30 + floor(random() * 150);
        
        INSERT INTO public.weekly_leaderboards (
          user_id,
          week_start_date,
          xp_earned,
          quiz_score,
          duels_won,
          total_score
        ) VALUES (
          bot_record.id,
          date_trunc('week', CURRENT_DATE - (INTERVAL '1 week') * week_offset)::DATE,
          weekly_xp,
          quiz_sessions / 4,
          floor(random() * 2),
          weekly_xp + (quiz_sessions / 4) + (floor(random() * 2) * 100)
        ) ON CONFLICT (user_id, week_start_date) DO NOTHING;
      END LOOP;
      
      -- Create portfolios
      IF random() > 0.7 THEN
        INSERT INTO public.portfolios (
          user_id,
          name,
          description,
          initial_balance,
          current_balance,
          performance_percentage,
          is_public,
          district_theme
        ) VALUES (
          bot_record.id,
          bot_record.nickname || '''s Portfolio',
          'Portfolio diversificado com foco em crescimento',
          10000.00,
          9800.00 + (random() * 4000.00),
          -2.0 + (random() * 6.0),
          random() > 0.5,
          (ARRAY['tech', 'finance', 'crypto', 'traditional'])[floor(random() * 4) + 1]
        ) ON CONFLICT DO NOTHING;
      END IF;
      
      current_processed := current_processed + 1;
      
    EXCEPTION WHEN others THEN
      error_occurred := TRUE;
      current_error := SQLERRM;
      RAISE WARNING 'Error processing bot %: %', bot_record.id, SQLERRM;
    END;
  END LOOP;
  
  RETURN QUERY SELECT 
    current_processed,
    total_count,
    (offset_value + batch_size) < total_count,
    NOT error_occurred,
    current_error;
    
END;
$$;
