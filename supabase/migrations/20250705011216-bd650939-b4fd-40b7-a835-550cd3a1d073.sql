-- Insert cyberpunk accessories and boosts
INSERT INTO public.products (name, description, image_url, price, category, rarity, level_required, effects, is_available, duration_hours) VALUES
('Neural Enhancement Headband', 'Banda neural que aumenta processamento de dados financeiros em 25%.', '/src/assets/accessories/neural-headband.jpg', 50, 'accessory', 'uncommon', 5, '{"xp_bonus": 10, "data_processing": 25}', true, null),
('Quantum Gloves', 'Luvas quânticas que permitem manipular múltiplas dimensões de trading.', '/src/assets/accessories/quantum-gloves.jpg', 80, 'accessory', 'rare', 8, '{"trading_precision": 30, "multi_dimensional": true}', true, null),
('Holo Sneakers', 'Tênis holográficos que aceleram movimentação entre mercados digitais.', '/src/assets/accessories/holo-sneakers.jpg', 60, 'accessory', 'uncommon', 6, '{"speed_bonus": 20, "market_navigation": 15}', true, null),
('XP Multiplier Chip', 'Chip de multiplicação de experiência que dobra ganho de XP por 2 horas.', '/src/assets/boosts/xp-multiplier.jpg', 30, 'boost', 'common', 1, '{"xp_multiplier": 2.0}', true, 2),
('Crypto Mining Booster', 'Impulsinador de mineração que aumenta ganho de Beetz em 50% por 4 horas.', '/src/assets/boosts/crypto-booster.jpg', 45, 'boost', 'uncommon', 3, '{"beetz_multiplier": 1.5}', true, 4),
('Time Warp Device', 'Dispositivo temporal que acelera cooldowns de habilidades em 75%.', '/src/assets/boosts/time-warp.jpg', 70, 'boost', 'rare', 7, '{"cooldown_reduction": 0.75}', true, 1);

-- Update existing avatars to use proper image paths
UPDATE public.avatars SET image_url = '/src/assets/avatars/neo-trader.jpg' WHERE name = 'Neo Trader';
UPDATE public.avatars SET image_url = '/src/assets/avatars/crypto-analyst.jpg' WHERE name = 'Crypto Analyst';
UPDATE public.avatars SET image_url = '/src/assets/avatars/finance-hacker.jpg' WHERE name = 'Finance Hacker';
UPDATE public.avatars SET image_url = '/src/assets/avatars/investment-scholar.jpg' WHERE name = 'Investment Scholar';
UPDATE public.avatars SET image_url = '/src/assets/avatars/quantum-broker.jpg' WHERE name = 'Quantum Broker';
UPDATE public.avatars SET image_url = '/src/assets/avatars/defi-samurai.jpg' WHERE name = 'DeFi Samurai';
UPDATE public.avatars SET image_url = '/src/assets/avatars/the-satoshi.jpg' WHERE name = 'The Satoshi';