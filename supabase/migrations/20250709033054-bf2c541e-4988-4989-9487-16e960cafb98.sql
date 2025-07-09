-- ================================================================================
-- RESOLUÇÃO DOS WARNINGS DO SUPABASE - MIGRAÇÃO BÁSICA E SEGURA
-- ================================================================================

-- 1. ÍNDICES BÁSICOS PARA TABELAS PRINCIPAIS
-- Apenas tabelas que sabemos que existem
CREATE INDEX IF NOT EXISTS idx_profiles_level_xp ON public.profiles(level DESC, xp DESC) WHERE is_bot = false;
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_created ON public.quiz_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_leaderboards_user_week ON public.weekly_leaderboards(user_id, week_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_districts_active ON public.districts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_social_posts_created ON public.social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant1_id, participant2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_duel_invites_status_created ON public.duel_invites(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_duels_status_created ON public.duels(status, created_at DESC);

-- 2. ÍNDICES PARA ADMIN TABLES (que sabemos que existem)
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role_active ON public.admin_users(role, is_active);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_expires ON public.admin_sessions(user_id, expires_at);

-- 3. CONSTRAINTS BÁSICOS PARA VALIDAÇÃO
DO $$ 
BEGIN 
    -- Validações para profiles
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_profiles_level_positive') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_level_positive CHECK (level >= 1);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_profiles_xp_non_negative') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_xp_non_negative CHECK (xp >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_profiles_points_non_negative') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_points_non_negative CHECK (points >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_profiles_streak_non_negative') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_streak_non_negative CHECK (streak >= 0);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Continuar mesmo se algum constraint falhar
        NULL;
END $$;

-- 4. OTIMIZAÇÕES PARA QUERIES FREQUENTES
CREATE INDEX IF NOT EXISTS idx_quiz_questions_category ON public.quiz_questions(category);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON public.quiz_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_daily_missions_active_expires ON public.daily_missions(is_active, expires_at) WHERE is_active = true;

-- 5. ESTATÍSTICAS PARA TABELAS PRINCIPAIS
ANALYZE public.profiles;
ANALYZE public.quiz_sessions;
ANALYZE public.quiz_questions;
ANALYZE public.districts;
ANALYZE public.social_posts;
ANALYZE public.admin_users;
ANALYZE public.admin_sessions;