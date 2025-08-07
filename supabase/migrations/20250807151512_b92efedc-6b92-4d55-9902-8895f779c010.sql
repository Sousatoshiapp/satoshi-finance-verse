-- Corrigir função update_mission_progress com validações para novos usuários
CREATE OR REPLACE FUNCTION public.update_mission_progress(profile_id uuid, mission_type_param text, progress_amount integer DEFAULT 1)
 RETURNS TABLE(mission_completed boolean, rewards_earned jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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

-- Limpar dados incorretos de usuários muito novos (criados nas últimas 48 horas)
DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Resetar XP e pontos de usuários criados nas últimas 48 horas com XP > 10
  FOR user_record IN 
    SELECT id, xp, points, created_at, nickname
    FROM profiles 
    WHERE created_at > (now() - INTERVAL '48 hours')
    AND is_bot = false
    AND (xp > 10 OR points > 50)
  LOOP
    -- Log the cleanup
    INSERT INTO activity_feed (user_id, activity_type, activity_data)
    VALUES (user_record.id, 'debug_user_cleanup', jsonb_build_object(
      'old_xp', user_record.xp,
      'old_points', user_record.points,
      'created_at', user_record.created_at,
      'nickname', user_record.nickname,
      'cleanup_reason', 'excessive_initial_rewards',
      'timestamp', now()
    ));
    
    -- Reset to starting values
    UPDATE profiles 
    SET xp = 0, points = 100, level = 1
    WHERE id = user_record.id;
    
    -- Clear incorrect mission progress
    DELETE FROM user_mission_progress 
    WHERE user_id = user_record.id;
  END LOOP;
END $$;