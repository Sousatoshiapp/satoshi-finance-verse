-- Remove avatares problemáticos que não fazem parte dos novos avatares cyberpunk
DELETE FROM public.avatars WHERE name IN (
  'Avatar Clássico',
  'Avatar Diamante', 
  'Avatar Dourado',
  'Avatar Lendário',
  'Avatar Platina',
  'Cyber Mogul',
  'FinTech Architect', 
  'Global Nexus',
  'Holographic Realtor',
  'Neural Banker',
  'Águia Selvagem',
  'Sardinha Perdida',
  'Lebre do Mercado',
  'Porco Ganancioso', 
  'Tartaruga Estrategista',
  'Touro Investidor',
  'Touro Louco',
  'Tubarão de Wall Street',
  'Unicórnio Estrategista',
  'Urso Analista',
  'Analista Cyber',
  'Cyborg Bitcoin',
  'Hacker Financeiro',
  'Ninja Financeira',
  'Punk Trader',
  'Satoshi Crypto Warrior',
  'Satoshi Nakamoto',
  'Soldado Crypto'
);

-- Atualiza produtos de boosts com novas imagens cyberpunk 3D
UPDATE public.products SET image_url = '/src/assets/boosts/neural-xp-booster.jpg' 
WHERE name = 'Mega XP';

UPDATE public.products SET image_url = '/src/assets/boosts/quantum-energy-drink.jpg' 
WHERE name = 'Energia Infinita';

UPDATE public.products SET image_url = '/src/assets/boosts/mega-points-amplifier.jpg' 
WHERE name = 'Chuva de Pontos';

UPDATE public.products SET image_url = '/src/assets/boosts/streak-shield.jpg' 
WHERE name = 'Escudo Anti-Streak';

UPDATE public.products SET image_url = '/src/assets/boosts/wisdom-elixir.jpg' 
WHERE name = 'Poção de Sabedoria';

UPDATE public.products SET image_url = '/src/assets/boosts/streak-shield.jpg' 
WHERE name = 'Protetor de Sequência';

UPDATE public.products SET image_url = '/src/assets/boosts/neural-xp-booster.jpg' 
WHERE name = 'XP em Dobro';

-- Adiciona novos produtos de boosts cyberpunk
INSERT INTO public.products (name, description, image_url, price, category, rarity, level_required, effects, is_available, duration_hours) VALUES
('Neural Focus Enhancer', 'Amplificador neural que aumenta a concentração durante quizzes em 40%.', '/src/assets/boosts/neural-xp-booster.jpg', 45, 'boost', 'rare', 6, '{"focus_bonus": 40, "quiz_accuracy": 15}', true, 3),
('Quantum Memory Bank', 'Banco de memória quântico que armazena respostas corretas para revisão.', '/src/assets/boosts/mega-points-amplifier.jpg', 60, 'boost', 'epic', 8, '{"memory_retention": 50, "review_bonus": 25}', true, 6),
('Cyber Streak Protector', 'Protetor cibernético avançado que mantém sequências ativas.', '/src/assets/boosts/streak-shield.jpg', 35, 'boost', 'uncommon', 4, '{"streak_protection": true, "backup_chances": 2}', true, 24),
('Digital Wisdom Serum', 'Soro digital que concede conhecimento temporário sobre mercados.', '/src/assets/boosts/wisdom-elixir.jpg', 55, 'boost', 'rare', 7, '{"knowledge_boost": 30, "hint_availability": true}', true, 4),
('Energy Core Reactor', 'Reator de energia que elimina cooldowns de atividades.', '/src/assets/boosts/quantum-energy-drink.jpg', 40, 'boost', 'uncommon', 5, '{"cooldown_elimination": true, "energy_regeneration": 100}', true, 2);