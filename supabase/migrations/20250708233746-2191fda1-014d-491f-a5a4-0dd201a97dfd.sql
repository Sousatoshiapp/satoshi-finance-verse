-- Database Performance Optimization Phase 5

-- 1. Critical Indexes for Dashboard Performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_user_id_active 
ON profiles(user_id) 
WHERE user_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_level_xp 
ON profiles(level, xp) 
WHERE is_bot = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_weekly_leaderboards_week_score 
ON weekly_leaderboards(week_start_date, total_score DESC) 
WHERE total_score > 0;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_districts_residence 
ON user_districts(user_id, district_id) 
WHERE is_residence = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_members_active 
ON team_members(user_id, team_id) 
WHERE is_active = true;

-- 2. Composite indexes for complex queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_missions_active_expires 
ON daily_missions(is_active, expires_at) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_sessions_user_recent 
ON quiz_sessions(user_id, completed_at DESC) 
WHERE completed_at >= NOW() - INTERVAL '30 days';

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
  avatar_data RECORD;
  district_data RECORD;
  team_data RECORD;
  next_level_xp INTEGER;
BEGIN
  -- Single query for profile with avatar
  SELECT 
    p.*,
    a.id as avatar_id,
    a.name as avatar_name,
    a.description as avatar_description,
    a.image_url as avatar_image_url,
    a.avatar_class,
    a.district_theme,
    a.rarity,
    a.evolution_level
  INTO profile_data
  FROM profiles p
  LEFT JOIN avatars a ON p.avatar_id = a.id
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
          'description', profile_data.avatar_description,
          'image_url', profile_data.avatar_image_url,
          'avatar_class', profile_data.avatar_class,
          'district_theme', profile_data.district_theme,
          'rarity', profile_data.rarity,
          'evolution_level', profile_data.evolution_level
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

-- 4. Optimized leaderboard function
CREATE OR REPLACE FUNCTION get_weekly_leaderboard_optimized(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  username TEXT,
  beetz INTEGER,
  rank INTEGER,
  avatar_url TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  current_week_start DATE;
BEGIN
  current_week_start := date_trunc('week', CURRENT_DATE)::DATE;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.nickname as username,
    p.points as beetz,
    ROW_NUMBER() OVER (ORDER BY wl.total_score DESC)::INTEGER as rank,
    a.image_url as avatar_url
  FROM weekly_leaderboards wl
  JOIN profiles p ON wl.user_id = p.id
  LEFT JOIN avatars a ON p.avatar_id = a.id
  WHERE wl.week_start_date = current_week_start
  AND wl.total_score > 0
  ORDER BY wl.total_score DESC
  LIMIT limit_count;
END;
$$;

-- 5. Cached missions function
CREATE OR REPLACE FUNCTION get_active_missions_cached()
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  mission_type TEXT,
  target_value INTEGER,
  xp_reward INTEGER,
  beetz_reward INTEGER,
  difficulty TEXT,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dm.id,
    dm.title,
    dm.description,
    dm.category,
    dm.mission_type,
    dm.target_value,
    dm.xp_reward,
    dm.beetz_reward,
    dm.difficulty,
    dm.expires_at
  FROM daily_missions dm
  WHERE dm.is_active = true
  AND dm.expires_at > NOW()
  ORDER BY dm.created_at DESC;
END;
$$;

-- 6. Performance monitoring view
CREATE OR REPLACE VIEW performance_stats AS
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_tuples,
  n_dead_tup as dead_tuples,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;