
-- Fix the update_mission_progress function - SET search_path properly and mark as VOLATILE
CREATE OR REPLACE FUNCTION public.update_mission_progress(profile_id uuid, mission_type_param text, progress_amount integer DEFAULT 1)
 RETURNS TABLE(mission_completed boolean, rewards_earned jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 VOLATILE
 SET search_path TO 'public'
AS $function$
DECLARE
  mission_record RECORD;
  new_progress INTEGER;
  completed_missions INTEGER;
BEGIN
  -- Find active missions of this type
  FOR mission_record IN 
    SELECT dm.* FROM daily_missions dm
    WHERE dm.mission_type = mission_type_param 
    AND dm.is_active = true 
    AND dm.expires_at > now()
  LOOP
    -- Update or insert progress
    INSERT INTO user_mission_progress (user_id, mission_id, progress)
    VALUES (profile_id, mission_record.id, progress_amount)
    ON CONFLICT (user_id, mission_id)
    DO UPDATE SET progress = user_mission_progress.progress + progress_amount;
    
    -- Check if mission is completed
    SELECT progress INTO new_progress
    FROM user_mission_progress
    WHERE user_id = profile_id AND mission_id = mission_record.id;
    
    IF new_progress >= mission_record.target_value AND NOT EXISTS (
      SELECT 1 FROM user_mission_progress 
      WHERE user_id = profile_id AND mission_id = mission_record.id AND completed = true
    ) THEN
      -- Mark as completed
      UPDATE user_mission_progress
      SET completed = true, completed_at = now()
      WHERE user_id = profile_id AND mission_id = mission_record.id;
      
      -- Award rewards
      PERFORM award_xp(profile_id, mission_record.xp_reward, 'daily_mission');
      
      UPDATE profiles
      SET points = points + mission_record.beetz_reward
      WHERE id = profile_id;
      
      RETURN QUERY SELECT true, jsonb_build_object(
        'xp', mission_record.xp_reward,
        'beetz', mission_record.beetz_reward,
        'mission_name', mission_record.title
      );
    END IF;
  END LOOP;
  
  -- Check for combo achievement (all daily missions completed)
  SELECT COUNT(*) INTO completed_missions
  FROM user_mission_progress ump
  JOIN daily_missions dm ON ump.mission_id = dm.id
  WHERE ump.user_id = profile_id 
  AND ump.completed = true
  AND dm.expires_at > now()
  AND dm.is_active = true
  AND DATE(ump.completed_at) = CURRENT_DATE;
  
  -- If completed 4+ missions today, award combo bonus
  IF completed_missions >= 4 AND NOT EXISTS (
    SELECT 1 FROM user_achievements
    WHERE user_id = profile_id 
    AND achievement_name = 'daily_combo_' || CURRENT_DATE
  ) THEN
    -- Award combo achievement
    INSERT INTO user_achievements (user_id, achievement_type, achievement_name, description, metadata)
    VALUES (profile_id, 'daily_combo', 'daily_combo_' || CURRENT_DATE, 'Completou todas as missões diárias', 
    jsonb_build_object('combo_bonus_xp', 500, 'combo_bonus_beetz', 1000));
    
    -- Award combo bonus
    PERFORM award_xp(profile_id, 500, 'daily_combo');
    UPDATE profiles SET points = points + 1000 WHERE id = profile_id;
    
    -- Award special loot box
    INSERT INTO user_loot_boxes (user_id, loot_box_id, source)
    SELECT profile_id, id, 'daily_combo'
    FROM loot_boxes 
    WHERE rarity = 'rare'
    ORDER BY RANDOM()
    LIMIT 1;
  END IF;
  
  RETURN;
END;
$function$;

-- Fix the generate_daily_missions function
CREATE OR REPLACE FUNCTION public.generate_daily_missions()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 VOLATILE
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Clear old missions
  DELETE FROM daily_missions WHERE expires_at < now();
  
  -- Generate new missions if none exist for today
  IF NOT EXISTS (SELECT 1 FROM daily_missions WHERE expires_at > now()) THEN
    -- Quiz missions
    INSERT INTO daily_missions (title, description, category, mission_type, target_value, xp_reward, beetz_reward, difficulty)
    VALUES 
    ('Gênio dos Quizzes', 'Responda 5 perguntas corretamente', 'quiz', 'correct_answers', 5, 100, 200, 'easy'),
    ('Especialista', 'Complete 3 quizzes consecutivos', 'quiz', 'quiz_completion', 3, 150, 300, 'medium');
    
    -- Streak missions
    INSERT INTO daily_missions (title, description, category, mission_type, target_value, xp_reward, beetz_reward, difficulty)
    VALUES 
    ('Consistência', 'Mantenha sua sequência diária', 'streak', 'daily_login', 1, 75, 150, 'easy');
    
    -- Social missions
    INSERT INTO daily_missions (title, description, category, mission_type, target_value, xp_reward, beetz_reward, difficulty)
    VALUES 
    ('Duelista', 'Vença 2 duelos hoje', 'social', 'duel_wins', 2, 200, 400, 'medium'),
    ('Social', 'Participe de 1 conversa', 'social', 'chat_messages', 5, 50, 100, 'easy');
    
    -- Weekend special missions
    IF EXTRACT(DOW FROM now()) IN (0, 6) THEN
      INSERT INTO daily_missions (title, description, category, mission_type, target_value, xp_reward, beetz_reward, difficulty, is_weekend_special)
      VALUES 
      ('Guerreiro de Fim de Semana', 'Ganhe 500 XP hoje', 'exploration', 'xp_earned', 500, 300, 600, 'hard', true);
    END IF;
  END IF;
END;
$function$;

-- Fix other functions that might have similar issues
CREATE OR REPLACE FUNCTION public.award_xp(profile_id uuid, xp_amount integer, activity_type text DEFAULT 'general'::text)
 RETURNS TABLE(new_xp integer, new_level integer, level_up boolean, rewards jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 VOLATILE
 SET search_path TO 'public'
AS $function$
DECLARE
  old_xp INTEGER;
  old_level INTEGER;
  updated_xp INTEGER;
  updated_level INTEGER;
  level_changed BOOLEAN DEFAULT FALSE;
  level_rewards JSONB DEFAULT '{}';
  xp_multiplier INTEGER;
BEGIN
  -- Get current user stats and multiplier
  SELECT xp, level INTO old_xp, old_level
  FROM profiles
  WHERE id = profile_id;
  
  -- Get XP multiplier based on subscription
  SELECT get_xp_multiplier(profile_id) INTO xp_multiplier;
  
  -- Calculate new XP with multiplier
  updated_xp := old_xp + (xp_amount * xp_multiplier);
  updated_level := calculate_user_level(updated_xp);
  level_changed := updated_level > old_level;
  
  -- Get rewards for new level if leveled up
  IF level_changed THEN
    SELECT level_tiers.rewards INTO level_rewards
    FROM level_tiers
    WHERE level_tiers.level = updated_level;
    
    -- Award beetz from level rewards
    IF level_rewards ? 'beetz' THEN
      UPDATE profiles 
      SET points = points + (level_rewards->>'beetz')::INTEGER
      WHERE id = profile_id;
    END IF;
    
    -- Create badge if specified in rewards
    IF level_rewards ? 'badge' THEN
      INSERT INTO user_badges (user_id, badge_name, badge_type, badge_description)
      VALUES (
        profile_id,
        level_rewards->>'badge',
        'level',
        'Conquistado ao alcançar nível ' || updated_level
      ) ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  -- Update user profile
  UPDATE profiles 
  SET 
    xp = updated_xp,
    level = updated_level,
    updated_at = NOW()
  WHERE id = profile_id;
  
  -- Log activity
  INSERT INTO activity_feed (user_id, activity_type, activity_data)
  VALUES (
    profile_id,
    'xp_earned',
    jsonb_build_object(
      'xp_amount', xp_amount,
      'xp_multiplier', xp_multiplier,
      'total_xp_earned', xp_amount * xp_multiplier,
      'activity_type', activity_type,
      'old_level', old_level,
      'new_level', updated_level,
      'level_up', level_changed
    )
  );
  
  RETURN QUERY SELECT updated_xp, updated_level, level_changed, level_rewards;
END;
$function$;
