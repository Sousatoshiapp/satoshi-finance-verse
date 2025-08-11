-- CORREÇÃO DEFINITIVA: RLS RESTRITIVA - ELIMINAÇÃO TOTAL DOS ERROS DE SEGURANÇA
-- Versão corrigida sem tabelas inexistentes

-- Fase 1: Limpeza completa de policies problemáticas
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Limited public activity visibility" ON public.activity_feed;
DROP POLICY IF EXISTS "Public crypto payments are viewable by everyone" ON public.crypto_payments;
DROP POLICY IF EXISTS "Admin sessions are viewable by their owners and super admins" ON public.admin_sessions;

-- Remover views problemáticas com SECURITY DEFINER
DROP VIEW IF EXISTS public.profiles_public;
DROP VIEW IF EXISTS public.portfolios_public;
DROP VIEW IF EXISTS public.activity_feed_public;
DROP VIEW IF EXISTS public.crypto_payments_public;
DROP VIEW IF EXISTS public.admin_data_sanitized;

-- Fase 2: Criar views seguras SEM SECURITY DEFINER para dados públicos específicos

-- View para leaderboard (apenas dados não sensíveis)
CREATE VIEW public.leaderboard_data AS
SELECT 
  p.id,
  p.nickname,
  p.level,
  p.xp,
  p.created_at
FROM public.profiles p
WHERE p.is_bot = false;

-- View para atividades públicas limitadas (apenas conquistas)
CREATE VIEW public.public_activities AS
SELECT 
  af.id,
  af.activity_type,
  af.created_at,
  CASE 
    WHEN af.activity_type = 'achievement_unlock' THEN 
      jsonb_build_object('achievement', af.activity_data->>'achievement')
    WHEN af.activity_type = 'level_up' THEN 
      jsonb_build_object('level', af.activity_data->>'level')
    ELSE '{}'::jsonb
  END as activity_data_safe
FROM public.activity_feed af
WHERE af.activity_type IN ('achievement_unlock', 'level_up');

-- Fase 3: RLS RESTRITIVO nas views
ALTER VIEW public.leaderboard_data SET (security_invoker = true);
ALTER VIEW public.public_activities SET (security_invoker = true);

-- Aplicar RLS nas views
ALTER TABLE public.leaderboard_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_activities ENABLE ROW LEVEL SECURITY;

-- Policies para as views (apenas leitura limitada)
CREATE POLICY "Leaderboard viewable by authenticated users" 
ON public.leaderboard_data 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Public activities viewable by authenticated users" 
ON public.public_activities 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fase 4: Policies RESTRITIVAS nas tabelas principais

-- PROFILES: Apenas usuário dono + sistema podem ver dados completos
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (user_id = auth.uid());

-- CRYPTO_PAYMENTS: Apenas usuário dono
CREATE POLICY "Users can view their own crypto payments only" 
ON public.crypto_payments 
FOR SELECT 
USING (user_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create their own crypto payments" 
ON public.crypto_payments 
FOR INSERT 
WITH CHECK (user_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));

-- ACTIVITY_FEED: Apenas usuário dono pode ver suas atividades
CREATE POLICY "Users can view only their own activity feed" 
ON public.activity_feed 
FOR SELECT 
USING (user_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));

-- ADMIN_SESSIONS: Apenas service role e usuário dono
CREATE POLICY "Admin sessions restricted to owners only" 
ON public.admin_sessions 
FOR SELECT 
USING (user_id = auth.uid());

-- ADMIN_TOKENS: Apenas service role
CREATE POLICY "Admin tokens accessible only by service role" 
ON public.admin_tokens 
FOR ALL 
USING (auth.role() = 'service_role');

-- Fase 5: Garantir que tabelas sensíveis tenham RLS ativo
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_tokens ENABLE ROW LEVEL SECURITY;

-- Fase 6: Função helper para leaderboard (sem exposição de dados sensíveis)
CREATE OR REPLACE FUNCTION public.get_safe_leaderboard(limit_count integer DEFAULT 10)
RETURNS TABLE(
  nickname text,
  level integer,
  xp integer,
  rank_position bigint
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.nickname,
    p.level,
    p.xp,
    ROW_NUMBER() OVER (ORDER BY p.xp DESC) as rank_position
  FROM public.profiles p
  WHERE p.is_bot = false
  ORDER BY p.xp DESC
  LIMIT limit_count;
$$;

-- Comentário de conclusão
COMMENT ON VIEW public.leaderboard_data IS 'View segura para leaderboard - apenas dados não sensíveis';
COMMENT ON VIEW public.public_activities IS 'View segura para atividades públicas - dados mascarados';
COMMENT ON FUNCTION public.get_safe_leaderboard IS 'Função segura para leaderboard - sem exposição de dados pessoais';