-- Adicionar suporte a temas nas perguntas
ALTER TABLE public.quiz_questions 
ADD COLUMN IF NOT EXISTS theme text;

-- Criar índice para busca eficiente por tema
CREATE INDEX IF NOT EXISTS idx_quiz_questions_theme ON public.quiz_questions(theme);

-- Criar tabela para progresso do usuário por tema
CREATE TABLE IF NOT EXISTS public.user_theme_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  theme text NOT NULL,
  questions_answered integer DEFAULT 0,
  questions_correct integer DEFAULT 0,
  current_difficulty text DEFAULT 'easy',
  difficulty_progression jsonb DEFAULT '{"easy": 0, "medium": 0, "hard": 0}',
  last_session_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, theme)
);

-- Enable RLS
ALTER TABLE public.user_theme_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own theme progress" 
ON public.user_theme_progress 
FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own theme progress" 
ON public.user_theme_progress 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own theme progress" 
ON public.user_theme_progress 
FOR UPDATE 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Trigger para atualizar timestamp
CREATE OR REPLACE FUNCTION update_user_theme_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_theme_progress_updated_at
  BEFORE UPDATE ON public.user_theme_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_user_theme_progress_updated_at();