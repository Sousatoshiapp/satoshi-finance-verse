-- Create get_user_evolution_data RPC function for real user data
CREATE OR REPLACE FUNCTION get_user_evolution_data(
  user_id_param uuid,
  start_date timestamp with time zone,
  end_date timestamp with time zone
)
RETURNS TABLE(
  date text,
  xp integer,
  level integer,
  btz integer,
  streak integer,
  quizzes_completed integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_date_iter date;
  xp_data integer;
  level_data integer;
  btz_data integer;
  streak_data integer;
  quiz_count integer;
BEGIN
  -- Generate data for each day in the range
  FOR current_date_iter IN 
    SELECT generate_series(start_date::date, end_date::date, '1 day'::interval)::date
  LOOP
    -- Get user stats for this date (using latest available data)
    SELECT 
      COALESCE(p.xp, 0),
      COALESCE(p.level, 1),
      COALESCE(p.points, 0),
      COALESCE(p.streak, 0)
    INTO xp_data, level_data, btz_data, streak_data
    FROM profiles p
    WHERE p.id = user_id_param;
    
    -- Count quiz sessions for this date
    SELECT COUNT(*)::integer
    INTO quiz_count
    FROM quiz_sessions qs
    WHERE qs.user_id = user_id_param
    AND DATE(qs.created_at) = current_date_iter;
    
    -- Return the data for this date
    RETURN QUERY SELECT 
      current_date_iter::text as date,
      xp_data as xp,
      level_data as level,
      btz_data as btz,
      streak_data as streak,
      quiz_count as quizzes_completed;
  END LOOP;
  
  RETURN;
END;
$$;