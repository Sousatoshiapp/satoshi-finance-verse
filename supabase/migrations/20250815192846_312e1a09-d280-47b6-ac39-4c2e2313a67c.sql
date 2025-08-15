-- Criar tabela para streaks de quiz por categoria
CREATE TABLE IF NOT EXISTS public.quiz_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_quiz_date DATE,
  total_quizzes_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_quiz_streaks_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_category_streak UNIQUE(user_id, category)
);

-- Habilitar RLS
ALTER TABLE public.quiz_streaks ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus próprios streaks
CREATE POLICY "Users can view their own quiz streaks"
ON public.quiz_streaks
FOR SELECT
USING (user_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));

-- Política para usuários atualizarem apenas seus próprios streaks  
CREATE POLICY "Users can update their own quiz streaks"
ON public.quiz_streaks
FOR ALL
USING (user_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
))
WITH CHECK (user_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_quiz_streaks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quiz_streaks_updated_at
  BEFORE UPDATE ON public.quiz_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_streaks_updated_at();