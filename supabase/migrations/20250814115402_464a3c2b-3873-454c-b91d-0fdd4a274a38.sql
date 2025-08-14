-- Create Battle Royale Sessions table
CREATE TABLE public.battle_royale_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_code TEXT NOT NULL UNIQUE,
  mode TEXT NOT NULL CHECK (mode IN ('solo', 'squad', 'chaos')),
  max_players INTEGER NOT NULL DEFAULT 100,
  current_players INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'starting', 'active', 'finished')),
  current_round INTEGER NOT NULL DEFAULT 1,
  total_rounds INTEGER NOT NULL DEFAULT 10,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  entry_fee INTEGER NOT NULL DEFAULT 100,
  prize_pool INTEGER NOT NULL DEFAULT 0,
  elimination_percentage NUMERIC NOT NULL DEFAULT 0.2,
  question_time_limit INTEGER NOT NULL DEFAULT 30,
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Battle Royale Participants table
CREATE TABLE public.battle_royale_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.battle_royale_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id UUID NULL,
  position INTEGER NULL,
  is_alive BOOLEAN NOT NULL DEFAULT true,
  eliminated_at TIMESTAMP WITH TIME ZONE NULL,
  eliminated_by_round INTEGER NULL,
  total_score INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  response_time_avg NUMERIC NOT NULL DEFAULT 0,
  power_ups_used JSONB NOT NULL DEFAULT '[]'::jsonb,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Create Battle Royale Teams table (for squad mode)
CREATE TABLE public.battle_royale_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.battle_royale_sessions(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  captain_id UUID NOT NULL REFERENCES public.profiles(id),
  is_alive BOOLEAN NOT NULL DEFAULT true,
  team_score INTEGER NOT NULL DEFAULT 0,
  members_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Battle Royale Answers table
CREATE TABLE public.battle_royale_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.battle_royale_sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.battle_royale_participants(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  question_id UUID NOT NULL,
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  response_time_ms INTEGER NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  power_up_used TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Battle Royale Power-ups table
CREATE TABLE public.battle_royale_powerups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  effect_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  cost_points INTEGER NOT NULL DEFAULT 100,
  duration_seconds INTEGER NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.battle_royale_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_royale_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_royale_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_royale_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_royale_powerups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for battle_royale_sessions
CREATE POLICY "Sessions are viewable by everyone" ON public.battle_royale_sessions
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create sessions" ON public.battle_royale_sessions
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "System can update sessions" ON public.battle_royale_sessions
FOR UPDATE USING (true);

-- RLS Policies for battle_royale_participants
CREATE POLICY "Participants can view session participants" ON public.battle_royale_participants
FOR SELECT USING (
  session_id IN (
    SELECT session_id FROM public.battle_royale_participants 
    WHERE user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  ) OR 
  session_id IN (SELECT id FROM public.battle_royale_sessions WHERE status = 'active')
);

CREATE POLICY "Users can join as participants" ON public.battle_royale_participants
FOR INSERT WITH CHECK (
  user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "System can update participants" ON public.battle_royale_participants
FOR UPDATE USING (true);

-- RLS Policies for battle_royale_teams
CREATE POLICY "Teams are viewable by session participants" ON public.battle_royale_teams
FOR SELECT USING (
  session_id IN (
    SELECT session_id FROM public.battle_royale_participants 
    WHERE user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can create teams" ON public.battle_royale_teams
FOR INSERT WITH CHECK (
  captain_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- RLS Policies for battle_royale_answers
CREATE POLICY "Answers are viewable by session participants" ON public.battle_royale_answers
FOR SELECT USING (
  session_id IN (
    SELECT session_id FROM public.battle_royale_participants 
    WHERE user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Participants can submit answers" ON public.battle_royale_answers
FOR INSERT WITH CHECK (
  participant_id IN (
    SELECT id FROM public.battle_royale_participants 
    WHERE user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- RLS Policies for battle_royale_powerups
CREATE POLICY "Power-ups are viewable by everyone" ON public.battle_royale_powerups
FOR SELECT USING (is_active = true);

-- Insert default power-ups
INSERT INTO public.battle_royale_powerups (name, description, effect_data, rarity, cost_points) VALUES
('Time Freeze', 'Ganha 5 segundos extras para responder', '{"extra_time": 5000}', 'common', 100),
('Double Points', 'Próxima resposta correta vale pontos duplos', '{"multiplier": 2}', 'rare', 200),
('Shield', 'Proteção contra eliminação na próxima rodada', '{"protection": true}', 'epic', 300),
('50/50', 'Remove duas alternativas incorretas', '{"remove_wrong": 2}', 'common', 150),
('Lightning', 'Resposta instantânea com pontos máximos', '{"instant_correct": true}', 'legendary', 500);

-- Function to generate session code
CREATE OR REPLACE FUNCTION generate_session_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
BEGIN
  code := 'BR-' || TO_CHAR(NOW(), 'YYYY-MM-DD-') || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0');
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to handle battle royale elimination
CREATE OR REPLACE FUNCTION process_battle_royale_elimination(
  p_session_id UUID,
  p_round_number INTEGER
)
RETURNS JSONB AS $$
DECLARE
  total_alive INTEGER;
  elimination_count INTEGER;
  session_data RECORD;
  eliminated_participants UUID[];
BEGIN
  -- Get session data
  SELECT * INTO session_data 
  FROM public.battle_royale_sessions 
  WHERE id = p_session_id;
  
  -- Count alive participants
  SELECT COUNT(*) INTO total_alive
  FROM public.battle_royale_participants
  WHERE session_id = p_session_id AND is_alive = true;
  
  -- Calculate elimination count based on round
  elimination_count := CASE 
    WHEN p_round_number <= 3 THEN FLOOR(total_alive * 0.2)
    WHEN p_round_number <= 6 THEN FLOOR(total_alive * 0.25)
    WHEN p_round_number <= 8 THEN FLOOR(total_alive * 0.3)
    WHEN p_round_number = 9 THEN FLOOR(total_alive * 0.4)
    ELSE 0
  END;
  
  -- Don't eliminate if less than 3 players remaining
  IF total_alive <= 3 THEN
    elimination_count := 0;
  END IF;
  
  -- Get participants to eliminate (worst performers this round)
  WITH round_performance AS (
    SELECT 
      bp.id,
      bp.user_id,
      COALESCE(SUM(CASE WHEN bra.is_correct THEN 1 ELSE 0 END), 0) as correct_this_round,
      COALESCE(AVG(bra.response_time_ms), 999999) as avg_response_time
    FROM public.battle_royale_participants bp
    LEFT JOIN public.battle_royale_answers bra ON bp.id = bra.participant_id 
      AND bra.round_number = p_round_number
    WHERE bp.session_id = p_session_id AND bp.is_alive = true
    GROUP BY bp.id, bp.user_id
    ORDER BY correct_this_round ASC, avg_response_time DESC
    LIMIT elimination_count
  )
  SELECT ARRAY_AGG(id) INTO eliminated_participants
  FROM round_performance;
  
  -- Eliminate participants
  IF eliminated_participants IS NOT NULL THEN
    UPDATE public.battle_royale_participants
    SET 
      is_alive = false,
      eliminated_at = now(),
      eliminated_by_round = p_round_number
    WHERE id = ANY(eliminated_participants);
  END IF;
  
  RETURN jsonb_build_object(
    'eliminated_count', elimination_count,
    'remaining_players', total_alive - COALESCE(array_length(eliminated_participants, 1), 0),
    'eliminated_participants', COALESCE(eliminated_participants, ARRAY[]::UUID[])
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate battle royale rewards
CREATE OR REPLACE FUNCTION calculate_battle_royale_rewards(
  p_session_id UUID
)
RETURNS VOID AS $$
DECLARE
  participant RECORD;
  reward_xp INTEGER;
  reward_beetz INTEGER;
BEGIN
  FOR participant IN 
    SELECT bp.*, p.user_id as auth_user_id
    FROM public.battle_royale_participants bp
    JOIN public.profiles p ON bp.user_id = p.id
    WHERE bp.session_id = p_session_id
    ORDER BY bp.position ASC NULLS LAST
  LOOP
    -- Calculate rewards based on position
    reward_xp := CASE 
      WHEN participant.position = 1 THEN 1000
      WHEN participant.position = 2 THEN 750
      WHEN participant.position = 3 THEN 500
      WHEN participant.position <= 10 THEN 250
      ELSE 50
    END;
    
    reward_beetz := CASE 
      WHEN participant.position = 1 THEN 2000
      WHEN participant.position = 2 THEN 1500
      WHEN participant.position = 3 THEN 1000
      WHEN participant.position <= 10 THEN 500
      ELSE 100
    END;
    
    -- Award XP and Beetz
    PERFORM award_xp(participant.user_id, reward_xp, 'battle_royale');
    
    UPDATE public.profiles 
    SET points = points + reward_beetz
    WHERE id = participant.user_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_battle_royale_sessions_updated_at
  BEFORE UPDATE ON public.battle_royale_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();