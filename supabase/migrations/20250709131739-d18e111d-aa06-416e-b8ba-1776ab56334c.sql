
-- ========================================
-- FASE 3 - SISTEMA DE GAMIFICAÇÃO AVANÇADA
-- ========================================

-- 1. Sistema de Ligas e Temporadas
CREATE TYPE league_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster');
CREATE TYPE season_status AS ENUM ('active', 'ended', 'upcoming');

CREATE TABLE league_seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status season_status DEFAULT 'upcoming',
    rewards JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE user_leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    season_id UUID NOT NULL REFERENCES league_seasons(id) ON DELETE CASCADE,
    current_tier league_tier DEFAULT 'bronze',
    tier_points INTEGER DEFAULT 0,
    peak_tier league_tier DEFAULT 'bronze',
    promotions_count INTEGER DEFAULT 0,
    demotions_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, season_id)
);

-- 2. Power-ups Aprimorados
CREATE TYPE powerup_category AS ENUM ('offensive', 'defensive', 'utility', 'legendary');
CREATE TYPE powerup_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');

CREATE TABLE advanced_powerups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category powerup_category NOT NULL,
    rarity powerup_rarity DEFAULT 'common',
    effect_data JSONB NOT NULL, -- {type, value, duration, etc}
    crafting_recipe JSONB, -- ingredients needed to craft
    unlock_requirements JSONB DEFAULT '{}',
    is_tradeable BOOLEAN DEFAULT false,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE user_advanced_powerups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    powerup_id UUID NOT NULL REFERENCES advanced_powerups(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    obtained_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Sistema de Combo Avançado
CREATE TYPE combo_type AS ENUM ('perfect_streak', 'speed_demon', 'topic_master', 'accuracy_king', 'endurance_run');

CREATE TABLE combo_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    combo_type combo_type NOT NULL,
    requirements JSONB NOT NULL, -- conditions to achieve
    multiplier NUMERIC DEFAULT 1.0,
    rewards JSONB DEFAULT '{}',
    icon_url TEXT,
    rarity powerup_rarity DEFAULT 'common'
);

CREATE TABLE user_combo_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    combo_achievement_id UUID NOT NULL REFERENCES combo_achievements(id),
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    total_achieved INTEGER DEFAULT 0,
    last_achieved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, combo_achievement_id)
);

-- 4. Sistema de Eventos e Desafios
CREATE TYPE event_type AS ENUM ('tournament', 'challenge', 'boss_battle', 'speedrun', 'community_goal');
CREATE TYPE event_status AS ENUM ('upcoming', 'active', 'ended', 'cancelled');

CREATE TABLE game_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    event_type event_type NOT NULL,
    status event_status DEFAULT 'upcoming',
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    requirements JSONB DEFAULT '{}', -- level, district, etc
    rewards JSONB NOT NULL,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    event_data JSONB DEFAULT '{}', -- specific config per event type
    banner_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE user_event_participation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES game_events(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    progress JSONB DEFAULT '{}',
    final_score INTEGER DEFAULT 0,
    rank_position INTEGER,
    rewards_claimed BOOLEAN DEFAULT false,
    UNIQUE(user_id, event_id)
);

-- 5. Sistema de Loot Personalizado  
CREATE TABLE themed_loot_boxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    theme TEXT NOT NULL, -- crypto, stocks, economics, etc
    rarity powerup_rarity DEFAULT 'common',
    contents JSONB NOT NULL, -- possible items and chances
    preview_items JSONB DEFAULT '[]',
    min_items INTEGER DEFAULT 1,
    max_items INTEGER DEFAULT 3,
    pity_timer INTEGER DEFAULT 10, -- guaranteed rare after X boxes
    seasonal BOOLEAN DEFAULT false,
    available_until TIMESTAMP WITH TIME ZONE,
    image_url TEXT,
    animation_url TEXT
);

CREATE TABLE user_loot_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    loot_box_id UUID NOT NULL REFERENCES themed_loot_boxes(id),
    items_received JSONB NOT NULL,
    pity_count INTEGER DEFAULT 0,
    was_guaranteed_rare BOOLEAN DEFAULT false,
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Sistema de Mentoria e Referência
CREATE TYPE mentorship_status AS ENUM ('pending', 'active', 'completed', 'cancelled');

CREATE TABLE mentorship_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    mentee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status mentorship_status DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    mentor_rating INTEGER CHECK (mentor_rating >= 1 AND mentor_rating <= 5),
    mentee_rating INTEGER CHECK (mentee_rating >= 1 AND mentee_rating <= 5),
    session_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(mentor_id, mentee_id)
);

CREATE TABLE mentoring_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements JSONB NOT NULL, -- what needs to be achieved
    mentor_reward JSONB DEFAULT '{}',
    mentee_reward JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE user_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    referred_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    milestone_rewards_claimed JSONB DEFAULT '[]', -- which milestones claimed
    total_referrer_rewards INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- 7. Personalização Avançada
CREATE TYPE customization_type AS ENUM ('avatar_evolution', 'theme', 'title', 'badge', 'emote');

CREATE TABLE unlockable_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    customization_type customization_type NOT NULL,
    rarity powerup_rarity DEFAULT 'common',
    unlock_requirements JSONB NOT NULL,
    preview_url TEXT,
    data JSONB DEFAULT '{}', -- specific content data
    is_seasonal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE user_customizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES unlockable_content(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_equipped BOOLEAN DEFAULT false,
    UNIQUE(user_id, content_id)
);

CREATE TABLE user_titles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    earned_for TEXT, -- what achievement unlocked this
    rarity powerup_rarity DEFAULT 'common',
    is_active BOOLEAN DEFAULT false,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Analytics Gamificados
CREATE TABLE user_performance_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    analysis_date DATE DEFAULT CURRENT_DATE,
    strengths JSONB DEFAULT '[]', -- strong topics/skills
    weaknesses JSONB DEFAULT '[]', -- areas for improvement  
    study_patterns JSONB DEFAULT '{}', -- when they study, session length, etc
    suggested_improvements JSONB DEFAULT '[]',
    performance_score NUMERIC DEFAULT 0,
    comparative_rank INTEGER, -- among similar level users
    insights_generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, analysis_date)
);

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_leagues_updated_at
    BEFORE UPDATE ON user_leagues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_combo_records_updated_at
    BEFORE UPDATE ON user_combo_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_user_leagues_user_season ON user_leagues(user_id, season_id);
CREATE INDEX idx_user_leagues_tier_points ON user_leagues(current_tier, tier_points DESC);
CREATE INDEX idx_game_events_status_time ON game_events(status, start_time, end_time);
CREATE INDEX idx_user_event_participation_user_event ON user_event_participation(user_id, event_id);
CREATE INDEX idx_user_combo_records_user_achievement ON user_combo_records(user_id, combo_achievement_id);
CREATE INDEX idx_mentorship_relationships_mentor_status ON mentorship_relationships(mentor_id, status);
CREATE INDEX idx_user_customizations_user_equipped ON user_customizations(user_id, is_equipped);

-- RLS Policies
ALTER TABLE league_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE advanced_powerups ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_advanced_powerups ENABLE ROW LEVEL SECURITY;
ALTER TABLE combo_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_combo_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_event_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE themed_loot_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_loot_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentoring_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlockable_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_performance_analytics ENABLE ROW LEVEL SECURITY;

-- Políticas para visualização pública
CREATE POLICY "League seasons are viewable by everyone" ON league_seasons FOR SELECT USING (true);
CREATE POLICY "Advanced powerups are viewable by everyone" ON advanced_powerups FOR SELECT USING (true);
CREATE POLICY "Combo achievements are viewable by everyone" ON combo_achievements FOR SELECT USING (true);
CREATE POLICY "Game events are viewable by everyone" ON game_events FOR SELECT USING (true);
CREATE POLICY "Themed loot boxes are viewable by everyone" ON themed_loot_boxes FOR SELECT USING (true);
CREATE POLICY "Mentoring missions are viewable by everyone" ON mentoring_missions FOR SELECT USING (true);
CREATE POLICY "Unlockable content is viewable by everyone" ON unlockable_content FOR SELECT USING (true);

-- Políticas para dados do usuário
CREATE POLICY "Users can view their own league data" ON user_leagues FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can view their own powerups" ON user_advanced_powerups FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can view their own combo records" ON user_combo_records FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can view their own event participation" ON user_event_participation FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can view their own loot history" ON user_loot_history FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can view their own customizations" ON user_customizations FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can view their own titles" ON user_titles FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can view their own analytics" ON user_performance_analytics FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Políticas para inserção
CREATE POLICY "System can manage league data" ON user_leagues FOR ALL USING (true);
CREATE POLICY "System can manage powerups" ON user_advanced_powerups FOR ALL USING (true);
CREATE POLICY "System can manage combo records" ON user_combo_records FOR ALL USING (true);
CREATE POLICY "Users can join events" ON user_event_participation FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "System can manage loot history" ON user_loot_history FOR ALL USING (true);
CREATE POLICY "System can manage customizations" ON user_customizations FOR ALL USING (true);
CREATE POLICY "System can manage titles" ON user_titles FOR ALL USING (true);
CREATE POLICY "System can manage analytics" ON user_performance_analytics FOR ALL USING (true);

-- Mentorship policies
CREATE POLICY "Users can view mentorship relationships they're part of" ON mentorship_relationships 
FOR SELECT USING (mentor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR mentee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create mentorship relationships" ON mentorship_relationships 
FOR INSERT WITH CHECK (mentor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR mentee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their mentorship relationships" ON mentorship_relationships 
FOR UPDATE USING (mentor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR mentee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Referral policies  
CREATE POLICY "Users can view their referrals" ON user_referrals FOR SELECT USING (referrer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR referred_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can create referrals" ON user_referrals FOR INSERT WITH CHECK (referrer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Funções auxiliares para o sistema de ligas
CREATE OR REPLACE FUNCTION get_current_season()
RETURNS UUID AS $$
DECLARE
    current_season_id UUID;
BEGIN
    SELECT id INTO current_season_id
    FROM league_seasons
    WHERE status = 'active'
    AND now() BETWEEN start_date AND end_date
    ORDER BY start_date DESC
    LIMIT 1;
    
    RETURN current_season_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Função para calcular pontos de liga baseado em performance
CREATE OR REPLACE FUNCTION calculate_league_points(
    p_user_id UUID,
    p_xp_gained INTEGER,
    p_quiz_score INTEGER,
    p_combo_achieved INTEGER DEFAULT 0
)
RETURNS INTEGER AS $$
DECLARE
    base_points INTEGER;
    combo_bonus INTEGER;
    tier_multiplier NUMERIC;
    current_season_id UUID;
BEGIN
    -- Pontos base
    base_points := (p_xp_gained / 10) + p_quiz_score;
    
    -- Bônus de combo
    combo_bonus := CASE 
        WHEN p_combo_achieved >= 20 THEN 50
        WHEN p_combo_achieved >= 10 THEN 25
        WHEN p_combo_achieved >= 5 THEN 10
        ELSE 0
    END;
    
    -- Obter temporada atual
    current_season_id := get_current_season();
    
    IF current_season_id IS NULL THEN
        RETURN base_points + combo_bonus;
    END IF;
    
    -- Multiplicador baseado na liga atual
    SELECT CASE current_tier
        WHEN 'bronze' THEN 1.0
        WHEN 'silver' THEN 1.1
        WHEN 'gold' THEN 1.2
        WHEN 'platinum' THEN 1.3
        WHEN 'diamond' THEN 1.4
        WHEN 'master' THEN 1.5
        WHEN 'grandmaster' THEN 1.6
        ELSE 1.0
    END INTO tier_multiplier
    FROM user_leagues
    WHERE user_id = p_user_id AND season_id = current_season_id;
    
    RETURN FLOOR((base_points + combo_bonus) * COALESCE(tier_multiplier, 1.0));
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar liga do usuário
CREATE OR REPLACE FUNCTION update_user_league(
    p_user_id UUID,
    p_points_gained INTEGER
)
RETURNS JSONB AS $$
DECLARE
    current_season_id UUID;
    current_record RECORD;
    new_tier league_tier;
    promotion BOOLEAN := false;
    demotion BOOLEAN := false;
    result JSONB;
BEGIN
    current_season_id := get_current_season();
    
    IF current_season_id IS NULL THEN
        RETURN jsonb_build_object('error', 'No active season');
    END IF;
    
    -- Buscar ou criar registro da liga
    INSERT INTO user_leagues (user_id, season_id, tier_points)
    VALUES (p_user_id, current_season_id, p_points_gained)
    ON CONFLICT (user_id, season_id)
    DO UPDATE SET 
        tier_points = user_leagues.tier_points + p_points_gained,
        updated_at = now()
    RETURNING * INTO current_record;
    
    -- Determinar nova liga baseada nos pontos
    new_tier := CASE
        WHEN current_record.tier_points >= 5000 THEN 'grandmaster'::league_tier
        WHEN current_record.tier_points >= 3000 THEN 'master'::league_tier
        WHEN current_record.tier_points >= 2000 THEN 'diamond'::league_tier
        WHEN current_record.tier_points >= 1200 THEN 'platinum'::league_tier
        WHEN current_record.tier_points >= 700 THEN 'gold'::league_tier
        WHEN current_record.tier_points >= 300 THEN 'silver'::league_tier
        ELSE 'bronze'::league_tier
    END;
    
    -- Verificar promoção/rebaixamento
    IF new_tier > current_record.current_tier THEN
        promotion := true;
    ELSIF new_tier < current_record.current_tier THEN
        demotion := true;
    END IF;
    
    -- Atualizar liga
    UPDATE user_leagues SET
        current_tier = new_tier,
        peak_tier = GREATEST(peak_tier, new_tier),
        promotions_count = promotions_count + CASE WHEN promotion THEN 1 ELSE 0 END,
        demotions_count = demotions_count + CASE WHEN demotion THEN 1 ELSE 0 END,
        updated_at = now()
    WHERE id = current_record.id;
    
    result := jsonb_build_object(
        'new_tier', new_tier,
        'total_points', current_record.tier_points,
        'promoted', promotion,
        'demoted', demotion,
        'points_gained', p_points_gained
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Dados iniciais
INSERT INTO league_seasons (name, start_date, end_date, status, rewards) VALUES
('Temporada 1 - Lançamento', now(), now() + interval '3 months', 'active', 
 '{"grandmaster": {"beetz": 10000, "powerups": 5, "exclusive_avatar": true}, 
   "master": {"beetz": 5000, "powerups": 3}, 
   "diamond": {"beetz": 2000, "powerups": 2}}');

-- Power-ups avançados iniciais
INSERT INTO advanced_powerups (name, description, category, rarity, effect_data, icon_url) VALUES
('Fire Streak', 'Dobra o XP pelas próximas 10 questões', 'offensive', 'rare', 
 '{"type": "xp_multiplier", "value": 2.0, "duration": 10, "trigger": "questions"}', '🔥'),
('Shield Protector', 'Protege de 1 erro', 'defensive', 'uncommon', 
 '{"type": "error_protection", "value": 1, "duration": 1, "trigger": "error"}', '🛡️'),
('Lightning Strike', 'Resposta automática correta para 3 questões', 'offensive', 'epic', 
 '{"type": "auto_correct", "value": 3, "duration": 3, "trigger": "questions"}', '⚡'),
('Focus Enhancer', 'Aumenta tempo de resposta em 50%', 'utility', 'uncommon', 
 '{"type": "time_bonus", "value": 1.5, "duration": 5, "trigger": "questions"}', '🎯'),
('Diamond Touch', 'Próxima resposta vira combo x3', 'legendary', 'legendary', 
 '{"type": "combo_multiplier", "value": 3.0, "duration": 1, "trigger": "next_answer"}', '💎');

-- Combo achievements iniciais
INSERT INTO combo_achievements (name, description, combo_type, requirements, multiplier, rewards, rarity) VALUES
('Perfect Streak', 'Acerte 20 questões consecutivas', 'perfect_streak', 
 '{"consecutive_correct": 20}', 2.0, '{"xp_bonus": 500, "beetz": 200}', 'rare'),
('Speed Demon', 'Responda 10 questões em menos de 30 segundos', 'speed_demon', 
 '{"questions": 10, "max_time": 30}', 1.5, '{"xp_bonus": 300, "beetz": 150}', 'epic'),
('Topic Master', 'Acerte 15 questões do mesmo tópico', 'topic_master', 
 '{"same_topic": 15}', 1.8, '{"xp_bonus": 400, "beetz": 180}', 'rare'),
('Accuracy King', 'Mantenha 95% de precisão por 50 questões', 'accuracy_king', 
 '{"accuracy": 0.95, "questions": 50}', 2.5, '{"xp_bonus": 750, "beetz": 300}', 'legendary');

-- Evento de exemplo
INSERT INTO game_events (name, description, event_type, status, start_time, end_time, rewards, event_data) VALUES
('Torneio de Lançamento', 'Primeiro torneio oficial do BeetzQuiz!', 'tournament', 'upcoming', 
 now() + interval '1 day', now() + interval '8 days', 
 '{"first": {"beetz": 5000, "title": "Champion"}, "top_10": {"beetz": 1000}}',
 '{"bracket_size": 64, "questions_per_round": 10, "topics": ["crypto", "stocks"]}');

-- Conteúdo desbloqueável inicial
INSERT INTO unlockable_content (name, description, customization_type, rarity, unlock_requirements) VALUES
('Avatar Dourado', 'Avatar especial para mestres', 'avatar_evolution', 'legendary', 
 '{"min_level": 50, "league_tier": "master"}'),
('Tema Crypto', 'Tema visual inspirado em criptomoedas', 'theme', 'epic', 
 '{"crypto_questions_correct": 100}'),
('Mestre Financeiro', 'Título para especialistas', 'title', 'rare', 
 '{"total_xp": 10000, "quiz_completion_rate": 0.9}');

-- Missões de mentoria
INSERT INTO mentoring_missions (name, description, requirements, mentor_reward, mentee_reward) VALUES
('Primeiro Passo', 'Ajude um novato a completar 5 quizzes', 
 '{"mentee_quizzes": 5}', 
 '{"beetz": 500, "xp": 200}', 
 '{"beetz": 200, "xp": 100}'),
('Mestre Dedicado', 'Complete 10 sessões de mentoria', 
 '{"mentoring_sessions": 10}', 
 '{"beetz": 2000, "xp": 800, "title": "Mentor Dedicado"}', 
 '{"beetz": 500, "xp": 300}');
