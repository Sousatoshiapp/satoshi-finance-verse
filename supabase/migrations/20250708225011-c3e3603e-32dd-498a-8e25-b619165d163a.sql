-- Fix the update_mission_progress function to use correct user_achievements table structure
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
  IF completed_missions >= 4 THEN
    -- Check if combo achievement already exists for today using achievement_id approach
    DECLARE
      combo_achievement_id UUID;
    BEGIN
      -- Try to find or create a daily combo achievement
      SELECT id INTO combo_achievement_id
      FROM achievements 
      WHERE name = 'daily_combo' 
      LIMIT 1;
      
      -- If achievement exists and user doesn't have it for today, award it
      IF combo_achievement_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM user_achievements
        WHERE user_id = profile_id 
        AND achievement_id = combo_achievement_id
        AND DATE(earned_at) = CURRENT_DATE
      ) THEN
        -- Award combo achievement
        INSERT INTO user_achievements (user_id, achievement_id, progress_data)
        VALUES (profile_id, combo_achievement_id, 
        jsonb_build_object('combo_bonus_xp', 500, 'combo_bonus_beetz', 1000, 'date', CURRENT_DATE));
        
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
    END;
  END IF;
  
  RETURN;
END;
$function$;