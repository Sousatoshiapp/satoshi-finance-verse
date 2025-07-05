-- Add cyberpunk narrative fields to avatars table
ALTER TABLE public.avatars 
ADD COLUMN IF NOT EXISTS avatar_class text DEFAULT 'newbie',
ADD COLUMN IF NOT EXISTS district_theme text,
ADD COLUMN IF NOT EXISTS evolution_level integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS backstory text,
ADD COLUMN IF NOT EXISTS bonus_effects jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_starter boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS model_url text;

-- Add evolution tracking to user_avatars
ALTER TABLE public.user_avatars
ADD COLUMN IF NOT EXISTS evolution_level integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_xp integer DEFAULT 0;

-- Insert 4 starter cyberpunk avatars (free)
INSERT INTO public.avatars (name, description, image_url, price, rarity, level_required, is_available, avatar_class, district_theme, backstory, bonus_effects, is_starter, model_url) VALUES
('Neo Trader', 'Um jovem hacker que descobriu os segredos do mercado financeiro através de algoritmos neurais.', '/placeholder.svg', 0, 'common', 1, true, 'trader', 'renda_variavel', 'Nascido nas periferias digitais de Satoshi City, domina análises técnicas com implantes neurais.', '{"xp_bonus": 10, "district": "renda_variavel"}', true, '/avatars/neo-trader.glb'),
('Crypto Analyst', 'Especialista em criptomoedas com modificações corporais para processar dados em tempo real.', '/placeholder.svg', 0, 'common', 1, true, 'analyst', 'criptomoedas', 'Ex-funcionário do Banco Central que se tornou revolucionário das moedas digitais descentralizadas.', '{"xp_bonus": 10, "district": "criptomoedas"}', true, '/avatars/crypto-analyst.glb'),
('Finance Hacker', 'Hacker ético especializado em segurança financeira e sistemas bancários.', '/placeholder.svg', 0, 'common', 1, true, 'hacker', 'sistema_bancario', 'Protege os cidadãos de Satoshi City contra fraudes corporativas e manipulações do mercado.', '{"xp_bonus": 10, "district": "sistema_bancario"}', true, '/avatars/finance-hacker.glb'),
('Investment Scholar', 'Acadêmica com implantes de memória expandida, especialista em educação financeira.', '/placeholder.svg', 0, 'common', 1, true, 'scholar', 'educacao_financeira', 'Professora da Academia Neural de Satoshi City, dedica-se a democratizar o conhecimento financeiro.', '{"xp_bonus": 10, "district": "educacao_financeira"}', true, '/avatars/investment-scholar.glb');

-- Insert premium cyberpunk avatars (purchaseable with Beetz)
INSERT INTO public.avatars (name, description, image_url, price, rarity, level_required, is_available, avatar_class, district_theme, backstory, bonus_effects, is_starter, model_url) VALUES
('Quantum Broker', 'Corretor quântico capaz de processar múltiplas realidades financeiras simultaneamente.', '/placeholder.svg', 150, 'rare', 5, true, 'broker', 'renda_variavel', 'Usa tecnologia quântica para prever movimentos do mercado com 87% de precisão.', '{"xp_bonus": 25, "district": "renda_variavel", "success_rate": 15}', false, '/avatars/quantum-broker.glb'),
('Cyber Mogul', 'Magnata corporativo com exoesqueleto dourado e conexões neurais com todas as bolsas mundiais.', '/placeholder.svg', 300, 'epic', 10, true, 'mogul', 'renda_variavel', 'CEO da MegaCorp Satoshi, controla 23% do mercado financeiro global através de IAs.', '{"xp_bonus": 50, "district": "renda_variavel", "coin_bonus": 20}', false, '/avatars/cyber-mogul.glb'),
('DeFi Samurai', 'Guerreiro das finanças descentralizadas com katana de plasma e armadura de dados.', '/placeholder.svg', 200, 'rare', 7, true, 'warrior', 'criptomoedas', 'Protege protocolos DeFi contra ataques de corporações centralizadas.', '{"xp_bonus": 30, "district": "criptomoedas", "mining_bonus": 25}', false, '/avatars/defi-samurai.glb'),
('Neural Banker', 'Executivo bancário com cérebro híbrido humano-IA, processa milhões de transações instantaneamente.', '/placeholder.svg', 180, 'rare', 6, true, 'executive', 'sistema_bancario', 'Revolucionou o sistema bancário tradicional integrando IA consciente aos processos.', '{"xp_bonus": 25, "district": "sistema_bancario", "efficiency_bonus": 20}', false, '/avatars/neural-banker.glb'),
('Holographic Realtor', 'Especialista em propriedades virtuais e físicas com projeções holográficas.', '/placeholder.svg', 120, 'uncommon', 4, true, 'realtor', 'fundos_imobiliarios', 'Vende tanto propriedades no metaverso quanto arranha-céus reais de Satoshi City.', '{"xp_bonus": 20, "district": "fundos_imobiliarios", "property_bonus": 15}', false, '/avatars/holographic-realtor.glb'),
('Global Nexus', 'Comerciante internacional com teletransporte quântico para mercados globais.', '/placeholder.svg', 250, 'epic', 8, true, 'trader', 'mercado_internacional', 'Único capaz de estar fisicamente presente em todas as bolsas mundiais simultaneamente.', '{"xp_bonus": 40, "district": "mercado_internacional", "global_bonus": 30}', false, '/avatars/global-nexus.glb'),
('FinTech Architect', 'Arquiteto de soluções financeiras com nanotecnologia integrada ao sistema nervoso.', '/placeholder.svg', 220, 'rare', 7, true, 'architect', 'fintech', 'Criador de 47 unicórnios FinTech, seus implantes permitem programar em tempo real.', '{"xp_bonus": 35, "district": "fintech", "innovation_bonus": 25}', false, '/avatars/fintech-architect.glb'),
('The Satoshi', 'Avatar lendário do próprio criador de Satoshi City, forma humana da IA central.', '/placeholder.svg', 500, 'legendary', 15, true, 'legend', 'all', 'Manifestação digital do fundador misterioso de Satoshi City. Conhece todos os segredos da cidade.', '{"xp_bonus": 100, "all_districts": 50, "legendary_status": true}', false, '/avatars/the-satoshi.glb');

-- Create avatar_evolutions table for tracking upgrades
CREATE TABLE IF NOT EXISTS public.avatar_evolutions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_avatar_id uuid NOT NULL REFERENCES public.user_avatars(id),
  evolution_level integer NOT NULL DEFAULT 1,
  xp_required integer NOT NULL DEFAULT 1000,
  visual_changes jsonb DEFAULT '{}',
  bonus_changes jsonb DEFAULT '{}',
  unlocked_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.avatar_evolutions ENABLE ROW LEVEL SECURITY;

-- Create policies for avatar_evolutions
CREATE POLICY "Users can view their own avatar evolutions" 
ON public.avatar_evolutions 
FOR SELECT 
USING (user_avatar_id IN (
  SELECT id FROM public.user_avatars 
  WHERE user_id IN (
    SELECT id FROM public.profiles 
    WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Users can insert their own avatar evolutions" 
ON public.avatar_evolutions 
FOR INSERT 
WITH CHECK (user_avatar_id IN (
  SELECT id FROM public.user_avatars 
  WHERE user_id IN (
    SELECT id FROM public.profiles 
    WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Users can update their own avatar evolutions" 
ON public.avatar_evolutions 
FOR UPDATE 
USING (user_avatar_id IN (
  SELECT id FROM public.user_avatars 
  WHERE user_id IN (
    SELECT id FROM public.profiles 
    WHERE user_id = auth.uid()
  )
));