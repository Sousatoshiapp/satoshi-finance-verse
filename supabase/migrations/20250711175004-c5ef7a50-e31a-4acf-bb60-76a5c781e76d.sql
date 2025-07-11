-- Melhorar a estrutura da tabela quiz_questions para ser mais robusta
ALTER TABLE public.quiz_questions 
ADD COLUMN IF NOT EXISTS concepts TEXT[],
ADD COLUMN IF NOT EXISTS source_material TEXT,
ADD COLUMN IF NOT EXISTS author_notes TEXT,
ADD COLUMN IF NOT EXISTS last_reviewed_date DATE,
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS avg_response_time INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.quiz_questions.concepts IS 'Array de conceitos/tópicos relacionados à pergunta';
COMMENT ON COLUMN public.quiz_questions.source_material IS 'Material de referência ou fonte da pergunta';
COMMENT ON COLUMN public.quiz_questions.author_notes IS 'Notas do autor/criador da pergunta';
COMMENT ON COLUMN public.quiz_questions.usage_count IS 'Quantas vezes a pergunta foi utilizada';
COMMENT ON COLUMN public.quiz_questions.success_rate IS 'Taxa de acerto da pergunta (0-100%)';
COMMENT ON COLUMN public.quiz_questions.avg_response_time IS 'Tempo médio de resposta em segundos';
COMMENT ON COLUMN public.quiz_questions.is_approved IS 'Se a pergunta foi aprovada para uso';
COMMENT ON COLUMN public.quiz_questions.version IS 'Versão da pergunta para controle de mudanças';

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_quiz_questions_category_difficulty ON public.quiz_questions(category, difficulty_level);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_district ON public.quiz_questions(district_id) WHERE district_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quiz_questions_approved ON public.quiz_questions(is_approved) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_quiz_questions_concepts ON public.quiz_questions USING GIN(concepts);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_tags ON public.quiz_questions USING GIN(tags);

-- Criar função para gerar template de planilha
CREATE OR REPLACE FUNCTION generate_question_template()
RETURNS TABLE (
  question TEXT,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_answer TEXT,
  explanation TEXT,
  category TEXT,
  difficulty TEXT,
  difficulty_level INTEGER,
  district_id TEXT,
  learning_module_id TEXT,
  tags TEXT,
  learning_objectives TEXT,
  estimated_time_seconds INTEGER,
  question_type TEXT,
  cognitive_level TEXT,
  concepts TEXT,
  source_material TEXT
)
LANGUAGE sql
AS $$
  SELECT 
    'Exemplo: Qual é o conceito fundamental do Bitcoin?'::TEXT as question,
    'Uma moeda física'::TEXT as option_a,
    'Um sistema de pagamento digital descentralizado'::TEXT as option_b,
    'Um banco virtual'::TEXT as option_c,
    'Uma empresa de tecnologia'::TEXT as option_d,
    'B'::TEXT as correct_answer,
    'Bitcoin é uma criptomoeda e sistema de pagamento digital descentralizado.'::TEXT as explanation,
    'crypto'::TEXT as category,
    'easy'::TEXT as difficulty,
    1::INTEGER as difficulty_level,
    NULL::TEXT as district_id,
    NULL::TEXT as learning_module_id,
    'bitcoin,cryptocurrency,basics'::TEXT as tags,
    'understanding_bitcoin_basics'::TEXT as learning_objectives,
    30::INTEGER as estimated_time_seconds,
    'multiple_choice'::TEXT as question_type,
    'knowledge'::TEXT as cognitive_level,
    'bitcoin,digital_currency,decentralization'::TEXT as concepts,
    'Bitcoin Whitepaper'::TEXT as source_material;
$$;