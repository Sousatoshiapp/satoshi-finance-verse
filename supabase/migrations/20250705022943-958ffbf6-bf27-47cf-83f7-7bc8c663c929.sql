-- Modificar tabela user_districts para suportar apenas uma residência por vez
ALTER TABLE public.user_districts 
ADD COLUMN is_residence BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN residence_started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN district_benefits JSONB DEFAULT '{}'::jsonb,
ADD COLUMN daily_streak INTEGER DEFAULT 0,
ADD COLUMN last_activity_date DATE DEFAULT CURRENT_DATE;

-- Criar constraint para garantir apenas uma residência ativa por usuário
CREATE UNIQUE INDEX idx_user_single_residence 
ON public.user_districts (user_id) 
WHERE is_residence = true;

-- Criar tabela para atividades diárias específicas de cada distrito
CREATE TABLE public.district_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL, -- 'daily_challenge', 'market_simulation', 'crypto_mining', etc
  activity_data JSONB DEFAULT '{}'::jsonb,
  points_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS para district_activities
ALTER TABLE public.district_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own district activities" 
ON public.district_activities 
FOR SELECT 
USING (user_id IN ( SELECT profiles.id FROM profiles WHERE (profiles.user_id = auth.uid())));

CREATE POLICY "Users can insert their own district activities" 
ON public.district_activities 
FOR INSERT 
WITH CHECK (user_id IN ( SELECT profiles.id FROM profiles WHERE (profiles.user_id = auth.uid())));

-- Criar tabela para daily quests específicos por distrito
CREATE TABLE public.district_daily_quests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  quest_name TEXT NOT NULL,
  quest_description TEXT NOT NULL,
  quest_type TEXT NOT NULL, -- 'trading_volume', 'quiz_streak', 'simulation_profit', etc
  target_value INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  points_reward INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  reset_frequency TEXT NOT NULL DEFAULT 'daily', -- 'daily', 'weekly', 'monthly'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS para district_daily_quests
ALTER TABLE public.district_daily_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Daily quests are viewable by everyone" 
ON public.district_daily_quests 
FOR SELECT 
USING (is_active = true);

-- Criar tabela para progresso das quests dos usuários
CREATE TABLE public.user_quest_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quest_id UUID NOT NULL REFERENCES public.district_daily_quests(id) ON DELETE CASCADE,
  current_progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, quest_id)
);

-- RLS para user_quest_progress
ALTER TABLE public.user_quest_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quest progress" 
ON public.user_quest_progress 
FOR SELECT 
USING (user_id IN ( SELECT profiles.id FROM profiles WHERE (profiles.user_id = auth.uid())));

CREATE POLICY "Users can insert their own quest progress" 
ON public.user_quest_progress 
FOR INSERT 
WITH CHECK (user_id IN ( SELECT profiles.id FROM profiles WHERE (profiles.user_id = auth.uid())));

CREATE POLICY "Users can update their own quest progress" 
ON public.user_quest_progress 
FOR UPDATE 
USING (user_id IN ( SELECT profiles.id FROM profiles WHERE (profiles.user_id = auth.uid())));

-- Inserir daily quests específicas para cada distrito
INSERT INTO public.district_daily_quests (district_id, quest_name, quest_description, quest_type, target_value, xp_reward, points_reward) 
SELECT 
  d.id,
  CASE d.theme
    WHEN 'renda_variavel' THEN 'Trading Master'
    WHEN 'educacao_financeira' THEN 'Knowledge Seeker'
    WHEN 'criptomoedas' THEN 'Crypto Miner'
    WHEN 'sistema_bancario' THEN 'Banking Expert'
    WHEN 'fundos_imobiliarios' THEN 'Real Estate Mogul'
    WHEN 'mercado_internacional' THEN 'Global Trader'
    WHEN 'fintech' THEN 'Tech Innovator'
  END,
  CASE d.theme
    WHEN 'renda_variavel' THEN 'Complete 5 trading simulations with profit'
    WHEN 'educacao_financeira' THEN 'Study 3 financial lessons and score 80%+'
    WHEN 'criptomoedas' THEN 'Mine 100 virtual crypto coins'
    WHEN 'sistema_bancario' THEN 'Process 10 banking operations correctly'
    WHEN 'fundos_imobiliarios' THEN 'Analyze 3 real estate investments'
    WHEN 'mercado_internacional' THEN 'Trade in 2 different international markets'
    WHEN 'fintech' THEN 'Test 2 new fintech features'
  END,
  CASE d.theme
    WHEN 'renda_variavel' THEN 'trading_simulation'
    WHEN 'educacao_financeira' THEN 'lesson_completion'
    WHEN 'criptomoedas' THEN 'crypto_mining'
    WHEN 'sistema_bancario' THEN 'banking_operations'
    WHEN 'fundos_imobiliarios' THEN 'investment_analysis'
    WHEN 'mercado_internacional' THEN 'international_trading'
    WHEN 'fintech' THEN 'feature_testing'
  END,
  CASE d.theme
    WHEN 'renda_variavel' THEN 5
    WHEN 'educacao_financeira' THEN 3
    WHEN 'criptomoedas' THEN 100
    WHEN 'sistema_bancario' THEN 10
    WHEN 'fundos_imobiliarios' THEN 3
    WHEN 'mercado_internacional' THEN 2
    WHEN 'fintech' THEN 2
  END,
  100,
  250
FROM public.districts d
WHERE d.is_active = true;