-- FASE 1: CRIAR VIEWS MASCARADAS PARA DADOS PÚBLICOS

-- 1. View mascarada para perfis públicos (resolve: User Personal Information Exposed)
CREATE OR REPLACE VIEW profiles_public AS
SELECT 
  id,
  -- Nickname mascarado para privacidade mas mantém funcionalidade
  CASE 
    WHEN LENGTH(nickname) <= 3 THEN nickname
    ELSE LEFT(nickname, 2) || REPEAT('*', LENGTH(nickname) - 3) || RIGHT(nickname, 1)
  END as nickname_masked,
  level,
  -- XP em faixas para leaderboards funcionarem
  CASE 
    WHEN xp >= 10000 THEN 10000 + (FLOOR((xp - 10000) / 1000) * 1000)
    WHEN xp >= 1000 THEN 1000 + (FLOOR((xp - 1000) / 500) * 500)
    ELSE FLOOR(xp / 100) * 100
  END as xp_range,
  -- BTZ em faixas aproximadas
  CASE 
    WHEN points >= 10000 THEN FLOOR(points / 5000) * 5000
    WHEN points >= 1000 THEN FLOOR(points / 1000) * 1000
    ELSE FLOOR(points / 100) * 100
  END as points_range,
  current_avatar_id,
  subscription_tier,
  created_at,
  is_bot
FROM profiles;

-- 2. View mascarada para portfolios (resolve: Financial Portfolio Data Accessible by Anyone)
CREATE OR REPLACE VIEW portfolios_public AS
SELECT 
  id,
  name,
  -- Valores financeiros aproximados
  CASE 
    WHEN initial_balance >= 100000 THEN FLOOR(initial_balance / 50000) * 50000
    WHEN initial_balance >= 10000 THEN FLOOR(initial_balance / 10000) * 10000
    ELSE FLOOR(initial_balance / 1000) * 1000
  END as balance_range,
  -- Performance em faixas
  CASE 
    WHEN performance_percentage >= 50 THEN '>50%'
    WHEN performance_percentage >= 20 THEN '20-50%'
    WHEN performance_percentage >= 0 THEN '0-20%'
    WHEN performance_percentage >= -20 THEN '0 to -20%'
    ELSE '<-20%'
  END as performance_range,
  district_theme,
  is_public,
  created_at
FROM portfolios
WHERE is_public = true;

-- 3. View mascarada para atividades sociais (resolve: Complete Social Activity History Exposed)
CREATE OR REPLACE VIEW activity_feed_public AS
SELECT 
  id,
  user_id,
  activity_type,
  -- Dados de atividade sem informações sensíveis
  CASE 
    WHEN activity_type IN ('level_up', 'achievement_unlock', 'tournament_win') THEN 
      jsonb_build_object(
        'level', activity_data->>'level',
        'achievement', activity_data->>'achievement',
        'public_data', true
      )
    ELSE jsonb_build_object('type', 'activity', 'public_data', true)
  END as activity_data_public,
  created_at
FROM activity_feed
WHERE activity_type IN ('level_up', 'achievement_unlock', 'tournament_win', 'portfolio_creation');

-- 4. View mascarada para pagamentos crypto (resolve: Cryptocurrency Payment Information Exposed)
CREATE OR REPLACE VIEW crypto_payments_public AS
SELECT 
  id,
  user_id,
  product_id,
  -- Valores aproximados por faixas
  CASE 
    WHEN amount_usd >= 1000 THEN '1000+'
    WHEN amount_usd >= 500 THEN '500-999'
    WHEN amount_usd >= 100 THEN '100-499'
    WHEN amount_usd >= 50 THEN '50-99'
    ELSE '< 50'
  END as amount_range,
  status,
  created_at
FROM crypto_payments
WHERE status = 'completed';

-- 5. View sanitizada para dados administrativos (resolve: Administrative Security Tokens Publicly Accessible)
CREATE OR REPLACE VIEW admin_data_sanitized AS
SELECT 
  au.user_id,
  au.role,
  au.is_active,
  au.created_at,
  -- Session info sem tokens sensíveis
  COUNT(ads.id) as active_sessions_count
FROM admin_users au
LEFT JOIN admin_sessions ads ON au.user_id = ads.user_id 
  AND ads.expires_at > now()
WHERE au.is_active = true
GROUP BY au.user_id, au.role, au.is_active, au.created_at;

-- FASE 2: ATUALIZAR POLÍTICAS RLS PROBLEMÁTICAS

-- 1. Corrigir políticas do profiles (manter funcionalidade atual para usuários logados)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

CREATE POLICY "Users can view their own complete profile" 
ON profiles FOR SELECT 
USING (user_id = auth.uid());

-- 2. Corrigir políticas dos portfolios
DROP POLICY IF EXISTS "Portfolios are viewable by everyone" ON portfolios;

CREATE POLICY "Users can view their own portfolios" 
ON portfolios FOR SELECT 
USING (user_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Public portfolios have limited visibility" 
ON portfolios FOR SELECT 
USING (is_public = true AND auth.uid() IS NOT NULL);

-- 3. Corrigir políticas do activity_feed
DROP POLICY IF EXISTS "Users can view limited public activities" ON activity_feed;

CREATE POLICY "Users can view their own activity" 
ON activity_feed FOR SELECT 
USING (user_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Limited public activity visibility" 
ON activity_feed FOR SELECT 
USING (
  activity_type IN ('level_up', 'achievement_unlock', 'tournament_win') 
  AND auth.uid() IS NOT NULL
);

-- 4. Corrigir políticas dos crypto_payments
DROP POLICY IF EXISTS "Users can view all crypto payments" ON crypto_payments;

CREATE POLICY "Users can view their own crypto payments" 
ON crypto_payments FOR SELECT 
USING (user_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

-- 5. Corrigir políticas dos admin_tokens (acesso restrito)
DROP POLICY IF EXISTS "Service role can manage admin tokens" ON admin_tokens;

CREATE POLICY "Only service role can access admin tokens" 
ON admin_tokens FOR ALL 
USING (current_setting('role') = 'service_role');

-- FASE 3: GRANTS PARA VIEWS PÚBLICAS
GRANT SELECT ON profiles_public TO anon, authenticated;
GRANT SELECT ON portfolios_public TO anon, authenticated;
GRANT SELECT ON activity_feed_public TO anon, authenticated;
GRANT SELECT ON crypto_payments_public TO anon, authenticated;
GRANT SELECT ON admin_data_sanitized TO authenticated;