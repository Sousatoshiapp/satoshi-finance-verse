-- Backfill de níveis dos usuários baseado no XP e tabela level_tiers
-- E correção de streak/BTZ issues

-- Primeiro, criar função para calcular o nível correto baseado no XP
CREATE OR REPLACE FUNCTION public.calculate_correct_level(user_xp integer)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  correct_level integer;
BEGIN
  -- Encontrar o maior nível onde o usuário tem XP suficiente
  SELECT COALESCE(MAX(level), 1) INTO correct_level
  FROM public.level_tiers 
  WHERE xp_required <= user_xp;
  
  RETURN correct_level;
END;
$$;

-- Criar trigger function para auto-update do nível quando XP muda
CREATE OR REPLACE FUNCTION public.auto_update_user_level()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  new_level integer;
BEGIN
  -- Calcular nível correto baseado no XP
  new_level := public.calculate_correct_level(NEW.xp);
  
  -- Atualizar o nível se mudou
  IF new_level != NEW.level THEN
    NEW.level := new_level;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Remover trigger existente se existir
DROP TRIGGER IF EXISTS trigger_auto_update_level ON public.profiles;

-- Criar novo trigger
CREATE TRIGGER trigger_auto_update_level
  BEFORE UPDATE OF xp ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_user_level();

-- BACKFILL: Corrigir todos os níveis existentes baseado no XP atual
UPDATE public.profiles 
SET level = public.calculate_correct_level(xp)
WHERE level != public.calculate_correct_level(xp);

-- Adicionar coluna para rastrear último login diário (se não existir)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_daily_login_date DATE;

-- Função para marcar login diário apenas uma vez por dia
CREATE OR REPLACE FUNCTION public.mark_daily_login_safe(profile_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_login_date DATE;
  already_logged_today boolean := false;
BEGIN
  -- Verificar se já fez login hoje
  SELECT last_daily_login_date INTO last_login_date
  FROM public.profiles 
  WHERE id = profile_id;
  
  -- Se já logou hoje, não fazer nada
  IF last_login_date = CURRENT_DATE THEN
    RETURN false;
  END IF;
  
  -- Atualizar data do último login diário
  UPDATE public.profiles 
  SET last_daily_login_date = CURRENT_DATE
  WHERE id = profile_id;
  
  -- Executar lógica de missão daily_login
  PERFORM public.update_mission_progress(profile_id, 'daily_login', 1);
  
  RETURN true;
END;
$$;

-- Limpar progresso de missões excessivo para usuários muito novos
-- (Usuários criados nas últimas 24 horas com progresso suspeito)
UPDATE public.profiles 
SET 
  xp = LEAST(xp, 100),  -- Máximo 100 XP para usuários novos
  points = LEAST(points, 500)  -- Máximo 500 BTZ para usuários novos
WHERE 
  created_at > now() - INTERVAL '24 hours'
  AND (xp > 100 OR points > 500);

-- Recalcular níveis após limpeza
UPDATE public.profiles 
SET level = public.calculate_correct_level(xp)
WHERE created_at > now() - INTERVAL '24 hours';

-- Log das correções feitas
INSERT INTO public.activity_feed (user_id, activity_type, activity_data)
SELECT 
  p.id,
  'system_level_correction',
  jsonb_build_object(
    'corrected_level', public.calculate_correct_level(p.xp),
    'previous_level', p.level,
    'current_xp', p.xp,
    'correction_date', now()
  )
FROM public.profiles p
WHERE p.level != public.calculate_correct_level(p.xp)
LIMIT 100;  -- Limitar para não sobrecarregar