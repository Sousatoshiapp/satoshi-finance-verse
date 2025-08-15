-- Criar tabela para rastrear histórico de questões vistas pelos usuários
CREATE TABLE public.user_question_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question_id UUID NOT NULL,
  seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  context_type TEXT NOT NULL DEFAULT 'duel',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_user_question_history_user_id ON public.user_question_history(user_id);
CREATE INDEX idx_user_question_history_question_id ON public.user_question_history(question_id);
CREATE INDEX idx_user_question_history_seen_at ON public.user_question_history(seen_at);
CREATE INDEX idx_user_question_history_user_context ON public.user_question_history(user_id, context_type);

-- RLS policies
ALTER TABLE public.user_question_history ENABLE ROW LEVEL SECURITY;

-- Usuários podem inserir seu próprio histórico
CREATE POLICY "Users can insert their own question history" 
ON public.user_question_history 
FOR INSERT 
WITH CHECK (user_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

-- Usuários podem ver seu próprio histórico
CREATE POLICY "Users can view their own question history" 
ON public.user_question_history 
FOR SELECT 
USING (user_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

-- Sistema pode inserir histórico para qualquer usuário
CREATE POLICY "System can manage question history" 
ON public.user_question_history 
FOR ALL 
USING (true);

-- Função para limpar histórico antigo (manter apenas últimos 100 por usuário/contexto)
CREATE OR REPLACE FUNCTION public.cleanup_old_question_history()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Remove registros antigos, mantendo apenas os 100 mais recentes por usuário/contexto
  DELETE FROM public.user_question_history
  WHERE id IN (
    SELECT id FROM (
      SELECT id, 
             ROW_NUMBER() OVER (PARTITION BY user_id, context_type ORDER BY seen_at DESC) as rn
      FROM public.user_question_history
    ) ranked
    WHERE ranked.rn > 100
  );
END;
$$;