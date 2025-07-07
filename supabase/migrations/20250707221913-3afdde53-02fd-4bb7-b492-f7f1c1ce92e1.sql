-- Create power-ups system
CREATE TABLE IF NOT EXISTS power_ups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'eliminate_option', 'extra_time', 'review_answer', 'combo_multiplier'
  effect_value INTEGER NOT NULL DEFAULT 1,
  rarity TEXT NOT NULL DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  price INTEGER NOT NULL DEFAULT 100,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user power-ups inventory
CREATE TABLE IF NOT EXISTS user_power_ups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  power_up_id UUID NOT NULL REFERENCES power_ups(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  acquired_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create loot system
CREATE TABLE IF NOT EXISTS loot_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'data_shard', 'cyber_artifact', 'memory_chip'
  rarity TEXT NOT NULL DEFAULT 'common',
  image_url TEXT,
  lore_text TEXT,
  effect_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user loot collection
CREATE TABLE IF NOT EXISTS user_loot (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  loot_item_id UUID NOT NULL REFERENCES loot_items(id),
  acquired_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT -- 'quiz_performance', 'streak_reward', 'event'
);

-- Create quiz sessions with enhanced tracking
ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS combo_count INTEGER DEFAULT 0;
ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS max_combo INTEGER DEFAULT 0;
ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS power_ups_used JSONB DEFAULT '[]';
ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS loot_earned JSONB DEFAULT '[]';
ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS performance_score NUMERIC DEFAULT 0;

-- Create user progress tracking for specializations
CREATE TABLE IF NOT EXISTS user_specializations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  specialization_type TEXT NOT NULL, -- 'defi_master', 'trading_ninja', 'crypto_analyst', etc.
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create achievement system
CREATE TABLE IF NOT EXISTS achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL, -- 'streak', 'performance', 'collection', 'social'
  requirement_data JSONB NOT NULL, -- stores requirements like streak_days, score_threshold, etc.
  reward_data JSONB DEFAULT '{}', -- rewards like xp, beetz, items
  badge_icon TEXT,
  rarity TEXT NOT NULL DEFAULT 'common',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES achievements(id),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress_data JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE power_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_power_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE loot_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_loot ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for power_ups
CREATE POLICY "Power-ups are viewable by everyone" ON power_ups FOR SELECT USING (true);

-- Create policies for user_power_ups
CREATE POLICY "Users can view their own power-ups" ON user_power_ups FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own power-ups" ON user_power_ups FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own power-ups" ON user_power_ups FOR UPDATE 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create policies for loot_items
CREATE POLICY "Loot items are viewable by everyone" ON loot_items FOR SELECT USING (true);

-- Create policies for user_loot
CREATE POLICY "Users can view their own loot" ON user_loot FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own loot" ON user_loot FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create policies for user_specializations
CREATE POLICY "Users can view their own specializations" ON user_specializations FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own specializations" ON user_specializations FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own specializations" ON user_specializations FOR UPDATE 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create policies for achievements
CREATE POLICY "Achievements are viewable by everyone" ON achievements FOR SELECT USING (true);

-- Create policies for user_achievements
CREATE POLICY "Users can view their own achievements" ON user_achievements FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own achievements" ON user_achievements FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Insert sample power-ups
INSERT INTO power_ups (name, description, type, effect_value, rarity, price, image_url) VALUES
('Neural Scanner', 'Elimina 2 opções incorretas', 'eliminate_option', 2, 'common', 50, '/lovable-uploads/neural-scanner.jpg'),
('Time Dilator', 'Adiciona 30 segundos extras', 'extra_time', 30, 'rare', 100, '/lovable-uploads/time-dilator.jpg'),
('Memory Buffer', 'Permite revisar a última resposta', 'review_answer', 1, 'epic', 200, '/lovable-uploads/memory-buffer.jpg'),
('Combo Amplifier', 'Multiplica combo por 2x', 'combo_multiplier', 2, 'legendary', 500, '/lovable-uploads/combo-amplifier.jpg');

-- Insert sample loot items
INSERT INTO loot_items (name, description, type, rarity, lore_text) VALUES
('Data Shard Alpha', 'Fragmento de dados corporativos', 'data_shard', 'common', 'Contém informações sobre transações suspeitas da MegaCorp'),
('Quantum Key', 'Chave de acesso cybernético', 'cyber_artifact', 'rare', 'Abre portais dimensionais para dados ocultos'),
('Satoshi Memory Chip', 'Memória do próprio Satoshi', 'memory_chip', 'legendary', 'Contém a sabedoria ancestral do criador do Bitcoin');

-- Insert sample achievements
INSERT INTO achievements (name, description, type, requirement_data, reward_data, rarity) VALUES
('Data Hunter', 'Complete 10 quizzes', 'performance', '{"quizzes_completed": 10}', '{"xp": 500, "beetz": 100}', 'common'),
('Combo Master', 'Alcance combo de 10', 'performance', '{"max_combo": 10}', '{"xp": 1000, "power_up": "combo_amplifier"}', 'rare'),
('Satoshi''s Heir', 'Complete 100 quizzes perfeitos', 'performance', '{"perfect_quizzes": 100}', '{"xp": 10000, "title": "Heir of Satoshi"}', 'legendary'),
('Cyber Streak', 'Mantenha streak de 30 dias', 'streak', '{"streak_days": 30}', '{"xp": 5000, "skin": "neon_matrix"}', 'epic');