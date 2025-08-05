-- Criar posts diversos e realistas para os bots
INSERT INTO social_posts (user_id, content, created_at) 
SELECT 
    p.id,
    CASE (RANDOM() * 15)::INTEGER
        WHEN 0 THEN 'Acabei de conquistar um novo nível! 🚀 Alguém quer um duelo para comemorar?'
        WHEN 1 THEN 'Dica do dia: diversificar investimentos é a chave do sucesso financeiro! 💰'
        WHEN 2 THEN 'Quem mais está viciado nos quizzes de finanças? Não consigo parar! 🧠'
        WHEN 3 THEN 'Alguém sabe como resolver essa questão sobre juros compostos? Preciso de ajuda!'
        WHEN 4 THEN 'Meu portfólio está indo bem essa semana! Como está o de vocês? 📈'
        WHEN 5 THEN 'Descobri uma estratégia incrível de trade hoje. Compartilho depois!'
        WHEN 6 THEN 'Quem quer um duelo rápido? Estou me sentindo confiante hoje! ⚔️'
        WHEN 7 THEN 'Aprendi sobre análise técnica hoje. O mercado é fascinante! 📊'
        WHEN 8 THEN 'Beetz acumulando! Próxima meta: 15.000! Quem vem comigo? 💎'
        WHEN 9 THEN 'Inflação, juros, câmbio... como tudo está interligado na economia! 🌐'
        WHEN 10 THEN 'Trading emocional é o maior inimigo do investidor. Frieza é fundamental! 🧊'
        WHEN 11 THEN 'Planejamento financeiro é como um GPS para seus sonhos! 🗺️'
        WHEN 12 THEN 'Minha sequência de estudos chegou a 20 dias! Consistência é tudo! 🔥'
        WHEN 13 THEN 'Mercado volátil hoje! Ótima oportunidade para quem tem estratégia! 📉📈'
        ELSE 'Que dia incrível para aprender sobre finanças! Bora estudar galera! 📚'
    END,
    NOW() - (RANDOM() * INTERVAL '72 hours')
FROM profiles p
WHERE p.is_bot = true
AND RANDOM() < 0.4
LIMIT 150;

-- Adicionar likes automáticos dos bots em posts existentes
INSERT INTO post_likes (post_id, user_id)
SELECT DISTINCT sp.id, p.id
FROM social_posts sp
CROSS JOIN profiles p
WHERE p.is_bot = true
AND RANDOM() < 0.35
AND NOT EXISTS (
    SELECT 1 FROM post_likes pl 
    WHERE pl.post_id = sp.id AND pl.user_id = p.id
)
AND sp.user_id != p.id -- Não curtir próprio post
LIMIT 800;

-- Adicionar comentários automáticos dos bots
INSERT INTO post_comments (post_id, user_id, content, created_at)
SELECT 
    sp.id,
    p.id,
    CASE (RANDOM() * 12)::INTEGER
        WHEN 0 THEN 'Concordo totalmente! Excelente perspectiva! 👍'
        WHEN 1 THEN 'Muito boa essa dica, obrigado por compartilhar! 🙏'
        WHEN 2 THEN 'Isso me lembra quando comecei a investir... nostalgia! 😊'
        WHEN 3 THEN 'Alguém tem mais informações sobre esse assunto? 🤓'
        WHEN 4 THEN 'Post muito útil! Salvando para consultar depois! 📌'
        WHEN 5 THEN 'Vou tentar implementar essa estratégia também! 💪'
        WHEN 6 THEN 'Parabéns pelo resultado! Inspirador! 🎉'
        WHEN 7 THEN 'Perspectiva interessante, não tinha pensado nisso! 💭'
        WHEN 8 THEN 'Adoro esse tipo de conteúdo educativo! ❤️'
        WHEN 9 THEN 'Conhecimento financeiro transforma vidas! ✨'
        WHEN 10 THEN 'Mercado recompensa quem se prepara! 🏆'
        ELSE 'Diversificação é realmente a chave! 🔑'
    END,
    sp.created_at + (RANDOM() * INTERVAL '48 hours')
FROM social_posts sp
CROSS JOIN profiles p
WHERE p.is_bot = true
AND RANDOM() < 0.25
AND sp.created_at > NOW() - INTERVAL '7 days'
AND sp.user_id != p.id -- Não comentar próprio post
LIMIT 300;