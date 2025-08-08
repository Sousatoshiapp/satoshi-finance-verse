-- FASE 2: Database Super Query Function
-- Ultra-optimized function that returns ALL dashboard data in one call
CREATE OR REPLACE FUNCTION public.get_dashboard_super_optimized(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  profile_data jsonb;
  avatar_data jsonb;
  district_data jsonb;
  team_data jsonb;
  missions_data jsonb;
  leaderboard_data jsonb;
  subscription_data jsonb;
  next_level_xp integer;
  completed_quizzes integer;
  btz_yield numeric;
BEGIN
  -- Get profile with avatar in one query
  SELECT to_jsonb(p.*) INTO profile_data
  FROM profiles p
  WHERE p.user_id = target_user_id;
  
  IF profile_data IS NULL THEN
    RETURN null;
  END IF;
  
  -- Get avatar data
  SELECT to_jsonb(a.*) INTO avatar_data
  FROM avatars a
  WHERE a.id = (profile_data->>'current_avatar_id')::uuid;
  
  -- Get district data
  SELECT to_jsonb(d.*) INTO district_data
  FROM user_districts ud
  JOIN districts d ON ud.district_id = d.id
  WHERE ud.user_id = (profile_data->>'id')::uuid 
  AND ud.is_residence = true
  LIMIT 1;
  
  -- Get team data
  SELECT to_jsonb(dt.*) INTO team_data
  FROM team_members tm
  JOIN district_teams dt ON tm.team_id = dt.id
  WHERE tm.user_id = (profile_data->>'id')::uuid 
  AND tm.is_active = true
  LIMIT 1;
  
  -- Get next level XP
  SELECT xp_required INTO next_level_xp
  FROM level_tiers
  WHERE level = ((profile_data->>'level')::integer + 1)
  LIMIT 1;
  
  -- Get completed quizzes count
  SELECT COUNT(*) INTO completed_quizzes
  FROM quiz_sessions
  WHERE user_id = (profile_data->>'id')::uuid
  AND session_type = 'practice'
  AND questions_correct >= 5;
  
  -- Get active daily missions
  SELECT jsonb_agg(to_jsonb(dm.*)) INTO missions_data
  FROM daily_missions dm
  WHERE dm.is_active = true 
  AND dm.expires_at > now()
  LIMIT 5;
  
  -- Get top 10 leaderboard
  SELECT jsonb_agg(
    jsonb_build_object(
      'nickname', p.nickname,
      'level', p.level,
      'xp', p.xp,
      'points', p.points
    )
  ) INTO leaderboard_data
  FROM profiles p
  WHERE p.is_bot = false
  ORDER BY p.xp DESC
  LIMIT 10;
  
  -- Calculate BTZ yield
  btz_yield := (profile_data->>'points')::numeric * 0.001; -- 0.1% daily yield
  
  -- Get subscription info
  subscription_data := jsonb_build_object('tier', COALESCE(profile_data->>'subscription_tier', 'free'));
  
  -- Build final result
  result := jsonb_build_object(
    'profile', profile_data,
    'avatar', avatar_data,
    'district', district_data,
    'team', team_data,
    'points', COALESCE((profile_data->>'points')::integer, 0),
    'xp', COALESCE((profile_data->>'xp')::integer, 0),
    'level', COALESCE((profile_data->>'level')::integer, 1),
    'nextLevelXP', COALESCE(next_level_xp, 100),
    'streak', COALESCE((profile_data->>'streak')::integer, 0),
    'completedQuizzes', COALESCE(completed_quizzes, 0),
    'dailyMissions', COALESCE(missions_data, '[]'::jsonb),
    'leaderboard', COALESCE(leaderboard_data, '[]'::jsonb),
    'subscription', subscription_data,
    'btzYield', btz_yield
  );
  
  RETURN result;
END;
$$;