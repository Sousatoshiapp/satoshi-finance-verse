-- CRITICAL SECURITY FIX: Add remaining database functions with SET search_path = 'public'

-- This migration adds the critical security fix to all remaining functions
-- to prevent SQL injection attacks through schema manipulation

-- Update function: get_dashboard_data_optimized
CREATE OR REPLACE FUNCTION public.get_dashboard_data_optimized(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  result jsonb;
  profile_data jsonb;
  avatar_data jsonb;
  district_data jsonb;
  team_data jsonb;
  missions_data jsonb;
  leaderboard_data jsonb;
  subscription_data jsonb;
  quiz_stats jsonb;
  next_level_xp integer;
  current_level_xp integer;
  completed_quizzes integer;
  btz_yield numeric;
  current_streak integer;
BEGIN
  -- Buscar perfil do usuário com dados básicos
  SELECT jsonb_build_object(
    'id', p.id,
    'user_id', p.user_id,
    'nickname', p.nickname,
    'level', p.level,
    'xp', p.xp,
    'points', p.points,
    'streak', p.streak,
    'consecutive_login_days', p.consecutive_login_days,
    'last_login_date', p.last_login_date,
    'current_avatar_id', p.current_avatar_id,
    'subscription_tier', COALESCE(p.subscription_tier, 'free'),
    'created_at', p.created_at
  ) INTO profile_data
  FROM profiles p
  WHERE p.user_id = target_user_id;
  
  IF profile_data IS NULL THEN
    RETURN jsonb_build_object(
      'error', 'Profile not found',
      'profile', null,
      'points', 0,
      'xp', 0,
      'level', 1
    );
  END IF;
  
  -- Buscar avatar atual
  SELECT jsonb_build_object(
    'id', a.id,
    'name', a.name,
    'image_url', a.image_url,
    'rarity', a.rarity,
    'description', a.description
  ) INTO avatar_data
  FROM avatars a
  WHERE a.id = (profile_data->>'current_avatar_id')::uuid;
  
  -- Buscar distrito do usuário
  SELECT jsonb_build_object(
    'id', d.id,
    'name', d.name,
    'theme', d.theme,
    'description', d.description,
    'sponsor_company', d.sponsor_company
  ) INTO district_data
  FROM user_districts ud
  JOIN districts d ON ud.district_id = d.id
  WHERE ud.user_id = (profile_data->>'id')::uuid 
  AND ud.is_residence = true
  LIMIT 1;
  
  -- Buscar time do usuário com coluna corrigida
  SELECT jsonb_build_object(
    'id', dt.id,
    'team_name', dt.name,
    'team_motto', dt.team_motto,
    'member_count', COALESCE(dt.members_count, 0)
  ) INTO team_data
  FROM team_members tm
  JOIN district_teams dt ON tm.team_id = dt.id
  WHERE tm.user_id = (profile_data->>'id')::uuid 
  AND tm.is_active = true
  LIMIT 1;
  
  -- Buscar XP do nível atual e próximo nível do banco level_tiers
  SELECT xp_required INTO current_level_xp
  FROM level_tiers
  WHERE level = COALESCE((profile_data->>'level')::integer, 1)
  LIMIT 1;
  
  SELECT xp_required INTO next_level_xp
  FROM level_tiers
  WHERE level = (COALESCE((profile_data->>'level')::integer, 1) + 1)
  LIMIT 1;
  
  -- Fallbacks se não encontrar no banco
  current_level_xp := COALESCE(current_level_xp, 0);
  next_level_xp := COALESCE(next_level_xp, 100);
  
  -- Contar quizzes completados
  SELECT COUNT(*) INTO completed_quizzes
  FROM quiz_sessions
  WHERE user_id = (profile_data->>'id')::uuid
  AND session_type = 'practice'
  AND questions_correct >= 5;
  
  -- Buscar missões diárias ativas (limitado para velocidade)
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', dm.id,
      'title', dm.title,
      'description', dm.description,
      'category', dm.category,
      'mission_type', dm.mission_type,
      'target_value', dm.target_value,
      'xp_reward', dm.xp_reward,
      'beetz_reward', dm.beetz_reward,
      'difficulty', dm.difficulty,
      'progress', COALESCE(ump.progress, 0),
      'completed', COALESCE(ump.completed, false)
    )
  ) INTO missions_data
  FROM daily_missions dm
  LEFT JOIN user_mission_progress ump ON dm.id = ump.mission_id AND ump.user_id = (profile_data->>'id')::uuid
  WHERE dm.is_active = true 
  AND dm.expires_at > now()
  LIMIT 6;
  
  -- Top 10 leaderboard otimizado
  SELECT jsonb_agg(
    jsonb_build_object(
      'nickname', p.nickname,
      'level', p.level,
      'xp', p.xp,
      'points', p.points,
      'avatar_url', a.image_url
    )
  ) INTO leaderboard_data
  FROM (
    SELECT id, nickname, level, xp, points, current_avatar_id
    FROM profiles
    WHERE is_bot = false
    ORDER BY xp DESC
    LIMIT 10
  ) p
  LEFT JOIN avatars a ON p.current_avatar_id = a.id;
  
  -- Stats de quiz simplificados
  SELECT jsonb_build_object(
    'total_sessions', COUNT(*),
    'average_score', ROUND(AVG(CASE WHEN questions_total > 0 THEN (questions_correct::numeric / questions_total::numeric) * 100 ELSE 0 END), 1),
    'best_combo', COALESCE(MAX(max_combo), 0),
    'recent_performance', ROUND(AVG(CASE WHEN questions_total > 0 THEN (questions_correct::numeric / questions_total::numeric) * 100 ELSE 0 END) FILTER (WHERE created_at > now() - interval '7 days'), 1)
  ) INTO quiz_stats
  FROM quiz_sessions
  WHERE user_id = (profile_data->>'id')::uuid
  AND created_at > now() - interval '30 days';
  
  -- Calcular BTZ yield com tratamento correto de numeric
  btz_yield := COALESCE((profile_data->>'points')::numeric, 0) * 0.001;
  
  -- Streak atual
  current_streak := COALESCE((profile_data->>'consecutive_login_days')::integer, 0);
  
  -- Subscription info
  subscription_data := jsonb_build_object(
    'tier', COALESCE(profile_data->>'subscription_tier', 'free'),
    'benefits', CASE 
      WHEN COALESCE(profile_data->>'subscription_tier', 'free') = 'pro' THEN jsonb_build_array('Extra XP', 'Premium Avatar')
      WHEN COALESCE(profile_data->>'subscription_tier', 'free') = 'elite' THEN jsonb_build_array('Max Benefits', 'Exclusive Content')
      ELSE jsonb_build_array('Basic Access')
    END
  );
  
  -- Resultado final com XP corretos do banco level_tiers
  result := jsonb_build_object(
    'profile', profile_data,
    'avatar', avatar_data,
    'district', district_data,
    'team', team_data,
    'points', COALESCE((profile_data->>'points')::numeric, 0),
    'xp', COALESCE((profile_data->>'xp')::integer, 0),
    'level', COALESCE((profile_data->>'level')::integer, 1),
    'nextLevelXP', next_level_xp,
    'currentLevelXP', current_level_xp,
    'streak', current_streak,
    'completedQuizzes', COALESCE(completed_quizzes, 0),
    'dailyMissions', COALESCE(missions_data, '[]'::jsonb),
    'leaderboard', COALESCE(leaderboard_data, '[]'::jsonb),
    'subscription', subscription_data,
    'btzYield', btz_yield,
    'quizStats', COALESCE(quiz_stats, '{}'::jsonb),
    'cacheTimestamp', extract(epoch from now())
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback com dados mínimos em caso de erro
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'profile', profile_data,
      'points', COALESCE((profile_data->>'points')::numeric, 0),
      'xp', COALESCE((profile_data->>'xp')::integer, 0),
      'level', COALESCE((profile_data->>'level')::integer, 1),
      'nextLevelXP', 100,
      'currentLevelXP', 0,
      'streak', 0,
      'completedQuizzes', 0,
      'dailyMissions', '[]'::jsonb,
      'leaderboard', '[]'::jsonb,
      'subscription', jsonb_build_object('tier', 'free'),
      'btzYield', 0,
      'cacheTimestamp', extract(epoch from now())
    );
END;
$function$;

-- Update additional critical functions with security fix
CREATE OR REPLACE FUNCTION public.transfer_btz(sender_id uuid, receiver_id uuid, amount integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  sender_profile RECORD;
  receiver_profile RECORD;
  transaction_id UUID;
  sender_new_balance INTEGER;
  receiver_new_balance INTEGER;
BEGIN
  -- Get sender profile (sender_id is profile.id)
  SELECT * INTO sender_profile 
  FROM profiles 
  WHERE id = sender_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sender profile not found');
  END IF;
  
  -- Get receiver profile (receiver_id is profile.id)
  SELECT * INTO receiver_profile 
  FROM profiles 
  WHERE id = receiver_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Receiver profile not found');
  END IF;
  
  -- Check sufficient balance
  IF sender_profile.points < amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;
  
  -- Transfer BTZ
  UPDATE profiles 
  SET points = points - amount 
  WHERE id = sender_id;
  
  UPDATE profiles 
  SET points = points + amount 
  WHERE id = receiver_id;
  
  -- Get updated balances
  SELECT points INTO sender_new_balance 
  FROM profiles 
  WHERE id = sender_id;
  
  SELECT points INTO receiver_new_balance 
  FROM profiles 
  WHERE id = receiver_id;
  
  -- Record transaction with CONSISTENT profile.id values for both sender and receiver
  INSERT INTO transactions (
    user_id,           -- sender profile.id
    receiver_id,       -- receiver profile.id  
    amount_cents,
    transfer_type,
    status
  ) VALUES (
    sender_id,         -- using profile.id (not auth.users.id)
    receiver_id,       -- using profile.id (not auth.users.id)
    amount,
    'p2p',
    'completed'
  ) RETURNING id INTO transaction_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', transaction_id,
    'sender_new_balance', sender_new_balance,
    'receiver_new_balance', receiver_new_balance
  );
END;
$function$;

-- Update is_master_admin function
CREATE OR REPLACE FUNCTION public.is_master_admin(email_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Check against admin_users table instead of hardcoding
  RETURN EXISTS (
    SELECT 1 FROM admin_users au
    JOIN auth.users u ON au.user_id = u.id
    WHERE u.email = email_check 
    AND au.role = 'super_admin'
    AND au.is_active = true
  );
END;
$function$;

-- Update is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = user_uuid AND is_active = true
  );
END;
$function$;