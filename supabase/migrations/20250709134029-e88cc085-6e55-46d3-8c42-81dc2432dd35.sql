-- League seasons and user leagues
CREATE TYPE public.league_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster');
CREATE TYPE public.season_status AS ENUM ('upcoming', 'active', 'ended');

CREATE TABLE public.league_seasons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status public.season_status NOT NULL DEFAULT 'upcoming',
  rewards JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_leagues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  season_id UUID NOT NULL REFERENCES public.league_seasons(id),
  current_tier public.league_tier NOT NULL DEFAULT 'bronze',
  tier_points INTEGER NOT NULL DEFAULT 0,
  promotion_count INTEGER DEFAULT 0,
  demotion_count INTEGER DEFAULT 0,
  peak_tier public.league_tier DEFAULT 'bronze',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, season_id)
);

-- Power-ups and combo achievements
CREATE TYPE public.powerup_category AS ENUM ('xp_boost', 'score_multiplier', 'time_extension', 'hint_reveal', 'streak_protection');
CREATE TYPE public.powerup_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');

CREATE TABLE public.advanced_powerups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category public.powerup_category NOT NULL,
  rarity public.powerup_rarity NOT NULL DEFAULT 'common',
  effects JSONB NOT NULL DEFAULT '{}',
  duration_minutes INTEGER DEFAULT 60,
  cooldown_minutes INTEGER DEFAULT 0,
  max_uses_per_day INTEGER DEFAULT 3,
  crafting_recipe JSONB DEFAULT '{}',
  unlock_requirements JSONB DEFAULT '{}',
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_advanced_powerups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  powerup_id UUID NOT NULL REFERENCES public.advanced_powerups(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE,
  uses_today INTEGER DEFAULT 0,
  acquired_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, powerup_id)
);

CREATE TYPE public.combo_type AS ENUM ('perfect_streak', 'speed_demon', 'knowledge_master', 'quiz_dominator');

CREATE TABLE public.combo_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  combo_type public.combo_type NOT NULL,
  target_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 100,
  beetz_reward INTEGER DEFAULT 200,
  powerup_reward UUID REFERENCES public.advanced_powerups(id),
  badge_icon TEXT,
  rarity public.powerup_rarity DEFAULT 'common',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_combo_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  combo_achievement_id UUID NOT NULL REFERENCES public.combo_achievements(id),
  current_value INTEGER DEFAULT 0,
  best_value INTEGER DEFAULT 0,
  achieved_at TIMESTAMP WITH TIME ZONE,
  total_completions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, combo_achievement_id)
);

-- Events, loot boxes, and mentorship
CREATE TYPE public.event_type AS ENUM ('quiz_marathon', 'duel_tournament', 'knowledge_race', 'community_challenge');
CREATE TYPE public.event_status AS ENUM ('upcoming', 'active', 'completed', 'cancelled');

CREATE TABLE public.game_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  event_type public.event_type NOT NULL,
  status public.event_status NOT NULL DEFAULT 'upcoming',
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  entry_requirements JSONB DEFAULT '{}',
  rewards JSONB DEFAULT '{}',
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  event_data JSONB DEFAULT '{}',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_event_participation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID NOT NULL REFERENCES public.game_events(id),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  score INTEGER DEFAULT 0,
  rank INTEGER,
  completion_data JSONB DEFAULT '{}',
  rewards_claimed BOOLEAN DEFAULT false,
  UNIQUE(user_id, event_id)
);

CREATE TABLE public.themed_loot_boxes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  theme TEXT NOT NULL,
  rarity public.powerup_rarity NOT NULL DEFAULT 'common',
  contents JSONB NOT NULL DEFAULT '[]',
  min_items INTEGER DEFAULT 1,
  max_items INTEGER DEFAULT 3,
  cost_beetz INTEGER DEFAULT 0,
  cost_real_money DECIMAL(10,2) DEFAULT 0,
  unlock_requirements JSONB DEFAULT '{}',
  animation_url TEXT,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_loot_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  loot_box_id UUID NOT NULL REFERENCES public.themed_loot_boxes(id),
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  items_received JSONB NOT NULL DEFAULT '[]',
  source TEXT DEFAULT 'purchase'
);

CREATE TYPE public.mentorship_status AS ENUM ('pending', 'active', 'completed', 'cancelled');

CREATE TABLE public.mentorship_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL,
  mentee_id UUID NOT NULL,
  status public.mentorship_status NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  goals JSONB DEFAULT '[]',
  progress JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(mentor_id, mentee_id)
);

CREATE TABLE public.mentoring_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  difficulty_level INTEGER DEFAULT 1,
  target_audience TEXT DEFAULT 'beginner',
  estimated_duration_minutes INTEGER DEFAULT 30,
  learning_objectives JSONB DEFAULT '[]',
  success_criteria JSONB DEFAULT '{}',
  rewards JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Referrals, customization, and analytics
CREATE TABLE public.user_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  rewards_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  claimed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(referrer_id, referred_id)
);

CREATE TYPE public.customization_type AS ENUM ('avatar_skin', 'profile_theme', 'ui_effect', 'sound_pack', 'emote');

CREATE TABLE public.unlockable_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  customization_type public.customization_type NOT NULL,
  rarity public.powerup_rarity NOT NULL DEFAULT 'common',
  unlock_requirements JSONB DEFAULT '{}',
  preview_url TEXT,
  asset_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  cost_beetz INTEGER DEFAULT 0,
  cost_real_money DECIMAL(10,2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_customizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID NOT NULL REFERENCES public.unlockable_content(id),
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_equipped BOOLEAN DEFAULT false,
  UNIQUE(user_id, content_id)
);

CREATE TABLE public.user_titles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  requirements_met JSONB DEFAULT '{}',
  rarity public.powerup_rarity DEFAULT 'common',
  is_active BOOLEAN DEFAULT false,
  UNIQUE(user_id, title)
);

CREATE TABLE public.user_performance_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_study_time_minutes INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  average_response_time_ms INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  powerups_used INTEGER DEFAULT 0,
  achievements_earned INTEGER DEFAULT 0,
  social_interactions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, metric_date)
);

-- Triggers for updated_at columns
CREATE TRIGGER update_league_seasons_updated_at
  BEFORE UPDATE ON public.league_seasons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_leagues_updated_at
  BEFORE UPDATE ON public.user_leagues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advanced_powerups_updated_at
  BEFORE UPDATE ON public.advanced_powerups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_combo_records_updated_at
  BEFORE UPDATE ON public.user_combo_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_game_events_updated_at
  BEFORE UPDATE ON public.game_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_themed_loot_boxes_updated_at
  BEFORE UPDATE ON public.themed_loot_boxes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentorship_relationships_updated_at
  BEFORE UPDATE ON public.mentorship_relationships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentoring_missions_updated_at
  BEFORE UPDATE ON public.mentoring_missions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_unlockable_content_updated_at
  BEFORE UPDATE ON public.unlockable_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_performance_analytics_updated_at
  BEFORE UPDATE ON public.user_performance_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_user_leagues_user_season ON public.user_leagues(user_id, season_id);
CREATE INDEX idx_user_leagues_tier_points ON public.user_leagues(current_tier, tier_points DESC);
CREATE INDEX idx_user_advanced_powerups_user ON public.user_advanced_powerups(user_id);
CREATE INDEX idx_user_combo_records_user ON public.user_combo_records(user_id);
CREATE INDEX idx_game_events_status_start ON public.game_events(status, start_time);
CREATE INDEX idx_user_event_participation_user ON public.user_event_participation(user_id);
CREATE INDEX idx_user_loot_history_user ON public.user_loot_history(user_id);
CREATE INDEX idx_mentorship_relationships_mentor ON public.mentorship_relationships(mentor_id);
CREATE INDEX idx_mentorship_relationships_mentee ON public.mentorship_relationships(mentee_id);
CREATE INDEX idx_user_performance_analytics_user_date ON public.user_performance_analytics(user_id, metric_date);

-- Enable RLS
ALTER TABLE public.league_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advanced_powerups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_advanced_powerups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combo_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_combo_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_event_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themed_loot_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_loot_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentoring_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unlockable_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_performance_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "League seasons are viewable by everyone" ON public.league_seasons FOR SELECT USING (true);

CREATE POLICY "Users can view their own league data" ON public.user_leagues FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can manage user leagues" ON public.user_leagues FOR ALL 
USING (true);

CREATE POLICY "Power-ups are viewable by everyone" ON public.advanced_powerups FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own power-ups" ON public.user_advanced_powerups FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their own power-ups" ON public.user_advanced_powerups FOR ALL 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Combo achievements are viewable by everyone" ON public.combo_achievements FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own combo records" ON public.user_combo_records FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can manage combo records" ON public.user_combo_records FOR ALL USING (true);

CREATE POLICY "Active events are viewable by everyone" ON public.game_events FOR SELECT USING (true);

CREATE POLICY "Users can view their event participation" ON public.user_event_participation FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can join events" ON public.user_event_participation FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Available loot boxes are viewable by everyone" ON public.themed_loot_boxes FOR SELECT USING (is_available = true);

CREATE POLICY "Users can view their loot history" ON public.user_loot_history FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their mentorship relationships" ON public.mentorship_relationships FOR SELECT 
USING (mentor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR 
       mentee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Mentoring missions are viewable by everyone" ON public.mentoring_missions FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their referrals" ON public.user_referrals FOR SELECT 
USING (referrer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR 
       referred_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Unlockable content is viewable by everyone" ON public.unlockable_content FOR SELECT USING (is_available = true);

CREATE POLICY "Users can view their customizations" ON public.user_customizations FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their titles" ON public.user_titles FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their performance analytics" ON public.user_performance_analytics FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Helper functions
CREATE OR REPLACE FUNCTION public.get_current_season()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT id FROM public.league_seasons 
  WHERE status = 'active' 
  ORDER BY start_date DESC 
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.calculate_league_points(
  p_user_id UUID,
  p_xp_gained INTEGER,
  p_quiz_score INTEGER,
  p_combo_achieved INTEGER DEFAULT 0
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  base_points INTEGER;
  combo_bonus INTEGER;
  streak_multiplier DECIMAL;
  user_streak INTEGER;
BEGIN
  -- Base points calculation
  base_points := p_xp_gained + (p_quiz_score * 2);
  
  -- Combo bonus
  combo_bonus := p_combo_achieved * 10;
  
  -- Get user streak for multiplier
  SELECT COALESCE(streak, 0) INTO user_streak
  FROM profiles WHERE id = p_user_id;
  
  -- Streak multiplier (up to 1.5x for 30+ day streak)
  streak_multiplier := 1.0 + LEAST(user_streak * 0.02, 0.5);
  
  RETURN FLOOR((base_points + combo_bonus) * streak_multiplier);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_league(
  p_user_id UUID,
  p_points_gained INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_season_id UUID;
  user_league RECORD;
  new_points INTEGER;
  new_tier public.league_tier;
  tier_changed BOOLEAN := false;
  promotion BOOLEAN := false;
  demotion BOOLEAN := false;
  result JSONB;
BEGIN
  -- Get current active season
  SELECT get_current_season() INTO current_season_id;
  
  IF current_season_id IS NULL THEN
    RETURN jsonb_build_object('error', 'No active season found');
  END IF;
  
  -- Get or create user league entry
  INSERT INTO public.user_leagues (user_id, season_id)
  VALUES (p_user_id, current_season_id)
  ON CONFLICT (user_id, season_id) DO NOTHING;
  
  -- Get current league data
  SELECT * INTO user_league
  FROM public.user_leagues
  WHERE user_id = p_user_id AND season_id = current_season_id;
  
  -- Calculate new points
  new_points := user_league.tier_points + p_points_gained;
  new_tier := user_league.current_tier;
  
  -- Tier progression logic
  CASE user_league.current_tier
    WHEN 'bronze' THEN
      IF new_points >= 1000 THEN
        new_tier := 'silver';
        tier_changed := true;
        promotion := true;
      END IF;
    WHEN 'silver' THEN
      IF new_points >= 2000 THEN
        new_tier := 'gold';
        tier_changed := true;
        promotion := true;
      ELSIF new_points < 800 THEN
        new_tier := 'bronze';
        tier_changed := true;
        demotion := true;
      END IF;
    WHEN 'gold' THEN
      IF new_points >= 3500 THEN
        new_tier := 'platinum';
        tier_changed := true;
        promotion := true;
      ELSIF new_points < 1800 THEN
        new_tier := 'silver';
        tier_changed := true;
        demotion := true;
      END IF;
    WHEN 'platinum' THEN
      IF new_points >= 5000 THEN
        new_tier := 'diamond';
        tier_changed := true;
        promotion := true;
      ELSIF new_points < 3000 THEN
        new_tier := 'gold';
        tier_changed := true;
        demotion := true;
      END IF;
    WHEN 'diamond' THEN
      IF new_points >= 7500 THEN
        new_tier := 'master';
        tier_changed := true;
        promotion := true;
      ELSIF new_points < 4500 THEN
        new_tier := 'platinum';
        tier_changed := true;
        demotion := true;
      END IF;
    WHEN 'master' THEN
      IF new_points >= 10000 THEN
        new_tier := 'grandmaster';
        tier_changed := true;
        promotion := true;
      ELSIF new_points < 7000 THEN
        new_tier := 'diamond';
        tier_changed := true;
        demotion := true;
      END IF;
    WHEN 'grandmaster' THEN
      IF new_points < 9500 THEN
        new_tier := 'master';
        tier_changed := true;
        demotion := true;
      END IF;
  END CASE;
  
  -- Update user league
  UPDATE public.user_leagues
  SET 
    tier_points = new_points,
    current_tier = new_tier,
    promotion_count = promotion_count + CASE WHEN promotion THEN 1 ELSE 0 END,
    demotion_count = demotion_count + CASE WHEN demotion THEN 1 ELSE 0 END,
    peak_tier = CASE 
      WHEN new_tier::text > peak_tier::text THEN new_tier 
      ELSE peak_tier 
    END,
    updated_at = now()
  WHERE user_id = p_user_id AND season_id = current_season_id;
  
  -- Build result
  result := jsonb_build_object(
    'tier_points', new_points,
    'current_tier', new_tier,
    'tier_changed', tier_changed,
    'promoted', promotion,
    'demoted', demotion,
    'points_gained', p_points_gained
  );
  
  RETURN result;
END;
$$;

-- Insert initial data
INSERT INTO public.league_seasons (season_number, name, start_date, end_date, status) VALUES
(1, 'Primeira Temporada', '2024-01-01', '2024-03-31', 'active'),
(2, 'Temporada de Primavera', '2024-04-01', '2024-06-30', 'upcoming');

-- Insert sample power-ups
INSERT INTO public.advanced_powerups (name, description, category, rarity, effects) VALUES
('Boost de XP Duplo', 'Dobra o XP ganho por 30 minutos', 'xp_boost', 'common', '{"multiplier": 2, "duration": 30}'),
('Multiplicador de Pontos', 'Triplica os pontos de quiz por 15 minutos', 'score_multiplier', 'rare', '{"multiplier": 3, "duration": 15}'),
('Proteção de Sequência', 'Protege sua sequência de uma resposta errada', 'streak_protection', 'epic', '{"protection_count": 1}'),
('Revelador de Dicas', 'Revela dicas extras em 5 perguntas', 'hint_reveal', 'legendary', '{"hint_count": 5, "extra_hints": 2}');

-- Insert combo achievements
INSERT INTO public.combo_achievements (name, description, combo_type, target_value, xp_reward, beetz_reward) VALUES
('Sequência Perfeita', 'Acerte 10 perguntas consecutivas', 'perfect_streak', 10, 200, 400),
('Velocista', 'Responda 20 perguntas em menos de 5 segundos cada', 'speed_demon', 20, 300, 600),
('Mestre do Conhecimento', 'Mantenha 95% de acerto em 50 perguntas', 'knowledge_master', 50, 500, 1000),
('Dominador de Quiz', 'Complete 5 quizzes com pontuação máxima', 'quiz_dominator', 5, 400, 800);

-- Insert sample events
INSERT INTO public.game_events (name, description, event_type, status, start_time, end_time, rewards) VALUES
('Maratona de Finanças', 'Quiz intensivo sobre mercado financeiro', 'quiz_marathon', 'upcoming', now() + interval '1 day', now() + interval '3 days', '{"first": 5000, "second": 3000, "third": 1500}'),
('Torneio de Duelos', 'Competição eliminatória entre jogadores', 'duel_tournament', 'upcoming', now() + interval '1 week', now() + interval '10 days', '{"winner": 10000, "finalist": 5000}');

-- Insert loot boxes
INSERT INTO public.themed_loot_boxes (name, description, theme, rarity, contents, cost_beetz) VALUES
('Caixa do Novato', 'Itens essenciais para iniciantes', 'beginner', 'common', '[{"type": "xp_boost", "chance": 0.7}, {"type": "beetz", "min": 100, "max": 300, "chance": 0.9}]', 500),
('Caixa Premium', 'Itens raros e valiosos', 'premium', 'epic', '[{"type": "powerup", "rarity": "rare", "chance": 0.5}, {"type": "customization", "chance": 0.3}]', 2000);

-- Insert mentoring missions
INSERT INTO public.mentoring_missions (title, description, learning_objectives, rewards) VALUES
('Introdução ao Bitcoin', 'Ensine os conceitos básicos de criptomoedas', '["blockchain", "wallet", "mining"]', '{"xp": 500, "beetz": 1000}'),
('Análise Técnica', 'Demonstre como analisar gráficos de preços', '["candlesticks", "indicators", "trends"]', '{"xp": 800, "beetz": 1500}');

-- Insert unlockable content
INSERT INTO public.unlockable_content (name, description, customization_type, rarity, cost_beetz) VALUES
('Avatar Dourado', 'Skin dourada exclusiva para o avatar', 'avatar_skin', 'legendary', 5000),
('Tema Neon', 'Interface com cores neon vibrantes', 'profile_theme', 'epic', 3000),
('Pack de Sons Futuristas', 'Efeitos sonoros temáticos', 'sound_pack', 'rare', 1500);