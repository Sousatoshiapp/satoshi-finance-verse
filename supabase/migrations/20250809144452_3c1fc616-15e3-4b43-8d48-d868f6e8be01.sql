-- QUIZ SYSTEM REDESIGN - JANEIRO 2025
-- Novo esquema completo para sistema unificado de quiz

-- ==========================================
-- 1. TABELA DE QUESTÕES (BASE ÚNICA)
-- ==========================================

-- Enum para tópicos principais
CREATE TYPE quiz_topic AS ENUM ('DIA_A_DIA', 'ABC', 'CRIPTO');

-- Enum para dificuldades
CREATE TYPE quiz_difficulty AS ENUM ('EASY', 'MEDIUM', 'HARD', 'INSANE');

-- Tabela principal de questões
CREATE TABLE public.questions (
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

-- Estatísticas agregadas anônimas das questões
CREATE TABLE public.question_stats (
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE PRIMARY KEY,
    plays INTEGER NOT NULL DEFAULT 0,
    correct INTEGER NOT NULL DEFAULT 0,
    wrong INTEGER NOT NULL DEFAULT 0,
    avg_time_ms INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Versionamento/auditoria de questões
CREATE TABLE public.question_versions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    payload_json JSONB NOT NULL,
    changed_by UUID, -- opcional, user_id
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 2. PERFIS DE USUÁRIO ATUALIZADOS
-- ==========================================

-- Adicionar colunas para o sistema de quiz
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS xp_total INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS btz_balance NUMERIC(18,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS skill_rating INTEGER DEFAULT 1200, -- elo para matchmaking
ADD COLUMN IF NOT EXISTS srs_enabled BOOLEAN DEFAULT true;

-- ==========================================
-- 3. PROGRESSO DO USUÁRIO NAS QUESTÕES (SRS)
-- ==========================================

-- Enum para resultados
CREATE TYPE quiz_result AS ENUM ('CORRECT', 'WRONG');

-- Progresso individual por questão (implementa FSRS)
CREATE TABLE public.user_question_progress (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    last_result quiz_result,
    last_time_ms INTEGER,
    seen_count INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    next_review_at TIMESTAMPTZ,
    -- Campos FSRS
    srs_difficulty FLOAT DEFAULT 0.3,
    srs_stability FLOAT DEFAULT 1.0,
    srs_retrievability FLOAT DEFAULT 1.0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, question_id)
);

-- ==========================================
-- 4. SESSÕES DE QUIZ UNIFICADAS
-- ==========================================

-- Enum para modos de quiz
CREATE TYPE quiz_mode AS ENUM ('SOLO', 'DUEL', 'TOURNAMENT');

-- Enum para estados da sessão
CREATE TYPE quiz_session_state AS ENUM ('PENDING', 'ACTIVE', 'FINISHED', 'CANCELLED');

-- Sessões unificadas (solo/duelo/torneio compartilham)
CREATE TABLE public.quiz_sessions (
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
CREATE TABLE public.quiz_session_questions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    revealed_at TIMESTAMPTZ
);

-- Enum para respostas
CREATE TYPE quiz_answer_option AS ENUM ('A', 'B', 'C');

-- Respostas dos usuários
CREATE TABLE public.quiz_answers (
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
-- 5. SISTEMA DE DUELOS
-- ==========================================

-- Enum para estados do duelo
CREATE TYPE duel_state AS ENUM ('INVITED', 'MATCHED', 'ACTIVE', 'SETTLEMENT', 'FINISHED', 'EXPIRED');

-- Duelos
CREATE TABLE public.duels (
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

-- Enum para status do convite
CREATE TYPE duel_invite_status AS ENUM ('SENT', 'SEEN', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- Convites para duelos
CREATE TABLE public.duel_invites (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    duel_id UUID NOT NULL REFERENCES public.duels(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status duel_invite_status NOT NULL DEFAULT 'SENT',
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    responded_at TIMESTAMPTZ
);

-- Enum para status da fila
CREATE TYPE matchmaking_status AS ENUM ('QUEUED', 'MATCHED', 'CANCELLED');

-- Fila de matchmaking
CREATE TABLE public.matchmaking_queue (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_pref TEXT[], -- null = qualquer tópico
    stake_btz NUMERIC(18,2), -- null = qualquer stake
    elo INTEGER NOT NULL, -- snapshot do elo no momento
    queued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status matchmaking_status NOT NULL DEFAULT 'QUEUED'
);

-- Enum para tipos de transação no escrow
CREATE TYPE escrow_transaction_type AS ENUM ('HOLD', 'RELEASE', 'REFUND');

-- Ledger do escrow para apostas
CREATE TABLE public.escrow_ledger (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    duel_id UUID NOT NULL REFERENCES public.duels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount_btz NUMERIC(18,2) NOT NULL,
    type escrow_transaction_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 6. SISTEMA DE TORNEIOS
-- ==========================================

-- Enum para tipos de torneio
CREATE TYPE tournament_type AS ENUM ('ASYNC_SCORE', 'BRACKET_1V1');

-- Enum para estados do torneio
CREATE TYPE tournament_state AS ENUM ('ANNOUNCED', 'REG_OPEN', 'ACTIVE', 'FINISHED', 'CANCELLED');

-- Torneios
CREATE TABLE public.tournaments (
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

-- Enum para estado da inscrição
CREATE TYPE tournament_registration_state AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'REFUNDED');

-- Inscrições nos torneios
CREATE TABLE public.tournament_registrations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    state tournament_registration_state NOT NULL DEFAULT 'PENDING_PAYMENT',
    paid_btz NUMERIC(18,2) NOT NULL DEFAULT 0,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tournament_id, user_id)
);

-- Enum para estado da partida (apenas para BRACKET_1V1)
CREATE TYPE tournament_match_state AS ENUM ('SCHEDULED', 'ACTIVE', 'FINISHED', 'WALKOVER');

-- Partidas de torneio (para BRACKET_1V1)
CREATE TABLE public.tournament_matches (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    round INTEGER NOT NULL,
    session_id UUID REFERENCES public.quiz_sessions(id) ON DELETE SET NULL,
    player_a_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    player_b_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    state tournament_match_state NOT NULL DEFAULT 'SCHEDULED'
);

-- ==========================================
-- 7. ÍNDICES PARA PERFORMANCE
-- ==========================================

-- Questões
CREATE INDEX idx_questions_topic_difficulty ON public.questions(topic, difficulty);
CREATE INDEX idx_questions_active ON public.questions(is_active) WHERE is_active = true;
CREATE INDEX idx_questions_tags ON public.questions USING GIN(tags);

-- Progresso do usuário
CREATE INDEX idx_user_question_progress_next_review ON public.user_question_progress(user_id, next_review_at) WHERE next_review_at IS NOT NULL;
CREATE INDEX idx_user_question_progress_seen ON public.user_question_progress(user_id, seen_count);

-- Sessões
CREATE INDEX idx_quiz_sessions_created_by ON public.quiz_sessions(created_by);
CREATE INDEX idx_quiz_sessions_mode_state ON public.quiz_sessions(mode, state);

-- Duelos
CREATE INDEX idx_duels_challenger ON public.duels(challenger_id);
CREATE INDEX idx_duels_opponent ON public.duels(opponent_id);
CREATE INDEX idx_duels_state ON public.duels(state);

-- Matchmaking
CREATE INDEX idx_matchmaking_queue_status ON public.matchmaking_queue(status) WHERE status = 'QUEUED';
CREATE INDEX idx_matchmaking_queue_elo ON public.matchmaking_queue(elo) WHERE status = 'QUEUED';

-- Torneios
CREATE INDEX idx_tournaments_state ON public.tournaments(state);
CREATE INDEX idx_tournament_registrations_tournament ON public.tournament_registrations(tournament_id);

-- ==========================================
-- 8. RLS (ROW LEVEL SECURITY)
-- ==========================================

-- Ativar RLS em todas as tabelas
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_question_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_session_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;

-- Políticas para questões (leitura pública, edição apenas admins)
CREATE POLICY "Questions são visíveis para todos" ON public.questions FOR SELECT USING (is_active = true);
CREATE POLICY "Question stats são visíveis para todos" ON public.question_stats FOR SELECT USING (true);

-- Políticas para progresso do usuário
CREATE POLICY "Users can view their own progress" ON public.user_question_progress FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can update their own progress" ON public.user_question_progress FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can modify their own progress" ON public.user_question_progress FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Políticas para sessões de quiz
CREATE POLICY "Users can view their own sessions" ON public.quiz_sessions FOR SELECT USING (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can create their own sessions" ON public.quiz_sessions FOR INSERT WITH CHECK (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can update their own sessions" ON public.quiz_sessions FOR UPDATE USING (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Políticas para duelos
CREATE POLICY "Users can view their own duels" ON public.duels FOR SELECT USING (
    challenger_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR 
    opponent_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create duels" ON public.duels FOR INSERT WITH CHECK (challenger_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can update their duels" ON public.duels FOR UPDATE USING (
    challenger_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR 
    opponent_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- ==========================================
-- 9. TRIGGERS E FUNÇÕES
-- ==========================================

-- Função para atualizar question_stats
CREATE OR REPLACE FUNCTION update_question_stats()
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
CREATE TRIGGER trigger_update_question_stats
    AFTER INSERT ON public.quiz_answers
    FOR EACH ROW
    EXECUTE FUNCTION update_question_stats();

-- Função para calcular ELO após duelo
CREATE OR REPLACE FUNCTION update_elo_after_duel()
RETURNS TRIGGER AS $$
DECLARE
    challenger_elo INTEGER;
    opponent_elo INTEGER;
    k_factor INTEGER := 32;
    expected_challenger FLOAT;
    expected_opponent FLOAT;
    new_challenger_elo INTEGER;
    new_opponent_elo INTEGER;
BEGIN
    -- Apenas executar quando duelo é finalizado
    IF NEW.state != 'FINISHED' OR NEW.winner_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Buscar ELOs atuais
    SELECT skill_rating INTO challenger_elo FROM profiles WHERE id = NEW.challenger_id;
    SELECT skill_rating INTO opponent_elo FROM profiles WHERE id = NEW.opponent_id;
    
    -- Calcular expectativas
    expected_challenger := 1.0 / (1.0 + power(10.0, (opponent_elo - challenger_elo) / 400.0));
    expected_opponent := 1.0 - expected_challenger;
    
    -- Calcular novos ELOs
    IF NEW.winner_id = NEW.challenger_id THEN
        new_challenger_elo := challenger_elo + k_factor * (1 - expected_challenger);
        new_opponent_elo := opponent_elo + k_factor * (0 - expected_opponent);
    ELSE
        new_challenger_elo := challenger_elo + k_factor * (0 - expected_challenger);
        new_opponent_elo := opponent_elo + k_factor * (1 - expected_opponent);
    END IF;
    
    -- Atualizar ELOs
    UPDATE profiles SET skill_rating = new_challenger_elo WHERE id = NEW.challenger_id;
    UPDATE profiles SET skill_rating = new_opponent_elo WHERE id = NEW.opponent_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar ELO após duelo
CREATE TRIGGER trigger_update_elo_after_duel
    AFTER UPDATE ON public.duels
    FOR EACH ROW
    EXECUTE FUNCTION update_elo_after_duel();