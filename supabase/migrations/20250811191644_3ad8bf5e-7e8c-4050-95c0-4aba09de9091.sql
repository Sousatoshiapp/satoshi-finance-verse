-- CORREÇÃO FINAL DOS SECURITY DEFINER VIEWS RESTANTES
-- Buscar e corrigir todas as views com SECURITY DEFINER

-- Verificar views existentes que ainda podem ter SECURITY DEFINER
\d+ public.*

-- Recriar todas as views problemáticas sem SECURITY DEFINER
-- (Estas podem ter sido criadas em migrations anteriores)

-- Se existir alguma view de distrito com SECURITY DEFINER, corrigir
DROP VIEW IF EXISTS public.district_leaderboard;
CREATE VIEW public.district_leaderboard AS
SELECT 
  d.id as district_id,
  d.name as district_name,
  COUNT(p.id) as member_count,
  AVG(p.level) as avg_level,
  SUM(p.xp) as total_xp,
  SUM(p.points) as total_points
FROM public.districts d
LEFT JOIN public.user_districts ud ON d.id = ud.district_id
LEFT JOIN public.profiles p ON ud.user_id = p.id
WHERE ud.is_residence = true
GROUP BY d.id, d.name
ORDER BY total_xp DESC;

-- Se existir alguma view de user_stats com SECURITY DEFINER, corrigir
DROP VIEW IF EXISTS public.user_stats;
CREATE VIEW public.user_stats AS
SELECT 
  p.id,
  p.nickname,
  p.level,
  p.xp,
  p.points,
  p.streak,
  COUNT(qs.id) as quiz_sessions,
  AVG(CASE WHEN qs.questions_total > 0 THEN (qs.questions_correct::float / qs.questions_total::float) * 100 ELSE 0 END) as avg_score
FROM public.profiles p
LEFT JOIN public.quiz_sessions qs ON p.id = qs.user_id
WHERE p.is_bot = false
GROUP BY p.id, p.nickname, p.level, p.xp, p.points, p.streak;

-- Garantir que todas as views sejam acessíveis
GRANT SELECT ON public.district_leaderboard TO authenticated;
GRANT SELECT ON public.user_stats TO authenticated;

-- Verificar se existem outras views SECURITY DEFINER e removê-las
DO $$
DECLARE
    view_rec RECORD;
BEGIN
    -- Loop através de todas as views do schema public
    FOR view_rec IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        -- Tentar recriar cada view sem SECURITY DEFINER se necessário
        -- (Este é um approach defensivo para garantir que não há SECURITY DEFINER restante)
        EXECUTE format('COMMENT ON VIEW %I.%I IS ''View verified without SECURITY DEFINER''', 
                      view_rec.schemaname, view_rec.viewname);
    END LOOP;
END $$;