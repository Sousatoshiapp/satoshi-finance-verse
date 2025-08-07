-- Complete the remaining database function security fixes

-- Function: apply_btz_penalty
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

-- Function: check_duel_limit
CREATE OR REPLACE FUNCTION public.check_duel_limit(profile_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  user_tier subscription_tier;
  duels_used INTEGER;
  reset_date DATE;
BEGIN
  SELECT subscription_tier, daily_duels_used, daily_duels_reset_date 
  INTO user_tier, duels_used, reset_date
  FROM public.profiles
  WHERE id = profile_id;
  
  IF reset_date < CURRENT_DATE THEN
    UPDATE public.profiles 
    SET daily_duels_used = 0, daily_duels_reset_date = CURRENT_DATE
    WHERE id = profile_id;
    duels_used := 0;
  END IF;
  
  IF user_tier = 'free' AND duels_used >= 10 THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$function$;

-- Function: increment_duel_count
CREATE OR REPLACE FUNCTION public.increment_duel_count(profile_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.profiles 
  SET daily_duels_used = daily_duels_used + 1
  WHERE id = profile_id;
END;
$function$;

-- Function: get_xp_multiplier
CREATE OR REPLACE FUNCTION public.get_xp_multiplier(profile_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE
 SET search_path = 'public'
AS $function$
DECLARE
  user_tier subscription_tier;
BEGIN
  SELECT subscription_tier INTO user_tier
  FROM public.profiles
  WHERE id = profile_id;
  
  CASE user_tier
    WHEN 'pro' THEN RETURN 2;
    WHEN 'elite' THEN RETURN 3;
    ELSE RETURN 1;
  END CASE;
END;
$function$;

-- Function: is_guild_member
CREATE OR REPLACE FUNCTION public.is_guild_member(p_user_id uuid, p_guild_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.guild_members
    WHERE user_id = p_user_id 
    AND guild_id = p_guild_id 
    AND is_active = true
  );
$function$;

-- Function: is_guild_leader_or_officer
CREATE OR REPLACE FUNCTION public.is_guild_leader_or_officer(p_user_id uuid, p_guild_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.guild_members
    WHERE user_id = p_user_id 
    AND guild_id = p_guild_id 
    AND role IN ('leader', 'officer')
    AND is_active = true
  );
$function$;

-- Function: get_user_profile_id
CREATE OR REPLACE FUNCTION public.get_user_profile_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$function$;