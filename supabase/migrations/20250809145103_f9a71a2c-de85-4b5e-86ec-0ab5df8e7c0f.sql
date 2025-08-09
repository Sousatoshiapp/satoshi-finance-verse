-- QUIZ SYSTEM REDESIGN - JANEIRO 2025 (CORRIGIDO v2)
-- Corrigindo nome da coluna e criando estrutura básica

-- ==========================================
-- 1. CRIAR ENUMS NECESSÁRIOS
-- ==========================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quiz_topic') THEN
        CREATE TYPE quiz_topic AS ENUM ('DIA_A_DIA', 'ABC', 'CRIPTO');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quiz_difficulty') THEN
        CREATE TYPE quiz_difficulty AS ENUM ('EASY', 'MEDIUM', 'HARD', 'INSANE');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quiz_mode') THEN
        CREATE TYPE quiz_mode AS ENUM ('SOLO', 'DUEL', 'TOURNAMENT');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quiz_session_state') THEN
        CREATE TYPE quiz_session_state AS ENUM ('PENDING', 'ACTIVE', 'FINISHED', 'CANCELLED');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quiz_answer_option') THEN
        CREATE TYPE quiz_answer_option AS ENUM ('A', 'B', 'C');
    END IF;
END $$;

-- ==========================================
-- 2. NOVA TABELA DE QUESTÕES SIMPLIFICADA
-- ==========================================

CREATE TABLE IF NOT EXISTS public.questions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE, 
    topic quiz_topic NOT NULL,
    subtopic TEXT, 
    difficulty quiz_difficulty NOT NULL,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL, -- SEMPRE a correta
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    explanation TEXT NOT NULL,
    lang TEXT NOT NULL DEFAULT 'pt-BR',
    tags TEXT[],
    source TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Estatísticas das questões
CREATE TABLE IF NOT EXISTS public.question_stats (
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE PRIMARY KEY,
    plays INTEGER NOT NULL DEFAULT 0,
    correct INTEGER NOT NULL DEFAULT 0,
    wrong INTEGER NOT NULL DEFAULT 0,
    avg_time_ms INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 3. ATUALIZAR PERFIS COM SKILL_RATING
-- ==========================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'skill_rating') THEN
        ALTER TABLE public.profiles ADD COLUMN skill_rating INTEGER DEFAULT 1200;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'srs_enabled') THEN
        ALTER TABLE public.profiles ADD COLUMN srs_enabled BOOLEAN DEFAULT true;
    END IF;
END $$;

-- ==========================================
-- 4. ADICIONAR CAMPOS FSRS À TABELA EXISTENTE
-- ==========================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_question_progress' AND column_name = 'srs_difficulty') THEN
        ALTER TABLE public.user_question_progress ADD COLUMN srs_difficulty FLOAT DEFAULT 0.3;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_question_progress' AND column_name = 'srs_stability') THEN
        ALTER TABLE public.user_question_progress ADD COLUMN srs_stability FLOAT DEFAULT 1.0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_question_progress' AND column_name = 'srs_retrievability') THEN
        ALTER TABLE public.user_question_progress ADD COLUMN srs_retrievability FLOAT DEFAULT 1.0;
    END IF;
END $$;

-- ==========================================
-- 5. SESSÕES UNIFICADAS DE QUIZ
-- ==========================================

CREATE TABLE IF NOT EXISTS public.quiz_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    mode quiz_mode NOT NULL,
    topic_filter TEXT[],
    difficulty_policy JSONB NOT NULL DEFAULT '{"mode":"adaptive","weights":{"EASY":0.5,"MEDIUM":0.35,"HARD":0.12,"INSANE":0.03}}',
    question_count INTEGER NOT NULL DEFAULT 10,
    state quiz_session_state NOT NULL DEFAULT 'PENDING',
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tournament_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ
);

-- Questões de cada sessão
CREATE TABLE IF NOT EXISTS public.quiz_session_questions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    revealed_at TIMESTAMPTZ
);

-- Respostas dos usuários
CREATE TABLE IF NOT EXISTS public.quiz_answers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    chosen quiz_answer_option NOT NULL,
    is_correct BOOLEAN NOT NULL,
    elapsed_ms INTEGER NOT NULL,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 6. ÍNDICES ESSENCIAIS
-- ==========================================

-- Questões
CREATE INDEX IF NOT EXISTS idx_questions_topic_difficulty ON public.questions(topic, difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_active ON public.questions(is_active) WHERE is_active = true;

-- Progresso do usuário (usando nome correto da coluna)
CREATE INDEX IF NOT EXISTS idx_user_question_progress_next_review ON public.user_question_progress(user_id, next_review_date) WHERE next_review_date IS NOT NULL;

-- Sessões
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_created_by ON public.quiz_sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_mode_state ON public.quiz_sessions(mode, state);

-- ==========================================
-- 7. RLS BÁSICO
-- ==========================================

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_session_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
DROP POLICY IF EXISTS "Questions são visíveis para todos" ON public.questions;
CREATE POLICY "Questions são visíveis para todos" ON public.questions FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Question stats são visíveis para todos" ON public.question_stats;
CREATE POLICY "Question stats são visíveis para todos" ON public.question_stats FOR SELECT USING (true);

-- Políticas para sessões
DROP POLICY IF EXISTS "Users can view their own quiz sessions" ON public.quiz_sessions;
CREATE POLICY "Users can view their own quiz sessions" ON public.quiz_sessions FOR SELECT USING (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can create their own quiz sessions" ON public.quiz_sessions;
CREATE POLICY "Users can create their own quiz sessions" ON public.quiz_sessions FOR INSERT WITH CHECK (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their own quiz sessions" ON public.quiz_sessions;
CREATE POLICY "Users can update their own quiz sessions" ON public.quiz_sessions FOR UPDATE USING (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Políticas para respostas
DROP POLICY IF EXISTS "Users can view their own quiz answers" ON public.quiz_answers;
CREATE POLICY "Users can view their own quiz answers" ON public.quiz_answers FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can create their own quiz answers" ON public.quiz_answers;
CREATE POLICY "Users can create their own quiz answers" ON public.quiz_answers FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ==========================================
-- 8. FUNÇÃO PARA ATUALIZAR STATS
-- ==========================================

CREATE OR REPLACE FUNCTION update_question_stats_v2()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.question_stats (question_id, plays, correct, wrong)
    VALUES (NEW.question_id, 1, CASE WHEN NEW.is_correct THEN 1 ELSE 0 END, CASE WHEN NEW.is_correct THEN 0 ELSE 1 END)
    ON CONFLICT (question_id) DO UPDATE SET
        plays = question_stats.plays + 1,
        correct = question_stats.correct + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
        wrong = question_stats.wrong + CASE WHEN NEW.is_correct THEN 0 ELSE 1 END,
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar stats
DROP TRIGGER IF EXISTS trigger_update_question_stats_v2 ON public.quiz_answers;
CREATE TRIGGER trigger_update_question_stats_v2
    AFTER INSERT ON public.quiz_answers
    FOR EACH ROW
    EXECUTE FUNCTION update_question_stats_v2();