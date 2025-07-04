-- Inserir avatares para teste no marketplace
INSERT INTO public.avatars (name, description, image_url, price, level_required, rarity, is_available) VALUES
('Satoshi Nakamoto', 'O criador do Bitcoin', 'https://i.imgur.com/6KjP8AY.png', 0, 1, 'common', true),
('Sardinha Perdida', 'Investidor iniciante perdido no mercado', 'https://i.imgur.com/5YhGx8K.png', 50, 1, 'common', true),
('Porco Ganancioso', 'Investidor que só pensa em dinheiro', 'https://i.imgur.com/7NgQz3M.png', 100, 2, 'uncommon', true),
('Lebre do Mercado', 'Investidor ágil e esperto', 'https://i.imgur.com/8JvHx2L.png', 200, 3, 'uncommon', true),
('Tartaruga Estrategista', 'Investidor paciente e estratégico', 'https://i.imgur.com/9KpLm4N.png', 500, 4, 'rare', true),
('Touro Louco', 'Investidor otimista e agressivo', 'https://i.imgur.com/3TvBn8P.png', 1000, 8, 'epic', true),
('Águia Selvagem', 'Investidor com visão de longo prazo', 'https://i.imgur.com/2Hx9Kl6.png', 2000, 9, 'legendary', true),
('Tubarão de Wall Street', 'Investidor experiente e feroz', 'https://i.imgur.com/4Mx7Nd8.png', 5000, 10, 'legendary', true);

-- Inserir produtos/boosts para teste no marketplace
INSERT INTO public.products (name, description, image_url, price, level_required, category, rarity, effects, duration_hours, is_available) VALUES
('Protetor Solar XP', 'Protege contra perdas de XP por 24 horas', 'https://i.imgur.com/Xb8Yt3K.png', 50, 1, 'boost', 'common', '{"xp_protection": 100}', 24, true),
('Multiplicador de Pontos 2x', 'Dobra os pontos ganhos por 2 horas', 'https://i.imgur.com/Zc9Qm2L.png', 100, 2, 'boost', 'uncommon', '{"points_multiplier": 2}', 2, true),
('Tênis da Velocidade', 'Acelera o tempo de resposta das perguntas', 'https://i.imgur.com/Ap1Kx5N.png', 200, 3, 'accessory', 'uncommon', '{"speed_boost": 30}', 0, true),
('Óculos de Análise', 'Revela uma dica extra em cada pergunta', 'https://i.imgur.com/Bp2Mx7Q.png', 300, 4, 'accessory', 'rare', '{"hint_bonus": 1}', 0, true),
('Poção de Sabedoria', 'Aumenta XP ganho por 1 hora', 'https://i.imgur.com/Cr3Ny8P.png', 500, 5, 'boost', 'rare', '{"xp_multiplier": 1.5}', 1, true),
('Escudo Anti-Streak', 'Protege contra perda de streak por 7 dias', 'https://i.imgur.com/Ds4Oz9Q.png', 1000, 6, 'boost', 'epic', '{"streak_protection": 7}', 168, true),
('Amuleto da Sorte', 'Aumenta chance de acerto em 10%', 'https://i.imgur.com/Et5Px1R.png', 2000, 7, 'accessory', 'epic', '{"luck_bonus": 10}', 0, true),
('Coroa do Conhecimento', 'Dobra XP e pontos por 30 minutos', 'https://i.imgur.com/Fu6Qy2S.png', 5000, 8, 'accessory', 'legendary', '{"xp_multiplier": 2, "points_multiplier": 2}', 0, true),
('Elixir do Mestre', 'Triplica ganhos por 15 minutos', 'https://i.imgur.com/Gv7Rz3T.png', 10000, 10, 'boost', 'legendary', '{"xp_multiplier": 3, "points_multiplier": 3}', 0, true);