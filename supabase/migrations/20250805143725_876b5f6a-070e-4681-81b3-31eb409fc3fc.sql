-- 1. Primeiro, criar uma nova migração para diversificar avatares dos bots
-- Atualizar avatares dos bots para usar IDs diferentes ao invés de todos usarem o mesmo

DO $$
DECLARE
    bot_record RECORD;
    avatar_ids UUID[] := ARRAY[
        'ad8a8b90-6e1a-45e9-b02b-4ac1234567a0',
        'ad8a8b90-6e1a-45e9-b02b-4ac1234567a1', 
        'ad8a8b90-6e1a-45e9-b02b-4ac1234567a2',
        'ad8a8b90-6e1a-45e9-b02b-4ac1234567a3',
        'ad8a8b90-6e1a-45e9-b02b-4ac1234567a4',
        'ad8a8b90-6e1a-45e9-b02b-4ac1234567a5',
        'ad8a8b90-6e1a-45e9-b02b-4ac1234567a6',
        'ad8a8b90-6e1a-45e9-b02b-4ac1234567a7',
        'ad8a8b90-6e1a-45e9-b02b-4ac1234567a8',
        'ad8a8b90-6e1a-45e9-b02b-4ac1234567a9',
        'ad8a8b90-6e1a-45e9-b02b-4ac1234567aa',
        'ad8a8b90-6e1a-45e9-b02b-4ac1234567ab',
        'ad8a8b90-6e1a-45e9-b02b-4ac1234567ac',
        'ad8a8b90-6e1a-45e9-b02b-4ac1234567ad',
        'ad8a8b90-6e1a-45e9-b02b-4ac1234567ae',
        'ad8a8b90-6e1a-45e9-b02b-4ac1234567af'
    ];
    random_index INTEGER;
BEGIN
    -- Atualizar cada bot com um avatar aleatório
    FOR bot_record IN 
        SELECT id FROM profiles WHERE is_bot = true
    LOOP
        random_index := 1 + floor(random() * array_length(avatar_ids, 1));
        
        UPDATE profiles 
        SET current_avatar_id = avatar_ids[random_index]
        WHERE id = bot_record.id;
    END LOOP;
END $$;

-- 2. Atualizar as URLs dos avatares para usar caminhos válidos
UPDATE avatars SET image_url = CASE 
    WHEN name = 'Neo Trader' THEN '/src/assets/avatars/neo-trader.jpg'
    WHEN name = 'Crypto Analyst' THEN '/src/assets/avatars/crypto-analyst.jpg'
    WHEN name = 'Finance Hacker' THEN '/src/assets/avatars/finance-hacker.jpg'
    WHEN name = 'Investment Scholar' THEN '/src/assets/avatars/investment-scholar.jpg'
    WHEN name = 'Quantum Broker' THEN '/src/assets/avatars/quantum-broker.jpg'
    WHEN name = 'DeFi Samurai' THEN '/src/assets/avatars/defi-samurai.jpg'
    WHEN name = 'The Satoshi' THEN '/src/assets/avatars/the-satoshi.jpg'
    WHEN name = 'Neural Architect' THEN '/src/assets/avatars/neural-architect.jpg'
    WHEN name = 'Data Miner' THEN '/src/assets/avatars/data-miner.jpg'
    WHEN name = 'Blockchain Guardian' THEN '/src/assets/avatars/blockchain-guardian.jpg'
    WHEN name = 'Quantum Physician' THEN '/src/assets/avatars/quantum-physician.jpg'
    WHEN name = 'Virtual Realtor' THEN '/src/assets/avatars/virtual-realtor.jpg'
    WHEN name = 'Code Assassin' THEN '/src/assets/avatars/code-assassin.jpg'
    WHEN name = 'Crypto Shaman' THEN '/src/assets/avatars/crypto-shaman.jpg'
    WHEN name = 'Market Prophet' THEN '/src/assets/avatars/market-prophet.jpg'
    WHEN name = 'Digital Nomad' THEN '/src/assets/avatars/digital-nomad.jpg'
    ELSE image_url
END;

-- 3. Aumentar número de bots online (modificar probabilidades)
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

-- 4. Criar função para buscar perfil com avatar de forma otimizada
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