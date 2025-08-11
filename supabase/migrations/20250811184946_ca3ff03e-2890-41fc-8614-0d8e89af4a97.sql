-- CORREÇÃO DEFINITIVA DAS POLÍTICAS RLS PROBLEMÁTICAS
-- Remove políticas que expõem dados sensíveis e implementa políticas restritivas

-- ========================================
-- FASE 1: REMOVER POLÍTICAS PROBLEMÁTICAS
-- ========================================

-- Remover política problemática de crypto_payments que permite acesso público
DROP POLICY IF EXISTS "System can manage crypto payments" ON public.crypto_payments;

-- Remover políticas problemáticas de profiles que permitem acesso público irrestrito
DROP POLICY IF EXISTS "EMERGÊNCIA - Acesso total temporário" ON public.profiles;
DROP POLICY IF EXISTS "Public can view basic profile info for leaderboards" ON public.profiles;

-- ========================================
-- FASE 2: IMPLEMENTAR POLÍTICAS RESTRITIVAS PARA CRYPTO_PAYMENTS
-- ========================================

-- Apenas service_role pode gerenciar operações do sistema
CREATE POLICY "Service role can manage crypto payments" 
ON public.crypto_payments 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Usuários podem ver apenas seus próprios pagamentos
CREATE POLICY "Users can view own crypto payments" 
ON public.crypto_payments 
FOR SELECT 
TO authenticated 
USING (user_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));

-- ========================================
-- FASE 3: IMPLEMENTAR POLÍTICAS RESTRITIVAS PARA PROFILES
-- ========================================

-- Usuários podem ver e editar apenas seu próprio perfil
CREATE POLICY "Users can manage own profile" 
ON public.profiles 
FOR ALL 
TO authenticated 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

-- Admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (public.check_user_is_admin(auth.uid()));

-- ========================================
-- FASE 4: GARANTIR VIEWS SEGURAS PARA FUNCIONALIDADE PÚBLICA
-- ========================================

-- Recriar view de leaderboard caso não existe
CREATE OR REPLACE VIEW public.leaderboard_data AS
SELECT 
  p.nickname,
  p.level,
  p.xp,
  p.points,
  a.image_url as avatar_url,
  ROW_NUMBER() OVER (ORDER BY p.xp DESC) as rank_position
FROM public.profiles p
LEFT JOIN public.avatars a ON p.current_avatar_id = a.id
WHERE p.is_bot = false
ORDER BY p.xp DESC;

-- Permitir acesso público à view de leaderboard
GRANT SELECT ON public.leaderboard_data TO anon, authenticated;

-- ========================================
-- FASE 5: VALIDAR OUTRAS TABELAS SENSÍVEIS
-- ========================================

-- Garantir que admin_sessions seja super restritiva
DROP POLICY IF EXISTS "Users can view their own admin sessions" ON public.admin_sessions;
DROP POLICY IF EXISTS "admin_sessions_secure_select" ON public.admin_sessions;

CREATE POLICY "Admin sessions owner only" 
ON public.admin_sessions 
FOR ALL 
TO authenticated 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

-- Garantir que admin_tokens seja acessível apenas ao service_role
DROP POLICY IF EXISTS "Only service role can access admin tokens" ON public.admin_tokens;
DROP POLICY IF EXISTS "admin_tokens_service_only" ON public.admin_tokens;

CREATE POLICY "Admin tokens service role only" 
ON public.admin_tokens 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- ========================================
-- FASE 6: ACTIVITY_FEED RESTRITIVA
-- ========================================

-- Garantir que activity_feed seja super restritiva
DROP POLICY IF EXISTS "Users can view their own activity" ON public.activity_feed;
DROP POLICY IF EXISTS "activity_feed_secure_select" ON public.activity_feed;

CREATE POLICY "Activity feed owner only" 
ON public.activity_feed 
FOR ALL 
TO authenticated 
USING (user_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
)) 
WITH CHECK (user_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));

-- ========================================
-- FASE 7: COMENTÁRIOS EXPLICATIVOS
-- ========================================

COMMENT ON POLICY "Service role can manage crypto payments" ON public.crypto_payments IS 
'Apenas service_role pode gerenciar pagamentos crypto - necessário para webhooks e operações do sistema';

COMMENT ON POLICY "Users can view own crypto payments" ON public.crypto_payments IS 
'Usuários podem ver apenas seus próprios pagamentos crypto';

COMMENT ON POLICY "Users can manage own profile" ON public.profiles IS 
'Usuários podem gerenciar apenas seu próprio perfil';

COMMENT ON POLICY "Admins can view all profiles" ON public.profiles IS 
'Admins podem ver todos os perfis para administração';

COMMENT ON VIEW public.leaderboard_data IS 
'View pública segura para leaderboards - expõe apenas dados não sensíveis';