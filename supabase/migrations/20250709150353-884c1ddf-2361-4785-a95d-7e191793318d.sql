-- Create daily challenges table (separate from missions) - only if not exists
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL, -- 'combo', 'speed', 'social', 'exploration'
  target_value INTEGER NOT NULL DEFAULT 1,
  xp_reward INTEGER NOT NULL DEFAULT 75,
  beetz_reward INTEGER NOT NULL DEFAULT 150,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

-- Create user challenge progress table - only if not exists
CREATE TABLE IF NOT EXISTS public.user_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Daily challenges are viewable by everyone" ON public.daily_challenges;
DROP POLICY IF EXISTS "Users can view their own challenge progress" ON public.user_challenge_progress;
DROP POLICY IF EXISTS "Users can insert their own challenge progress" ON public.user_challenge_progress;
DROP POLICY IF EXISTS "Users can update their own challenge progress" ON public.user_challenge_progress;

-- Create RLS policies
CREATE POLICY "Daily challenges are viewable by everyone"
  ON public.daily_challenges FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can view their own challenge progress"
  ON public.user_challenge_progress FOR SELECT
  USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own challenge progress"
  ON public.user_challenge_progress FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own challenge progress"
  ON public.user_challenge_progress FOR UPDATE
  USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Function to generate daily challenges
CREATE OR REPLACE FUNCTION public.generate_daily_challenges()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clear old challenges
  DELETE FROM daily_challenges WHERE expires_at < now();
  
  -- Generate new challenges if none exist for today
  IF NOT EXISTS (SELECT 1 FROM daily_challenges WHERE expires_at > now()) THEN
    -- Speed challenges
    INSERT INTO daily_challenges (title, description, challenge_type, target_value, xp_reward, beetz_reward, difficulty)
    VALUES 
    ('Velocidade da Luz', 'Responda 10 perguntas em menos de 8 segundos cada', 'speed', 10, 150, 300, 'medium'),
    ('Raio Laser', 'Responda 5 perguntas em menos de 5 segundos cada', 'speed', 5, 200, 400, 'hard');
    
    -- Combo challenges
    INSERT INTO daily_challenges (title, description, challenge_type, target_value, xp_reward, beetz_reward, difficulty)
    VALUES 
    ('Combo Master', 'Acerte 8 perguntas seguidas sem errar', 'combo', 8, 175, 350, 'medium'),
    ('Sequência Perfeita', 'Mantenha um combo de 15 respostas corretas', 'combo', 15, 300, 600, 'hard');
    
    -- Social challenges
    INSERT INTO daily_challenges (title, description, challenge_type, target_value, xp_reward, beetz_reward, difficulty)
    VALUES 
    ('Socialização', 'Participe de 3 conversas no distrito', 'social', 3, 100, 200, 'easy'),
    ('Duelista Social', 'Vença 3 duelos consecutivos', 'social', 3, 250, 500, 'hard');
    
    -- Exploration challenges
    INSERT INTO daily_challenges (title, description, challenge_type, target_value, xp_reward, beetz_reward, difficulty)
    VALUES 
    ('Explorador', 'Visite 4 distritos diferentes hoje', 'exploration', 4, 125, 250, 'medium');
  END IF;
END;
$$;

-- Function to update challenge progress
CREATE OR REPLACE FUNCTION public.update_challenge_progress(
  profile_id UUID,
  challenge_type_param TEXT,
  progress_amount INTEGER DEFAULT 1
)
RETURNS TABLE(challenge_completed BOOLEAN, rewards_earned JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  challenge_record RECORD;
  new_progress INTEGER;
BEGIN
  -- Find active challenges of this type
  FOR challenge_record IN 
    SELECT dc.* FROM daily_challenges dc
    WHERE dc.challenge_type = challenge_type_param 
    AND dc.is_active = true 
    AND dc.expires_at > now()
  LOOP
    -- Update or insert progress
    INSERT INTO user_challenge_progress (user_id, challenge_id, progress)
    VALUES (profile_id, challenge_record.id, progress_amount)
    ON CONFLICT (user_id, challenge_id)
    DO UPDATE SET progress = user_challenge_progress.progress + progress_amount;
    
    -- Check if challenge is completed
    SELECT progress INTO new_progress
    FROM user_challenge_progress
    WHERE user_id = profile_id AND challenge_id = challenge_record.id;
    
    IF new_progress >= challenge_record.target_value AND NOT EXISTS (
      SELECT 1 FROM user_challenge_progress 
      WHERE user_id = profile_id AND challenge_id = challenge_record.id AND completed = true
    ) THEN
      -- Mark as completed
      UPDATE user_challenge_progress
      SET completed = true, completed_at = now()
      WHERE user_id = profile_id AND challenge_id = challenge_record.id;
      
      -- Award rewards
      PERFORM award_xp(profile_id, challenge_record.xp_reward, 'daily_challenge');
      
      UPDATE profiles
      SET points = points + challenge_record.beetz_reward
      WHERE id = profile_id;
      
      RETURN QUERY SELECT true, jsonb_build_object(
        'xp', challenge_record.xp_reward,
        'beetz', challenge_record.beetz_reward,
        'challenge_name', challenge_record.title
      );
    END IF;
  END LOOP;
  
  RETURN;
END;
$$;