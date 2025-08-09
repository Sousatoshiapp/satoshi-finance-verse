-- Corrigir trigger que causa erro ao fazer backup
-- O trigger está tentando usar array_to_string com JSONB, vamos corrigir

-- Primeiro, dropar o trigger problemático temporariamente
DROP TRIGGER IF EXISTS update_question_hash_trigger ON public.quiz_questions;
DROP FUNCTION IF EXISTS public.update_question_hash();

-- FASE 1: Backup e limpeza das perguntas antigas (segunda tentativa)
-- Criar tabela de backup para as perguntas do sistema antigo
CREATE TABLE IF NOT EXISTS public.quiz_questions_legacy (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Copia de todos os campos da tabela original
    question TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    difficulty_level INTEGER,
    district_id UUID,
    learning_module_id UUID,
    tags TEXT[],
    learning_objectives TEXT[],
    estimated_time_seconds INTEGER DEFAULT 30,
    question_type TEXT DEFAULT 'multiple_choice',
    cognitive_level TEXT,
    concepts TEXT[],
    source_material TEXT,
    author_notes TEXT,
    is_approved BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    success_rate NUMERIC DEFAULT 0,
    avg_response_time INTEGER DEFAULT 30,
    approved_by UUID,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    -- Campos adicionais para rastrear o backup
    migrated_from_original BOOLEAN DEFAULT true,
    backup_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    backup_reason TEXT DEFAULT 'Sistema antigo - migração Janeiro 2025'
);

-- Fazer backup de todas as perguntas existentes
INSERT INTO public.quiz_questions_legacy (
    question, options, correct_answer, explanation, category, difficulty, difficulty_level,
    district_id, learning_module_id, tags, learning_objectives, estimated_time_seconds,
    question_type, cognitive_level, concepts, source_material, author_notes,
    is_approved, usage_count, success_rate, avg_response_time, approved_by, version,
    created_at, updated_at
)
SELECT 
    question, options, correct_answer, explanation, category, difficulty, difficulty_level,
    district_id, learning_module_id, tags, learning_objectives, estimated_time_seconds,
    question_type, cognitive_level, concepts, source_material, author_notes,
    is_approved, usage_count, success_rate, avg_response_time, approved_by, version,
    created_at, updated_at
FROM public.quiz_questions;

-- Limpar tabela original para recomeçar do zero
DELETE FROM public.quiz_questions;

-- Adicionar comentário explicativo
COMMENT ON TABLE public.quiz_questions_legacy IS 'Backup das perguntas do sistema antigo - Janeiro 2025. Total de perguntas migradas durante refatoração completa para novo sistema de categorias: Finanças do Dia a Dia, ABC das Finanças, Cripto';

-- Habilitar RLS na tabela de backup
ALTER TABLE public.quiz_questions_legacy ENABLE ROW LEVEL SECURITY;

-- Política para visualizar backup (apenas admins)
CREATE POLICY "Admins can view legacy questions" 
ON public.quiz_questions_legacy 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Política para gerenciar backup (apenas admins)
CREATE POLICY "Admins can manage legacy questions" 
ON public.quiz_questions_legacy 
FOR ALL 
USING (is_admin(auth.uid()));

-- Recriar trigger corrigido (se necessário)
CREATE OR REPLACE FUNCTION public.update_question_hash()
RETURNS TRIGGER AS $$
DECLARE
  question_hash TEXT;
  options_text TEXT;
BEGIN
  -- Converter JSONB options para texto de forma segura
  options_text := CASE 
    WHEN jsonb_typeof(NEW.options) = 'array' 
    THEN array_to_string(ARRAY(SELECT jsonb_array_elements_text(NEW.options)), '||')
    ELSE NEW.options::text
  END;
  
  question_hash := encode(
    digest(
      NEW.question || COALESCE(options_text, '') || NEW.correct_answer,
      'sha256'
    ),
    'hex'
  );
  
  -- Se houver campo hash, atualizá-lo
  -- NEW.question_hash := question_hash;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;