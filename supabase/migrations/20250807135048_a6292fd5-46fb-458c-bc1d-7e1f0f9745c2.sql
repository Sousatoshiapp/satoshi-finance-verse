-- Redução de 80% nos ganhos de XP - Atualização das tabelas daily_missions e daily_challenges

-- Atualizar XP rewards nas daily_missions (redução de 80%)
UPDATE daily_missions 
SET xp_reward = CASE 
  WHEN difficulty = 'easy' THEN 10        -- 50 → 10 XP
  WHEN difficulty = 'medium' THEN 15      -- 75 → 15 XP  
  WHEN difficulty = 'hard' THEN 20        -- 100 → 20 XP
  WHEN is_weekend_special = true THEN 30  -- 150 → 30 XP
  ELSE 10
END
WHERE xp_reward > 10; -- Only update if current value is higher

-- Atualizar XP rewards nas daily_challenges (redução de 80%)
UPDATE daily_challenges 
SET xp_reward = CASE
  WHEN difficulty = 'easy' THEN 20        -- 100 → 20 XP
  WHEN difficulty = 'medium' THEN 30      -- 150 → 30 XP
  WHEN difficulty = 'hard' THEN 40        -- 200 → 40 XP
  WHEN difficulty = 'extreme' THEN 60     -- 300 → 60 XP
  ELSE 20
END
WHERE xp_reward > 20; -- Only update if current value is higher

-- Log das alterações para auditoria
INSERT INTO admin_sessions (id, user_id, session_token, expires_at, created_at, last_activity)
SELECT 
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000'::uuid,
  'xp_reduction_migration_' || extract(epoch from now())::text,
  now() + interval '1 hour',
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM admin_sessions 
  WHERE session_token LIKE 'xp_reduction_migration_%'
);

-- Comentário sobre as mudanças
COMMENT ON TABLE daily_missions IS 'XP rewards reduced by 80% on 2025-01-07 to rebalance game progression';
COMMENT ON TABLE daily_challenges IS 'XP rewards reduced by 80% on 2025-01-07 to rebalance game progression';