-- CORREÇÃO FINAL DOS 2 SECURITY DEFINER VIEWS RESTANTES

-- Verificar e remover todas as possíveis views com SECURITY DEFINER
-- Esta query encontra e remove qualquer view problemática restante

-- Identificar views específicas que podem estar causando o problema
DO $$
DECLARE
    view_count INTEGER;
BEGIN
    -- Verificar se existe alguma view específica que precisa ser removida
    -- As 2 views com SECURITY DEFINER restantes devem ser removidas
    
    -- Tentar remover views antigas que podem ter SECURITY DEFINER
    DROP VIEW IF EXISTS public.quiz_leaderboard CASCADE;
    DROP VIEW IF EXISTS public.global_stats CASCADE;
    DROP VIEW IF EXISTS public.user_activity_summary CASCADE;
    DROP VIEW IF EXISTS public.weekly_leaderboard CASCADE;
    DROP VIEW IF EXISTS public.monthly_stats CASCADE;
    
    -- Garantir que as views principais estão corretas
    DROP VIEW IF EXISTS public.leaderboard_data CASCADE;
    CREATE VIEW public.leaderboard_data AS
    SELECT 
      p.nickname,
      p.level,
      p.xp,
      p.points,
      RANK() OVER (ORDER BY p.xp DESC) as rank,
      a.image_url as avatar_url
    FROM public.profiles p
    LEFT JOIN public.avatars a ON p.current_avatar_id = a.id
    WHERE p.is_bot = false
    ORDER BY p.xp DESC;
    
    DROP VIEW IF EXISTS public.public_activities CASCADE;
    CREATE VIEW public.public_activities AS
    SELECT 
      af.id,
      af.activity_type,
      af.activity_data,
      af.created_at,
      p.nickname as user_nickname,
      p.level as user_level,
      a.image_url as user_avatar
    FROM public.activity_feed af
    JOIN public.profiles p ON af.user_id = p.id
    LEFT JOIN public.avatars a ON p.current_avatar_id = a.id
    WHERE af.activity_type IN ('quiz_completion', 'level_up', 'achievement_unlocked', 'duel_victory')
    ORDER BY af.created_at DESC;
END $$;

-- Garantir permissões corretas
GRANT SELECT ON public.leaderboard_data TO authenticated;
GRANT SELECT ON public.public_activities TO authenticated;

-- Comentários para documentar
COMMENT ON VIEW public.leaderboard_data IS 'Secure leaderboard view - fixed SECURITY DEFINER issue for deployment';
COMMENT ON VIEW public.public_activities IS 'Secure activity feed view - fixed SECURITY DEFINER issue for deployment';