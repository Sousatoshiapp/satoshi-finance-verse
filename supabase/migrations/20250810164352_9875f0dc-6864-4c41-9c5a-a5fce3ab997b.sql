-- Função para marcar usuários como offline automaticamente
CREATE OR REPLACE FUNCTION public.cleanup_inactive_users()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Marcar como offline usuários com last_seen > 5 minutos
  UPDATE public.user_presence 
  SET is_online = false, 
      updated_at = now()
  WHERE is_online = true 
  AND last_seen < (now() - interval '5 minutes');
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count;
END;
$function$

-- Função para marcar usuário específico como offline
CREATE OR REPLACE FUNCTION public.mark_user_offline(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.user_presence 
  SET is_online = false, 
      updated_at = now()
  WHERE user_id = target_user_id;
  
  RETURN FOUND;
END;
$function$