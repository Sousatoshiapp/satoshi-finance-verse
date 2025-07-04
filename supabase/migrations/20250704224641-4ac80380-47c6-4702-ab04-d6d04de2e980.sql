-- Create districts table
CREATE TABLE public.districts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  theme TEXT NOT NULL,
  color_primary TEXT NOT NULL,
  color_secondary TEXT NOT NULL,
  image_url TEXT,
  level_required INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  max_members INTEGER NOT NULL DEFAULT 10,
  level_required INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_districts table
CREATE TABLE public.user_districts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, district_id)
);

-- Create user_teams table
CREATE TABLE public.user_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, team_id)
);

-- Add district_id to quiz_questions
ALTER TABLE public.quiz_questions 
ADD COLUMN district_id UUID REFERENCES public.districts(id);

-- Enable RLS on new tables
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_teams ENABLE ROW LEVEL SECURITY;

-- RLS Policies for districts
CREATE POLICY "Districts are viewable by everyone" 
ON public.districts 
FOR SELECT 
USING (true);

-- RLS Policies for teams
CREATE POLICY "Teams are viewable by everyone" 
ON public.teams 
FOR SELECT 
USING (true);

-- RLS Policies for user_districts
CREATE POLICY "Users can view their own districts" 
ON public.user_districts 
FOR SELECT 
USING (user_id IN ( SELECT profiles.id FROM profiles WHERE (profiles.user_id = auth.uid())));

CREATE POLICY "Users can insert their own districts" 
ON public.user_districts 
FOR INSERT 
WITH CHECK (user_id IN ( SELECT profiles.id FROM profiles WHERE (profiles.user_id = auth.uid())));

CREATE POLICY "Users can update their own districts" 
ON public.user_districts 
FOR UPDATE 
USING (user_id IN ( SELECT profiles.id FROM profiles WHERE (profiles.user_id = auth.uid())));

-- RLS Policies for user_teams
CREATE POLICY "Users can view their own teams" 
ON public.user_teams 
FOR SELECT 
USING (user_id IN ( SELECT profiles.id FROM profiles WHERE (profiles.user_id = auth.uid())));

CREATE POLICY "Users can insert their own teams" 
ON public.user_teams 
FOR INSERT 
WITH CHECK (user_id IN ( SELECT profiles.id FROM profiles WHERE (profiles.user_id = auth.uid())));

CREATE POLICY "Users can update their own teams" 
ON public.user_teams 
FOR UPDATE 
USING (user_id IN ( SELECT profiles.id FROM profiles WHERE (profiles.user_id = auth.uid())));

-- Triggers for updated_at
CREATE TRIGGER update_districts_updated_at
BEFORE UPDATE ON public.districts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial districts
INSERT INTO public.districts (name, description, theme, color_primary, color_secondary, image_url) VALUES
('XP Investimentos District', 'Centro financeiro focado em renda variável, ações e fundos de investimento', 'renda_variavel', '#00ff41', '#003d10', null),
('Anima Educação District', 'Distrito dedicado à educação financeira aplicada e planejamento', 'educacao_financeira', '#ff6b35', '#4a1e0d', null),
('Cripto Valley', 'Vale tecnológico especializado em criptomoedas, DeFi e blockchain', 'criptomoedas', '#9d4edd', '#3c1361', null),
('Banking Sector', 'Setor bancário com foco em sistema financeiro e fintechs', 'sistema_bancario', '#06ffa5', '#023d2f', null),
('Real Estate Zone', 'Zona imobiliária para fundos imobiliários e mercado de imóveis', 'fundos_imobiliarios', '#ff8500', '#4a2800', null),
('International Trade', 'Centro de comércio internacional, câmbio e mercados globais', 'mercado_internacional', '#3a86ff', '#0f2a5a', null),
('Tech Finance Hub', 'Hub de inovação em fintechs, open banking e tecnologia financeira', 'fintech', '#f72585', '#5a0e30', null);