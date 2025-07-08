-- Corrigir política RLS para criação de times
-- Permitir que qualquer usuário autenticado possa criar times em qualquer distrito

DROP POLICY IF EXISTS "Users can create teams in districts they belong to" ON public.district_teams;

CREATE POLICY "Authenticated users can create teams" ON public.district_teams FOR INSERT
WITH CHECK (
  -- Usuário deve estar autenticado
  auth.uid() IS NOT NULL
  -- E o captain_id deve ser o próprio usuário
  AND captain_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Função para automaticamente adicionar usuário ao distrito quando criar um time
CREATE OR REPLACE FUNCTION public.add_user_to_district_on_team_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Adicionar o capitão do time ao distrito se ainda não estiver
  INSERT INTO public.user_districts (user_id, district_id)
  VALUES (NEW.captain_id, NEW.district_id)
  ON CONFLICT (user_id, district_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger para executar a função após inserir um time
DROP TRIGGER IF EXISTS trigger_add_user_to_district_on_team_creation ON public.district_teams;
CREATE TRIGGER trigger_add_user_to_district_on_team_creation
  AFTER INSERT ON public.district_teams
  FOR EACH ROW
  EXECUTE FUNCTION public.add_user_to_district_on_team_creation();