-- Função para atualizar progresso da emergência da cidade
CREATE OR REPLACE FUNCTION public.update_city_emergency_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  total_btz INTEGER;
  total_xp INTEGER;
BEGIN
  -- Calcular totais
  SELECT 
    COALESCE(SUM(btz_contributed), 0),
    COALESCE(SUM(xp_contributed), 0)
  INTO total_btz, total_xp
  FROM public.city_emergency_contributions 
  WHERE emergency_id = NEW.emergency_id;
  
  -- Atualizar evento de emergência
  UPDATE public.city_emergency_events 
  SET 
    current_btz_contributions = total_btz,
    current_xp_contributions = total_xp,
    updated_at = now()
  WHERE id = NEW.emergency_id;
  
  RETURN NEW;
END;
$$;

-- Trigger para atualizar progresso da emergência
DROP TRIGGER IF EXISTS update_city_emergency_progress_trigger ON public.city_emergency_contributions;
CREATE TRIGGER update_city_emergency_progress_trigger
  AFTER INSERT OR UPDATE ON public.city_emergency_contributions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_city_emergency_progress();

-- Função para finalizar emergências expiradas
CREATE OR REPLACE FUNCTION public.finalize_expired_emergencies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.city_emergency_events 
  SET is_active = false
  WHERE is_active = true 
  AND end_time < now();
END;
$$;