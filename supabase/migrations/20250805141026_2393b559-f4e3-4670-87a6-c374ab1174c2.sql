-- First, let's delete all existing bots and recreate them with realistic data
DELETE FROM profiles WHERE is_bot = true;

-- Create function to generate realistic Brazilian bot profiles
CREATE OR REPLACE FUNCTION create_realistic_bot_profiles()
RETURNS VOID AS $$
DECLARE
    realistic_names TEXT[] := ARRAY[
        'Ana Silva', 'João Santos', 'Maria Oliveira', 'Pedro Costa', 'Carla Lima',
        'Rafael Souza', 'Juliana Alves', 'Lucas Pereira', 'Fernanda Ribeiro', 'Marcelo Fernandes',
        'Camila Rocha', 'Diego Martins', 'Leticia Barbosa', 'Gabriel Araújo', 'Priscila Gomes',
        'Thiago Cardoso', 'Amanda Nascimento', 'Bruno Dias', 'Natalia Correia', 'Felipe Monteiro',
        'Beatriz Carvalho', 'Rodrigo Teixeira', 'Vanessa Moura', 'Daniel Castro', 'Patricia Ramos',
        'Gustavo Freitas', 'Renata Azevedo', 'Andre Mendes', 'Carolina Pinto', 'Vinicius Lopes',
        'Sabrina Campos', 'Alexandre Vieira', 'Larissa Duarte', 'Eduardo Barros', 'Tatiana Reis',
        'Murilo Torres', 'Bianca Macedo', 'Henrique Nunes', 'Roberta Farias', 'Leandro Silva',
        'Adriana Cavalcanti', 'Fabio Moreira', 'Danielle Lima', 'Roberto Cruz', 'Monica Andrade',
        'Igor Rodrigues', 'Stephanie Cunha', 'Caio Melo', 'Raquel Coelho', 'Victor Hugo',
        'Mariana Santos', 'Wesley Pinheiro', 'Isabela Ferreira', 'Otavio Borges', 'Claudia Medeiros'
    ];
    bot_id UUID;
    bot_level INTEGER;
    bot_xp INTEGER;
    bot_points INTEGER;
    avatar_count INTEGER;
    selected_avatar_id UUID;
    name_to_use TEXT;
    personality_types TEXT[] := ARRAY['active', 'casual', 'sporadic', 'night_owl'];
    selected_personality TEXT;
    subscription_value subscription_tier;
BEGIN
    -- Get avatar count for random selection
    SELECT COUNT(*) INTO avatar_count FROM avatars WHERE is_available = true;
    
    -- Create 50 realistic bot profiles
    FOR i IN 1..50 LOOP
        -- Pick a random name
        name_to_use := realistic_names[1 + (random() * (array_length(realistic_names, 1) - 1))::integer];
        
        -- Generate realistic stats with natural distribution
        bot_level := CASE 
            WHEN random() < 0.3 THEN 1 + (random() * 5)::integer  -- 30% beginners (1-5)
            WHEN random() < 0.6 THEN 6 + (random() * 10)::integer  -- 30% intermediate (6-15)
            WHEN random() < 0.9 THEN 16 + (random() * 10)::integer -- 30% advanced (16-25)
            ELSE 26 + (random() * 5)::integer                      -- 10% experts (26-30)
        END;
        
        -- Calculate XP based on level with some randomness
        bot_xp := (bot_level * 1000) + (random() * 800)::integer;
        
        -- Points based on level and activity
        bot_points := (bot_level * 150) + (random() * 500)::integer;
        
        -- Select random avatar
        SELECT id INTO selected_avatar_id 
        FROM avatars 
        WHERE is_available = true 
        ORDER BY random() 
        LIMIT 1;
        
        -- Select random personality
        selected_personality := personality_types[1 + (random() * (array_length(personality_types, 1) - 1))::integer];
        
        -- Cast subscription tier correctly
        subscription_value := CASE 
            WHEN random() < 0.7 THEN 'free'::subscription_tier
            WHEN random() < 0.9 THEN 'pro'::subscription_tier
            ELSE 'elite'::subscription_tier
        END;
        
        -- Create bot profile
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
        ) VALUES (
            gen_random_uuid(),
            name_to_use,
            bot_level,
            bot_xp,
            bot_points,
            (random() * 15)::integer, -- Random streak 0-15
            true,
            selected_avatar_id,
            subscription_value,
            now() - (random() * interval '90 days'), -- Created within last 90 days
            now() - (random() * interval '7 days')   -- Updated within last 7 days
        ) RETURNING id INTO bot_id;
        
        -- Create bot presence simulation entry
        INSERT INTO bot_presence_simulation (
            bot_id,
            personality_type,
            is_online,
            online_probability,
            peak_hours,
            last_activity_at
        ) VALUES (
            bot_id,
            selected_personality,
            random() < 0.3, -- 30% chance of being online initially
            CASE selected_personality
                WHEN 'active' THEN 0.8 + (random() * 0.15)
                WHEN 'casual' THEN 0.3 + (random() * 0.3) 
                WHEN 'sporadic' THEN 0.1 + (random() * 0.2)
                WHEN 'night_owl' THEN 0.4 + (random() * 0.2)
                ELSE 0.2 + (random() * 0.2)
            END,
            CASE selected_personality
                WHEN 'active' THEN ARRAY[8,9,10,11,12,13,14,15,16,17,18,19,20,21]
                WHEN 'casual' THEN ARRAY[9,10,11,14,15,16,19,20,21]
                WHEN 'sporadic' THEN ARRAY[12,13,18,19,20]
                WHEN 'night_owl' THEN ARRAY[20,21,22,23,0,1,2]
                ELSE ARRAY[9,10,11,14,15,16,19,20,21]
            END,
            now() - (random() * interval '2 hours')
        );
        
        -- Create bot duel configuration
        INSERT INTO bot_duel_configs (
            bot_profile_id,
            difficulty_level,
            accuracy_percentage,
            response_time_min,
            response_time_max,
            is_active
        ) VALUES (
            bot_id,
            CASE 
                WHEN bot_level <= 5 THEN 1
                WHEN bot_level <= 15 THEN 2 + (random() * 2)::integer
                WHEN bot_level <= 25 THEN 3 + (random() * 2)::integer
                ELSE 4 + (random() * 2)::integer
            END,
            CASE 
                WHEN bot_level <= 5 THEN 0.45 + (random() * 0.2)   -- 45-65%
                WHEN bot_level <= 15 THEN 0.60 + (random() * 0.2)  -- 60-80%
                WHEN bot_level <= 25 THEN 0.70 + (random() * 0.2)  -- 70-90%
                ELSE 0.80 + (random() * 0.15)                      -- 80-95%
            END,
            1500 + (random() * 1000)::integer, -- 1.5-2.5s response time min
            4000 + (random() * 4000)::integer, -- 4-8s response time max
            true
        );
        
        -- Log bot creation
        INSERT INTO bot_activity_log (
            bot_id,
            activity_type,
            activity_data
        ) VALUES (
            bot_id,
            'bot_created',
            json_build_object(
                'nickname', name_to_use,
                'level', bot_level,
                'xp', bot_xp,
                'points', bot_points,
                'personality', selected_personality
            )
        );
    END LOOP;
    
    RAISE NOTICE 'Successfully created 50 realistic bot profiles';
END;
$$ LANGUAGE plpgsql;

-- Execute the function to create bots
SELECT create_realistic_bot_profiles();

-- Clean up the function
DROP FUNCTION create_realistic_bot_profiles();

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