-- Create daily missions system
CREATE TABLE public.daily_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('quiz', 'streak', 'social', 'shop', 'exploration')),
  mission_type TEXT NOT NULL,
  target_value INTEGER NOT NULL DEFAULT 1,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  beetz_reward INTEGER NOT NULL DEFAULT 100,
  difficulty TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_weekend_special BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

-- Create user mission progress tracking
CREATE TABLE public.user_mission_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mission_id UUID NOT NULL REFERENCES public.daily_missions(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, mission_id)
);

-- Create loot boxes system
CREATE TABLE public.loot_boxes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  contents JSONB NOT NULL DEFAULT '[]',
  image_url TEXT,
  animation_url TEXT,
  min_items INTEGER NOT NULL DEFAULT 1,
  max_items INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user loot boxes inventory
CREATE TABLE public.user_loot_boxes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  loot_box_id UUID NOT NULL REFERENCES public.loot_boxes(id) ON DELETE CASCADE,
  opened BOOLEAN NOT NULL DEFAULT false,
  opened_at TIMESTAMP WITH TIME ZONE,
  items_received JSONB,
  source TEXT NOT NULL DEFAULT 'daily_reward',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leagues system
CREATE TABLE public.leagues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tier INTEGER NOT NULL UNIQUE,
  min_points INTEGER NOT NULL,
  max_points INTEGER,
  color_primary TEXT NOT NULL,
  color_secondary TEXT NOT NULL,
  icon TEXT,
  rewards JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weekly leaderboards
CREATE TABLE public.weekly_leaderboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start_date DATE NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  quiz_score INTEGER NOT NULL DEFAULT 0,
  duels_won INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  total_score INTEGER NOT NULL DEFAULT 0,
  rank_position INTEGER,
  league_id UUID REFERENCES public.leagues(id),
  rewards_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start_date)
);

-- Create user achievements for mission combos
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_name)
);

-- Enable RLS on all tables
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loot_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_loot_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Daily missions are viewable by everyone" 
ON public.daily_missions FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their mission progress" 
ON public.user_mission_progress FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their mission progress" 
ON public.user_mission_progress FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their mission progress" 
ON public.user_mission_progress FOR UPDATE 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Loot boxes are viewable by everyone" 
ON public.loot_boxes FOR SELECT USING (true);

CREATE POLICY "Users can view their loot boxes" 
ON public.user_loot_boxes FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their loot boxes" 
ON public.user_loot_boxes FOR UPDATE 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Leagues are viewable by everyone" 
ON public.leagues FOR SELECT USING (true);

CREATE POLICY "Leaderboards are viewable by everyone" 
ON public.weekly_leaderboards FOR SELECT USING (true);

CREATE POLICY "Users can insert their leaderboard data" 
ON public.weekly_leaderboards FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their leaderboard data" 
ON public.weekly_leaderboards FOR UPDATE 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their achievements" 
ON public.user_achievements FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their achievements" 
ON public.user_achievements FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Insert default leagues
INSERT INTO public.leagues (name, tier, min_points, max_points, color_primary, color_secondary, icon) VALUES
('Bronze', 1, 0, 999, '#CD7F32', '#A0522D', '🥉'),
('Prata', 2, 1000, 2499, '#C0C0C0', '#A8A8A8', '🥈'),
('Ouro', 3, 2500, 4999, '#FFD700', '#FFA500', '🥇'),
('Diamante', 4, 5000, 9999, '#B9F2FF', '#87CEEB', '💎'),
('Mestre', 5, 10000, 19999, '#800080', '#9370DB', '👑'),
('Grão-Mestre', 6, 20000, NULL, '#FF6B6B', '#FF4757', '🔥');

-- Insert default loot boxes
INSERT INTO public.loot_boxes (name, description, rarity, contents, min_items, max_items) VALUES
('Caixa Iniciante', 'Recompensas básicas para novos jogadores', 'common', 
'[{"type": "beetz", "min": 50, "max": 150, "chance": 0.8}, {"type": "xp", "min": 25, "max": 75, "chance": 0.7}, {"type": "boost", "duration": 1, "chance": 0.1}]', 
1, 2),

('Caixa Diária', 'Recompensas diárias para jogadores ativos', 'common', 
'[{"type": "beetz", "min": 100, "max": 300, "chance": 0.9}, {"type": "xp", "min": 50, "max": 150, "chance": 0.6}, {"type": "avatar_accessory", "rarity": "common", "chance": 0.15}]', 
2, 3),

('Caixa Rara', 'Itens especiais para conquistas importantes', 'rare', 
'[{"type": "beetz", "min": 300, "max": 800, "chance": 0.95}, {"type": "xp_multiplier", "value": 2, "duration": 24, "chance": 0.3}, {"type": "avatar_skin", "rarity": "rare", "chance": 0.25}]', 
2, 4),

('Caixa Épica', 'Recompensas épicas para grandes conquistas', 'epic', 
'[{"type": "beetz", "min": 800, "max": 2000, "chance": 1.0}, {"type": "xp_multiplier", "value": 3, "duration": 48, "chance": 0.5}, {"type": "avatar", "rarity": "epic", "chance": 0.3}]', 
3, 5),

('Caixa Lendária', 'Os tesouros mais raros do jogo', 'legendary', 
'[{"type": "beetz", "min": 2000, "max": 5000, "chance": 1.0}, {"type": "xp_multiplier", "value": 5, "duration": 72, "chance": 0.8}, {"type": "avatar", "rarity": "legendary", "chance": 0.6}]', 
4, 6);

-- Function to generate daily missions
CREATE OR REPLACE FUNCTION public.generate_daily_missions()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clear old missions
  DELETE FROM public.daily_missions WHERE expires_at < now();
  
  -- Generate new missions if none exist for today
  IF NOT EXISTS (SELECT 1 FROM public.daily_missions WHERE expires_at > now()) THEN
    -- Quiz missions
    INSERT INTO public.daily_missions (title, description, category, mission_type, target_value, xp_reward, beetz_reward, difficulty)
    VALUES 
    ('Gênio dos Quizzes', 'Responda 5 perguntas corretamente', 'quiz', 'correct_answers', 5, 100, 200, 'easy'),
    ('Especialista', 'Complete 3 quizzes consecutivos', 'quiz', 'quiz_completion', 3, 150, 300, 'medium');
    
    -- Streak missions
    INSERT INTO public.daily_missions (title, description, category, mission_type, target_value, xp_reward, beetz_reward, difficulty)
    VALUES 
    ('Consistência', 'Mantenha sua sequência diária', 'streak', 'daily_login', 1, 75, 150, 'easy');
    
    -- Social missions
    INSERT INTO public.daily_missions (title, description, category, mission_type, target_value, xp_reward, beetz_reward, difficulty)
    VALUES 
    ('Duelista', 'Vença 2 duelos hoje', 'social', 'duel_wins', 2, 200, 400, 'medium'),
    ('Social', 'Participe de 1 conversa', 'social', 'chat_messages', 5, 50, 100, 'easy');
    
    -- Weekend special missions
    IF EXTRACT(DOW FROM now()) IN (0, 6) THEN
      INSERT INTO public.daily_missions (title, description, category, mission_type, target_value, xp_reward, beetz_reward, difficulty, is_weekend_special)
      VALUES 
      ('Guerreiro de Fim de Semana', 'Ganhe 500 XP hoje', 'exploration', 'xp_earned', 500, 300, 600, 'hard', true);
    END IF;
  END IF;
END;
$$;

-- Function to update leaderboards
CREATE OR REPLACE FUNCTION public.update_weekly_leaderboard(
  profile_id UUID,
  xp_gained INTEGER DEFAULT 0,
  quiz_points INTEGER DEFAULT 0,
  duel_win BOOLEAN DEFAULT false
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_week_start DATE;
  current_league_id UUID;
  total_points INTEGER;
BEGIN
  -- Get current week start (Monday)
  current_week_start := date_trunc('week', CURRENT_DATE)::DATE;
  
  -- Upsert leaderboard entry
  INSERT INTO public.weekly_leaderboards (user_id, week_start_date, xp_earned, quiz_score, duels_won)
  VALUES (profile_id, current_week_start, xp_gained, quiz_points, CASE WHEN duel_win THEN 1 ELSE 0 END)
  ON CONFLICT (user_id, week_start_date)
  DO UPDATE SET
    xp_earned = weekly_leaderboards.xp_earned + xp_gained,
    quiz_score = weekly_leaderboards.quiz_score + quiz_points,
    duels_won = weekly_leaderboards.duels_won + CASE WHEN duel_win THEN 1 ELSE 0 END,
    updated_at = now();
  
  -- Calculate total score and assign league
  SELECT xp_earned + quiz_score + (duels_won * 100) INTO total_points
  FROM public.weekly_leaderboards 
  WHERE user_id = profile_id AND week_start_date = current_week_start;
  
  -- Get appropriate league
  SELECT id INTO current_league_id
  FROM public.leagues
  WHERE min_points <= total_points AND (max_points IS NULL OR total_points <= max_points)
  ORDER BY tier DESC
  LIMIT 1;
  
  -- Update total score and league
  UPDATE public.weekly_leaderboards
  SET total_score = total_points, league_id = current_league_id
  WHERE user_id = profile_id AND week_start_date = current_week_start;
END;
$$;

-- Function to update mission progress
CREATE OR REPLACE FUNCTION public.update_mission_progress(
  profile_id UUID,
  mission_type_param TEXT,
  progress_amount INTEGER DEFAULT 1
)
RETURNS TABLE(mission_completed BOOLEAN, rewards_earned JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  mission_record RECORD;
  new_progress INTEGER;
  completed_missions INTEGER;
BEGIN
  -- Find active missions of this type
  FOR mission_record IN 
    SELECT dm.* FROM public.daily_missions dm
    WHERE dm.mission_type = mission_type_param 
    AND dm.is_active = true 
    AND dm.expires_at > now()
  LOOP
    -- Update or insert progress
    INSERT INTO public.user_mission_progress (user_id, mission_id, progress)
    VALUES (profile_id, mission_record.id, progress_amount)
    ON CONFLICT (user_id, mission_id)
    DO UPDATE SET progress = user_mission_progress.progress + progress_amount;
    
    -- Check if mission is completed
    SELECT progress INTO new_progress
    FROM public.user_mission_progress
    WHERE user_id = profile_id AND mission_id = mission_record.id;
    
    IF new_progress >= mission_record.target_value AND NOT EXISTS (
      SELECT 1 FROM public.user_mission_progress 
      WHERE user_id = profile_id AND mission_id = mission_record.id AND completed = true
    ) THEN
      -- Mark as completed
      UPDATE public.user_mission_progress
      SET completed = true, completed_at = now()
      WHERE user_id = profile_id AND mission_id = mission_record.id;
      
      -- Award rewards
      PERFORM public.award_xp(profile_id, mission_record.xp_reward, 'daily_mission');
      
      UPDATE public.profiles
      SET points = points + mission_record.beetz_reward
      WHERE id = profile_id;
      
      RETURN QUERY SELECT true, jsonb_build_object(
        'xp', mission_record.xp_reward,
        'beetz', mission_record.beetz_reward,
        'mission_name', mission_record.title
      );
    END IF;
  END LOOP;
  
  -- Check for combo achievement (all daily missions completed)
  SELECT COUNT(*) INTO completed_missions
  FROM public.user_mission_progress ump
  JOIN public.daily_missions dm ON ump.mission_id = dm.id
  WHERE ump.user_id = profile_id 
  AND ump.completed = true
  AND dm.expires_at > now()
  AND dm.is_active = true
  AND DATE(ump.completed_at) = CURRENT_DATE;
  
  -- If completed 4+ missions today, award combo bonus
  IF completed_missions >= 4 AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements
    WHERE user_id = profile_id 
    AND achievement_name = 'daily_combo_' || CURRENT_DATE
  ) THEN
    -- Award combo achievement
    INSERT INTO public.user_achievements (user_id, achievement_type, achievement_name, description, metadata)
    VALUES (profile_id, 'daily_combo', 'daily_combo_' || CURRENT_DATE, 'Completou todas as missões diárias', 
    jsonb_build_object('combo_bonus_xp', 500, 'combo_bonus_beetz', 1000));
    
    -- Award combo bonus
    PERFORM public.award_xp(profile_id, 500, 'daily_combo');
    UPDATE public.profiles SET points = points + 1000 WHERE id = profile_id;
    
    -- Award special loot box
    INSERT INTO public.user_loot_boxes (user_id, loot_box_id, source)
    SELECT profile_id, id, 'daily_combo'
    FROM public.loot_boxes 
    WHERE rarity = 'rare'
    ORDER BY RANDOM()
    LIMIT 1;
  END IF;
  
  RETURN;
END;
$$;