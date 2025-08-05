-- Remove foreign key constraint from profiles table to allow bots
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Delete existing bots first
DELETE FROM profiles WHERE is_bot = true;

-- Now create 50 realistic bot profiles without foreign key constraints
INSERT INTO profiles (
    user_id, 
    nickname, 
    level, 
    xp, 
    points, 
    streak, 
    is_bot, 
    current_avatar_id,
    subscription_tier,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid() as user_id,
    (ARRAY['Ana Silva', 'João Santos', 'Maria Oliveira', 'Pedro Costa', 'Carla Lima',
           'Rafael Souza', 'Juliana Alves', 'Lucas Pereira', 'Fernanda Ribeiro', 'Marcelo Fernandes',
           'Camila Rocha', 'Diego Martins', 'Leticia Barbosa', 'Gabriel Araújo', 'Priscila Gomes',
           'Thiago Cardoso', 'Amanda Nascimento', 'Bruno Dias', 'Natalia Correia', 'Felipe Monteiro',
           'Beatriz Carvalho', 'Rodrigo Teixeira', 'Vanessa Moura', 'Daniel Castro', 'Patricia Ramos',
           'Gustavo Freitas', 'Renata Azevedo', 'Andre Mendes', 'Carolina Pinto', 'Vinicius Lopes',
           'Sabrina Campos', 'Alexandre Vieira', 'Larissa Duarte', 'Eduardo Barros', 'Tatiana Reis',
           'Murilo Torres', 'Bianca Macedo', 'Henrique Nunes', 'Roberta Farias', 'Leandro Silva',
           'Adriana Cavalcanti', 'Fabio Moreira', 'Danielle Lima', 'Roberto Cruz', 'Monica Andrade',
           'Igor Rodrigues', 'Stephanie Cunha', 'Caio Melo', 'Raquel Coelho', 'Victor Hugo',
           'Mariana Santos', 'Wesley Pinheiro', 'Isabela Ferreira', 'Otavio Borges', 'Claudia Medeiros'])[floor(random() * 55 + 1)] as nickname,
    CASE 
        WHEN random() < 0.3 THEN 1 + floor(random() * 5)::integer  -- 30% beginners (1-5)
        WHEN random() < 0.6 THEN 6 + floor(random() * 10)::integer  -- 30% intermediate (6-15)
        WHEN random() < 0.9 THEN 16 + floor(random() * 10)::integer -- 30% advanced (16-25)
        ELSE 26 + floor(random() * 5)::integer                      -- 10% experts (26-30)
    END as level,
    (CASE 
        WHEN random() < 0.3 THEN (1 + floor(random() * 5)) * 1000  -- level * 1000
        WHEN random() < 0.6 THEN (6 + floor(random() * 10)) * 1000
        WHEN random() < 0.9 THEN (16 + floor(random() * 10)) * 1000
        ELSE (26 + floor(random() * 5)) * 1000
    END + floor(random() * 800))::integer as xp,
    (CASE 
        WHEN random() < 0.3 THEN (1 + floor(random() * 5)) * 150
        WHEN random() < 0.6 THEN (6 + floor(random() * 10)) * 150
        WHEN random() < 0.9 THEN (16 + floor(random() * 10)) * 150
        ELSE (26 + floor(random() * 5)) * 150
    END + floor(random() * 500))::integer as points,
    floor(random() * 15)::integer as streak, -- Random streak 0-15
    true as is_bot,
    (SELECT id FROM avatars WHERE is_available = true ORDER BY random() LIMIT 1) as current_avatar_id,
    CASE 
        WHEN random() < 0.7 THEN 'free'::subscription_tier
        WHEN random() < 0.9 THEN 'pro'::subscription_tier
        ELSE 'elite'::subscription_tier
    END as subscription_tier,
    now() - (random() * interval '90 days') as created_at, -- Created within last 90 days
    now() - (random() * interval '7 days') as updated_at   -- Updated within last 7 days
FROM generate_series(1, 50);

-- Create bot presence simulation entries for all new bots
INSERT INTO bot_presence_simulation (bot_id, personality_type, is_online, online_probability, peak_hours, last_activity_at)
SELECT 
    p.id,
    (ARRAY['active', 'casual', 'sporadic', 'night_owl'])[floor(random() * 4 + 1)] as personality_type,
    random() < 0.3 as is_online, -- 30% chance of being online initially
    CASE (ARRAY['active', 'casual', 'sporadic', 'night_owl'])[floor(random() * 4 + 1)]
        WHEN 'active' THEN 0.8 + (random() * 0.15)
        WHEN 'casual' THEN 0.3 + (random() * 0.3) 
        WHEN 'sporadic' THEN 0.1 + (random() * 0.2)
        WHEN 'night_owl' THEN 0.4 + (random() * 0.2)
        ELSE 0.2 + (random() * 0.2)
    END as online_probability,
    CASE (ARRAY['active', 'casual', 'sporadic', 'night_owl'])[floor(random() * 4 + 1)]
        WHEN 'active' THEN ARRAY[8,9,10,11,12,13,14,15,16,17,18,19,20,21]
        WHEN 'casual' THEN ARRAY[9,10,11,14,15,16,19,20,21]
        WHEN 'sporadic' THEN ARRAY[12,13,18,19,20]
        WHEN 'night_owl' THEN ARRAY[20,21,22,23,0,1,2]
        ELSE ARRAY[9,10,11,14,15,16,19,20,21]
    END as peak_hours,
    now() - (random() * interval '2 hours') as last_activity_at
FROM profiles p 
WHERE p.is_bot = true;

-- Update any existing users who don't have current_avatar_id set to use their first chosen avatar
UPDATE profiles 
SET current_avatar_id = (
    SELECT ua.avatar_id 
    FROM user_avatars ua 
    WHERE ua.user_id = profiles.id 
    ORDER BY ua.created_at ASC 
    LIMIT 1
)
WHERE current_avatar_id IS NULL 
AND is_bot = false 
AND EXISTS (
    SELECT 1 FROM user_avatars ua WHERE ua.user_id = profiles.id
);