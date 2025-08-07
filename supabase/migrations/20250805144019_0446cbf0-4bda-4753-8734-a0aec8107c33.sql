-- Corrigir avatares dos bots usando IDs reais
DO $$
DECLARE
    bot_record RECORD;
    avatar_ids UUID[] := ARRAY[
        'fb87d9b5-0828-4254-9202-e9d1c83ff1f8', -- Binary Monk
        '4ca4f6c7-92dd-4fe2-a95f-bb380ca2a1ab', -- Blockchain Guardian
        '216adaf7-64c7-4442-be80-10605c4a3155', -- Chrome Gladiator
        'aa4b1daf-8527-4e8e-a97c-fd01621e4b8c', -- Code Assassin
        'd09e65f6-caae-4288-873e-e92fe0199dfa', -- Crypto Analyst
        'c9155b58-8566-4747-8b17-97962d90b520', -- Crypto Shaman
        '54b1a051-7bd2-4b6d-a7bb-b96744bc8381', -- Cyber Mechanic
        '01aa2771-e1eb-41f6-9443-f0245af2743f', -- Data Miner
        '72a20c03-76ac-47f9-b9d0-2f2c29f8e8a1', -- DeFi Samurai
        '40c03f58-917c-4b31-930f-2c20bb92539b', -- Digital Nomad
        '20f4de81-f0cb-4155-b4ed-3e4b23d87d43', -- Dream Architect
        'cc383ca4-5972-4ff2-be3c-85ad31b61aae', -- Finance Hacker
        '5a6d391f-909c-4fcc-8f76-303fc1e7cd6d', -- Ghost Trader
        '14fdcbb2-4e9d-4364-8896-397bed7a1b15', -- Hologram Dancer
        '670bb5ff-8504-4749-831a-1a00e9abb4e8', -- Investment Scholar
        '748296af-f985-4d6b-b70b-79aa83153e1c', -- Market Prophet
        '1b256dcc-f23e-4b7d-899b-d1ff65167a7e', -- Memory Keeper
        '5350beca-fb34-4dec-a3e4-902ee125edd1', -- Neo Trader
        'b644770b-a79f-4ffa-9716-6fd774fe323a', -- Neon Detective
        '151575ba-f8d3-4d27-9f23-40012c4aa315'  -- Neural Architect
    ];
    random_index INTEGER;
BEGIN
    -- Diversificar avatares dos bots
    FOR bot_record IN 
        SELECT id FROM profiles WHERE is_bot = true
    LOOP
        random_index := 1 + floor(random() * array_length(avatar_ids, 1));
        
        UPDATE profiles 
        SET current_avatar_id = avatar_ids[random_index]
        WHERE id = bot_record.id;
    END LOOP;
END $$;

-- Aumentar número de bots online
UPDATE bot_presence_simulation 
SET online_probability = CASE
    WHEN personality_type = 'active' THEN 0.85
    WHEN personality_type = 'casual' THEN 0.65
    WHEN personality_type = 'sporadic' THEN 0.45
    WHEN personality_type = 'night_owl' THEN 0.75
    ELSE 0.60
END,
is_online = true
WHERE bot_id IN (
    SELECT id FROM profiles WHERE is_bot = true ORDER BY RANDOM() LIMIT 200
);

-- Atualizar usuários sem avatar para usar um avatar padrão
UPDATE profiles 
SET current_avatar_id = '5350beca-fb34-4dec-a3e4-902ee125edd1' -- Neo Trader
WHERE current_avatar_id IS NULL;

-- Criar função otimizada para buscar perfil com avatar
CREATE OR REPLACE FUNCTION get_profile_with_avatar(profile_id UUID)
RETURNS TABLE(
    id UUID,
    nickname TEXT,
    level INTEGER,
    xp INTEGER,
    points INTEGER,
    profile_image_url TEXT,
    avatar_name TEXT,
    avatar_image_url TEXT,
    is_bot BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.nickname,
        p.level,
        p.xp,
        p.points,
        p.profile_image_url,
        a.name as avatar_name,
        a.image_url as avatar_image_url,
        p.is_bot
    FROM profiles p
    LEFT JOIN avatars a ON p.current_avatar_id = a.id
    WHERE p.id = profile_id;
END;
$$;