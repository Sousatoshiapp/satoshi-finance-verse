-- Fix all database functions by adding SET search_path = 'public' for security
-- This prevents potential security vulnerabilities from search path manipulation

-- Function: update_guild_member_count
CREATE OR REPLACE FUNCTION public.update_guild_member_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- Function: is_master_admin
CREATE OR REPLACE FUNCTION public.is_master_admin(email_check text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN email_check = 'fasdurian@gmail.com';
END;
$function$;

-- Function: clean_expired_btc_queue
CREATE OR REPLACE FUNCTION public.clean_expired_btc_queue()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.btc_duel_queue WHERE expires_at <= now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$function$;

-- Function: update_user_theme_progress_updated_at
CREATE OR REPLACE FUNCTION public.update_user_theme_progress_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Function: recover_user_lives
CREATE OR REPLACE FUNCTION public.recover_user_lives()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- Function: is_admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  user_email text;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = user_uuid;
  
  IF public.is_master_admin(user_email) THEN
    RETURN true;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = user_uuid AND is_active = true
  );
END;
$function$;

-- Function: get_admin_role
CREATE OR REPLACE FUNCTION public.get_admin_role(user_uuid uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  user_email text;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = user_uuid;
  
  IF public.is_master_admin(user_email) THEN
    RETURN 'super_admin';
  END IF;
  
  SELECT role::text INTO user_email
  FROM public.admin_users
  WHERE user_id = user_uuid AND is_active = true;
  
  RETURN COALESCE(user_email, 'admin');
END;
$function$;

-- Continue with remaining functions...
-- Function: update_city_emergency_progress
CREATE OR REPLACE FUNCTION public.update_city_emergency_progress()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  total_btz INTEGER;
  total_xp INTEGER;
BEGIN
  SELECT 
    COALESCE(SUM(btz_contributed), 0),
    COALESCE(SUM(xp_contributed), 0)
  INTO total_btz, total_xp
  FROM public.city_emergency_contributions 
  WHERE emergency_id = NEW.emergency_id;
  
  UPDATE public.city_emergency_events 
  SET 
    current_btz_contributions = total_btz,
    current_xp_contributions = total_xp,
    updated_at = now()
  WHERE id = NEW.emergency_id;
  
  RETURN NEW;
END;
$function$;

-- Function: finalize_expired_emergencies
CREATE OR REPLACE FUNCTION public.finalize_expired_emergencies()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.city_emergency_events 
  SET is_active = false
  WHERE is_active = true AND end_time < now();
END;
$function$;

-- Function: simulate_bot_presence
CREATE OR REPLACE FUNCTION public.simulate_bot_presence()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  current_hour INTEGER;
  total_updated INTEGER := 0;
  bot_record RECORD;
  online_chance NUMERIC;
  is_peak_hour BOOLEAN;
BEGIN
  current_hour := EXTRACT(HOUR FROM now());
  
  FOR bot_record IN 
    SELECT bps.*, p.level 
    FROM public.bot_presence_simulation bps
    JOIN public.profiles p ON bps.bot_id = p.id
  LOOP
    is_peak_hour := current_hour = ANY(bot_record.peak_hours);
    
    CASE bot_record.personality_type
      WHEN 'active' THEN 
        online_chance := CASE WHEN is_peak_hour THEN 0.45 ELSE 0.25 END;
      WHEN 'casual' THEN 
        online_chance := CASE WHEN is_peak_hour THEN 0.20 ELSE 0.10 END;
      WHEN 'sporadic' THEN 
        online_chance := CASE WHEN is_peak_hour THEN 0.15 ELSE 0.05 END;
      WHEN 'night_owl' THEN 
        online_chance := CASE WHEN current_hour BETWEEN 19 AND 23 THEN 0.35 ELSE 0.08 END;
      ELSE 
        online_chance := bot_record.online_probability;
    END CASE;
    
    IF bot_record.level > 20 THEN
      online_chance := online_chance * 1.2;
    ELSIF bot_record.level > 10 THEN
      online_chance := online_chance * 1.1;
    END IF;
    
    UPDATE public.bot_presence_simulation 
    SET 
      is_online = (random() < online_chance),
      last_activity_at = CASE 
        WHEN (random() < online_chance) THEN now() 
        ELSE last_activity_at 
      END,
      updated_at = now()
    WHERE id = bot_record.id;
    
    total_updated := total_updated + 1;
  END LOOP;
  
  RETURN total_updated;
END;
$function$;