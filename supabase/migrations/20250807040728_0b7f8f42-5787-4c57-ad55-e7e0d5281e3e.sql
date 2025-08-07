-- Fix type mismatch in calculate_daily_yield function
-- Change new_total from integer to numeric to match points column type

CREATE OR REPLACE FUNCTION public.calculate_daily_yield(profile_id uuid)
RETURNS TABLE(yield_applied boolean, yield_amount integer, new_total numeric, streak_bonus numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_record RECORD;
  base_yield DECIMAL(10,4);
  subscription_bonus DECIMAL(10,4) := 0;
  streak_bonus DECIMAL(10,4) := 0;
  total_yield DECIMAL(10,4);
  capped_yield INTEGER;
  final_total NUMERIC(10,2);
BEGIN
  -- Get user data
  SELECT * INTO user_record 
  FROM profiles 
  WHERE id = profile_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 0::numeric, 0::numeric;
    RETURN;
  END IF;
  
  -- Check if yield already applied today
  IF user_record.last_yield_date = CURRENT_DATE THEN
    RETURN QUERY SELECT false, 0, user_record.points, 0::numeric;
    RETURN;
  END IF;
  
  -- Calculate base yield (0.1% daily)
  base_yield := user_record.points * 0.001;
  
  -- Add subscription bonus
  CASE user_record.subscription_tier
    WHEN 'pro' THEN subscription_bonus := user_record.points * 0.0005;
    WHEN 'elite' THEN subscription_bonus := user_record.points * 0.001;
    ELSE subscription_bonus := 0;
  END CASE;
  
  -- Add streak bonus (0.01% per tier of 5 days, max 0.3%)
  streak_bonus := LEAST(0.003, (user_record.consecutive_login_days / 5) * 0.001) * user_record.points;
  
  -- Calculate total yield
  total_yield := base_yield + subscription_bonus + streak_bonus;
  
  -- Apply absolute cap of 5 BTZ
  capped_yield := LEAST(FLOOR(total_yield), 5);
  
  -- Calculate new total as numeric to preserve decimal precision
  final_total := user_record.points + capped_yield;
  
  -- Update user points and yield date
  UPDATE profiles 
  SET 
    points = final_total,
    last_yield_date = CURRENT_DATE
  WHERE id = profile_id;
  
  -- Record yield history
  INSERT INTO btz_yield_history (
    user_id, yield_amount, yield_rate, btz_before, btz_after,
    streak_bonus, subscription_bonus
  ) VALUES (
    profile_id, capped_yield, total_yield, user_record.points, final_total,
    streak_bonus, subscription_bonus
  );
  
  RETURN QUERY SELECT true, capped_yield, final_total, streak_bonus;
END;
$function$;