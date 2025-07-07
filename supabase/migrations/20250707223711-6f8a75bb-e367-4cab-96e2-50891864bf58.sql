-- Fix the award_xp function - column reference "rewards" is ambiguous
CREATE OR REPLACE FUNCTION public.award_xp(profile_id uuid, xp_amount integer, activity_type text DEFAULT 'general')
RETURNS TABLE(new_xp integer, new_level integer, level_up boolean, rewards jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_xp INTEGER;
  old_level INTEGER;
  updated_xp INTEGER;
  updated_level INTEGER;
  level_changed BOOLEAN DEFAULT FALSE;
  level_rewards JSONB DEFAULT '{}';
BEGIN
  -- Get current user stats
  SELECT xp, level INTO old_xp, old_level
  FROM public.profiles
  WHERE id = profile_id;
  
  -- Calculate new XP and level
  updated_xp := old_xp + xp_amount;
  updated_level := public.calculate_user_level(updated_xp);
  level_changed := updated_level > old_level;
  
  -- Get rewards for new level if leveled up
  IF level_changed THEN
    SELECT level_tiers.rewards INTO level_rewards
    FROM public.level_tiers
    WHERE level_tiers.level = updated_level;
    
    -- Award beetz from level rewards
    IF level_rewards ? 'beetz' THEN
      UPDATE public.profiles 
      SET points = points + (level_rewards->>'beetz')::INTEGER
      WHERE id = profile_id;
    END IF;
    
    -- Create badge if specified in rewards
    IF level_rewards ? 'badge' THEN
      INSERT INTO public.user_badges (user_id, badge_name, badge_type, badge_description)
      VALUES (
        profile_id,
        level_rewards->>'badge',
        'level',
        'Conquistado ao alcançar nível ' || updated_level
      ) ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  -- Update user profile
  UPDATE public.profiles 
  SET 
    xp = updated_xp,
    level = updated_level,
    updated_at = NOW()
  WHERE id = profile_id;
  
  -- Log activity
  INSERT INTO public.activity_feed (user_id, activity_type, activity_data)
  VALUES (
    profile_id,
    'xp_earned',
    jsonb_build_object(
      'xp_amount', xp_amount,
      'activity_type', activity_type,
      'old_level', old_level,
      'new_level', updated_level,
      'level_up', level_changed
    )
  );
  
  RETURN QUERY SELECT updated_xp, updated_level, level_changed, level_rewards;
END;
$$;