-- Corrigir URLs dos avatares para usar caminhos públicos corretos
UPDATE avatars SET image_url = '/avatars/' || REPLACE(REPLACE(image_url, '/avatars/', ''), 'src/assets/avatars/', '') || '.jpg'
WHERE image_url NOT LIKE '/avatars/%';

-- Criar função para resposta automática de bots em duelos
CREATE OR REPLACE FUNCTION auto_accept_bot_duels()
RETURNS void AS $$
DECLARE
    pending_duel RECORD;
    bot_profile RECORD;
BEGIN
    -- Buscar duelos pendentes há mais de 5 segundos
    FOR pending_duel IN 
        SELECT d.id, d.challenger_id 
        FROM duels d 
        WHERE d.status = 'pending' 
        AND d.created_at < NOW() - INTERVAL '5 seconds'
        AND d.opponent_id IS NULL
    LOOP
        -- Encontrar um bot online para aceitar o duelo
        SELECT p.id INTO bot_profile
        FROM profiles p
        JOIN bot_presence_simulation bps ON p.id = bps.bot_id
        WHERE p.is_bot = true 
        AND bps.is_online = true
        AND p.id != pending_duel.challenger_id
        ORDER BY RANDOM()
        LIMIT 1;
        
        -- Se encontrou um bot, aceitar o duelo
        IF bot_profile IS NOT NULL THEN
            UPDATE duels 
            SET opponent_id = bot_profile,
                status = 'accepted',
                accepted_at = NOW()
            WHERE id = pending_duel.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Melhorar função find_automatic_opponent para garantir bots online
CREATE OR REPLACE FUNCTION find_automatic_opponent(user_profile_id uuid)
RETURNS uuid AS $$
DECLARE
    opponent_id uuid;
BEGIN
    -- Primeiro, tentar encontrar um bot online
    SELECT p.id INTO opponent_id
    FROM profiles p
    JOIN bot_presence_simulation bps ON p.id = bps.bot_id
    WHERE p.is_bot = true 
    AND bps.is_online = true
    AND p.id != user_profile_id
    ORDER BY RANDOM()
    LIMIT 1;
    
    -- Se não encontrou bot, buscar usuário real online
    IF opponent_id IS NULL THEN
        SELECT p.id INTO opponent_id
        FROM profiles p
        WHERE p.is_bot = false 
        AND p.id != user_profile_id
        AND p.last_seen > NOW() - INTERVAL '10 minutes'
        ORDER BY RANDOM()
        LIMIT 1;
    END IF;
    
    RETURN opponent_id;
END;
$$ LANGUAGE plpgsql;

-- Aumentar presença online dos bots para 80%
UPDATE bot_presence_simulation 
SET is_online = true, 
    online_probability = 0.8,
    last_activity_at = NOW()
WHERE RANDOM() < 0.8;