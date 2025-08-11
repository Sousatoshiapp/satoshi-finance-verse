-- SECURITY FIX: Add SET search_path = 'public' to critical remaining functions for SQL injection prevention

-- Update award_xp function
CREATE OR REPLACE FUNCTION public.award_xp(profile_id uuid, xp_amount integer, source_type text DEFAULT 'quiz'::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_record RECORD;
  current_level INTEGER;
  new_level INTEGER;
  next_level_xp INTEGER;
BEGIN
  SELECT * INTO user_record FROM profiles WHERE id = profile_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  current_level := user_record.level;
  
  UPDATE profiles 
  SET xp = xp + xp_amount
  WHERE id = profile_id;
  
  SELECT level INTO new_level
  FROM level_tiers 
  WHERE xp_required <= (user_record.xp + xp_amount)
  ORDER BY level DESC 
  LIMIT 1;
  
  new_level := COALESCE(new_level, 1);
  
  IF new_level > current_level THEN
    UPDATE profiles 
    SET level = new_level
    WHERE id = profile_id;
    
    INSERT INTO activity_feed (user_id, activity_type, activity_data)
    VALUES (profile_id, 'level_up', jsonb_build_object(
      'old_level', current_level,
      'new_level', new_level,
      'source', source_type
    ));
  END IF;
  
  RETURN true;
END;
$$;

-- Update recover_user_lives function
CREATE OR REPLACE FUNCTION public.recover_user_lives()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  hours_since_last_recovery INTEGER;
  max_recoverable_lives INTEGER := 3;
BEGIN
  hours_since_last_recovery := EXTRACT(HOUR FROM (now() - NEW.last_life_recovery));
  
  IF hours_since_last_recovery >= 8 AND NEW.lives_count < max_recoverable_lives THEN
    NEW.lives_count := LEAST(max_recoverable_lives, NEW.lives_count + (hours_since_last_recovery / 8));
    NEW.last_life_recovery := now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update update_guild_member_count function
CREATE OR REPLACE FUNCTION public.update_guild_member_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE guilds SET member_count = member_count + 1 WHERE id = NEW.guild_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE guilds SET member_count = member_count - 1 WHERE id = OLD.guild_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;