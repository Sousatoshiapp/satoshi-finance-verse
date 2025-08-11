-- CORREÇÃO ULTRA-EMERGENCIAL FASE 3: ACESSO TOTAL TEMPORÁRIO
-- Remove TODAS as políticas RLS e cria acesso total temporário

-- 1. REMOVER ABSOLUTAMENTE TODAS AS POLÍTICAS DA TABELA PROFILES
DROP POLICY IF EXISTS "Simplified profile access" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profile data" ON public.profiles;
DROP POLICY IF EXISTS "Public leaderboard access" ON public.profiles;
DROP POLICY IF EXISTS "Users can view followed profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- 2. CRIAR POLÍTICA DE ACESSO TOTAL TEMPORÁRIO
-- ATENÇÃO: ESTA É UMA POLÍTICA TEMPORÁRIA PARA EMERGÊNCIA
CREATE POLICY "EMERGÊNCIA - Acesso total temporário"
ON public.profiles
FOR SELECT
USING (true);  -- ACESSO TOTAL PARA TODOS

-- 3. POLÍTICAS BÁSICAS PARA MODIFICAÇÕES (AINDA SEGURAS)
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 4. TESTE IMEDIATO DE CONECTIVIDADE
DO $$
DECLARE
  foxtrot_points INTEGER;
  total_profiles INTEGER;
BEGIN
  -- Verificar especificamente o saldo do Foxtrot Alpha
  SELECT points INTO foxtrot_points
  FROM profiles 
  WHERE nickname = 'Foxtrot Alpha'
  LIMIT 1;
  
  -- Contar total de perfis
  SELECT COUNT(*) INTO total_profiles
  FROM profiles;
  
  RAISE NOTICE '🔥 EMERGÊNCIA: Foxtrot Alpha tem % BTZ', COALESCE(foxtrot_points, 0);
  RAISE NOTICE '🔥 EMERGÊNCIA: % perfis totais acessíveis', total_profiles;
  
  IF foxtrot_points IS NULL THEN
    RAISE NOTICE '⚠️ ALERTA: Perfil Foxtrot Alpha não encontrado!';
  ELSE
    RAISE NOTICE '✅ SUCESSO: Dados do Foxtrot Alpha acessíveis!';
  END IF;
END $$;