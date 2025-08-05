-- Etapa 1: Corrigir URLs dos Avatares e Sistema de Matchmaking

-- Atualizar URLs dos avatares para usar caminhos públicos corretos
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

-- Criar posts diversos para os bots
INSERT INTO social_posts (user_id, content, created_at) 
SELECT 
    p.id,
    CASE (RANDOM() * 10)::INTEGER
        WHEN 0 THEN 'Acabei de conquistar um novo nível! 🚀 Alguém quer um duelo para comemorar?'
        WHEN 1 THEN 'Dica do dia: diversificar investimentos é a chave do sucesso financeiro! 💰'
        WHEN 2 THEN 'Quem mais está viciado nos quizzes de finanças? Não consigo parar! 🧠'
        WHEN 3 THEN 'Alguém sabe como resolver essa questão sobre juros compostos? Preciso de ajuda!'
        WHEN 4 THEN 'Meu portfólio está indo bem essa semana! Como está o de vocês? 📈'
        WHEN 5 THEN 'Descobri uma estratégia incrível de trade hoje. Compartilho depois!'
        WHEN 6 THEN 'Quem quer um duelo rápido? Estou me sentindo confiante hoje! ⚔️'
        WHEN 7 THEN 'Aprendi sobre análise técnica hoje. O mercado é fascinante! 📊'
        WHEN 8 THEN 'Beetz acumulando! Próxima meta: 10.000! Quem vem comigo? 💎'
        ELSE 'Que dia incrível para aprender sobre finanças! Bora estudar galera! 📚'
    END,
    NOW() - (RANDOM() * INTERVAL '48 hours')
FROM profiles p
WHERE p.is_bot = true
AND RANDOM() < 0.6
LIMIT 100;

-- Adicionar likes automáticos dos bots
INSERT INTO social_post_likes (post_id, user_id)
SELECT DISTINCT sp.id, p.id
FROM social_posts sp
CROSS JOIN profiles p
WHERE p.is_bot = true
AND RANDOM() < 0.4
AND NOT EXISTS (
    SELECT 1 FROM social_post_likes spl 
    WHERE spl.post_id = sp.id AND spl.user_id = p.id
)
LIMIT 500;

-- Adicionar comentários automáticos dos bots
INSERT INTO social_post_comments (post_id, user_id, content, created_at)
SELECT 
    sp.id,
    p.id,
    CASE (RANDOM() * 8)::INTEGER
        WHEN 0 THEN 'Concordo totalmente! 👍'
        WHEN 1 THEN 'Ótima dica, obrigado por compartilhar!'
        WHEN 2 THEN 'Isso me lembra de quando comecei a investir...'
        WHEN 3 THEN 'Alguém tem mais informações sobre isso?'
        WHEN 4 THEN 'Excelente post! Muito útil.'
        WHEN 5 THEN 'Vou tentar essa estratégia também!'
        WHEN 6 THEN 'Parabéns pelo resultado! 🎉'
        ELSE 'Interessante perspectiva sobre o assunto.'
    END,
    sp.created_at + (RANDOM() * INTERVAL '24 hours')
FROM social_posts sp
CROSS JOIN profiles p
WHERE p.is_bot = true
AND RANDOM() < 0.3
AND sp.created_at > NOW() - INTERVAL '7 days'
LIMIT 200;