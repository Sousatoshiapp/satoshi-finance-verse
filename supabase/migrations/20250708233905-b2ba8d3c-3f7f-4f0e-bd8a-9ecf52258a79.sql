-- Database Performance Optimization Phase 5 (Fixed v2)

-- 1. Critical Indexes for Dashboard Performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_active 
ON profiles(user_id) 
WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_level_xp 
ON profiles(level, xp) 
WHERE is_bot = false;

CREATE INDEX IF NOT EXISTS idx_weekly_leaderboards_week_score 
ON weekly_leaderboards(week_start_date, total_score DESC) 
WHERE total_score > 0;

CREATE INDEX IF NOT EXISTS idx_user_districts_residence 
ON user_districts(user_id, district_id) 
WHERE is_residence = true;

CREATE INDEX IF NOT EXISTS idx_team_members_active 
ON team_members(user_id, team_id) 
WHERE is_active = true;

-- 2. Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_daily_missions_active_expires 
ON daily_missions(is_active, expires_at) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_completed 
ON quiz_sessions(user_id, completed_at DESC);

-- 3. Optimized function for dashboard data
CREATE OR REPLACE FUNCTION get_dashboard_data_optimized(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  profile_data RECORD;
  district_data RECORD;
  team_data RECORD;
  next_level_xp INTEGER;
BEGIN
  -- Single query for profile with avatar - using same join as Profile page
  SELECT 
    p.*,
    a.id as avatar_id,
    a.name as avatar_name,
    a.image_url as avatar_image_url
  INTO profile_data
  FROM profiles p
  LEFT JOIN avatars a ON p.current_avatar_id = a.id
  WHERE p.user_id = target_user_id;

  -- Get district info
  SELECT 
    d.id,
    d.name,
    d.color_primary,
    d.color_secondary,
    d.theme
  INTO district_data
  FROM user_districts ud
  JOIN districts d ON ud.district_id = d.id
  WHERE ud.user_id = profile_data.id 
  AND ud.is_residence = true
  LIMIT 1;

  -- Get team info
  SELECT 
    dt.id,
    dt.name,
    dt.team_color
  INTO team_data
  FROM team_members tm
  JOIN district_teams dt ON tm.team_id = dt.id
  WHERE tm.user_id = profile_data.id 
  AND tm.is_active = true
  LIMIT 1;

  -- Get next level XP
  SELECT get_next_level_xp(profile_data.level) INTO next_level_xp;

  -- Build result JSON
  result := json_build_object(
    'profile', row_to_json(profile_data),
    'avatar', CASE 
      WHEN profile_data.avatar_id IS NOT NULL THEN
        json_build_object(
          'id', profile_data.avatar_id,
          'name', profile_data.avatar_name,
          'image_url', profile_data.avatar_image_url
        )
      ELSE NULL
    END,
    'district', row_to_json(district_data),
    'team', row_to_json(team_data),
    'nextLevelXP', next_level_xp
  );

  RETURN result;
END;
$$;
