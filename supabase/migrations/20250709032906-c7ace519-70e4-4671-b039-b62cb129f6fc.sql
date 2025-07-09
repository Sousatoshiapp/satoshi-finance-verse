-- ================================================================================
-- RESOLUÇÃO DOS WARNINGS DO SUPABASE - MIGRAÇÃO ABRANGENTE
-- ================================================================================

-- 1. ADICIONAR ÍNDICES FALTANTES PARA PERFORMANCE
-- Índices em user_id para tabelas que não têm
CREATE INDEX IF NOT EXISTS idx_user_avatars_user_id ON public.user_avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_user_products_user_id ON public.user_products(user_id);
CREATE INDEX IF NOT EXISTS idx_user_districts_user_id ON public.user_districts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_teams_user_id ON public.user_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_district_activities_user_id ON public.district_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quest_progress_user_id ON public.user_quest_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_leaderboards_user_id ON public.weekly_leaderboards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON public.user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_loot_boxes_user_id ON public.user_loot_boxes(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON public.social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stories_user_id ON public.user_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_story_views_user_id ON public.user_story_views(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON public.user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant1_id ON public.conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2_id ON public.conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_duel_invites_challenger_id ON public.duel_invites(challenger_id);
CREATE INDEX IF NOT EXISTS idx_duel_invites_challenged_id ON public.duel_invites(challenged_id);
CREATE INDEX IF NOT EXISTS idx_duels_player1_id ON public.duels(player1_id);
CREATE INDEX IF NOT EXISTS idx_duels_player2_id ON public.duels(player2_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participations_user_id ON public.tournament_participations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mission_progress_user_id ON public.user_mission_progress(user_id);

-- Índices em created_at para queries de ordenação
CREATE INDEX IF NOT EXISTS idx_user_avatars_created_at ON public.user_avatars(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_products_created_at ON public.user_products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_districts_created_at ON public.districts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_teams_created_at ON public.teams(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_district_activities_created_at ON public.district_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_created_at ON public.user_badges(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_created_at ON public.user_achievements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tournament_participations_created_at ON public.tournament_participations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_duel_invites_created_at ON public.duel_invites(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_duels_created_at ON public.duels(created_at DESC);

-- Índices compostos para queries frequentes
CREATE INDEX IF NOT EXISTS idx_user_districts_user_district ON public.user_districts(user_id, district_id);
CREATE INDEX IF NOT EXISTS idx_user_teams_user_team ON public.user_teams(user_id, team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_user ON public.team_members(team_id, user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_leaderboards_week_user ON public.weekly_leaderboards(week_start_date, user_id);
CREATE INDEX IF NOT EXISTS idx_user_mission_progress_user_mission ON public.user_mission_progress(user_id, mission_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_portfolio_asset ON public.portfolio_holdings(portfolio_id, asset_symbol);

-- Índices para status e flags
CREATE INDEX IF NOT EXISTS idx_duel_invites_status ON public.duel_invites(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_duels_status ON public.duels(status) WHERE status IN ('active', 'waiting');
CREATE INDEX IF NOT EXISTS idx_tournaments_is_active ON public.tournaments(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_daily_missions_is_active ON public.daily_missions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_loot_boxes_opened ON public.user_loot_boxes(opened) WHERE opened = false;
CREATE INDEX IF NOT EXISTS idx_achievements_type ON public.achievements(type);
CREATE INDEX IF NOT EXISTS idx_loot_items_type ON public.loot_items(type);
CREATE INDEX IF NOT EXISTS idx_power_ups_type ON public.power_ups(type);

-- 2. ADICIONAR CONSTRAINTS FALTANTES
-- Constraints de CHECK para validação de dados
DO $$ 
BEGIN 
    -- Check if constraint doesn't exist before adding
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
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_quiz_sessions_questions_positive') THEN
        ALTER TABLE public.quiz_sessions ADD CONSTRAINT chk_quiz_sessions_questions_positive CHECK (questions_total > 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_quiz_sessions_correct_valid') THEN
        ALTER TABLE public.quiz_sessions ADD CONSTRAINT chk_quiz_sessions_correct_valid CHECK (questions_correct >= 0 AND questions_correct <= questions_total);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_quiz_sessions_incorrect_valid') THEN
        ALTER TABLE public.quiz_sessions ADD CONSTRAINT chk_quiz_sessions_incorrect_valid CHECK (questions_incorrect >= 0 AND questions_incorrect <= questions_total);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_quiz_sessions_performance_valid') THEN
        ALTER TABLE public.quiz_sessions ADD CONSTRAINT chk_quiz_sessions_performance_valid CHECK (performance_score >= 0 AND performance_score <= 1);
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_weekly_leaderboards_xp_non_negative') THEN
        ALTER TABLE public.weekly_leaderboards ADD CONSTRAINT chk_weekly_leaderboards_xp_non_negative CHECK (xp_earned >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_weekly_leaderboards_score_non_negative') THEN
        ALTER TABLE public.weekly_leaderboards ADD CONSTRAINT chk_weekly_leaderboards_score_non_negative CHECK (quiz_score >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_weekly_leaderboards_duels_non_negative') THEN
        ALTER TABLE public.weekly_leaderboards ADD CONSTRAINT chk_weekly_leaderboards_duels_non_negative CHECK (duels_won >= 0);
    END IF;
END $$;

-- 3. OTIMIZAÇÕES ESPECÍFICAS PARA QUERIES COMUNS
-- Índices para queries de leaderboard
CREATE INDEX IF NOT EXISTS idx_profiles_xp_level ON public.profiles(xp DESC, level DESC) WHERE is_bot = false;
CREATE INDEX IF NOT EXISTS idx_weekly_leaderboards_total_score ON public.weekly_leaderboards(total_score DESC, week_start_date DESC);

-- Índices para queries de duels
CREATE INDEX IF NOT EXISTS idx_duel_queue_skill_level ON public.duel_queue(skill_level, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_duels_status_created ON public.duels(status, created_at) WHERE status IN ('active', 'waiting');

-- Índices para queries de district
CREATE INDEX IF NOT EXISTS idx_districts_active_level ON public.districts(is_active, level_required) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_district_teams_district_members ON public.district_teams(district_id, members_count DESC);

-- 4. ADICIONAR ÍNDICES FALTANTES PARA ADMIN
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON public.admin_sessions(expires_at);

-- 5. ESTATÍSTICAS PARA OTIMIZADOR
-- Atualizar estatísticas das tabelas principais
ANALYZE public.profiles;
ANALYZE public.quiz_sessions;
ANALYZE public.weekly_leaderboards;
ANALYZE public.duels;
ANALYZE public.districts;
ANALYZE public.social_posts;
ANALYZE public.tournaments;
ANALYZE public.portfolios;

-- 6. CRIAR FUNÇÃO DE VALIDAÇÃO DE INTEGRIDADE
CREATE OR REPLACE FUNCTION public.validate_data_integrity()
RETURNS TABLE(table_name text, issue_count bigint, issue_description text)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verificar profiles sem user_id válido (exceto bots)
  RETURN QUERY
  SELECT 'profiles'::text, COUNT(*)::bigint, 'profiles with invalid user_id'::text
  FROM public.profiles 
  WHERE user_id IS NULL AND is_bot = false;
  
  -- Verificar quiz_sessions órfãos
  RETURN QUERY
  SELECT 'quiz_sessions'::text, COUNT(*)::bigint, 'quiz_sessions without valid user'::text
  FROM public.quiz_sessions qs
  WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = qs.user_id);
  
  -- Verificar weekly_leaderboards órfãos
  RETURN QUERY
  SELECT 'weekly_leaderboards'::text, COUNT(*)::bigint, 'weekly_leaderboards without valid user'::text
  FROM public.weekly_leaderboards wl
  WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = wl.user_id);
  
  -- Verificar duplicatas em user_districts
  RETURN QUERY
  SELECT 'user_districts'::text, COUNT(*)::bigint - COUNT(DISTINCT user_id, district_id)::bigint, 'duplicate user_districts entries'::text
  FROM public.user_districts;
  
  -- Verificar dados inconsistentes em portfolios
  RETURN QUERY
  SELECT 'portfolios'::text, COUNT(*)::bigint, 'portfolios with negative current_balance'::text
  FROM public.portfolios 
  WHERE current_balance < 0;
END;
$$;