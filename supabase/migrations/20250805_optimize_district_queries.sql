
CREATE OR REPLACE FUNCTION get_all_districts_optimized()
RETURNS TABLE (
  id UUID,
  name TEXT,
  theme TEXT,
  color_primary TEXT,
  color_secondary TEXT,
  level_required INTEGER,
  power_level INTEGER,
  battles_won INTEGER,
  sponsor_company TEXT,
  total_residents INTEGER,
  total_xp INTEGER,
  is_active BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.name,
    d.theme,
    d.color_primary,
    d.color_secondary,
    d.level_required,
    d.power_level,
    d.battles_won,
    d.sponsor_company,
    COALESCE(resident_counts.total_residents, 0)::INTEGER as total_residents,
    COALESCE(xp_totals.total_xp, 0)::INTEGER as total_xp,
    d.is_active
  FROM districts d
  LEFT JOIN (
    SELECT 
      district_id,
      COUNT(*) as total_residents
    FROM user_districts 
    WHERE is_active = true
    GROUP BY district_id
  ) resident_counts ON d.id = resident_counts.district_id
  LEFT JOIN (
    SELECT 
      ud.district_id,
      SUM(p.xp) as total_xp
    FROM user_districts ud
    JOIN profiles p ON ud.user_id = p.id
    WHERE ud.is_active = true
    GROUP BY ud.district_id
  ) xp_totals ON d.id = xp_totals.district_id
  WHERE d.is_active = true
  ORDER BY d.power_level DESC, d.name;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_user_districts_active_district ON user_districts(district_id, is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_xp_optimized ON profiles(xp) WHERE xp > 0;
