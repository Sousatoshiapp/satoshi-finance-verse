-- Fix security warnings by adding search_path to all functions
-- This resolves the "Function Search Path Mutable" warnings and allows publication

-- Core profile and authentication functions
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

-- P2P Transfer function (CRITICAL for security)
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

-- Authentication and admin functions
CREATE OR REPLACE FUNCTION public.is_master_admin(email_check text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN email_check = 'fasdurian@gmail.com';
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  user_email text;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = user_uuid;
  
  IF is_master_admin(user_email) THEN
    RETURN true;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = user_uuid AND is_active = true
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_admin_role(user_uuid uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  user_email text;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = user_uuid;
  
  IF is_master_admin(user_email) THEN
    RETURN 'super_admin';
  END IF;
  
  SELECT role::text INTO user_email
  FROM admin_users
  WHERE user_id = user_uuid AND is_active = true;
  
  RETURN COALESCE(user_email, 'admin');
END;
$function$;

-- Mission and progression functions
CREATE OR REPLACE FUNCTION public.update_mission_progress(profile_id uuid, mission_type_param text, progress_amount integer DEFAULT 1)
 RETURNS TABLE(mission_completed boolean, rewards_earned jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  mission_record RECORD;
  new_progress INTEGER;
  completed_missions INTEGER;
  user_created_at TIMESTAMP WITH TIME ZONE;
  hours_since_creation INTEGER;
  is_very_new_user BOOLEAN;
BEGIN
  -- Verificar se o usuário existe e não é bot
  SELECT created_at INTO user_created_at
  FROM profiles 
  WHERE id = profile_id AND is_bot = false;
  
  IF user_created_at IS NULL THEN
    RETURN;
  END IF;
  
  -- Calcular horas desde criação do usuário
  hours_since_creation := EXTRACT(EPOCH FROM (now() - user_created_at)) / 3600;
  is_very_new_user := hours_since_creation < 1;
  
  -- Log para debug de novos usuários
  IF hours_since_creation < 24 THEN
    INSERT INTO activity_feed (user_id, activity_type, activity_data)
    VALUES (profile_id, 'debug_mission_attempt', jsonb_build_object(
      'mission_type', mission_type_param,
      'hours_since_creation', hours_since_creation,
      'progress_amount', progress_amount,
      'timestamp', now()
    ));
  END IF;
  
  -- Proteção rigorosa: usuários com menos de 1 hora só podem fazer login diário
  IF is_very_new_user AND mission_type_param != 'daily_login' THEN
    RETURN;
  END IF;
  
  -- Usuários muito novos (menos de 24 horas) têm limitações severas
  IF hours_since_creation < 24 THEN
    -- Limitar drasticamente o progresso para usuários novos
    progress_amount := CASE 
      WHEN mission_type_param = 'daily_login' THEN 1 -- Permitir apenas 1 login
      ELSE LEAST(progress_amount, 1) -- Máximo 1 de progresso em outras missões
    END;
  END IF;

  -- Find active missions of this type
  FOR mission_record IN 
    SELECT dm.* FROM daily_missions dm
    WHERE dm.mission_type = mission_type_param 
    AND dm.is_active = true 
    AND dm.expires_at > now()
  LOOP
    -- Check if mission is already completed today
    IF EXISTS (
      SELECT 1 FROM user_mission_progress 
      WHERE user_id = profile_id 
      AND mission_id = mission_record.id 
      AND completed = true 
      AND DATE(completed_at) = CURRENT_DATE
    ) THEN
      CONTINUE; -- Skip already completed missions
    END IF;
    
    -- Proteção adicional: limitar progresso baseado no tempo desde criação
    DECLARE
      max_allowed_progress INTEGER;
    BEGIN
      max_allowed_progress := CASE 
        WHEN hours_since_creation < 1 AND mission_type_param = 'daily_login' THEN 1
        WHEN hours_since_creation < 1 THEN 0 -- Bloquear outras missões
        WHEN hours_since_creation < 24 THEN LEAST(progress_amount, 1)
        WHEN hours_since_creation < 72 THEN LEAST(progress_amount, 3)
        ELSE progress_amount
      END;
      
      -- Se não há progresso permitido, pular
      IF max_allowed_progress <= 0 THEN
        CONTINUE;
      END IF;
      
      -- Update or insert progress with limited amount
      INSERT INTO user_mission_progress (user_id, mission_id, progress)
      VALUES (profile_id, mission_record.id, max_allowed_progress)
      ON CONFLICT (user_id, mission_id)
      DO UPDATE SET progress = LEAST(
        mission_record.target_value,
        user_mission_progress.progress + max_allowed_progress
      );
    END;
    
    -- Check if mission is completed
    SELECT progress INTO new_progress
    FROM user_mission_progress
    WHERE user_id = profile_id AND mission_id = mission_record.id;
    
    IF new_progress >= mission_record.target_value AND NOT EXISTS (
      SELECT 1 FROM user_mission_progress 
      WHERE user_id = profile_id AND mission_id = mission_record.id AND completed = true
    ) THEN
      -- Mark as completed
      UPDATE user_mission_progress
      SET completed = true, completed_at = now()
      WHERE user_id = profile_id AND mission_id = mission_record.id;
      
      -- Award rewards with severe limitations for new users
      DECLARE
        xp_reward INTEGER;
        btz_reward INTEGER;
      BEGIN
        -- Drasticamente reduzir recompensas para usuários novos
        xp_reward := CASE 
          WHEN hours_since_creation < 1 THEN LEAST(mission_record.xp_reward, 5) -- Máximo 5 XP primeira hora
          WHEN hours_since_creation < 24 THEN LEAST(mission_record.xp_reward, 10) -- Máximo 10 XP primeiro dia
          WHEN hours_since_creation < 72 THEN LEAST(mission_record.xp_reward, 25) -- Máximo 25 XP primeiros 3 dias
          ELSE mission_record.xp_reward
        END;
        
        btz_reward := CASE 
          WHEN hours_since_creation < 1 THEN LEAST(mission_record.beetz_reward, 10) -- Máximo 10 BTZ primeira hora
          WHEN hours_since_creation < 24 THEN LEAST(mission_record.beetz_reward, 25) -- Máximo 25 BTZ primeiro dia
          WHEN hours_since_creation < 72 THEN LEAST(mission_record.beetz_reward, 50) -- Máximo 50 BTZ primeiros 3 dias
          ELSE mission_record.beetz_reward
        END;
        
        -- Log reward for debug
        INSERT INTO activity_feed (user_id, activity_type, activity_data)
        VALUES (profile_id, 'debug_mission_completed', jsonb_build_object(
          'mission_type', mission_type_param,
          'mission_name', mission_record.title,
          'original_xp', mission_record.xp_reward,
          'awarded_xp', xp_reward,
          'original_btz', mission_record.beetz_reward,
          'awarded_btz', btz_reward,
          'hours_since_creation', hours_since_creation,
          'timestamp', now()
        ));
        
        -- Award limited rewards
        PERFORM award_xp(profile_id, xp_reward, 'daily_mission');
        
        UPDATE profiles
        SET points = points + btz_reward
        WHERE id = profile_id;
        
        RETURN QUERY SELECT true, jsonb_build_object(
          'xp', xp_reward,
          'beetz', btz_reward,
          'mission_name', mission_record.title
        );
      END;
    END IF;
  END LOOP;
  
  -- Return false if no mission was completed
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, '{}'::jsonb;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.mark_daily_login_safe(profile_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  last_login_date DATE;
  already_logged_today boolean := false;
BEGIN
  -- Verificar se já fez login hoje
  SELECT last_daily_login_date INTO last_login_date
  FROM profiles 
  WHERE id = profile_id;
  
  -- Se já logou hoje, não fazer nada
  IF last_login_date = CURRENT_DATE THEN
    RETURN false;
  END IF;
  
  -- Atualizar data do último login diário
  UPDATE profiles 
  SET last_daily_login_date = CURRENT_DATE
  WHERE id = profile_id;
  
  -- Executar lógica de missão daily_login
  PERFORM update_mission_progress(profile_id, 'daily_login', 1);
  
  RETURN true;
END;
$function$;