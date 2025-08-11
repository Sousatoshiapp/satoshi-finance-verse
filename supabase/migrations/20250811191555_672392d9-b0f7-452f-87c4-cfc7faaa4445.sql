-- CORREÇÃO CRÍTICA DE SEGURANÇA PARA LIBERAR DEPLOY
-- Removendo Security Definer das views críticas que estão bloqueando o deploy

-- 1. CORRIGIR SECURITY DEFINER VIEWS (CRITICAL ERRORS)
-- Recriar leaderboard_data sem SECURITY DEFINER
DROP VIEW IF EXISTS public.leaderboard_data;
CREATE VIEW public.leaderboard_data AS
SELECT 
  p.nickname,
  p.level,
  p.xp,
  p.points,
  RANK() OVER (ORDER BY p.xp DESC) as rank,
  a.image_url as avatar_url
FROM public.profiles p
LEFT JOIN public.avatars a ON p.current_avatar_id = a.id
WHERE p.is_bot = false
ORDER BY p.xp DESC;

-- Recriar public_activities sem SECURITY DEFINER  
DROP VIEW IF EXISTS public.public_activities;
CREATE VIEW public.public_activities AS
SELECT 
  af.id,
  af.activity_type,
  af.activity_data,
  af.created_at,
  p.nickname as user_nickname,
  p.level as user_level,
  a.image_url as user_avatar
FROM public.activity_feed af
JOIN public.profiles p ON af.user_id = p.id
LEFT JOIN public.avatars a ON p.current_avatar_id = a.id
WHERE af.activity_type IN ('quiz_completion', 'level_up', 'achievement_unlocked', 'duel_victory')
ORDER BY af.created_at DESC;

-- 2. ADICIONAR SEARCH_PATH ÀS FUNÇÕES CRÍTICAS (SECURITY WARNINGS)
-- Drop e recriar award_xp function com search_path
DROP FUNCTION IF EXISTS public.award_xp(uuid, integer, text);
CREATE OR REPLACE FUNCTION public.award_xp(profile_id uuid, xp_amount integer, source text DEFAULT 'unknown')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_xp INTEGER;
  current_level INTEGER;
  new_xp INTEGER;
  new_level INTEGER;
  level_up_occurred BOOLEAN := false;
  xp_for_next_level INTEGER;
BEGIN
  -- Get current user data
  SELECT xp, level INTO current_xp, current_level
  FROM profiles WHERE id = profile_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Calculate new XP
  new_xp := current_xp + xp_amount;
  new_level := current_level;
  
  -- Check for level ups
  LOOP
    SELECT xp_required INTO xp_for_next_level
    FROM level_tiers WHERE level = new_level + 1;
    
    EXIT WHEN xp_for_next_level IS NULL OR new_xp < xp_for_next_level;
    
    new_level := new_level + 1;
    level_up_occurred := true;
  END LOOP;
  
  -- Update user
  UPDATE profiles 
  SET xp = new_xp, level = new_level
  WHERE id = profile_id;
  
  -- Log activity
  IF level_up_occurred THEN
    INSERT INTO activity_feed (user_id, activity_type, activity_data)
    VALUES (profile_id, 'level_up', jsonb_build_object(
      'new_level', new_level,
      'old_level', current_level,
      'source', source
    ));
  END IF;
END;
$$;

-- 3. CORRIGIR RLS POLICIES CRÍTICAS
-- Garantir que admin_sessions tenha RLS restritiva
DROP POLICY IF EXISTS "admin_sessions_owner" ON public.admin_sessions;
DROP POLICY IF EXISTS "admin_sessions_strict_access" ON public.admin_sessions;
CREATE POLICY "admin_sessions_strict_access" 
ON public.admin_sessions 
FOR ALL 
USING (
  user_id = auth.uid() AND 
  expires_at > now() AND
  is_admin(auth.uid())
)
WITH CHECK (
  user_id = auth.uid() AND
  is_admin(auth.uid())
);

-- Garantir que admin_tokens seja super restritivo
DROP POLICY IF EXISTS "admin_tokens_service" ON public.admin_tokens;
DROP POLICY IF EXISTS "admin_tokens_service_only" ON public.admin_tokens;
CREATE POLICY "admin_tokens_service_only" 
ON public.admin_tokens 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 4. PROTEGER DADOS FINANCEIROS CRÍTICOS
-- Crypto payments - apenas owner pode ver
DROP POLICY IF EXISTS "Users can view their own crypto payments" ON public.crypto_payments;
DROP POLICY IF EXISTS "crypto_payments_owner_only" ON public.crypto_payments;
CREATE POLICY "crypto_payments_owner_only" 
ON public.crypto_payments 
FOR ALL 
USING (
  user_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  user_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- Transactions - apenas owner pode ver
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "transactions_owner_only" ON public.transactions;
CREATE POLICY "transactions_owner_only" 
ON public.transactions 
FOR ALL 
USING (
  user_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  user_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- Garantir que views sejam acessíveis por usuários autenticados
GRANT SELECT ON public.leaderboard_data TO authenticated;
GRANT SELECT ON public.public_activities TO authenticated;

-- Comentários para documentar as correções
COMMENT ON VIEW public.leaderboard_data IS 'Secure leaderboard view without SECURITY DEFINER - fixed for deployment';
COMMENT ON VIEW public.public_activities IS 'Secure activity feed view without SECURITY DEFINER - fixed for deployment';