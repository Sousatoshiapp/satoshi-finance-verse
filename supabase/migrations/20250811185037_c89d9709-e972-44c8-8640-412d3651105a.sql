-- CORREÇÃO DEFINITIVA DAS POLÍTICAS RLS PROBLEMÁTICAS - VERSÃO 2
-- Remove políticas que expõem dados sensíveis e implementa políticas restritivas

-- ========================================
-- FASE 1: REMOVER TODAS AS POLÍTICAS PROBLEMÁTICAS
-- ========================================

-- Remover política problemática de crypto_payments
DROP POLICY IF EXISTS "System can manage crypto payments" ON public.crypto_payments;

-- Remover todas as políticas problemáticas de profiles
DROP POLICY IF EXISTS "EMERGÊNCIA - Acesso total temporário" ON public.profiles;
DROP POLICY IF EXISTS "Public can view basic profile info for leaderboards" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;

-- Remover políticas duplicadas de outras tabelas
DROP POLICY IF EXISTS "Users can view their own admin sessions" ON public.admin_sessions;
DROP POLICY IF EXISTS "admin_sessions_secure_select" ON public.admin_sessions;
DROP POLICY IF EXISTS "Admin sessions owner only" ON public.admin_sessions;

DROP POLICY IF EXISTS "Only service role can access admin tokens" ON public.admin_tokens;
DROP POLICY IF EXISTS "admin_tokens_service_only" ON public.admin_tokens;
DROP POLICY IF EXISTS "Admin tokens service role only" ON public.admin_tokens;

DROP POLICY IF EXISTS "Users can view their own activity" ON public.activity_feed;
DROP POLICY IF EXISTS "activity_feed_secure_select" ON public.activity_feed;
DROP POLICY IF EXISTS "Activity feed owner only" ON public.activity_feed;

-- ========================================
-- FASE 2: IMPLEMENTAR POLÍTICAS RESTRITIVAS LIMPAS
-- ========================================

-- CRYPTO_PAYMENTS - Apenas service_role e usuário dono
CREATE POLICY "crypto_payments_service_role" 
ON public.crypto_payments 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

CREATE POLICY "crypto_payments_user_select" 
ON public.crypto_payments 
FOR SELECT 
TO authenticated 
USING (user_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));

-- PROFILES - Usuário dono e admin
CREATE POLICY "profiles_user_own" 
ON public.profiles 
FOR ALL 
TO authenticated 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_admin_select" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (public.check_user_is_admin(auth.uid()));

-- ADMIN_SESSIONS - Apenas usuário dono
CREATE POLICY "admin_sessions_owner" 
ON public.admin_sessions 
FOR ALL 
TO authenticated 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

-- ADMIN_TOKENS - Apenas service_role
CREATE POLICY "admin_tokens_service" 
ON public.admin_tokens 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- ACTIVITY_FEED - Apenas usuário dono
CREATE POLICY "activity_feed_owner" 
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
-- FASE 3: GARANTIR VIEW SEGURA PARA LEADERBOARD
-- ========================================

-- Recriar view de leaderboard segura
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