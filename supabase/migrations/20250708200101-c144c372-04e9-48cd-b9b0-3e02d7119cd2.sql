-- Add district power system and battle mechanics
ALTER TABLE public.districts ADD COLUMN IF NOT EXISTS power_level INTEGER DEFAULT 100;
ALTER TABLE public.districts ADD COLUMN IF NOT EXISTS battles_won INTEGER DEFAULT 0;
ALTER TABLE public.districts ADD COLUMN IF NOT EXISTS battles_lost INTEGER DEFAULT 0;
ALTER TABLE public.districts ADD COLUMN IF NOT EXISTS sponsor_company TEXT;
ALTER TABLE public.districts ADD COLUMN IF NOT EXISTS sponsor_logo_url TEXT;
ALTER TABLE public.districts ADD COLUMN IF NOT EXISTS referral_link TEXT;
ALTER TABLE public.districts ADD COLUMN IF NOT EXISTS special_power TEXT;

-- Create district battles table
CREATE TABLE IF NOT EXISTS public.district_battles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attacking_district_id UUID REFERENCES public.districts(id) NOT NULL,
  defending_district_id UUID REFERENCES public.districts(id) NOT NULL,
  battle_type TEXT DEFAULT 'power_clash',
  status TEXT DEFAULT 'pending', -- pending, active, completed
  winner_district_id UUID REFERENCES public.districts(id),
  battle_data JSONB DEFAULT '{}',
  rewards JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create district teams table
CREATE TABLE IF NOT EXISTS public.district_teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID REFERENCES public.districts(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  captain_id UUID REFERENCES public.profiles(id),
  members_count INTEGER DEFAULT 0,
  max_members INTEGER DEFAULT 20,
  team_power INTEGER DEFAULT 0,
  team_color TEXT DEFAULT '#3B82F6',
  achievements JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.district_teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member', -- member, captain, vice_captain
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  contribution_points INTEGER DEFAULT 0,
  UNIQUE(team_id, user_id)
);

-- Create sponsor referrals tracking table
CREATE TABLE IF NOT EXISTS public.sponsor_referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID REFERENCES public.districts(id) NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  referral_type TEXT NOT NULL, -- signup, purchase, investment
  referral_data JSONB DEFAULT '{}',
  commission_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, confirmed, paid
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Update user_districts to include team membership and power contribution
ALTER TABLE public.user_districts ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.district_teams(id);
ALTER TABLE public.user_districts ADD COLUMN IF NOT EXISTS power_contribution INTEGER DEFAULT 0;
ALTER TABLE public.user_districts ADD COLUMN IF NOT EXISTS monthly_battles_participated INTEGER DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE public.district_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.district_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for district_battles
CREATE POLICY "Everyone can view district battles" ON public.district_battles FOR SELECT USING (true);
CREATE POLICY "Team captains can create battles" ON public.district_battles FOR INSERT 
WITH CHECK (
  attacking_district_id IN (
    SELECT dt.district_id FROM public.district_teams dt
    JOIN public.team_members tm ON dt.id = tm.team_id
    WHERE tm.user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND tm.role IN ('captain', 'vice_captain')
  )
);

-- RLS Policies for district_teams
CREATE POLICY "Everyone can view district teams" ON public.district_teams FOR SELECT USING (true);
CREATE POLICY "Users can create teams in districts they belong to" ON public.district_teams FOR INSERT
WITH CHECK (
  district_id IN (
    SELECT district_id FROM public.user_districts 
    WHERE user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);
CREATE POLICY "Team captains can update their teams" ON public.district_teams FOR UPDATE
USING (
  captain_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- RLS Policies for team_members
CREATE POLICY "Everyone can view team members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Users can join teams" ON public.team_members FOR INSERT
WITH CHECK (
  user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can leave teams" ON public.team_members FOR DELETE
USING (
  user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- RLS Policies for sponsor_referrals
CREATE POLICY "Users can view their own referrals" ON public.sponsor_referrals FOR SELECT
USING (
  user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create their own referrals" ON public.sponsor_referrals FOR INSERT
WITH CHECK (
  user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Insert sample district powers and sponsors
UPDATE public.districts SET 
  power_level = 100,
  special_power = CASE 
    WHEN theme = 'renda_variavel' THEN 'Multiplicador de XP em trading'
    WHEN theme = 'educacao_financeira' THEN 'Bônus de aprendizado'
    WHEN theme = 'criptomoedas' THEN 'Resistência a volatilidade'
    WHEN theme = 'sistema_bancario' THEN 'Proteção contra perdas'
    WHEN theme = 'fundos_imobiliarios' THEN 'Crescimento estável'
    WHEN theme = 'mercado_internacional' THEN 'Diversificação global'
    WHEN theme = 'fintech' THEN 'Inovação tecnológica'
  END,
  sponsor_company = CASE 
    WHEN theme = 'renda_variavel' THEN 'XP Investimentos'
    WHEN theme = 'educacao_financeira' THEN 'Ânima Educação'
    WHEN theme = 'criptomoedas' THEN 'Crypto Valley'
    WHEN theme = 'sistema_bancario' THEN 'Banking Solutions'
    WHEN theme = 'fundos_imobiliarios' THEN 'Real Estate Pro'
    WHEN theme = 'mercado_internacional' THEN 'Global Trade'
    WHEN theme = 'fintech' THEN 'Tech Finance'
  END;