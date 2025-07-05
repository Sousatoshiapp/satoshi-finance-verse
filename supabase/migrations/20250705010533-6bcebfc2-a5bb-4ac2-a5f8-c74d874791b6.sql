-- Insert 20 new cyberpunk avatars with varying prices, levels and rarities
INSERT INTO public.avatars (name, description, image_url, price, rarity, level_required, is_available, avatar_class, district_theme, backstory, bonus_effects, is_starter, model_url) VALUES

-- Tier 1: Uncommon (Level 3-5, 80-120 Beetz)
('Neural Architect', 'Arquiteta de redes neurais com implantes quânticos para processar big data financeiro.', '/src/assets/avatars/neural-architect.jpg', 100, 'uncommon', 3, true, 'architect', 'fintech', 'Ex-pesquisadora do MIT que revolucionou a arquitetura de sistemas financeiros descentralizados.', '{"xp_bonus": 15, "district": "fintech", "data_processing": 20}', false, '/avatars/neural-architect.glb'),

('Data Miner', 'Minerador de dados especializado em extrair insights valiosos dos mercados digitais.', '/src/assets/avatars/data-miner.jpg', 90, 'uncommon', 4, true, 'miner', 'criptomoedas', 'Veterano das primeiras minerações de Bitcoin, agora explora tesouros de dados no metaverso.', '{"xp_bonus": 15, "district": "criptomoedas", "mining_efficiency": 25}', false, '/avatars/data-miner.glb'),

('Blockchain Guardian', 'Guardiã dos protocolos blockchain, protege transações contra ataques maliciosos.', '/src/assets/avatars/blockchain-guardian.jpg', 110, 'uncommon', 5, true, 'guardian', 'criptomoedas', 'Paladina digital que dedica sua vida à proteção dos ativos descentralizados da comunidade.', '{"xp_bonus": 15, "district": "criptomoedas", "security_bonus": 30}', false, '/avatars/blockchain-guardian.glb'),

('Virtual Realtor', 'Corretor de imóveis virtuais especializado em propriedades do metaverso.', '/src/assets/avatars/virtual-realtor.jpg', 95, 'uncommon', 4, true, 'realtor', 'fundos_imobiliarios', 'Pioneer em vendas de terrenos virtuais, já negociou mais de 10.000 propriedades digitais.', '{"xp_bonus": 15, "district": "fundos_imobiliarios", "property_insight": 20}', false, '/avatars/virtual-realtor.glb'),

('Cyber Mechanic', 'Mecânico cibernético especializado em manutenção de sistemas financeiros automatizados.', '/src/assets/avatars/cyber-mechanic.jpg', 85, 'uncommon', 3, true, 'mechanic', 'fintech', 'Mestre em reparar algoritmos de trading que falharam, salvou bilhões em ativos.', '{"xp_bonus": 15, "district": "fintech", "system_repair": 25}', false, '/avatars/cyber-mechanic.glb'),

-- Tier 2: Rare (Level 6-8, 150-250 Beetz)
('Quantum Physician', 'Médico quântico que trata distúrbios financeiros com precisão cirúrgica.', '/src/assets/avatars/quantum-physician.jpg', 180, 'rare', 6, true, 'physician', 'sistema_bancario', 'Especialista em curar portfolios doentes e ressuscitar investimentos falidos.', '{"xp_bonus": 25, "district": "sistema_bancario", "portfolio_healing": 35}', false, '/avatars/quantum-physician.glb'),

('Code Assassin', 'Assassino de códigos maliciosos, elimina bugs e vulnerabilidades silenciosamente.', '/src/assets/avatars/code-assassin.jpg', 200, 'rare', 7, true, 'assassin', 'fintech', 'Lenda urbana entre hackers, capaz de neutralizar qualquer ameaça digital em segundos.', '{"xp_bonus": 25, "district": "fintech", "debug_mastery": 40}', false, '/avatars/code-assassin.glb'),

('Crypto Shaman', 'Xamã das criptomoedas que prevê movimentos de mercado através de rituais digitais.', '/src/assets/avatars/crypto-shaman.jpg', 220, 'rare', 8, true, 'shaman', 'criptomoedas', 'Visionário que combina sabedoria ancestral com tecnologia blockchain para prever o futuro.', '{"xp_bonus": 25, "district": "criptomoedas", "market_prophecy": 50}', false, '/avatars/crypto-shaman.glb'),

('Market Prophet', 'Profeta dos mercados com acesso a informações de múltiplas dimensões temporais.', '/src/assets/avatars/market-prophet.jpg', 240, 'rare', 8, true, 'prophet', 'renda_variavel', 'Oracle que enxerga padrões ocultos nos mercados financianos através de visões quânticas.', '{"xp_bonus": 25, "district": "renda_variavel", "future_sight": 45}', false, '/avatars/market-prophet.glb'),

('Neon Detective', 'Detetive especializado em crimes financeiros e fraudes digitais.', '/src/assets/avatars/neon-detective.jpg', 170, 'rare', 6, true, 'detective', 'sistema_bancario', 'Investigador lendário que desvendou os maiores esquemas de pirâmide do século XXI.', '{"xp_bonus": 25, "district": "sistema_bancario", "fraud_detection": 35}', false, '/avatars/neon-detective.glb'),

('Storm Hacker', 'Hacker das tempestades que controla fluxos de dados como fenômenos naturais.', '/src/assets/avatars/storm-hacker.jpg', 190, 'rare', 7, true, 'hacker', 'fintech', 'Mestre em criar e controlar tsunamis de dados que podem derrubar qualquer sistema.', '{"xp_bonus": 25, "district": "fintech", "data_storm": 40}', false, '/avatars/storm-hacker.glb'),

-- Tier 3: Epic (Level 10-12, 300-400 Beetz)
('Digital Nomad', 'Nômade digital que negocia ativos em todas as bolsas mundiais simultaneamente.', '/src/assets/avatars/digital-nomad.jpg', 320, 'epic', 10, true, 'nomad', 'mercado_internacional', 'Viajante interdimensional que acessa mercados de realidades paralelas.', '{"xp_bonus": 50, "district": "mercado_internacional", "global_access": 60}', false, '/avatars/digital-nomad.glb'),

('Hologram Dancer', 'Dançarina holográfica que hipnotiza algoritmos de trading com sua arte.', '/src/assets/avatars/hologram-dancer.jpg', 350, 'epic', 11, true, 'dancer', 'educacao_financeira', 'Artista que transforma educação financeira em performances hipnotizantes e memoráveis.', '{"xp_bonus": 50, "district": "educacao_financeira", "hypnotic_learning": 55}', false, '/avatars/hologram-dancer.glb'),

('Ghost Trader', 'Trader fantasma que executa operações em dimensões invisíveis do mercado.', '/src/assets/avatars/ghost-trader.jpg', 380, 'epic', 12, true, 'ghost', 'renda_variavel', 'Entidade misteriosa que negocia em mercados que não existem fisicamente.', '{"xp_bonus": 50, "district": "renda_variavel", "phantom_trading": 70}', false, '/avatars/ghost-trader.glb'),

('Memory Keeper', 'Guardião de memórias financeiras que preserva o conhecimento dos grandes mestres.', '/src/assets/avatars/memory-keeper.jpg', 300, 'epic', 10, true, 'keeper', 'educacao_financeira', 'Bibliotecário das almas financeiras que guarda segredos de investidores lendários.', '{"xp_bonus": 50, "district": "educacao_financeira", "wisdom_preservation": 65}', false, '/avatars/memory-keeper.glb'),

('Quantum Thief', 'Ladrão quântico que rouba apenas os prejuízos, deixando apenas os lucros.', '/src/assets/avatars/quantum-thief.jpg', 360, 'epic', 11, true, 'thief', 'renda_variavel', 'Anti-herói que redistribui perdas financeiras, tornando todos os investimentos lucrativos.', '{"xp_bonus": 50, "district": "renda_variavel", "loss_theft": 60}', false, '/avatars/quantum-thief.glb'),

-- Tier 4: Legendary (Level 15+, 500+ Beetz)
('Binary Monk', 'Monge binário que atingiu a iluminação financeira através da meditação digital.', '/src/assets/avatars/binary-monk.jpg', 500, 'legendary', 15, true, 'monk', 'all', 'Ser enlightened que transcendeu a ganância e encontrou o equilíbrio perfeito nos mercados.', '{"xp_bonus": 100, "all_districts": 50, "inner_peace": 80}', false, '/avatars/binary-monk.glb'),

('Pixel Artist', 'Artista pixel que pinta o futuro dos mercados com pinceladas de código.', '/src/assets/avatars/pixel-artist.jpg', 450, 'legendary', 14, true, 'artist', 'all', 'Visionário que cria arte generativa representando a beleza oculta dos dados financeiros.', '{"xp_bonus": 80, "all_districts": 40, "creative_insight": 75}', false, '/avatars/pixel-artist.glb'),

('Dream Architect', 'Arquiteto dos sonhos que constrói realidades financeiras impossíveis.', '/src/assets/avatars/dream-architect.jpg', 600, 'legendary', 16, true, 'dream_architect', 'all', 'Criador de dimensões onde todos os investimentos se tornam realidade materializada.', '{"xp_bonus": 120, "all_districts": 60, "reality_shaping": 90}', false, '/avatars/dream-architect.glb'),

('Chrome Gladiator', 'Gladiador cromado que luta nas arenas dos mercados mais violentos.', '/src/assets/avatars/chrome-gladiator.jpg', 550, 'legendary', 15, true, 'gladiator', 'all', 'Campeão invencível das batalhas financeiras mais brutais da história de Satoshi City.', '{"xp_bonus": 100, "all_districts": 55, "combat_mastery": 85}', false, '/avatars/chrome-gladiator.glb'),

-- Update existing avatars to use proper image paths
UPDATE public.avatars SET image_url = '/src/assets/avatars/neo-trader.jpg' WHERE name = 'Neo Trader';
UPDATE public.avatars SET image_url = '/src/assets/avatars/crypto-analyst.jpg' WHERE name = 'Crypto Analyst';
UPDATE public.avatars SET image_url = '/src/assets/avatars/finance-hacker.jpg' WHERE name = 'Finance Hacker';
UPDATE public.avatars SET image_url = '/src/assets/avatars/investment-scholar.jpg' WHERE name = 'Investment Scholar';
UPDATE public.avatars SET image_url = '/src/assets/avatars/quantum-broker.jpg' WHERE name = 'Quantum Broker';
UPDATE public.avatars SET image_url = '/src/assets/avatars/defi-samurai.jpg' WHERE name = 'DeFi Samurai';
UPDATE public.avatars SET image_url = '/src/assets/avatars/the-satoshi.jpg' WHERE name = 'The Satoshi';

-- Insert cyberpunk accessories
INSERT INTO public.products (name, description, image_url, price, category, rarity, level_required, effects, is_available) VALUES
('Neural Enhancement Headband', 'Banda neural que aumenta processamento de dados financeiros em 25%.', '/src/assets/accessories/neural-headband.jpg', 50, 'accessory', 'uncommon', 5, '{"xp_bonus": 10, "data_processing": 25}', true),
('Quantum Gloves', 'Luvas quânticas que permitem manipular múltiplas dimensões de trading.', '/src/assets/accessories/quantum-gloves.jpg', 80, 'accessory', 'rare', 8, '{"trading_precision": 30, "multi_dimensional": true}', true),
('Holo Sneakers', 'Tênis holográficos que aceleram movimentação entre mercados digitais.', '/src/assets/accessories/holo-sneakers.jpg', 60, 'accessory', 'uncommon', 6, '{"speed_bonus": 20, "market_navigation": 15}', true),

-- Insert cyberpunk boosts
('XP Multiplier Chip', 'Chip de multiplicação de experiência que dobra ganho de XP por 2 horas.', '/src/assets/boosts/xp-multiplier.jpg', 30, 'boost', 'common', 1, '{"xp_multiplier": 2.0}', true),
('Crypto Mining Booster', 'Impulsinador de mineração que aumenta ganho de Beetz em 50% por 4 horas.', '/src/assets/boosts/crypto-booster.jpg', 45, 'boost', 'uncommon', 3, '{"beetz_multiplier": 1.5}', true),
('Time Warp Device', 'Dispositivo temporal que acelera cooldowns de habilidades em 75%.', '/src/assets/boosts/time-warp.jpg', 70, 'boost', 'rare', 7, '{"cooldown_reduction": 0.75}', true);