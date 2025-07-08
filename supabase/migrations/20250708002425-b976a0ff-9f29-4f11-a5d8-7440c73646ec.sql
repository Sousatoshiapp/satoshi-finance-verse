-- Function to update leaderboards
CREATE OR REPLACE FUNCTION public.update_weekly_leaderboard(
  profile_id UUID,
  xp_gained INTEGER DEFAULT 0,
  quiz_points INTEGER DEFAULT 0,
  duel_win BOOLEAN DEFAULT false
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_week_start DATE;
  current_league_id UUID;
  total_points INTEGER;
BEGIN
  -- Get current week start (Monday)
  current_week_start := date_trunc('week', CURRENT_DATE)::DATE;
  
  -- Upsert leaderboard entry
  INSERT INTO public.weekly_leaderboards (user_id, week_start_date, xp_earned, quiz_score, duels_won)
  VALUES (profile_id, current_week_start, xp_gained, quiz_points, CASE WHEN duel_win THEN 1 ELSE 0 END)
  ON CONFLICT (user_id, week_start_date)
  DO UPDATE SET
    xp_earned = weekly_leaderboards.xp_earned + xp_gained,
    quiz_score = weekly_leaderboards.quiz_score + quiz_points,
    duels_won = weekly_leaderboards.duels_won + CASE WHEN duel_win THEN 1 ELSE 0 END,
    updated_at = now();
  
  -- Calculate total score and assign league
  SELECT xp_earned + quiz_score + (duels_won * 100) INTO total_points
  FROM public.weekly_leaderboards 
  WHERE user_id = profile_id AND week_start_date = current_week_start;
  
  -- Get appropriate league
  SELECT id INTO current_league_id
  FROM public.leagues
  WHERE min_points <= total_points AND (max_points IS NULL OR total_points <= max_points)
  ORDER BY tier DESC
  LIMIT 1;
  
  -- Update total score and league
  UPDATE public.weekly_leaderboards
  SET total_score = total_points, league_id = current_league_id
  WHERE user_id = profile_id AND week_start_date = current_week_start;
END;
$$;

-- Function to update mission progress
CREATE OR REPLACE FUNCTION public.update_mission_progress(
  profile_id UUID,
  mission_type_param TEXT,
  progress_amount INTEGER DEFAULT 1
)
RETURNS TABLE(mission_completed BOOLEAN, rewards_earned JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  mission_record RECORD;
  new_progress INTEGER;
  completed_missions INTEGER;
BEGIN
  -- Find active missions of this type
  FOR mission_record IN 
    SELECT dm.* FROM public.daily_missions dm
    WHERE dm.mission_type = mission_type_param 
    AND dm.is_active = true 
    AND dm.expires_at > now()
  LOOP
    -- Update or insert progress
    INSERT INTO public.user_mission_progress (user_id, mission_id, progress)
    VALUES (profile_id, mission_record.id, progress_amount)
    ON CONFLICT (user_id, mission_id)
    DO UPDATE SET progress = user_mission_progress.progress + progress_amount;
    
    -- Check if mission is completed
    SELECT progress INTO new_progress
    FROM public.user_mission_progress
    WHERE user_id = profile_id AND mission_id = mission_record.id;
    
    IF new_progress >= mission_record.target_value AND NOT EXISTS (
      SELECT 1 FROM public.user_mission_progress 
      WHERE user_id = profile_id AND mission_id = mission_record.id AND completed = true
    ) THEN
      -- Mark as completed
      UPDATE public.user_mission_progress
      SET completed = true, completed_at = now()
      WHERE user_id = profile_id AND mission_id = mission_record.id;
      
      -- Award rewards
      PERFORM public.award_xp(profile_id, mission_record.xp_reward, 'daily_mission');
      
      UPDATE public.profiles
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
  FROM public.user_mission_progress ump
  JOIN public.daily_missions dm ON ump.mission_id = dm.id
  WHERE ump.user_id = profile_id 
  AND ump.completed = true
  AND dm.expires_at > now()
  AND dm.is_active = true
  AND DATE(ump.completed_at) = CURRENT_DATE;
  
  -- If completed 4+ missions today, award combo bonus
  IF completed_missions >= 4 AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements
    WHERE user_id = profile_id 
    AND achievement_name = 'daily_combo_' || CURRENT_DATE
  ) THEN
    -- Award combo achievement
    INSERT INTO public.user_achievements (user_id, achievement_type, achievement_name, description, metadata)
    VALUES (profile_id, 'daily_combo', 'daily_combo_' || CURRENT_DATE, 'Completou todas as missões diárias', 
    jsonb_build_object('combo_bonus_xp', 500, 'combo_bonus_beetz', 1000));
    
    -- Award combo bonus
    PERFORM public.award_xp(profile_id, 500, 'daily_combo');
    UPDATE public.profiles SET points = points + 1000 WHERE id = profile_id;
    
    -- Award special loot box
    INSERT INTO public.user_loot_boxes (user_id, loot_box_id, source)
    SELECT profile_id, id, 'daily_combo'
    FROM public.loot_boxes 
    WHERE rarity = 'rare'
    ORDER BY RANDOM()
    LIMIT 1;
  END IF;
  
  RETURN;
END;
$$;

-- Function to open loot boxes
CREATE OR REPLACE FUNCTION public.open_loot_box(
  profile_id UUID,
  user_loot_box_id UUID
)
RETURNS TABLE(items JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  loot_box_contents JSONB;
  generated_items JSONB DEFAULT '[]';
  item_count INTEGER;
  content_item JSONB;
  i INTEGER;
BEGIN
  -- Get loot box contents
  SELECT lb.contents, lb.min_items + floor(random() * (lb.max_items - lb.min_items + 1))
  INTO loot_box_contents, item_count
  FROM public.user_loot_boxes ulb
  JOIN public.loot_boxes lb ON ulb.loot_box_id = lb.id
  WHERE ulb.id = user_loot_box_id 
  AND ulb.user_id = profile_id 
  AND ulb.opened = false;
  
  IF loot_box_contents IS NULL THEN
    RETURN;
  END IF;
  
  -- Generate items based on chances
  FOR i IN 1..item_count LOOP
    FOR content_item IN SELECT * FROM jsonb_array_elements(loot_box_contents) LOOP
      IF random() <= (content_item->>'chance')::numeric THEN
        -- Generate item based on type
        CASE content_item->>'type'
          WHEN 'beetz' THEN
            generated_items := generated_items || jsonb_build_object(
              'type', 'beetz',
              'amount', (content_item->>'min')::integer + floor(random() * ((content_item->>'max')::integer - (content_item->>'min')::integer + 1))
            );
            
          WHEN 'xp' THEN
            generated_items := generated_items || jsonb_build_object(
              'type', 'xp',
              'amount', (content_item->>'min')::integer + floor(random() * ((content_item->>'max')::integer - (content_item->>'min')::integer + 1))
            );
            
          WHEN 'xp_multiplier' THEN
            generated_items := generated_items || jsonb_build_object(
              'type', 'xp_multiplier',
              'value', content_item->>'value',
              'duration', content_item->>'duration'
            );
            
          ELSE
            generated_items := generated_items || content_item;
        END CASE;
        
        EXIT; -- Only one item per slot
      END IF;
    END LOOP;
  END LOOP;
  
  -- Mark loot box as opened and save items
  UPDATE public.user_loot_boxes
  SET opened = true, opened_at = now(), items_received = generated_items
  WHERE id = user_loot_box_id;
  
  -- Award the items to user
  FOR content_item IN SELECT * FROM jsonb_array_elements(generated_items) LOOP
    CASE content_item->>'type'
      WHEN 'beetz' THEN
        UPDATE public.profiles 
        SET points = points + (content_item->>'amount')::integer
        WHERE id = profile_id;
        
      WHEN 'xp' THEN
        PERFORM public.award_xp(profile_id, (content_item->>'amount')::integer, 'loot_box');
    END CASE;
  END LOOP;
  
  RETURN QUERY SELECT generated_items;
END;
$$;

-- Function to award daily loot box
CREATE OR REPLACE FUNCTION public.award_daily_loot_box(profile_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  loot_box_id UUID;
  new_user_loot_box_id UUID;
BEGIN
  -- Check if user already received daily loot box today
  IF EXISTS (
    SELECT 1 FROM public.user_loot_boxes 
    WHERE user_id = profile_id 
    AND source = 'daily_reward'
    AND DATE(created_at) = CURRENT_DATE
  ) THEN
    RETURN NULL;
  END IF;
  
  -- Get a random daily loot box
  SELECT id INTO loot_box_id
  FROM public.loot_boxes
  WHERE name = 'Caixa Diária'
  LIMIT 1;
  
  -- Award the loot box
  INSERT INTO public.user_loot_boxes (user_id, loot_box_id, source)
  VALUES (profile_id, loot_box_id, 'daily_reward')
  RETURNING id INTO new_user_loot_box_id;
  
  RETURN new_user_loot_box_id;
END;
$$;