-- Create battle royale queue table
CREATE TABLE public.battle_royale_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mode TEXT NOT NULL DEFAULT 'solo',
  topic TEXT NOT NULL DEFAULT 'general',
  difficulty TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '5 minutes')
);

-- Enable RLS
ALTER TABLE public.battle_royale_queue ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own queue entries" 
ON public.battle_royale_queue 
FOR ALL 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create index for performance
CREATE INDEX idx_battle_royale_queue_mode_topic ON public.battle_royale_queue(mode, topic, created_at);
CREATE INDEX idx_battle_royale_queue_expires ON public.battle_royale_queue(expires_at);

-- Auto-cleanup expired queue entries
CREATE OR REPLACE FUNCTION cleanup_expired_battle_royale_queue()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.battle_royale_queue 
  WHERE expires_at < now();
END;
$$;

-- Create matchmaking function
CREATE OR REPLACE FUNCTION find_battle_royale_match(
  p_user_id UUID,
  p_mode TEXT DEFAULT 'solo',
  p_topic TEXT DEFAULT 'general', 
  p_difficulty TEXT DEFAULT 'medium'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  new_session_id UUID;
  participant_count INTEGER;
  max_players INTEGER;
BEGIN
  -- Clean expired queue entries first
  DELETE FROM public.battle_royale_queue WHERE expires_at < now();
  
  -- Set max players based on mode
  max_players := CASE 
    WHEN p_mode = 'solo' THEN 100
    WHEN p_mode = 'squad' THEN 80
    WHEN p_mode = 'chaos' THEN 50
    ELSE 100
  END;
  
  -- Look for existing waiting sessions with same parameters
  SELECT brs.* INTO session_record
  FROM public.battle_royale_sessions brs
  WHERE brs.status = 'waiting'
    AND brs.mode = p_mode
    AND brs.topic = p_topic
    AND brs.difficulty = p_difficulty
    AND brs.current_players < brs.max_players
    AND brs.created_at > (now() - INTERVAL '10 minutes')
  ORDER BY brs.created_at ASC
  LIMIT 1;
  
  -- If found session with space, join it
  IF session_record.id IS NOT NULL THEN
    -- Check if user already in this session
    IF NOT EXISTS (
      SELECT 1 FROM public.battle_royale_participants 
      WHERE session_id = session_record.id AND user_id = p_user_id
    ) THEN
      -- Add user to session
      INSERT INTO public.battle_royale_participants (
        session_id, user_id, joined_at
      ) VALUES (
        session_record.id, p_user_id, now()
      );
      
      -- Update session player count
      UPDATE public.battle_royale_sessions 
      SET current_players = current_players + 1,
          updated_at = now()
      WHERE id = session_record.id;
      
      -- Remove from queue if exists
      DELETE FROM public.battle_royale_queue WHERE user_id = p_user_id;
      
      RETURN jsonb_build_object(
        'success', true,
        'action', 'joined_existing',
        'session_id', session_record.id,
        'session_code', session_record.session_code,
        'current_players', session_record.current_players + 1,
        'max_players', session_record.max_players
      );
    END IF;
  END IF;
  
  -- No suitable session found, create new one
  INSERT INTO public.battle_royale_sessions (
    session_code,
    mode,
    topic,
    difficulty,
    max_players,
    current_players,
    prize_pool,
    entry_fee,
    status
  ) VALUES (
    generate_session_code(),
    p_mode,
    p_topic,
    p_difficulty,
    max_players,
    1,
    CASE p_mode 
      WHEN 'solo' THEN 10000
      WHEN 'squad' THEN 8000
      WHEN 'chaos' THEN 5000
      ELSE 10000
    END,
    100,
    'waiting'
  ) RETURNING id INTO new_session_id;
  
  -- Add creator as participant
  INSERT INTO public.battle_royale_participants (
    session_id, user_id, joined_at
  ) VALUES (
    new_session_id, p_user_id, now()
  );
  
  -- Remove from queue
  DELETE FROM public.battle_royale_queue WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'action', 'created_new',
    'session_id', new_session_id,
    'current_players', 1,
    'max_players', max_players
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Function to get queue stats
CREATE OR REPLACE FUNCTION get_battle_royale_queue_stats(
  p_mode TEXT DEFAULT 'solo',
  p_topic TEXT DEFAULT 'general'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  queue_count INTEGER;
  active_sessions INTEGER;
  waiting_sessions INTEGER;
BEGIN
  -- Count people in queue for this mode/topic
  SELECT COUNT(*) INTO queue_count
  FROM public.battle_royale_queue
  WHERE mode = p_mode 
    AND topic = p_topic
    AND expires_at > now();
  
  -- Count active sessions
  SELECT COUNT(*) INTO active_sessions
  FROM public.battle_royale_sessions
  WHERE status = 'active'
    AND mode = p_mode
    AND topic = p_topic;
    
  -- Count waiting sessions
  SELECT COUNT(*) INTO waiting_sessions
  FROM public.battle_royale_sessions
  WHERE status = 'waiting'
    AND mode = p_mode
    AND topic = p_topic
    AND created_at > (now() - INTERVAL '10 minutes');
  
  RETURN jsonb_build_object(
    'queue_count', queue_count,
    'active_sessions', active_sessions,
    'waiting_sessions', waiting_sessions,
    'estimated_wait_time', CASE 
      WHEN waiting_sessions > 0 THEN 30
      WHEN queue_count > 5 THEN 60
      ELSE 90
    END
  );
END;
$$;