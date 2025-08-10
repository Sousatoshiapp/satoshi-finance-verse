-- Criar tabelas para o novo sistema de duelos de cassino
-- Tabela principal de duelos do cassino
CREATE TABLE IF NOT EXISTS public.casino_duels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  player2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  bet_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled')),
  winner_id UUID REFERENCES public.profiles(id),
  player1_score INTEGER NOT NULL DEFAULT 0,
  player2_score INTEGER NOT NULL DEFAULT 0,
  questions JSONB NOT NULL DEFAULT '[]',
  current_question INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de fila de duelos do cassino
CREATE TABLE IF NOT EXISTS public.casino_duel_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  bet_amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '5 minutes')
);

-- Tabela de respostas dos duelos do cassino
CREATE TABLE IF NOT EXISTS public.casino_duel_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  duel_id UUID NOT NULL REFERENCES public.casino_duels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  selected_answer TEXT NOT NULL CHECK (selected_answer IN ('a', 'b', 'c', 'd')),
  is_correct BOOLEAN NOT NULL DEFAULT false,
  response_time_ms INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.casino_duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casino_duel_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casino_duel_answers ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para casino_duels
CREATE POLICY "Users can view their own casino duels" ON public.casino_duels
  FOR SELECT USING (
    player1_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    player2_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create casino duels" ON public.casino_duels
  FOR INSERT WITH CHECK (
    player1_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own casino duels" ON public.casino_duels
  FOR UPDATE USING (
    player1_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    player2_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Políticas RLS para casino_duel_queue
CREATE POLICY "Users can manage their own queue entries" ON public.casino_duel_queue
  FOR ALL USING (
    user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Políticas RLS para casino_duel_answers
CREATE POLICY "Users can view answers from their duels" ON public.casino_duel_answers
  FOR SELECT USING (
    duel_id IN (
      SELECT id FROM public.casino_duels 
      WHERE player1_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
         OR player2_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can submit answers to their duels" ON public.casino_duel_answers
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND
    duel_id IN (
      SELECT id FROM public.casino_duels 
      WHERE player1_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
         OR player2_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_casino_duels_players ON public.casino_duels(player1_id, player2_id);
CREATE INDEX IF NOT EXISTS idx_casino_duels_status ON public.casino_duels(status);
CREATE INDEX IF NOT EXISTS idx_casino_duel_queue_topic_bet ON public.casino_duel_queue(topic, bet_amount);
CREATE INDEX IF NOT EXISTS idx_casino_duel_answers_duel_user ON public.casino_duel_answers(duel_id, user_id);

-- Função para limpar fila expirada
CREATE OR REPLACE FUNCTION public.clean_expired_casino_queue()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.casino_duel_queue WHERE expires_at <= now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;