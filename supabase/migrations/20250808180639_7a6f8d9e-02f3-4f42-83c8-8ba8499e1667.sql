-- Fix the calculate_daily_yield function to use correct column names
CREATE OR REPLACE FUNCTION public.calculate_daily_yield(profile_id uuid)
 RETURNS TABLE(yield_amount numeric, new_total numeric, applied_rate numeric, streak_bonus numeric, subscription_bonus numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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