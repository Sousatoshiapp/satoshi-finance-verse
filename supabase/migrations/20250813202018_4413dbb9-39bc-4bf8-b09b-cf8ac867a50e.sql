-- Criar tabela de lições diárias
CREATE TABLE public.daily_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('curiosidades', 'dicas', 'historias', 'glossario')),
  quiz_question TEXT NOT NULL,
  quiz_options JSONB NOT NULL DEFAULT '[]',
  correct_answer INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 10,
  btz_reward NUMERIC NOT NULL DEFAULT 0.5,
  is_main_lesson BOOLEAN NOT NULL DEFAULT false,
  lesson_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(lesson_date, is_main_lesson, category)
);

-- Criar tabela de progresso das lições por usuário
CREATE TABLE public.user_lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.daily_lessons(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  quiz_completed BOOLEAN NOT NULL DEFAULT false,
  quiz_correct BOOLEAN DEFAULT null,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  btz_earned NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Criar tabela de streaks das lições
CREATE TABLE public.lesson_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_lesson_date DATE DEFAULT null,
  total_lessons_completed INTEGER NOT NULL DEFAULT 0,
  weekly_combo_count INTEGER NOT NULL DEFAULT 0,
  last_weekly_combo DATE DEFAULT null,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Criar tabela para controle de modal diário
CREATE TABLE public.user_daily_lesson_modal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  last_shown_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.daily_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_lesson_modal ENABLE ROW LEVEL SECURITY;

-- Políticas para daily_lessons (lições são públicas)
CREATE POLICY "Lessons are viewable by everyone" 
ON public.daily_lessons 
FOR SELECT 
USING (is_active = true);

-- Políticas para user_lesson_progress (usuários só veem seu próprio progresso)
CREATE POLICY "Users can view their own lesson progress" 
ON public.user_lesson_progress 
FOR SELECT 
USING (user_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Users can create their own lesson progress" 
ON public.user_lesson_progress 
FOR INSERT 
WITH CHECK (user_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Users can update their own lesson progress" 
ON public.user_lesson_progress 
FOR UPDATE 
USING (user_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

-- Políticas para lesson_streaks
CREATE POLICY "Users can view their own lesson streaks" 
ON public.lesson_streaks 
FOR SELECT 
USING (user_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Users can create their own lesson streaks" 
ON public.lesson_streaks 
FOR INSERT 
WITH CHECK (user_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Users can update their own lesson streaks" 
ON public.lesson_streaks 
FOR UPDATE 
USING (user_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

-- Políticas para user_daily_lesson_modal
CREATE POLICY "Users can manage their own modal state" 
ON public.user_daily_lesson_modal 
FOR ALL 
USING (user_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
))
WITH CHECK (user_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_lesson_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_daily_lessons_updated_at
  BEFORE UPDATE ON public.daily_lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lesson_updated_at();

CREATE TRIGGER update_lesson_streaks_updated_at
  BEFORE UPDATE ON public.lesson_streaks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lesson_updated_at();

-- Função para atualizar streak das lições
CREATE OR REPLACE FUNCTION public.update_lesson_streak(p_user_id UUID, p_lesson_date DATE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  streak_record RECORD;
  new_streak INTEGER;
  streak_broken BOOLEAN := false;
  weekly_combo BOOLEAN := false;
  result JSONB;
BEGIN
  -- Buscar streak atual
  SELECT * INTO streak_record 
  FROM public.lesson_streaks 
  WHERE user_id = p_user_id;
  
  -- Se não existe, criar novo
  IF streak_record IS NULL THEN
    INSERT INTO public.lesson_streaks (user_id, current_streak, longest_streak, last_lesson_date, total_lessons_completed)
    VALUES (p_user_id, 1, 1, p_lesson_date, 1)
    RETURNING current_streak, longest_streak INTO new_streak, new_streak;
  ELSE
    -- Verificar se lição foi ontem ou hoje
    IF streak_record.last_lesson_date = p_lesson_date THEN
      -- Já completou hoje, manter streak
      new_streak := streak_record.current_streak;
    ELSIF streak_record.last_lesson_date = p_lesson_date - INTERVAL '1 day' THEN
      -- Completou ontem, incrementar streak
      new_streak := streak_record.current_streak + 1;
      
      -- Verificar combo semanal (7 dias seguidos)
      IF new_streak % 7 = 0 THEN
        weekly_combo := true;
        
        UPDATE public.lesson_streaks 
        SET current_streak = new_streak,
            longest_streak = GREATEST(longest_streak, new_streak),
            last_lesson_date = p_lesson_date,
            total_lessons_completed = total_lessons_completed + 1,
            weekly_combo_count = weekly_combo_count + 1,
            last_weekly_combo = p_lesson_date,
            updated_at = now()
        WHERE user_id = p_user_id;
      ELSE
        UPDATE public.lesson_streaks 
        SET current_streak = new_streak,
            longest_streak = GREATEST(longest_streak, new_streak),
            last_lesson_date = p_lesson_date,
            total_lessons_completed = total_lessons_completed + 1,
            updated_at = now()
        WHERE user_id = p_user_id;
      END IF;
    ELSE
      -- Streak quebrado, começar novo
      new_streak := 1;
      streak_broken := true;
      
      UPDATE public.lesson_streaks 
      SET current_streak = 1,
          last_lesson_date = p_lesson_date,
          total_lessons_completed = total_lessons_completed + 1,
          updated_at = now()
      WHERE user_id = p_user_id;
    END IF;
  END IF;
  
  result := jsonb_build_object(
    'current_streak', new_streak,
    'streak_broken', streak_broken,
    'weekly_combo', weekly_combo,
    'badge_earned', new_streak IN (7, 30, 100)
  );
  
  RETURN result;
END;
$$;