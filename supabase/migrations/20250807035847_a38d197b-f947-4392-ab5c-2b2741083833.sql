-- Desabilitar temporariamente loot boxes automáticas
-- Modificar função award_daily_loot_box para sempre retornar NULL durante manutenção

CREATE OR REPLACE FUNCTION public.award_daily_loot_box(profile_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- MANUTENÇÃO: Loot boxes temporariamente desabilitadas
  -- Adicionar log para monitoramento
  INSERT INTO public.system_logs (event_type, description, user_id)
  VALUES ('loot_box_maintenance', 'Daily loot box attempt blocked during maintenance', profile_id);
  
  -- Retornar NULL (nenhuma loot box será concedida)
  RETURN NULL;
END;
$function$;