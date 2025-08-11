-- CORREÇÃO EMERGENCIAL FASE 2: Simplificar Políticas RLS
-- Remove todas as políticas SELECT conflitantes e cria uma política permissiva

-- 1. REMOVER TODAS AS POLÍTICAS SELECT CONFLITANTES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profile data" ON public.profiles;
DROP POLICY IF EXISTS "Public leaderboard access" ON public.profiles;
DROP POLICY IF EXISTS "Users can view followed profiles" ON public.profiles;

-- 2. CRIAR UMA POLÍTICA SELECT SIMPLIFICADA E PERMISSIVA
-- Permite visualizar perfis próprios e públicos básicos
CREATE POLICY "Simplified profile access"
ON public.profiles
FOR SELECT
USING (
  -- Usuário logado pode ver seu próprio perfil OU perfis públicos básicos
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  (is_bot = false AND nickname IS NOT NULL)
);

-- 3. MANTER POLÍTICAS SEGURAS PARA MODIFICAÇÕES
-- Estas já existem mas vamos garantir que estão corretas
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 4. TESTE DE CONECTIVIDADE
DO $$
DECLARE
  profile_count INTEGER;
  points_total INTEGER;
BEGIN
  -- Verificar se conseguimos acessar os dados
  SELECT COUNT(*), COALESCE(SUM(points), 0) 
  INTO profile_count, points_total 
  FROM profiles 
  WHERE is_bot = false;
  
  RAISE NOTICE 'TESTE: % perfis encontrados, % pontos totais', profile_count, points_total;
  
  -- Verificar se há perfis com pontos
  SELECT COUNT(*) INTO profile_count
  FROM profiles 
  WHERE is_bot = false AND points > 0;
  
  RAISE NOTICE 'TESTE: % perfis com pontos > 0', profile_count;
END $$;