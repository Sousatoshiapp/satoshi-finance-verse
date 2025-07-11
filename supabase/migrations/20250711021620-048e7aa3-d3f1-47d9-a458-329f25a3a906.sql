-- Criar tabela para perguntas específicas de cada distrito
CREATE TABLE public.district_quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array de opções [A, B, C, D]
  correct_answer TEXT NOT NULL, -- Letra da resposta correta (A, B, C, D)
  explanation TEXT,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  tags TEXT[], -- Tags para categorização
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para duelos entre distritos
CREATE TABLE public.district_duels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  initiator_district_id UUID NOT NULL REFERENCES public.districts(id),
  challenged_district_id UUID NOT NULL REFERENCES public.districts(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  total_questions INTEGER DEFAULT 20,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  questions JSONB, -- Array das 20 perguntas selecionadas
  participants_count_initiator INTEGER DEFAULT 0,
  participants_count_challenged INTEGER DEFAULT 0,
  average_score_initiator DECIMAL(5,2) DEFAULT 0,
  average_score_challenged DECIMAL(5,2) DEFAULT 0,
  winner_district_id UUID REFERENCES public.districts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para participação em duelos
CREATE TABLE public.district_duel_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  duel_id UUID NOT NULL REFERENCES public.district_duels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  district_id UUID NOT NULL REFERENCES public.districts(id),
  score INTEGER DEFAULT 0,
  answers JSONB, -- Array com as respostas do usuário
  completed_at TIMESTAMP WITH TIME ZONE,
  participation_time_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(duel_id, user_id)
);

-- Enable RLS
ALTER TABLE public.district_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.district_duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.district_duel_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies para district_quiz_questions
CREATE POLICY "Quiz questions are viewable by everyone" 
ON public.district_quiz_questions 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "System can manage quiz questions" 
ON public.district_quiz_questions 
FOR ALL 
USING (true);

-- RLS Policies para district_duels
CREATE POLICY "District duels are viewable by everyone" 
ON public.district_duels 
FOR SELECT 
USING (true);

CREATE POLICY "District members can create duels" 
ON public.district_duels 
FOR INSERT 
WITH CHECK (
  initiator_district_id IN (
    SELECT district_id FROM public.user_districts 
    WHERE user_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "System can update duels" 
ON public.district_duels 
FOR UPDATE 
USING (true);

-- RLS Policies para district_duel_participants
CREATE POLICY "Users can view duel participations" 
ON public.district_duel_participants 
FOR SELECT 
USING (true);

CREATE POLICY "Users can participate in duels" 
ON public.district_duel_participants 
FOR INSERT 
WITH CHECK (
  user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their participation" 
ON public.district_duel_participants 
FOR UPDATE 
USING (
  user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Criar função para iniciar duelo entre distritos
CREATE OR REPLACE FUNCTION public.start_district_duel(
  p_initiator_district_id UUID,
  p_challenged_district_id UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  duel_id UUID;
  initiator_questions JSONB;
  challenged_questions JSONB;
  mixed_questions JSONB;
BEGIN
  -- Validar que os distritos são diferentes
  IF p_initiator_district_id = p_challenged_district_id THEN
    RAISE EXCEPTION 'Um distrito não pode desafiar a si mesmo';
  END IF;
  
  -- Buscar 10 perguntas de cada distrito
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'question', question,
      'options', options,
      'correct_answer', correct_answer,
      'explanation', explanation
    )
  ) INTO initiator_questions
  FROM (
    SELECT * FROM public.district_quiz_questions 
    WHERE district_id = p_initiator_district_id 
    AND is_active = true 
    ORDER BY RANDOM() 
    LIMIT 10
  ) sub;
  
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'question', question,
      'options', options,
      'correct_answer', correct_answer,
      'explanation', explanation
    )
  ) INTO challenged_questions
  FROM (
    SELECT * FROM public.district_quiz_questions 
    WHERE district_id = p_challenged_district_id 
    AND is_active = true 
    ORDER BY RANDOM() 
    LIMIT 10
  ) sub;
  
  -- Combinar e embaralhar as 20 perguntas
  mixed_questions := initiator_questions || challenged_questions;
  
  -- Criar o duelo
  INSERT INTO public.district_duels (
    initiator_district_id,
    challenged_district_id,
    status,
    questions,
    start_time,
    end_time
  ) VALUES (
    p_initiator_district_id,
    p_challenged_district_id,
    'active',
    mixed_questions,
    now(),
    now() + INTERVAL '24 hours'
  ) RETURNING id INTO duel_id;
  
  RETURN duel_id;
END;
$$;

-- Criar função para finalizar participação em duelo
CREATE OR REPLACE FUNCTION public.complete_duel_participation(
  p_duel_id UUID,
  p_user_id UUID,
  p_answers JSONB,
  p_participation_time_seconds INTEGER
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_score INTEGER := 0;
  question_item JSONB;
  user_answer TEXT;
  correct_answer TEXT;
  user_district_id UUID;
BEGIN
  -- Buscar district_id do usuário
  SELECT district_id INTO user_district_id
  FROM public.user_districts 
  WHERE user_id = p_user_id 
  AND is_residence = true
  LIMIT 1;
  
  -- Calcular score
  FOR question_item IN SELECT * FROM jsonb_array_elements((
    SELECT questions FROM public.district_duels WHERE id = p_duel_id
  ))
  LOOP
    SELECT (p_answers->>(question_item->>'id')) INTO user_answer;
    SELECT (question_item->>'correct_answer') INTO correct_answer;
    
    IF user_answer = correct_answer THEN
      user_score := user_score + 1;
    END IF;
  END LOOP;
  
  -- Inserir/atualizar participação
  INSERT INTO public.district_duel_participants (
    duel_id, user_id, district_id, score, answers, 
    participation_time_seconds, completed_at
  ) VALUES (
    p_duel_id, p_user_id, user_district_id, user_score, 
    p_answers, p_participation_time_seconds, now()
  ) ON CONFLICT (duel_id, user_id) DO UPDATE SET
    score = user_score,
    answers = p_answers,
    participation_time_seconds = p_participation_time_seconds,
    completed_at = now();
  
  -- Atualizar estatísticas do duelo
  PERFORM public.update_duel_statistics(p_duel_id);
  
  RETURN user_score;
END;
$$;

-- Função para atualizar estatísticas do duelo
CREATE OR REPLACE FUNCTION public.update_duel_statistics(p_duel_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  duel_record RECORD;
  initiator_avg DECIMAL(5,2);
  challenged_avg DECIMAL(5,2);
  initiator_count INTEGER;
  challenged_count INTEGER;
  winner_id UUID;
BEGIN
  -- Buscar informações do duelo
  SELECT * INTO duel_record 
  FROM public.district_duels 
  WHERE id = p_duel_id;
  
  -- Calcular estatísticas do distrito iniciador
  SELECT AVG(score), COUNT(*) 
  INTO initiator_avg, initiator_count
  FROM public.district_duel_participants 
  WHERE duel_id = p_duel_id 
  AND district_id = duel_record.initiator_district_id
  AND completed_at IS NOT NULL;
  
  -- Calcular estatísticas do distrito desafiado
  SELECT AVG(score), COUNT(*) 
  INTO challenged_avg, challenged_count
  FROM public.district_duel_participants 
  WHERE duel_id = p_duel_id 
  AND district_id = duel_record.challenged_district_id
  AND completed_at IS NOT NULL;
  
  -- Determinar vencedor
  IF initiator_avg > challenged_avg THEN
    winner_id := duel_record.initiator_district_id;
  ELSIF challenged_avg > initiator_avg THEN
    winner_id := duel_record.challenged_district_id;
  ELSE
    winner_id := NULL; -- Empate
  END IF;
  
  -- Atualizar duelo
  UPDATE public.district_duels SET
    participants_count_initiator = COALESCE(initiator_count, 0),
    participants_count_challenged = COALESCE(challenged_count, 0),
    average_score_initiator = COALESCE(initiator_avg, 0),
    average_score_challenged = COALESCE(challenged_avg, 0),
    winner_district_id = winner_id,
    updated_at = now()
  WHERE id = p_duel_id;
END;
$$;

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_district_quiz_questions_updated_at
  BEFORE UPDATE ON public.district_quiz_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_district_duels_updated_at
  BEFORE UPDATE ON public.district_duels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir perguntas exemplo para cada distrito
INSERT INTO public.district_quiz_questions (district_id, question, options, correct_answer, explanation, difficulty_level, tags) 
SELECT 
  d.id,
  CASE d.theme
    WHEN 'criptomoedas' THEN 'O que é Bitcoin?'
    WHEN 'sistema_bancario' THEN 'O que é taxa SELIC?'
    WHEN 'renda_variavel' THEN 'O que são ações?'
    WHEN 'educacao_financeira' THEN 'O que é educação financeira?'
    WHEN 'fundos_imobiliarios' THEN 'O que são FIIs?'
    WHEN 'mercado_internacional' THEN 'O que é forex?'
    WHEN 'fintech' THEN 'O que é fintech?'
    ELSE 'Pergunta exemplo'
  END,
  CASE d.theme
    WHEN 'criptomoedas' THEN '["Uma moeda digital descentralizada", "Um banco tradicional", "Uma empresa de tecnologia", "Um tipo de investimento físico"]'
    WHEN 'sistema_bancario' THEN '["Taxa básica de juros da economia", "Taxa de câmbio", "Taxa de inflação", "Taxa de desemprego"]'
    WHEN 'renda_variavel' THEN '["Títulos de propriedade de empresas", "Títulos de dívida", "Moedas digitais", "Imóveis"]'
    WHEN 'educacao_financeira' THEN '["Processo de melhoria da compreensão financeira", "Tipo de investimento", "Produto bancário", "Sistema de pagamento"]'
    WHEN 'fundos_imobiliarios' THEN '["Fundos que investem em imóveis", "Fundos de ações", "Fundos de renda fixa", "Fundos cambiais"]'
    WHEN 'mercado_internacional' THEN '["Mercado de moedas estrangeiras", "Mercado de ações local", "Mercado imobiliário", "Mercado de commodities"]'
    WHEN 'fintech' THEN '["Empresa de tecnologia financeira", "Banco tradicional", "Corretora comum", "Seguradora"]'
    ELSE '["Resposta A", "Resposta B", "Resposta C", "Resposta D"]'
  END::jsonb,
  'A',
  'Esta é uma pergunta exemplo para demonstrar o sistema',
  1,
  ARRAY[d.theme, 'conceito_basico']
FROM public.districts d
WHERE d.is_active = true;