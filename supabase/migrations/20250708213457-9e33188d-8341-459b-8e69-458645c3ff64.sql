-- Melhorar sistema de times e adicionar produtos exclusivos por distrito

-- 1. Corrigir problema de membros duplicados nos times
-- Adicionar coluna para verificar se usuário já é membro
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Adicionar menção do patrocinador nos times (de forma sutil)
ALTER TABLE public.district_teams ADD COLUMN IF NOT EXISTS sponsor_themed BOOLEAN DEFAULT TRUE;
ALTER TABLE public.district_teams ADD COLUMN IF NOT EXISTS team_motto TEXT;

-- 3. Função para verificar se usuário já é membro de algum time no distrito
CREATE OR REPLACE FUNCTION public.check_user_team_membership(p_user_id UUID, p_district_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.team_members tm
    JOIN public.district_teams dt ON tm.team_id = dt.id
    WHERE tm.user_id = p_user_id 
    AND dt.district_id = p_district_id
    AND tm.is_active = TRUE
  );
END;
$$;

-- 4. Atualizar política RLS para team_members (evitar duplicatas)
DROP POLICY IF EXISTS "Users can join teams" ON public.team_members;
CREATE POLICY "Users can join teams" ON public.team_members FOR INSERT
WITH CHECK (
  user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  AND NOT public.check_user_team_membership(user_id, (SELECT district_id FROM public.district_teams WHERE id = team_id))
);

-- 5. Política para visualizar membros do time
DROP POLICY IF EXISTS "Users can view team members" ON public.team_members;
CREATE POLICY "Users can view team members" ON public.team_members FOR SELECT
USING (TRUE);

-- 6. Inserir produtos exclusivos cyberpunk para cada distrito
-- Produtos para XP Investimentos (Renda Variável)
INSERT INTO public.district_store_items (district_id, item_type, name, description, price_beetz, sponsor_branded, unlock_requirements, rarity, effects, image_url)
SELECT 
  d.id,
  'uniform',
  'Uniforme Elite XP Neo',
  'Uniforme exclusivo dos especialistas em renda variável. Design cyberpunk com hologramas do logo XP.',
  3500,
  TRUE,
  jsonb_build_object('residence_required', true, 'min_days', 14, 'min_level', 5),
  'epic',
  jsonb_build_object('xp_bonus', 0.20, 'prestige', 15, 'trading_boost', 0.10),
  '/assets/districts/xp-uniform-cyber.jpg'
FROM public.districts d 
WHERE d.sponsor_company = 'XP Investimentos'
ON CONFLICT DO NOTHING;

INSERT INTO public.district_store_items (district_id, item_type, name, description, price_beetz, sponsor_branded, unlock_requirements, rarity, effects)
SELECT 
  d.id,
  'accessory',
  'Óculos de Realidade XP',
  'Óculos cyberpunk com análise de mercado em tempo real. Tecnologia XP integrada.',
  2800,
  TRUE,
  jsonb_build_object('residence_required', true, 'min_level', 8),
  'rare',
  jsonb_build_object('analysis_boost', 0.15, 'data_vision', true)
FROM public.districts d 
WHERE d.sponsor_company = 'XP Investimentos'
ON CONFLICT DO NOTHING;

-- Produtos para Ânima Educação
INSERT INTO public.district_store_items (district_id, item_type, name, description, price_beetz, sponsor_branded, unlock_requirements, rarity, effects)
SELECT 
  d.id,
  'uniform',
  'Jaqueta Scholar Ânima',
  'Jaqueta inteligente com fibras que mudam de cor baseado no conhecimento adquirido.',
  3200,
  TRUE,
  jsonb_build_object('residence_required', true, 'min_days', 10, 'quiz_score', 85),
  'epic',
  jsonb_build_object('learning_boost', 0.25, 'knowledge_aura', true)
FROM public.districts d 
WHERE d.sponsor_company = 'Ânima Educação'
ON CONFLICT DO NOTHING;

INSERT INTO public.district_store_items (district_id, item_type, name, description, price_beetz, sponsor_branded, unlock_requirements, rarity, effects)
SELECT 
  d.id,
  'accessory',
  'Neural Implant Ânima',
  'Implante que acelera o aprendizado e retenção de conhecimento financeiro.',
  4500,
  TRUE,
  jsonb_build_object('residence_required', true, 'min_level', 12, 'achievements', 5),
  'legendary',
  jsonb_build_object('memory_boost', 0.30, 'instant_learning', true)
FROM public.districts d 
WHERE d.sponsor_company = 'Ânima Educação'
ON CONFLICT DO NOTHING;

-- Adicionar produtos para outros distritos seguindo o mesmo padrão
INSERT INTO public.district_store_items (district_id, item_type, name, description, price_beetz, sponsor_branded, unlock_requirements, rarity, effects)
SELECT 
  d.id,
  'uniform',
  d.sponsor_company || ' Cyber Armor',
  'Armadura cyberpunk exclusiva com tecnologia ' || d.sponsor_company || '. Proteção e estilo.',
  3000 + (RANDOM() * 2000)::INT,
  TRUE,
  jsonb_build_object('residence_required', true, 'min_days', 7),
  'rare',
  jsonb_build_object('district_power', 0.15, 'sponsor_prestige', 10)
FROM public.districts d 
WHERE d.sponsor_company IS NOT NULL 
AND d.sponsor_company NOT IN ('XP Investimentos', 'Ânima Educação')
ON CONFLICT DO NOTHING;

-- 7. Função para atualizar motto dos times baseado no patrocinador
CREATE OR REPLACE FUNCTION public.update_team_sponsor_motto()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sponsor_name TEXT;
  district_theme TEXT;
BEGIN
  -- Buscar informações do distrito
  SELECT d.sponsor_company, d.theme INTO sponsor_name, district_theme
  FROM public.districts d
  WHERE d.id = NEW.district_id;
  
  -- Definir motto baseado no patrocinador se não foi definido
  IF NEW.team_motto IS NULL OR NEW.team_motto = '' THEN
    NEW.team_motto := CASE 
      WHEN sponsor_name = 'XP Investimentos' THEN 'Excelência em Renda Variável'
      WHEN sponsor_name = 'Ânima Educação' THEN 'Conhecimento é Poder'
      WHEN sponsor_name IS NOT NULL THEN 'Inovação ' || sponsor_name
      ELSE 'Unidos por ' || REPLACE(district_theme, '_', ' ')
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 8. Trigger para aplicar motto automaticamente
DROP TRIGGER IF EXISTS trigger_update_team_sponsor_motto ON public.district_teams;
CREATE TRIGGER trigger_update_team_sponsor_motto
  BEFORE INSERT OR UPDATE ON public.district_teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_team_sponsor_motto();

-- 9. Atualizar teams existentes com motto
UPDATE public.district_teams 
SET team_motto = COALESCE(
  (SELECT CASE 
    WHEN d.sponsor_company = 'XP Investimentos' THEN 'Excelência em Renda Variável'
    WHEN d.sponsor_company = 'Ânima Educação' THEN 'Conhecimento é Poder'
    WHEN d.sponsor_company IS NOT NULL THEN 'Inovação ' || d.sponsor_company
    ELSE 'Unidos por ' || REPLACE(d.theme, '_', ' ')
  END
  FROM public.districts d WHERE d.id = district_teams.district_id),
  'Time de Elite'
)
WHERE team_motto IS NULL OR team_motto = '';