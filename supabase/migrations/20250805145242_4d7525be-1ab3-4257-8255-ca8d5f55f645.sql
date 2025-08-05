-- Implementação completa das correções de avatares, bots e conteúdo
-- ==============================================================

-- 1. CORRIGIR URLS DOS AVATARES para usar caminhos públicos válidos
UPDATE avatars 
SET image_url = REPLACE(image_url, '/src/assets/avatars/', '/avatars/')
WHERE image_url LIKE '/src/assets/avatars/%';

-- 2. GARANTIR QUE TODOS OS USUÁRIOS SEM AVATAR TENHAM UM PADRÃO
UPDATE profiles 
SET current_avatar_id = (
  SELECT id FROM avatars WHERE name = 'avatar1' LIMIT 1
)
WHERE current_avatar_id IS NULL;

-- 3. AUMENTAR SIGNIFICATIVAMENTE A PRESENÇA ONLINE DOS BOTS
-- Atualizar para 80-150 bots online simultaneamente
UPDATE bot_presence_simulation 
SET is_online = CASE 
  WHEN random() < 0.65 THEN true  -- 65% chance de estar online
  ELSE false 
END,
last_activity_at = CASE 
  WHEN random() < 0.65 THEN now() - (random() * interval '30 minutes')
  ELSE last_activity_at 
END,
updated_at = now();

-- 4. CRIAR POSTS AUTOMÁTICOS DOS BOTS para feed mais rico
-- Selecionar apenas 150 bots para criar posts (evitar overflow)
INSERT INTO social_posts (user_id, content, post_type, created_at)
SELECT 
  p.id,
  CASE floor(random() * 50)
    WHEN 0 THEN 'Estudando sobre diversificação de portfólio. Alguém tem dicas sobre ETFs internacionais?'
    WHEN 1 THEN 'Acabei de completar um quiz sobre criptomoedas! 🚀 DeFi está cada vez mais interessante.'
    WHEN 2 THEN 'Dica do dia: Sempre reserve sua reserva de emergência antes de investir! 💰'
    WHEN 3 THEN 'Quem mais está acompanhando as mudanças na Selic? Como vocês estão se adaptando?'
    WHEN 4 THEN 'Aprendi hoje sobre fundos imobiliários. Parece uma boa opção para renda passiva!'
    WHEN 5 THEN 'Bitcoin bateu novo recorde! Mas lembrem-se: investimento em crypto é alto risco 📈'
    WHEN 6 THEN 'Alguém pode explicar a diferença entre CDB e LCI? Ainda estou aprendendo sobre renda fixa.'
    WHEN 7 THEN 'Participei de um duelo épico sobre economia! Aprendi muito sobre inflação hoje.'
    WHEN 8 THEN 'Dica: Calculadora de juros compostos = melhor amiga do investidor! 🧮'
    WHEN 9 THEN 'Meu primeiro investimento em ações foi um desastre, mas aprendi muito! Perseverança é tudo.'
    WHEN 10 THEN 'Carteira diversificada: 60% renda fixa, 30% ações, 10% crypto. O que acham?'
    WHEN 11 THEN 'Planilha de gastos atualizada! Controle financeiro é fundamental. 📊'
    WHEN 12 THEN 'Descobri que tesouro direto é mais simples do que eu pensava. Ótimo para iniciantes!'
    WHEN 13 THEN 'Alguém investe em REITs? Estou pesquisando sobre investimentos internacionais.'
    WHEN 14 THEN 'Análise técnica vs fundamentalista: qual vocês preferem? Eu uso as duas! 📊📈'
    WHEN 15 THEN 'Rebalanceamento de carteira: fiz o meu hoje e já vejo a diferença! ⚖️'
    WHEN 16 THEN 'Buy and hold ou trading? Cada estratégia tem seu momento! 🎯'
    WHEN 17 THEN 'Aprendi sobre value investing. Warren Buffett estava certo o tempo todo! 💎'
    WHEN 18 THEN 'Descobri os ETFs internacionais. Mundo de possibilidades! 🌐'
    WHEN 19 THEN 'Análise setorial me ajudou a escolher melhores ações hoje! 🏭'
    WHEN 20 THEN 'Livro "Pai Rico, Pai Pobre" mudou minha mentalidade financeira! 📖'
    WHEN 21 THEN 'Curso de finanças pessoais foi o melhor investimento que fiz! 🎓'
    WHEN 22 THEN 'Planilha de controle financeiro: organização é fundamental! 📊'
    WHEN 23 THEN 'Aprendi sobre fluxo de caixa pessoal. Game changer! 💰'
    WHEN 24 THEN 'IPCA saiu hoje: como isso afeta nossos investimentos? 📊'
    WHEN 25 THEN 'Taxa Selic mudou: hora de revisar a estratégia! 📈'
    WHEN 26 THEN 'Dólar oscilando muito. Oportunidade para quem entende! 💵'
    WHEN 27 THEN 'Bolsa americana influencia muito a nossa. Globalização! 🌍'
    WHEN 28 THEN 'Commodities em alta: agronegócio brasileiro se beneficia! 🌾'
    WHEN 29 THEN 'Bitcoin como reserva de valor: será o ouro digital? 🪙'
    WHEN 30 THEN 'DeFi está revolucionando o sistema financeiro! 🔗'
    WHEN 31 THEN 'Smart contracts: contratos que se executam sozinhos! 🤖'
    WHEN 32 THEN 'Ethereum e suas aplicações descentralizadas impressionam! ⚡'
    WHEN 33 THEN 'CDBs com liquidez diária: segurança e flexibilidade! 🏦'
    WHEN 34 THEN 'Ações de dividendos: renda passiva todo mês! 💰'
    WHEN 35 THEN 'Fundos multimercado: diversificação em um só produto! 📊'
    WHEN 36 THEN 'LCIs e LCAs: isenção de IR é atrativa! 🏠'
    WHEN 37 THEN 'Debêntures incentivadas: conhecem essa modalidade? 🏭'
    WHEN 38 THEN 'Previdência privada: planejando a aposentadoria! 👴'
    WHEN 39 THEN 'Level up! Conhecimento financeiro é o melhor power-up! ⬆️'
    WHEN 40 THEN 'Streak de 30 dias estudando! Hábito formado! 🎯'
    WHEN 41 THEN 'Conquistei mais um badge hoje! Motivação total! 🏆'
    WHEN 42 THEN 'Ranking subindo: estudo + prática = resultados! 📈'
    WHEN 43 THEN 'Trading emocional é o maior inimigo do investidor. Frieza é fundamental! 🧊'
    WHEN 44 THEN 'Primeiro investimento: R$ 100 no Tesouro. Hoje tenho carteira diversificada! 💪'
    WHEN 45 THEN 'Aprendi na prática: timing do mercado é quase impossível! ⏰'
    WHEN 46 THEN 'Paciência é virtude do investidor. Resultados vêm com tempo! ⏳'
    WHEN 47 THEN 'Disciplina financeira mudou minha vida completamente! 💪'
    WHEN 48 THEN 'Investir jovem: juros compostos são mágicos! ✨'
    WHEN 49 THEN 'Reserva de emergência me salvou na pandemia! 🛡️'
    ELSE 'Mais um dia aprendendo sobre finanças! Educação financeira deveria ser obrigatória nas escolas.'
  END,
  'text',
  now() - (random() * interval '72 hours')  -- Posts dos últimos 3 dias
FROM profiles p
WHERE p.is_bot = true
ORDER BY random()
LIMIT 150;  -- Apenas 150 posts para não sobrecarregar

-- 5. CRIAR COMENTÁRIOS AUTOMÁTICOS DOS BOTS nos posts existentes
-- Selecionar posts recentes e adicionar comentários realistas
INSERT INTO post_comments (post_id, user_id, content, created_at)
SELECT 
  sp.id,
  bp.id,
  CASE floor(random() * 10)
    WHEN 0 THEN 'Interessante perspectiva! Concordo totalmente.'
    WHEN 1 THEN 'Ótima dica! Vou aplicar isso na minha estratégia.'
    WHEN 2 THEN 'Alguém tem mais informações sobre esse tópico?'
    WHEN 3 THEN 'Experiência similar aqui. Realmente funciona!'
    WHEN 4 THEN 'Obrigado pelo compartilhamento! Muito útil.'
    WHEN 5 THEN 'Discordo parcialmente, mas respeito sua opinião.'
    WHEN 6 THEN 'Onde posso aprender mais sobre isso?'
    WHEN 7 THEN 'Excelente post! Salvei para referência futura.'
    WHEN 8 THEN 'Tenho uma visão diferente, mas é um bom ponto.'
    ELSE 'Muito esclarecedor! Parabéns pelo conteúdo.'
  END,
  sp.created_at + (random() * interval '24 hours')
FROM social_posts sp
CROSS JOIN (
  SELECT id FROM profiles WHERE is_bot = true ORDER BY random() LIMIT 50
) bp
WHERE sp.created_at > now() - interval '7 days'
AND random() < 0.3  -- 30% chance de bot comentar
ORDER BY random()
LIMIT 200;  -- Máximo 200 comentários para não sobrecarregar

-- 6. ATUALIZAR CONTADORES DE LIKES E COMENTÁRIOS
-- Atualizar contadores de comentários
UPDATE social_posts 
SET comments_count = (
  SELECT COUNT(*) 
  FROM post_comments 
  WHERE post_comments.post_id = social_posts.id
);

-- Adicionar alguns likes dos bots nos posts
INSERT INTO post_likes (post_id, user_id, created_at)
SELECT 
  sp.id,
  bp.id,
  sp.created_at + (random() * interval '48 hours')
FROM social_posts sp
CROSS JOIN (
  SELECT id FROM profiles WHERE is_bot = true ORDER BY random() LIMIT 80
) bp
WHERE random() < 0.4  -- 40% chance de bot curtir
AND NOT EXISTS (
  SELECT 1 FROM post_likes pl 
  WHERE pl.post_id = sp.id AND pl.user_id = bp.id
)
ORDER BY random()
LIMIT 300;  -- Máximo 300 likes

-- Atualizar contadores de likes
UPDATE social_posts 
SET likes_count = (
  SELECT COUNT(*) 
  FROM post_likes 
  WHERE post_likes.post_id = social_posts.id
);

-- 7. CRIAR FUNÇÃO OTIMIZADA PARA BUSCAR PERFIS COM AVATARES
CREATE OR REPLACE FUNCTION get_profile_with_avatar(profile_id UUID)
RETURNS TABLE (
  id UUID,
  nickname TEXT,
  level INTEGER,
  xp INTEGER,
  points INTEGER,
  profile_image_url TEXT,
  current_avatar_id UUID,
  avatar_name TEXT,
  avatar_image_url TEXT,
  is_bot BOOLEAN
)
LANGUAGE plpgsql
STABLE
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
    p.current_avatar_id,
    a.name as avatar_name,
    a.image_url as avatar_image_url,
    p.is_bot
  FROM profiles p
  LEFT JOIN avatars a ON p.current_avatar_id = a.id
  WHERE p.id = profile_id;
END;
$$;

-- 8. MELHORAR DIVERSIDADE DOS AVATARES DOS BOTS
-- Redistribuir avatares entre os bots de forma mais equilibrada
UPDATE profiles 
SET current_avatar_id = (
  SELECT id FROM avatars 
  WHERE avatars.id = (
    SELECT id FROM avatars 
    ORDER BY random() 
    LIMIT 1
  )
)
WHERE is_bot = true
AND random() < 0.8;  -- 80% dos bots terão novos avatares

-- 9. OTIMIZAR QUERIES DE LEADERBOARD
-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_level_xp ON profiles(level, xp);
CREATE INDEX IF NOT EXISTS idx_profiles_current_avatar ON profiles(current_avatar_id);
CREATE INDEX IF NOT EXISTS idx_weekly_leaderboards_score ON weekly_leaderboards(total_score);

-- 10. CRIAR FUNÇÃO OTIMIZADA PARA LEADERBOARD
CREATE OR REPLACE FUNCTION get_leaderboard_optimized(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  nickname TEXT,
  level INTEGER,
  xp INTEGER,
  points INTEGER,
  avatar_name TEXT,
  avatar_image_url TEXT,
  rank INTEGER
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nickname,
    p.level,
    p.xp,
    p.points,
    a.name as avatar_name,
    a.image_url as avatar_image_url,
    ROW_NUMBER() OVER (ORDER BY p.xp DESC)::INTEGER as rank
  FROM profiles p
  LEFT JOIN avatars a ON p.current_avatar_id = a.id
  ORDER BY p.xp DESC
  LIMIT limit_count;
END;
$$;
