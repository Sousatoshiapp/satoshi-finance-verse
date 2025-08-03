CREATE TABLE IF NOT EXISTS public.duels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invite_id UUID REFERENCES public.duel_invites(id),
  player1_id UUID NOT NULL REFERENCES public.profiles(id),
  player2_id UUID NOT NULL REFERENCES public.profiles(id),
  quiz_topic TEXT NOT NULL,
  questions JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  winner_id UUID REFERENCES public.profiles(id),
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  player1_answers JSONB DEFAULT '[]',
  player2_answers JSONB DEFAULT '[]',
  player1_current_question INTEGER DEFAULT 1,
  player2_current_question INTEGER DEFAULT 1,
  player1_finished_at TIMESTAMP WITH TIME ZONE NULL,
  player2_finished_at TIMESTAMP WITH TIME ZONE NULL,
  player1_timeout_count INTEGER DEFAULT 0,
  player2_timeout_count INTEGER DEFAULT 0,
  player1_status TEXT DEFAULT 'playing',
  player2_status TEXT DEFAULT 'playing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.duels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view their own duels" ON public.duels
  FOR SELECT USING (
    player1_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    player2_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "System can create duels via RPC" ON public.duels
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Players can update their own duels" ON public.duels
  FOR UPDATE USING (
    player1_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    player2_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_duels_player1_id ON public.duels(player1_id);
CREATE INDEX IF NOT EXISTS idx_duels_player2_id ON public.duels(player2_id);
CREATE INDEX IF NOT EXISTS idx_duels_status_created ON public.duels(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_duels_created_at ON public.duels(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_duels_status ON public.duels(status) WHERE status IN ('active', 'waiting');
