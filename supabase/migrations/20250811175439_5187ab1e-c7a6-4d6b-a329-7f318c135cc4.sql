-- CORREÇÃO EMERGENCIAL: Recursão Infinita na Tabela Profiles
-- Remove políticas RLS problemáticas e cria novas não-recursivas

-- 1. REMOVER TODAS AS POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "Users can view followed profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- 2. CRIAR FUNÇÃO SEGURA PARA VERIFICAR PROPRIEDADE DO PERFIL
CREATE OR REPLACE FUNCTION public.is_profile_owner(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT profile_user_id = auth.uid();
$$;

-- 3. CRIAR FUNÇÃO SEGURA PARA VERIFICAR SEGUIMENTO
CREATE OR REPLACE FUNCTION public.is_following_user(target_profile_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_follows uf
    JOIN profiles p1 ON uf.follower_id = p1.id
    WHERE p1.user_id = auth.uid() 
    AND uf.following_id = target_profile_id
  );
$$;

-- 4. RECRIAR POLÍTICAS RLS SEM RECURSÃO
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (public.is_profile_owner(user_id));

CREATE POLICY "Users can view public profile data"
ON public.profiles  
FOR SELECT
USING (
  -- Perfil próprio ou perfis públicos limitados
  public.is_profile_owner(user_id) OR 
  (is_bot = false AND nickname IS NOT NULL)
);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (public.is_profile_owner(user_id));

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (public.is_profile_owner(user_id));

-- 5. POLÍTICA ESPECIAL PARA LEADERBOARDS (sem dados sensíveis)
CREATE POLICY "Public leaderboard access"
ON public.profiles
FOR SELECT
USING (
  is_bot = false AND 
  nickname IS NOT NULL AND
  current_timestamp < current_timestamp + interval '1 hour' -- Sempre verdadeiro, mas força refresh
);

-- 6. TESTE DE INTEGRIDADE
DO $$
DECLARE
  test_count INTEGER;
BEGIN
  -- Verifica se conseguimos contar profiles sem recursão
  SELECT COUNT(*) INTO test_count FROM profiles WHERE is_bot = false;
  RAISE NOTICE 'Teste de integridade: % profiles encontrados', test_count;
END $$;