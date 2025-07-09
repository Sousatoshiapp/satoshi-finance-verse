-- Criar função de validação de integridade dos dados
CREATE OR REPLACE FUNCTION public.validate_data_integrity()
RETURNS TABLE(table_name text, issue_count bigint, issue_description text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar profiles sem user_id válido (exceto bots)
  RETURN QUERY
  SELECT 'profiles'::text, COUNT(*)::bigint, 'profiles with invalid user_id (excluding bots)'::text
  FROM public.profiles 
  WHERE user_id IS NULL AND is_bot = false;
  
  -- Verificar quiz_sessions órfãos
  RETURN QUERY
  SELECT 'quiz_sessions'::text, COUNT(*)::bigint, 'quiz_sessions without valid user'::text
  FROM public.quiz_sessions qs
  WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = qs.user_id);
  
  -- Verificar weekly_leaderboards órfãos
  RETURN QUERY
  SELECT 'weekly_leaderboards'::text, COUNT(*)::bigint, 'weekly_leaderboards without valid user'::text
  FROM public.weekly_leaderboards wl
  WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = wl.user_id);
  
  -- Verificar admin_sessions expirados
  RETURN QUERY
  SELECT 'admin_sessions'::text, COUNT(*)::bigint, 'expired admin sessions'::text
  FROM public.admin_sessions
  WHERE expires_at < now();
  
  -- Verificar admin_users inativos com sessões
  RETURN QUERY
  SELECT 'admin_inconsistency'::text, COUNT(*)::bigint, 'inactive admin users with active sessions'::text
  FROM public.admin_sessions ads
  JOIN public.admin_users au ON ads.user_id = au.user_id
  WHERE au.is_active = false AND ads.expires_at > now();
  
  -- Verificar profiles com dados inconsistentes
  RETURN QUERY
  SELECT 'profile_inconsistency'::text, COUNT(*)::bigint, 'profiles with negative values'::text
  FROM public.profiles
  WHERE level < 1 OR xp < 0 OR points < 0 OR streak < 0;
  
  -- Verificar duels órfãos
  RETURN QUERY
  SELECT 'duels'::text, COUNT(*)::bigint, 'duels with invalid players'::text
  FROM public.duels d
  WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = d.player1_id)
     OR NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = d.player2_id);
     
  -- Verificar conversations órfãs
  RETURN QUERY
  SELECT 'conversations'::text, COUNT(*)::bigint, 'conversations with invalid participants'::text
  FROM public.conversations c
  WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = c.participant1_id)
     OR NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = c.participant2_id);
END;
$$;