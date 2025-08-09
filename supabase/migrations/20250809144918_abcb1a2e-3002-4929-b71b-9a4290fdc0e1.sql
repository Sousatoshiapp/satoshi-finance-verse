-- QUIZ SYSTEM REDESIGN - JANEIRO 2025 (CORRIGIDO)
-- Ajustando estrutura existente sem conflitos

-- ==========================================
-- 1. VERIFICAR E CRIAR ENUMS
-- ==========================================

-- Criar novos enums apenas se não existirem
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

-- ==========================================
-- 2. NOVA TABELA DE QUESTÕES (SIMPLIFICADA)
-- ==========================================

-- Criar apenas se não existe
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE, -- opcional, para import/export
    topic quiz_topic NOT NULL,
    subtopic TEXT, -- opcional (ex: "cartão", "inflação", "DeFi")
    difficulty quiz_difficulty NOT NULL,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL, -- SEMPRE a correta (regra Satoshi)
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    explanation TEXT NOT NULL, -- curta, tom GenZ
    lang TEXT NOT NULL DEFAULT 'pt-BR',
    tags TEXT[], -- opcional
    source TEXT, -- opcional (referência/autor)
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
-- 3. ATUALIZAR TABELA DE PROFILES
-- ==========================================

-- Adicionar novas colunas se não existirem
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
-- 4. ATUALIZAR USER_QUESTION_PROGRESS (EXISTENTE)
-- ==========================================

-- Adicionar campos FSRS se não existirem
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
-- 5. NOVOS ENUMS PARA SESSÕES
-- ==========================================

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
-- 6. SESSÕES UNIFICADAS DE QUIZ
-- ==========================================

-- Sessões unificadas (solo/duelo/torneio compartilham)
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    mode quiz_mode NOT NULL,
    topic_filter TEXT[], -- null = todos os tópicos
    difficulty_policy JSONB NOT NULL DEFAULT '{"mode":"adaptive","weights":{"EASY":0.5,"MEDIUM":0.35,"HARD":0.12,"INSANE":0.03}}',
    question_count INTEGER NOT NULL DEFAULT 10,
    state quiz_session_state NOT NULL DEFAULT 'PENDING',
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tournament_id UUID, -- null se não for torneio
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ
);

-- Questões específicas de cada sessão
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
-- 7. SISTEMA DE DUELOS (NOVO)
-- ==========================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'duel_state') THEN
        CREATE TYPE duel_state AS ENUM ('INVITED', 'MATCHED', 'ACTIVE', 'SETTLEMENT', 'FINISHED', 'EXPIRED');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'duel_invite_status') THEN
        CREATE TYPE duel_invite_status AS ENUM ('SENT', 'SEEN', 'ACCEPTED', 'DECLINED', 'EXPIRED');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'matchmaking_status') THEN
        CREATE TYPE matchmaking_status AS ENUM ('QUEUED', 'MATCHED', 'CANCELLED');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'escrow_transaction_type') THEN
        CREATE TYPE escrow_transaction_type AS ENUM ('HOLD', 'RELEASE', 'REFUND');
    END IF;
END $$;

-- Duelos (nova estrutura)
CREATE TABLE IF NOT EXISTS public.duels_v2 (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
    challenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    opponent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- null até aceitar
    state duel_state NOT NULL DEFAULT 'INVITED',
    stake_btz NUMERIC(18,2) NOT NULL DEFAULT 0, -- aposta por jogador
    escrow_tx_id TEXT, -- referência da transação
    winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    accepted_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ
);

-- Convites para duelos
CREATE TABLE IF NOT EXISTS public.duel_invites_v2 (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    duel_id UUID NOT NULL REFERENCES public.duels_v2(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status duel_invite_status NOT NULL DEFAULT 'SENT',
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    responded_at TIMESTAMPTZ
);

-- Fila de matchmaking
CREATE TABLE IF NOT EXISTS public.matchmaking_queue (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_pref TEXT[], -- null = qualquer tópico
    stake_btz NUMERIC(18,2), -- null = qualquer stake
    elo INTEGER NOT NULL, -- snapshot do elo no momento
    queued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status matchmaking_status NOT NULL DEFAULT 'QUEUED'
);

-- Ledger do escrow para apostas
CREATE TABLE IF NOT EXISTS public.escrow_ledger (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    duel_id UUID NOT NULL REFERENCES public.duels_v2(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount_btz NUMERIC(18,2) NOT NULL,
    type escrow_transaction_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 8. SISTEMA DE TORNEIOS
-- ==========================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tournament_type') THEN
        CREATE TYPE tournament_type AS ENUM ('ASYNC_SCORE', 'BRACKET_1V1');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tournament_state') THEN
        CREATE TYPE tournament_state AS ENUM ('ANNOUNCED', 'REG_OPEN', 'ACTIVE', 'FINISHED', 'CANCELLED');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tournament_registration_state') THEN
        CREATE TYPE tournament_registration_state AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'REFUNDED');
    END IF;
END $$;

-- Torneios
CREATE TABLE IF NOT EXISTS public.tournaments_v2 (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type tournament_type NOT NULL,
    entry_fee_btz NUMERIC(18,2) NOT NULL DEFAULT 0,
    max_players INTEGER,
    topic_filter TEXT[], -- null = todos os tópicos
    difficulty_policy JSONB NOT NULL DEFAULT '{"mode":"adaptive","weights":{"EASY":0.5,"MEDIUM":0.35,"HARD":0.12,"INSANE":0.03}}',
    state tournament_state NOT NULL DEFAULT 'ANNOUNCED',
    schedule_json JSONB, -- janelas de jogo
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inscrições nos torneios
CREATE TABLE IF NOT EXISTS public.tournament_registrations_v2 (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES public.tournaments_v2(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    state tournament_registration_state NOT NULL DEFAULT 'PENDING_PAYMENT',
    paid_btz NUMERIC(18,2) NOT NULL DEFAULT 0,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tournament_id, user_id)
);

-- ==========================================
-- 9. ÍNDICES PARA PERFORMANCE
-- ==========================================

-- Questões
CREATE INDEX IF NOT EXISTS idx_questions_topic_difficulty ON public.questions(topic, difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_active ON public.questions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_questions_tags ON public.questions USING GIN(tags);

-- Progresso do usuário (apenas se não existir)
CREATE INDEX IF NOT EXISTS idx_user_question_progress_next_review ON public.user_question_progress(user_id, next_review_at) WHERE next_review_at IS NOT NULL;

-- Sessões
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_created_by ON public.quiz_sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_mode_state ON public.quiz_sessions(mode, state);

-- Matchmaking
CREATE INDEX IF NOT EXISTS idx_matchmaking_queue_status ON public.matchmaking_queue(status) WHERE status = 'QUEUED';
CREATE INDEX IF NOT EXISTS idx_matchmaking_queue_elo ON public.matchmaking_queue(elo) WHERE status = 'QUEUED';

-- ==========================================
-- 10. RLS (ROW LEVEL SECURITY) 
-- ==========================================

-- Ativar RLS apenas nas novas tabelas
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_session_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duels_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_invites_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_registrations_v2 ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
DROP POLICY IF EXISTS "Questions são visíveis para todos" ON public.questions;
CREATE POLICY "Questions são visíveis para todos" ON public.questions FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Question stats são visíveis para todos" ON public.question_stats;
CREATE POLICY "Question stats são visíveis para todos" ON public.question_stats FOR SELECT USING (true);

-- Políticas para sessões de quiz
DROP POLICY IF EXISTS "Users can view their own quiz sessions" ON public.quiz_sessions;
CREATE POLICY "Users can view their own quiz sessions" ON public.quiz_sessions FOR SELECT USING (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can create their own quiz sessions" ON public.quiz_sessions;
CREATE POLICY "Users can create their own quiz sessions" ON public.quiz_sessions FOR INSERT WITH CHECK (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their own quiz sessions" ON public.quiz_sessions;
CREATE POLICY "Users can update their own quiz sessions" ON public.quiz_sessions FOR UPDATE USING (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ==========================================
-- 11. FUNÇÕES BÁSICAS
-- ==========================================

-- Função para atualizar question_stats
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

-- Trigger para atualizar stats quando resposta é inserida
DROP TRIGGER IF EXISTS trigger_update_question_stats_v2 ON public.quiz_answers;
CREATE TRIGGER trigger_update_question_stats_v2
    AFTER INSERT ON public.quiz_answers
    FOR EACH ROW
    EXECUTE FUNCTION update_question_stats_v2();