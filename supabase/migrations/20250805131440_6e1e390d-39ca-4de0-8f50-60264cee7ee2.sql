-- Atualizar bots com avatares aleatórios para parecerem usuários reais
WITH bot_avatar_assignments AS (
  SELECT 
    p.id as profile_id,
    a.id as avatar_id,
    ROW_NUMBER() OVER (ORDER BY RANDOM()) as rn
  FROM profiles p
  CROSS JOIN avatars a
  WHERE p.is_bot = true
    AND p.id NOT IN (
      SELECT DISTINCT user_id 
      FROM user_avatars 
      WHERE user_id IN (SELECT id FROM profiles WHERE is_bot = true)
    )
)
INSERT INTO user_avatars (user_id, avatar_id, is_active, unlocked_at)
SELECT 
  profile_id, 
  avatar_id, 
  true, 
  now()
FROM bot_avatar_assignments 
WHERE rn <= 1000; -- Limitar para evitar timeout

-- Remover referências específicas de bot nos nicknames
UPDATE profiles 
SET nickname = CASE 
  WHEN nickname LIKE '%AI%' THEN REPLACE(nickname, 'AI', '')
  WHEN nickname LIKE '%Bot%' THEN REPLACE(nickname, 'Bot', '')
  WHEN nickname LIKE '%API%' THEN REPLACE(nickname, 'API', '')
  WHEN nickname LIKE '%Auto%' THEN REPLACE(nickname, 'Auto', '')
  WHEN nickname LIKE '%Binary%' THEN REPLACE(nickname, 'Binary', 'Smart')
  WHEN nickname LIKE '%Algo%' THEN REPLACE(nickname, 'Algo', 'Pro')
  WHEN nickname LIKE '%Code%' THEN REPLACE(nickname, 'Code', 'Elite')
  WHEN nickname LIKE '%Byte%' THEN REPLACE(nickname, 'Byte', 'Quick')
  WHEN nickname LIKE '%Array%' THEN REPLACE(nickname, 'Array', 'Swift')
  WHEN nickname LIKE '%Cloud%' THEN REPLACE(nickname, 'Cloud', 'Smart')
  WHEN nickname LIKE '%Tech%' THEN REPLACE(nickname, 'Tech', 'Pro')
  WHEN nickname LIKE '%System%' THEN REPLACE(nickname, 'System', 'Expert')
  WHEN nickname LIKE '%Cyber%' THEN REPLACE(nickname, 'Cyber', 'Ace')
  ELSE nickname
END
WHERE is_bot = true 
AND (
  nickname LIKE '%AI%' OR 
  nickname LIKE '%Bot%' OR 
  nickname LIKE '%API%' OR 
  nickname LIKE '%Auto%' OR 
  nickname LIKE '%Binary%' OR 
  nickname LIKE '%Algo%' OR 
  nickname LIKE '%Code%' OR 
  nickname LIKE '%Byte%' OR 
  nickname LIKE '%Array%' OR 
  nickname LIKE '%Cloud%' OR 
  nickname LIKE '%Tech%' OR 
  nickname LIKE '%System%' OR 
  nickname LIKE '%Cyber%'
);

-- Adicionar coluna current_avatar_id na tabela profiles se não existir
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_avatar_id uuid REFERENCES avatars(id);

-- Atualizar profiles para referenciar avatar atual dos bots
UPDATE profiles 
SET current_avatar_id = (
  SELECT ua.avatar_id 
  FROM user_avatars ua 
  WHERE ua.user_id = profiles.id 
  AND ua.is_active = true 
  LIMIT 1
)
WHERE is_bot = true 
AND current_avatar_id IS NULL;