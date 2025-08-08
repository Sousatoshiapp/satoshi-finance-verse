-- Corrigir a função get_dashboard_data_optimized para usar os valores corretos de XP
CREATE OR REPLACE FUNCTION public.get_dashboard_data_optimized(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  profile_data RECORD;
  avatar_data RECORD;
  district_data RECORD;
  team_data RECORD;
  completed_quizzes_count INTEGER;
  next_level_xp INTEGER;
  xp_table INTEGER[] := ARRAY[
    0, 100, 200, 350, 550, 800, 1100, 1450, 1850, 2300, 2800,
    3350, 3950, 4600, 5300, 6050, 6850, 7700, 8600, 9550, 10500,
    11500, 12550, 13650, 14800, 16000, 17250, 18550, 19900, 21300, 22750
  ];
BEGIN
  -- Get profile data including profile_image_url
  SELECT 
    p.id,
    p.user_id,
    p.nickname,
    p.level,
    p.xp,
    p.points,
    p.streak,
    p.profile_image_url,
    p.current_avatar_id,
    p.subscription_tier,
    p.created_at,
    p.updated_at
  INTO profile_data
  FROM profiles p
  WHERE p.user_id = target_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Profile not found');
  END IF;
  
  -- Get avatar data if user has one selected
  IF profile_data.current_avatar_id IS NOT NULL THEN
    SELECT 
      a.id,
      a.name,
      a.image_url
    INTO avatar_data
    FROM avatars a
    WHERE a.id = profile_data.current_avatar_id;
  END IF;
  
  -- Get district data
  SELECT 
    d.id,
    d.name,
    d.color_primary,
    d.color_secondary,
    d.theme,
    d.sponsor_logo_url,
    d.sponsor_company,
    d.description
  INTO district_data
  FROM user_districts ud
  JOIN districts d ON d.id = ud.district_id
  WHERE ud.user_id = profile_data.id AND ud.is_residence = true
  LIMIT 1;
  
  -- Get team data
  SELECT 
    dt.id,
    dt.name,
    dt.team_color
  INTO team_data
  FROM team_members tm
  JOIN district_teams dt ON dt.id = tm.team_id
  WHERE tm.user_id = profile_data.id AND tm.is_active = true
  LIMIT 1;
  
  -- Get completed quizzes count
  SELECT COUNT(*)
  INTO completed_quizzes_count
  FROM quiz_sessions qs
  WHERE qs.user_id = profile_data.id 
    AND qs.session_type = 'practice' 
    AND qs.questions_correct >= 5;
  
  -- Calculate next level XP usando a tabela correta
  DECLARE
    current_level INTEGER := COALESCE(profile_data.level, 1);
  BEGIN
    -- Tentar buscar da tabela level_tiers primeiro
    SELECT lt.xp_required INTO next_level_xp
    FROM level_tiers lt
    WHERE lt.level = current_level + 1;
    
    -- Se não encontrar, usar a tabela hardcoded
    IF next_level_xp IS NULL THEN
      IF current_level + 1 <= array_length(xp_table, 1) THEN
        next_level_xp := xp_table[current_level + 1];
      ELSE
        -- Fallback para níveis muito altos
        next_level_xp := xp_table[array_length(xp_table, 1)];
      END IF;
    END IF;
  END;
  
  -- Build final result
  result := json_build_object(
    'profile', json_build_object(
      'id', profile_data.id,
      'user_id', profile_data.user_id,
      'nickname', profile_data.nickname,
      'level', COALESCE(profile_data.level, 1),
      'xp', COALESCE(profile_data.xp, 0),
      'points', COALESCE(profile_data.points, 0),
      'streak', COALESCE(profile_data.streak, 0),
      'profile_image_url', profile_data.profile_image_url,
      'current_avatar_id', profile_data.current_avatar_id,
      'subscription_tier', COALESCE(profile_data.subscription_tier, 'free'),
      'created_at', profile_data.created_at,
      'updated_at', profile_data.updated_at
    ),
    'avatar', CASE 
      WHEN avatar_data IS NOT NULL THEN 
        json_build_object(
          'id', avatar_data.id,
          'name', avatar_data.name,
          'image_url', avatar_data.image_url
        )
      ELSE NULL
    END,
    'district', CASE 
      WHEN district_data IS NOT NULL THEN 
        json_build_object(
          'id', district_data.id,
          'name', district_data.name,
          'color_primary', district_data.color_primary,
          'color_secondary', district_data.color_secondary,
          'theme', district_data.theme,
          'sponsor_logo_url', district_data.sponsor_logo_url,
          'sponsor_company', district_data.sponsor_company,
          'description', district_data.description
        )
      ELSE NULL
    END,
    'team', CASE 
      WHEN team_data IS NOT NULL THEN 
        json_build_object(
          'id', team_data.id,
          'name', team_data.name,
          'team_color', team_data.team_color
        )
      ELSE NULL
    END,
    'nextLevelXP', next_level_xp,
    'completedQuizzes', completed_quizzes_count
  );
  
  RETURN result;
END;
$$;