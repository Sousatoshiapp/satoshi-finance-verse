-- Create user matchmaking preferences table
CREATE TABLE IF NOT EXISTS public.user_matchmaking_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferred_topics TEXT[] DEFAULT ARRAY['financas', 'investimentos'],
  allow_bots BOOLEAN DEFAULT true,
  skill_level_range TEXT DEFAULT 'similar' CHECK (skill_level_range IN ('similar', 'any', 'challenging')),
  auto_accept_from_friends BOOLEAN DEFAULT false,
  max_concurrent_invites INTEGER DEFAULT 3 CHECK (max_concurrent_invites > 0 AND max_concurrent_invites <= 10),
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'invisible')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_matchmaking_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own preferences" 
ON public.user_matchmaking_preferences 
FOR SELECT 
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own preferences" 
ON public.user_matchmaking_preferences 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own preferences" 
ON public.user_matchmaking_preferences 
FOR UPDATE 
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create an enhanced invite queue system table
CREATE TABLE IF NOT EXISTS public.invite_queue_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invite_id UUID NOT NULL REFERENCES public.duel_invites(id) ON DELETE CASCADE,
  queue_position INTEGER NOT NULL,
  priority_score NUMERIC DEFAULT 0,
  auto_dismiss_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '30 seconds'),
  interaction_type TEXT DEFAULT 'manual' CHECK (interaction_type IN ('manual', 'auto_accept', 'auto_decline', 'timeout')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, invite_id)
);

-- Enable RLS
ALTER TABLE public.invite_queue_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for invite queue
CREATE POLICY "Users can view their own queue sessions" 
ON public.invite_queue_sessions 
FOR SELECT 
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own queue sessions" 
ON public.invite_queue_sessions 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own queue sessions" 
ON public.invite_queue_sessions 
FOR UPDATE 
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create function to calculate invite priority
CREATE OR REPLACE FUNCTION public.calculate_invite_priority(
  p_challenger_id UUID,
  p_challenged_id UUID,
  p_quiz_topic TEXT
) RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  priority_score NUMERIC := 0;
  challenger_level INTEGER;
  preferences RECORD;
BEGIN
  -- Get challenger level
  SELECT level INTO challenger_level
  FROM public.profiles
  WHERE id = p_challenger_id;
  
  -- Get user preferences
  SELECT * INTO preferences
  FROM public.user_matchmaking_preferences
  WHERE user_id = p_challenged_id;
  
  -- Base priority
  priority_score := 50;
  
  -- Topic preference bonus (+30 points)
  IF preferences.preferred_topics IS NOT NULL AND p_quiz_topic = ANY(preferences.preferred_topics) THEN
    priority_score := priority_score + 30;
  END IF;
  
  -- High level challenger bonus (+20 points for level 20+)
  IF challenger_level >= 20 THEN
    priority_score := priority_score + 20;
  END IF;
  
  -- Friend bonus (if implemented later) would go here
  
  RETURN priority_score;
END;
$$;

-- Create function to manage smart invite queue
CREATE OR REPLACE FUNCTION public.add_to_smart_queue(
  p_invite_id UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_record RECORD;
  queue_session_id UUID;
  current_position INTEGER;
  priority NUMERIC;
BEGIN
  -- Get invite details
  SELECT * INTO invite_record
  FROM public.duel_invites
  WHERE id = p_invite_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invite not found';
  END IF;
  
  -- Calculate priority
  SELECT public.calculate_invite_priority(
    invite_record.challenger_id,
    invite_record.challenged_id,
    invite_record.quiz_topic
  ) INTO priority;
  
  -- Get current queue position
  SELECT COALESCE(MAX(queue_position), 0) + 1 INTO current_position
  FROM public.invite_queue_sessions
  WHERE user_id = invite_record.challenged_id
  AND processed_at IS NULL;
  
  -- Insert into queue
  INSERT INTO public.invite_queue_sessions (
    user_id,
    invite_id,
    queue_position,
    priority_score
  ) VALUES (
    invite_record.challenged_id,
    p_invite_id,
    current_position,
    priority
  ) RETURNING id INTO queue_session_id;
  
  RETURN queue_session_id;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_matchmaking_preferences_user_id ON public.user_matchmaking_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_invite_queue_sessions_user_id ON public.invite_queue_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_invite_queue_sessions_priority ON public.invite_queue_sessions(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_invite_queue_sessions_processed ON public.invite_queue_sessions(processed_at) WHERE processed_at IS NULL;