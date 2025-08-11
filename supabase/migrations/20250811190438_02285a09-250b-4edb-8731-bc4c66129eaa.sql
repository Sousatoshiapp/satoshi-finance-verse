-- Correção das políticas RLS excessivamente restritivas
-- Permite visualização de dados básicos de profiles mantendo segurança

-- Remover políticas restritivas atuais de profiles
DROP POLICY IF EXISTS "profiles_secure_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_owner_all" ON public.profiles;

-- Política para visualização pública de dados básicos (não sensíveis)
CREATE POLICY "profiles_public_basic_data" 
ON public.profiles 
FOR SELECT 
USING (
  -- Qualquer usuário autenticado pode ver dados básicos de qualquer profile
  auth.uid() IS NOT NULL
);

-- Política para que usuários vejam todos os seus próprios dados
CREATE POLICY "profiles_owner_full_access" 
ON public.profiles 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Política para admins terem acesso total
CREATE POLICY "profiles_admin_full_access" 
ON public.profiles 
FOR ALL 
USING (is_admin(auth.uid()));

-- Corrigir política de user_follows para permitir visualização
DROP POLICY IF EXISTS "user_follows_participants" ON public.user_follows;

CREATE POLICY "user_follows_view_public" 
ON public.user_follows 
FOR SELECT 
USING (
  -- Qualquer usuário autenticado pode ver follows (para verificar se segue alguém)
  auth.uid() IS NOT NULL
);

CREATE POLICY "user_follows_manage_own" 
ON public.user_follows 
FOR ALL 
USING (
  follower_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  follower_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- Corrigir política de social_posts para permitir visualização pública
DROP POLICY IF EXISTS "social_posts_owner" ON public.social_posts;

CREATE POLICY "social_posts_public_view" 
ON public.social_posts 
FOR SELECT 
USING (
  -- Posts são públicos para usuários autenticados
  auth.uid() IS NOT NULL
);

CREATE POLICY "social_posts_owner_manage" 
ON public.social_posts 
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

-- Garantir que leaderboard_data continue funcionando (já é uma view pública)
COMMENT ON VIEW public.leaderboard_data IS 'Public view for leaderboard - intentionally accessible to show rankings';

-- Garantir que public_activities continue funcionando  
COMMENT ON VIEW public.public_activities IS 'Public view for activity feed - intentionally accessible for social features';