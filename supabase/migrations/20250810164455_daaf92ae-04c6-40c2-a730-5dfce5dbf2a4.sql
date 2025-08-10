-- Função para marcar usuário específico como offline
CREATE OR REPLACE FUNCTION public.mark_user_offline(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.user_presence 
  SET is_online = false, 
      updated_at = now()
  WHERE user_id = target_user_id;
  
  RETURN FOUND;
END;
$function$;