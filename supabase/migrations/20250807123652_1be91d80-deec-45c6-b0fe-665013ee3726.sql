-- Continue fixing remaining database functions with SET search_path = 'public'

-- Function: request_guild_membership
CREATE OR REPLACE FUNCTION public.request_guild_membership(p_guild_id uuid, p_user_id uuid, p_message text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  guild_record RECORD;
BEGIN
  SELECT * INTO guild_record FROM guilds WHERE id = p_guild_id AND status = 'active';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Guild não encontrada ou inativa';
  END IF;
  
  IF EXISTS (SELECT 1 FROM guild_members WHERE guild_id = p_guild_id AND user_id = p_user_id) THEN
    RAISE EXCEPTION 'Usuário já é membro desta guild';
  END IF;
  
  IF EXISTS (SELECT 1 FROM guild_requests WHERE guild_id = p_guild_id AND user_id = p_user_id AND status = 'pending') THEN
    RAISE EXCEPTION 'Já existe uma solicitação pendente';
  END IF;
  
  IF guild_record.member_count >= guild_record.max_members THEN
    RAISE EXCEPTION 'Guild está lotada';
  END IF;
  
  INSERT INTO guild_requests (guild_id, user_id, message)
  VALUES (p_guild_id, p_user_id, p_message);
  
  RETURN TRUE;
END;
$function$;

-- Function: update_user_streak
CREATE OR REPLACE FUNCTION public.update_user_streak(profile_id uuid, activity_date date DEFAULT CURRENT_DATE)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  current_streak INTEGER DEFAULT 0;
  last_activity DATE;
  new_streak INTEGER;
BEGIN
  SELECT streak, updated_at::DATE INTO current_streak, last_activity
  FROM public.profiles
  WHERE id = profile_id;
  
  IF last_activity IS NULL OR last_activity = activity_date - INTERVAL '1 day' THEN
    new_streak := current_streak + 1;
  ELSIF last_activity = activity_date THEN
    new_streak := current_streak;
  ELSE
    new_streak := 1;
  END IF;
  
  UPDATE public.profiles 
  SET 
    streak = new_streak,
    updated_at = NOW()
  WHERE id = profile_id;
  
  IF new_streak IN (3, 7, 14, 30, 100) THEN
    INSERT INTO public.user_badges (user_id, badge_name, badge_type, badge_description)
    VALUES (
      profile_id,
      'streak_' || new_streak,
      'streak',
      'Manteve uma sequência de ' || new_streak || ' dias'
    ) ON CONFLICT DO NOTHING;
    
    PERFORM public.award_xp(profile_id, new_streak * 5, 'streak_bonus');
  END IF;
  
  RETURN new_streak;
END;
$function$;

-- Function: auto_update_user_level
CREATE OR REPLACE FUNCTION public.auto_update_user_level()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.xp != OLD.xp THEN
    NEW.level := public.calculate_user_level(NEW.xp);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Function: process_guild_request
CREATE OR REPLACE FUNCTION public.process_guild_request(p_request_id uuid, p_reviewer_id uuid, p_approved boolean)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  request_record RECORD;
BEGIN
  SELECT gr.*, g.max_members, g.member_count 
  INTO request_record 
  FROM guild_requests gr
  JOIN guilds g ON gr.guild_id = g.id
  WHERE gr.id = p_request_id AND gr.status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solicitação não encontrada';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM guild_members 
    WHERE guild_id = request_record.guild_id 
    AND user_id = p_reviewer_id 
    AND role IN ('leader', 'officer')
  ) THEN
    RAISE EXCEPTION 'Sem permissão para revisar solicitações';
  END IF;
  
  UPDATE guild_requests 
  SET status = CASE WHEN p_approved THEN 'approved' ELSE 'rejected' END,
      reviewed_by = p_reviewer_id,
      reviewed_at = now()
  WHERE id = p_request_id;
  
  IF p_approved THEN
    IF request_record.member_count >= request_record.max_members THEN
      RAISE EXCEPTION 'Guild está lotada';
    END IF;
    
    INSERT INTO guild_members (guild_id, user_id, role)
    VALUES (request_record.guild_id, request_record.user_id, 'member');
  END IF;
  
  RETURN TRUE;
END;
$function$;

-- Function: award_xp
CREATE OR REPLACE FUNCTION public.award_xp(profile_id uuid, xp_amount integer, activity_type text DEFAULT 'general'::text)
 RETURNS TABLE(new_xp integer, new_level integer, level_up boolean, rewards jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
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
  SELECT xp, level INTO old_xp, old_level
  FROM profiles
  WHERE id = profile_id;
  
  SELECT get_xp_multiplier(profile_id) INTO xp_multiplier;
  
  updated_xp := old_xp + (xp_amount * xp_multiplier);
  updated_level := calculate_user_level(updated_xp);
  level_changed := updated_level > old_level;
  
  IF level_changed THEN
    SELECT level_tiers.rewards INTO level_rewards
    FROM level_tiers
    WHERE level_tiers.level = updated_level;
    
    IF level_rewards ? 'beetz' THEN
      UPDATE profiles 
      SET points = points + (level_rewards->>'beetz')::INTEGER
      WHERE id = profile_id;
    END IF;
    
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
  
  UPDATE profiles 
  SET 
    xp = updated_xp,
    level = updated_level,
    updated_at = NOW()
  WHERE id = profile_id;
  
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