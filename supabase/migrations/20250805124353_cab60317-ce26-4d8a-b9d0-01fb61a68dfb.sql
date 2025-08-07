-- Criar tabela para simulação de presença de bots
CREATE TABLE IF NOT EXISTS public.bot_presence_simulation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  personality_type TEXT NOT NULL DEFAULT 'casual', -- casual, active, sporadic, night_owl
  is_online BOOLEAN NOT NULL DEFAULT false,
  online_probability NUMERIC(3,2) NOT NULL DEFAULT 0.15, -- 15% chance base
  peak_hours INTEGER[] NOT NULL DEFAULT ARRAY[9,10,11,14,15,16,19,20,21], -- Horários de pico
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_bot_presence_bot_id ON public.bot_presence_simulation(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_presence_online ON public.bot_presence_simulation(is_online);
CREATE INDEX IF NOT EXISTS idx_bot_presence_personality ON public.bot_presence_simulation(personality_type);

-- Função para simular presença de bots de forma realista
CREATE OR REPLACE FUNCTION public.simulate_bot_presence()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_hour INTEGER;
  total_updated INTEGER := 0;
  bot_record RECORD;
  online_chance NUMERIC;
  is_peak_hour BOOLEAN;
BEGIN
  current_hour := EXTRACT(HOUR FROM now());
  
  -- Atualizar presença de cada bot baseado em personalidade e horário
  FOR bot_record IN 
    SELECT bps.*, p.level 
    FROM public.bot_presence_simulation bps
    JOIN public.profiles p ON bps.bot_id = p.id
  LOOP
    -- Verificar se é horário de pico para este bot
    is_peak_hour := current_hour = ANY(bot_record.peak_hours);
    
    -- Calcular chance de estar online baseado na personalidade
    CASE bot_record.personality_type
      WHEN 'active' THEN 
        online_chance := CASE WHEN is_peak_hour THEN 0.45 ELSE 0.25 END;
      WHEN 'casual' THEN 
        online_chance := CASE WHEN is_peak_hour THEN 0.20 ELSE 0.10 END;
      WHEN 'sporadic' THEN 
        online_chance := CASE WHEN is_peak_hour THEN 0.15 ELSE 0.05 END;
      WHEN 'night_owl' THEN 
        online_chance := CASE WHEN current_hour BETWEEN 19 AND 23 THEN 0.35 ELSE 0.08 END;
      ELSE 
        online_chance := bot_record.online_probability;
    END CASE;
    
    -- Bots de nível mais alto têm maior chance de estar online
    IF bot_record.level > 20 THEN
      online_chance := online_chance * 1.2;
    ELSIF bot_record.level > 10 THEN
      online_chance := online_chance * 1.1;
    END IF;
    
    -- Atualizar status online baseado na probabilidade
    UPDATE public.bot_presence_simulation 
    SET 
      is_online = (random() < online_chance),
      last_activity_at = CASE 
        WHEN (random() < online_chance) THEN now() 
        ELSE last_activity_at 
      END,
      updated_at = now()
    WHERE id = bot_record.id;
    
    total_updated := total_updated + 1;
  END LOOP;
  
  RETURN total_updated;
END;
$$;

-- Função redesenhada para matchmaking com sistema híbrido de prioridades
CREATE OR REPLACE FUNCTION public.find_automatic_opponent(
  user_id_param UUID,
  topic_param TEXT DEFAULT 'finance',
  max_level_diff INTEGER DEFAULT 5
)
RETURNS TABLE(
  opponent_id UUID,
  opponent_type TEXT,
  opponent_nickname TEXT,
  opponent_level INTEGER,
  match_quality NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_level INTEGER;
  min_level INTEGER;
  max_level INTEGER;
BEGIN
  -- Buscar nível do usuário
  SELECT level INTO user_level
  FROM public.profiles
  WHERE id = user_id_param;
  
  IF user_level IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;
  
  min_level := GREATEST(1, user_level - max_level_diff);
  max_level := user_level + max_level_diff;
  
  -- PRIORIDADE 1: Usuários reais na fila de duelos
  RETURN QUERY
  SELECT 
    p.id,
    'human'::TEXT,
    p.nickname,
    p.level,
    (1.0 - ABS(p.level - user_level)::NUMERIC / (max_level_diff + 1)) as quality
  FROM public.profiles p
  JOIN public.duel_queue dq ON p.id = dq.user_id
  WHERE p.id != user_id_param
    AND p.level BETWEEN min_level AND max_level
    AND dq.is_active = true
    AND dq.expires_at > now()
    AND NOT p.is_bot
  ORDER BY quality DESC, dq.created_at ASC
  LIMIT 1;
  
  -- Se não encontrou usuário real, PRIORIDADE 2: Bots simulados online
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      p.id,
      'bot_online'::TEXT,
      p.nickname,
      p.level,
      (1.0 - ABS(p.level - user_level)::NUMERIC / (max_level_diff + 1)) as quality
    FROM public.profiles p
    JOIN public.bot_presence_simulation bps ON p.id = bps.bot_id
    WHERE p.id != user_id_param
      AND p.level BETWEEN min_level AND max_level
      AND p.is_bot = true
      AND bps.is_online = true
      AND bps.updated_at > (now() - INTERVAL '30 minutes') -- Presença recente
    ORDER BY quality DESC, random()
    LIMIT 1;
  END IF;
  
  -- Se ainda não encontrou, PRIORIDADE 3: Qualquer bot disponível (fallback)
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      p.id,
      'bot_available'::TEXT,
      p.nickname,
      p.level,
      (1.0 - ABS(p.level - user_level)::NUMERIC / (max_level_diff + 1)) as quality
    FROM public.profiles p
    WHERE p.id != user_id_param
      AND p.level BETWEEN min_level AND max_level
      AND p.is_bot = true
    ORDER BY quality DESC, random()
    LIMIT 1;
  END IF;
END;
$$;

-- Popular tabela com dados iniciais para todos os bots existentes
INSERT INTO public.bot_presence_simulation (bot_id, personality_type, online_probability, peak_hours)
SELECT 
  p.id,
  CASE 
    WHEN p.level > 25 THEN 'active'
    WHEN p.level > 15 THEN 'casual'  
    WHEN p.level < 10 THEN 'sporadic'
    WHEN random() < 0.2 THEN 'night_owl'
    ELSE 'casual'
  END as personality_type,
  CASE 
    WHEN p.level > 25 THEN 0.25
    WHEN p.level > 15 THEN 0.15
    ELSE 0.10
  END as online_probability,
  CASE 
    WHEN random() < 0.2 THEN ARRAY[20,21,22,23,0,1] -- night_owl
    WHEN random() < 0.3 THEN ARRAY[7,8,9,17,18,19] -- early/evening
    ELSE ARRAY[9,10,11,14,15,16,19,20,21] -- normal
  END as peak_hours
FROM public.profiles p
WHERE p.is_bot = true
  AND NOT EXISTS (
    SELECT 1 FROM public.bot_presence_simulation bps 
    WHERE bps.bot_id = p.id
  );