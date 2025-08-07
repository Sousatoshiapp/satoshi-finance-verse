-- Corrigir valores de recompensa das missões diárias
UPDATE daily_missions 
SET beetz_reward = 50, target_value = 5 
WHERE mission_type = 'quiz_completion' AND title = 'Especialista';

UPDATE daily_missions 
SET beetz_reward = 75 
WHERE mission_type = 'correct_answers' AND title = 'Gênio dos Quizzes';

UPDATE daily_missions 
SET beetz_reward = 100, target_value = 3 
WHERE mission_type = 'duel_wins' AND title = 'Duelista';

UPDATE daily_missions 
SET beetz_reward = 25 
WHERE mission_type = 'daily_login' AND title = 'Consistência';

UPDATE daily_missions 
SET beetz_reward = 30 
WHERE mission_type = 'chat_messages' AND title = 'Social';

-- Limpar progresso incorreto de missões para usuários recentes
DELETE FROM user_mission_progress 
WHERE user_id IN (
  SELECT id FROM profiles 
  WHERE created_at > NOW() - INTERVAL '7 days' 
  AND is_bot = false
  AND points > 200
);

-- Corrigir BTZ de usuários que receberam extras
UPDATE profiles 
SET points = 5 
WHERE created_at > NOW() - INTERVAL '7 days' 
AND is_bot = false 
AND points BETWEEN 200 AND 400;

-- Melhorar a função update_mission_progress para adicionar proteções
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
  
  -- Proteção: usuários muito novos (menos de 1 hora) têm limitações
  IF hours_since_creation < 1 AND mission_type_param != 'daily_login' THEN
    -- Apenas permitir missão de login diário para usuários muito novos
    RETURN;
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
        WHEN hours_since_creation < 24 THEN LEAST(progress_amount, 2) -- Máximo 2 de progresso no primeiro dia
        WHEN hours_since_creation < 72 THEN LEAST(progress_amount, 5) -- Máximo 5 nos primeiros 3 dias
        ELSE progress_amount
      END;
      
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
      
      -- Award rewards with additional validation
      PERFORM award_xp(profile_id, mission_record.xp_reward, 'daily_mission');
      
      -- Aplicar recompensa de BTZ com limite para usuários novos
      DECLARE
        btz_reward INTEGER;
      BEGIN
        btz_reward := CASE 
          WHEN hours_since_creation < 24 THEN LEAST(mission_record.beetz_reward, 50) -- Máximo 50 BTZ no primeiro dia
          WHEN hours_since_creation < 72 THEN LEAST(mission_record.beetz_reward, 100) -- Máximo 100 BTZ nos primeiros 3 dias
          ELSE mission_record.beetz_reward
        END;
        
        UPDATE profiles
        SET points = points + btz_reward
        WHERE id = profile_id;
        
        RETURN QUERY SELECT true, jsonb_build_object(
          'xp', mission_record.xp_reward,
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