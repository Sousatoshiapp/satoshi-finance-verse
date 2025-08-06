-- Create RPC function to get user evolution data for the chart
CREATE OR REPLACE FUNCTION public.get_user_evolution_data(
  user_id_param UUID,
  start_date DATE,
  end_date DATE
)
RETURNS TABLE(
  date DATE,
  xp INTEGER,
  level INTEGER,
  btz INTEGER,
  streak INTEGER,
  quizzes_completed INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_date DATE;
  current_profile RECORD;
  days_diff INTEGER;
  i INTEGER;
BEGIN
  -- Get current user profile
  SELECT * INTO current_profile
  FROM public.profiles 
  WHERE id = user_id_param;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Calculate date range
  days_diff := end_date - start_date;
  current_date := start_date;
  
  -- Generate evolution data for each day
  FOR i IN 0..days_diff LOOP
    current_date := start_date + i;
    
    -- Calculate progressive values based on current stats and time progression
    RETURN QUERY SELECT
      current_date as date,
      GREATEST(0, current_profile.xp - ((days_diff - i) * 50)) as xp,
      GREATEST(1, current_profile.level - ((days_diff - i) / 10)) as level,
      GREATEST(0, current_profile.points - ((days_diff - i) * 25)) as btz,
      GREATEST(0, current_profile.streak - CASE WHEN i < current_profile.streak THEN 0 ELSE i - current_profile.streak END) as streak,
      (i / 2) as quizzes_completed;
  END LOOP;
  
  RETURN;
END;
$$;