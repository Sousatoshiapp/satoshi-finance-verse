-- Complete security fix - Part 2: Fix remaining functions with search_path
-- This will resolve all remaining "Function Search Path Mutable" warnings

-- Financial and game functions
CREATE OR REPLACE FUNCTION public.calculate_daily_yield(profile_id uuid)
 RETURNS TABLE(yield_amount numeric, new_total numeric, applied_rate numeric, streak_bonus numeric, subscription_bonus numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  user_record RECORD;
  base_rate DECIMAL(4,3) := 0.001; -- 0.1% daily
  streak_bonus_rate DECIMAL(4,3) := 0;
  subscription_bonus_rate DECIMAL(4,3) := 0;
  total_rate DECIMAL(4,3);
  calculated_yield DECIMAL(10,2);
  capped_yield DECIMAL(10,2);
  new_points_total DECIMAL(10,2);
  daily_yield_cap DECIMAL(10,2) := 5.0; -- 5 BTZ maximum per day
BEGIN
  -- Get user data
  SELECT * INTO user_record 
  FROM profiles 
  WHERE id = profile_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0.0, 0.0, 0.0, 0.0, 0.0;
    RETURN;
  END IF;
  
  -- Calculate streak bonus (0.01% per 5-day tier, max 0.3%)
  IF user_record.consecutive_login_days >= 5 THEN
    streak_bonus_rate := LEAST(0.003, (user_record.consecutive_login_days / 5) * 0.0001);
  END IF;
  
  -- Calculate subscription bonus
  CASE user_record.subscription_tier
    WHEN 'pro' THEN subscription_bonus_rate := 0.0005; -- +0.05%
    WHEN 'elite' THEN subscription_bonus_rate := 0.001; -- +0.1%
    ELSE subscription_bonus_rate := 0;
  END CASE;
  
  -- Total rate calculation
  total_rate := base_rate + streak_bonus_rate + subscription_bonus_rate;
  
  -- Calculate yield
  calculated_yield := user_record.points * total_rate;
  
  -- Apply daily cap
  capped_yield := LEAST(calculated_yield, daily_yield_cap);
  
  -- Calculate new total
  new_points_total := user_record.points + capped_yield;
  
  -- Update user points
  UPDATE profiles 
  SET points = new_points_total
  WHERE id = profile_id;
  
  -- Record yield history with correct column names
  INSERT INTO btz_yield_history (
    user_id, 
    yield_amount, 
    yield_rate, 
    streak_bonus, 
    subscription_bonus,
    btz_before, 
    btz_after
  ) VALUES (
    profile_id,
    capped_yield,
    total_rate,
    streak_bonus_rate,
    subscription_bonus_rate,
    user_record.points,
    new_points_total
  );
  
  RETURN QUERY SELECT 
    capped_yield,
    new_points_total,
    total_rate,
    streak_bonus_rate,
    subscription_bonus_rate;
END;
$function$;

CREATE OR REPLACE FUNCTION public.apply_btz_penalty(profile_id uuid)
 RETURNS TABLE(penalty_applied boolean, penalty_amount integer, days_inactive integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  user_record RECORD;
  inactive_days INTEGER;
  penalty_rate DECIMAL(4,3) := 0;
  calculated_penalty INTEGER;
  unprotected_btz INTEGER;
BEGIN
  SELECT * INTO user_record FROM profiles WHERE id = profile_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 0;
    RETURN;
  END IF;
  
  inactive_days := CURRENT_DATE - user_record.last_login_date;
  
  IF inactive_days <= 1 THEN
    RETURN QUERY SELECT false, 0, inactive_days;
    RETURN;
  END IF;
  
  CASE 
    WHEN inactive_days BETWEEN 2 AND 3 THEN penalty_rate := 0.01;
    WHEN inactive_days BETWEEN 4 AND 7 THEN penalty_rate := 0.02;
    WHEN inactive_days >= 8 THEN penalty_rate := 0.05;
  END CASE;
  
  unprotected_btz := GREATEST(0, user_record.points - user_record.protected_btz);
  calculated_penalty := FLOOR(unprotected_btz * penalty_rate);
  
  IF calculated_penalty > 0 THEN
    UPDATE profiles 
    SET points = GREATEST(protected_btz, points - calculated_penalty)
    WHERE id = profile_id;
    
    INSERT INTO btz_penalty_history (
      user_id, penalty_amount, days_inactive, penalty_rate,
      btz_before, btz_after
    ) VALUES (
      profile_id, calculated_penalty, inactive_days, penalty_rate,
      user_record.points, user_record.points - calculated_penalty
    );
  END IF;
  
  RETURN QUERY SELECT calculated_penalty > 0, calculated_penalty, inactive_days;
END;
$function$;

-- Level and XP functions
CREATE OR REPLACE FUNCTION public.calculate_correct_level(user_xp integer)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
  correct_level integer;
BEGIN
  -- Encontrar o maior nível onde o usuário tem XP suficiente
  SELECT COALESCE(MAX(level), 1) INTO correct_level
  FROM level_tiers 
  WHERE xp_required <= user_xp;
  
  RETURN correct_level;
END;
$function$;

CREATE OR REPLACE FUNCTION public.auto_update_user_level()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
  new_level integer;
BEGIN
  -- Calcular nível correto baseado no XP
  new_level := calculate_correct_level(NEW.xp);
  
  -- Atualizar o nível se mudou
  IF new_level != NEW.level THEN
    NEW.level := new_level;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_next_level_xp(current_level integer)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE
 SET search_path = 'public'
AS $function$
DECLARE
  next_xp INTEGER;
BEGIN
  SELECT xp_required INTO next_xp
  FROM level_tiers 
  WHERE level = current_level + 1;
  
  RETURN COALESCE(next_xp, (SELECT MAX(xp_required) FROM level_tiers));
END;
$function$;

-- Cleanup and maintenance functions
CREATE OR REPLACE FUNCTION public.clean_expired_casino_queue()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM casino_duel_queue WHERE expires_at <= now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.clean_expired_btc_queue()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM btc_duel_queue WHERE expires_at <= now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$function$;

-- Game and bot functions
CREATE OR REPLACE FUNCTION public.improve_bot_data()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  bot_record RECORD;
  improved_count INTEGER := 0;
  new_streak INTEGER;
  additional_sessions INTEGER;
BEGIN
  -- Improve streaks for some high-level bots
  FOR bot_record IN 
    SELECT id, level, streak
    FROM profiles 
    WHERE is_bot = true 
    AND level >= 20 
    AND streak < 30
    ORDER BY RANDOM()
    LIMIT 50 -- Only improve 50 bots to keep it realistic
  LOOP
    -- Give them longer streaks (30-90 days)
    new_streak := 30 + floor(random() * 60);
    
    UPDATE profiles 
    SET streak = new_streak
    WHERE id = bot_record.id;
    
    improved_count := improved_count + 1;
  END LOOP;
  
  -- Add more quiz sessions with better combos for some bots
  FOR bot_record IN 
    SELECT id, level
    FROM profiles 
    WHERE is_bot = true 
    AND level >= 15
    ORDER BY RANDOM()
    LIMIT 30 -- Only improve 30 bots
  LOOP
    -- Add 10-20 additional quiz sessions with better performance
    additional_sessions := 10 + floor(random() * 10);
    
    FOR i IN 1..additional_sessions LOOP
      INSERT INTO quiz_sessions (
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
$function$;

CREATE OR REPLACE FUNCTION public.assign_bot_achievements()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
    FROM profiles 
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
    FROM quiz_sessions qs
    WHERE qs.user_id = bot_record.id;
    
    -- Achievement: First Steps (level 5+)
    IF current_level >= 5 THEN
      SELECT id INTO achievement_id_var FROM achievements WHERE name = 'first_steps';
      IF achievement_id_var IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM user_achievements 
        WHERE user_id = bot_record.id AND achievement_id = achievement_id_var
      ) THEN
        INSERT INTO user_achievements (user_id, achievement_id, progress_data)
        VALUES (bot_record.id, achievement_id_var, jsonb_build_object('level_achieved', current_level));
        achievement_count := achievement_count + 1;
      END IF;
    END IF;
    
    -- Achievement: Rising Star (level 10+)
    IF current_level >= 10 THEN
      SELECT id INTO achievement_id_var FROM achievements WHERE name = 'rising_star';
      IF achievement_id_var IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM user_achievements 
        WHERE user_id = bot_record.id AND achievement_id = achievement_id_var
      ) THEN
        INSERT INTO user_achievements (user_id, achievement_id, progress_data)
        VALUES (bot_record.id, achievement_id_var, jsonb_build_object('level_achieved', current_level));
        achievement_count := achievement_count + 1;
      END IF;
    END IF;
    
    -- Achievement: Expert (level 20+)
    IF current_level >= 20 THEN
      SELECT id INTO achievement_id_var FROM achievements WHERE name = 'expert';
      IF achievement_id_var IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM user_achievements 
        WHERE user_id = bot_record.id AND achievement_id = achievement_id_var
      ) THEN
        INSERT INTO user_achievements (user_id, achievement_id, progress_data)
        VALUES (bot_record.id, achievement_id_var, jsonb_build_object('level_achieved', current_level));
        achievement_count := achievement_count + 1;
      END IF;
    END IF;
    
    -- Achievement: Master (level 30+)
    IF current_level >= 30 THEN
      SELECT id INTO achievement_id_var FROM achievements WHERE name = 'master';
      IF achievement_id_var IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM user_achievements 
        WHERE user_id = bot_record.id AND achievement_id = achievement_id_var
      ) THEN
        INSERT INTO user_achievements (user_id, achievement_id, progress_data)
        VALUES (bot_record.id, achievement_id_var, jsonb_build_object('level_achieved', current_level));
        achievement_count := achievement_count + 1;
      END IF;
    END IF;
    
    -- Achievement: Streak Warrior (streak 7+)
    IF current_streak >= 7 THEN
      SELECT id INTO achievement_id_var FROM achievements WHERE name = 'streak_warrior';
      IF achievement_id_var IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM user_achievements 
        WHERE user_id = bot_record.id AND achievement_id = achievement_id_var
      ) THEN
        INSERT INTO user_achievements (user_id, achievement_id, progress_data)
        VALUES (bot_record.id, achievement_id_var, jsonb_build_object('streak_days', current_streak));
        achievement_count := achievement_count + 1;
      END IF;
    END IF;
    
    -- Achievement: Dedication (streak 30+)
    IF current_streak >= 30 THEN
      SELECT id INTO achievement_id_var FROM achievements WHERE name = 'dedication';
      IF achievement_id_var IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM user_achievements 
        WHERE user_id = bot_record.id AND achievement_id = achievement_id_var
      ) THEN
        INSERT INTO user_achievements (user_id, achievement_id, progress_data)
        VALUES (bot_record.id, achievement_id_var, jsonb_build_object('streak_days', current_streak));
        achievement_count := achievement_count + 1;
      END IF;
    END IF;
    
    processed_count := processed_count + 1;
    
  END LOOP;
  
  RETURN achievement_count;
END;
$function$;