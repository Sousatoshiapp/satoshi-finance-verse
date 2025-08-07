-- Delete existing bots first
DELETE FROM profiles WHERE is_bot = true;

-- Create 50 realistic bot profiles with proper data
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
    (1000 + floor(random() * 800))::integer as xp, -- Based on level with randomness
    (150 + floor(random() * 500))::integer as points, -- Based on level with randomness
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

-- Update any existing users who don't have current_avatar_id set to use their first chosen avatar
UPDATE profiles 
SET current_avatar_id = (
    SELECT ua.avatar_id 
    FROM user_avatars ua 
    WHERE ua.user_id = profiles.id 
    ORDER BY ua.acquired_at ASC 
    LIMIT 1
)
WHERE current_avatar_id IS NULL 
AND is_bot = false 
AND EXISTS (
    SELECT 1 FROM user_avatars ua WHERE ua.user_id = profiles.id
);