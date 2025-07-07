-- Create tournaments table
CREATE TABLE public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  theme TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'finished')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER DEFAULT 100,
  entry_fee INTEGER DEFAULT 0,
  prize_pool INTEGER DEFAULT 1000,
  trophy_image_url TEXT,
  trophy_name TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'legendary')),
  category TEXT NOT NULL DEFAULT 'financial',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tournament participants table
CREATE TABLE public.tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  rank INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  prize_won INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);

-- Create tournament rewards table
CREATE TABLE public.tournament_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  rank_position INTEGER NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('trophy', 'badge', 'beetz', 'xp')),
  reward_value TEXT NOT NULL,
  reward_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tournaments
CREATE POLICY "Tournaments are viewable by everyone" 
ON public.tournaments FOR SELECT 
USING (true);

-- RLS Policies for tournament participants
CREATE POLICY "Users can view tournament participants" 
ON public.tournament_participants FOR SELECT 
USING (true);

CREATE POLICY "Users can join tournaments" 
ON public.tournament_participants FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their participation" 
ON public.tournament_participants FOR UPDATE 
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for tournament rewards
CREATE POLICY "Tournament rewards are viewable by everyone" 
ON public.tournament_rewards FOR SELECT 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON public.tournaments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert epic tournaments data
INSERT INTO public.tournaments (name, description, theme, status, start_date, end_date, max_participants, prize_pool, trophy_image_url, trophy_name, difficulty, category) VALUES
('Neural Network Championship', 'Domine os algoritmos de IA e machine learning neste torneio épico de conhecimento tecnológico', 'neural', 'active', NOW() + INTERVAL '1 hour', NOW() + INTERVAL '7 days', 150, 5000, '/src/assets/trophies/neural-crown.jpg', 'Neural Crown', 'legendary', 'technology'),
('Quantum Trading Wars', 'Batalha suprema de estratégias de investimento usando análises quânticas avançadas', 'quantum', 'active', NOW() + INTERVAL '30 minutes', NOW() + INTERVAL '5 days', 200, 3000, '/src/assets/trophies/quantum-sphere.jpg', 'Quantum Sphere', 'hard', 'trading'),
('Crypto Genesis Tournament', 'O torneio definitivo de conhecimento em criptomoedas e blockchain', 'crypto', 'upcoming', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '10 days', 300, 4000, '/src/assets/trophies/genesis-crystal.jpg', 'Genesis Crystal', 'hard', 'cryptocurrency'),
('Digital Empire Conquest', 'Construa o império financeiro mais poderoso através de estratégias de portfólio', 'empire', 'upcoming', NOW() + INTERVAL '6 hours', NOW() + INTERVAL '14 days', 100, 8000, '/src/assets/trophies/empire-throne.jpg', 'Empire Throne', 'legendary', 'portfolio'),
('Matrix Financial Protocol', 'O desafio supremo multi-disciplinar que testará todos os seus conhecimentos', 'matrix', 'upcoming', NOW() + INTERVAL '1 day', NOW() + INTERVAL '21 days', 50, 10000, '/src/assets/trophies/matrix-core.jpg', 'Matrix Core', 'legendary', 'comprehensive');

-- Insert tournament rewards for trophies
INSERT INTO public.tournament_rewards (tournament_id, rank_position, reward_type, reward_value, reward_image_url) 
SELECT 
  t.id,
  1,
  'trophy',
  t.trophy_name,
  t.trophy_image_url
FROM public.tournaments t;

-- Insert badges for top 3 positions
WITH tournament_badges AS (
  SELECT 
    id as tournament_id,
    UNNEST(ARRAY[1, 2, 3]) as rank_pos,
    UNNEST(ARRAY['Elite Champion', 'Silver Warrior', 'Bronze Fighter']) as badge_name
  FROM public.tournaments
)
INSERT INTO public.tournament_rewards (tournament_id, rank_position, reward_type, reward_value, reward_image_url)
SELECT 
  tournament_id,
  rank_pos,
  'badge',
  badge_name,
  '/src/assets/badges/elite-trader.jpg'
FROM tournament_badges;