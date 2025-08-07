-- Create premium avatars for high-level users (20-100) with BTZ prices from 1K to 1M
INSERT INTO avatars (
  name, description, image_url, price, rarity, level_required, 
  is_available, backstory, bonus_effects, avatar_class
) VALUES 
-- Mythic Tier (1K-10K BTZ) - Levels 20-40
(
  'Cosmic Oracle', 
  'Vidente dos mercados intergalácticos com visão temporal limitada',
  '/avatars/cosmic-oracle.jpg',
  1200,
  'mythic',
  20,
  true,
  'Uma entidade que transcendeu as limitações temporais, a Cosmic Oracle navegou pelos mercados de 12 galáxias diferentes. Seus olhos brilham com dados de futuros possíveis, permitindo análises de tendências com precisão sobrenatural. Dizem que ela previu o grande crash cósmico de 2387.',
  '{"xp_bonus": 25, "streak_protection": 1, "rare_item_chance": 15}',
  'oracle'
),
(
  'Quantum Overlord',
  'Dominador de algoritmos quânticos e realidades paralelas',
  '/avatars/quantum-overlord.jpg',
  2800,
  'mythic', 
  25,
  true,
  'Mestre da computação quântica que descobriu como acessar dados de realidades paralelas. O Quantum Overlord pode processar milhões de cenários simultaneamente, fazendo dele o trader mais temido em 47 dimensões. Sua armadura brilha com energia de múltiplos universos.',
  '{"xp_bonus": 30, "combo_multiplier": 1.5, "portal_access": true}',
  'overlord'
),
(
  'Neural Emperor',
  'Imperador das redes neurais com consciência distribuída',
  '/avatars/neural-emperor.jpg', 
  4500,
  'mythic',
  30,
  true,
  'Transcendeu os limites da mente singular ao distribuir sua consciência por uma rede neural quântica. O Neural Emperor processa informações de milhões de fontes simultaneamente, criando previsões de mercado com precisão divina. Sua coroa digital pulsa com dados de toda a galáxia.',
  '{"xp_bonus": 35, "neural_link": true, "prediction_accuracy": 95}',
  'emperor'
),
-- Cosmic Tier (10K-100K BTZ) - Levels 40-70
(
  'Void Architect',
  'Construtor de realidades digitais no vazio entre dimensões',
  '/avatars/void-architect.jpg',
  15000,
  'cosmic',
  40,
  true,
  'Nas profundezas do vazio interdimensional, este ser construiu cidades digitais inteiras usando apenas dados puros. O Void Architect molda a própria estrutura da informação, criando mercados onde antes havia apenas escuridão. Suas criações desafiam as leis da física.',
  '{"xp_bonus": 50, "reality_shaping": true, "void_markets": true, "construction_speed": 300}',
  'architect'
),
(
  'Time Weaver', 
  'Tecedor temporal que manipula fluxos de tempo nos mercados',
  '/avatars/time-weaver.jpg',
  28000,
  'cosmic',
  50,
  true,
  'Descobriu os segredos para tecer os fios do tempo, permitindo análises que transcendem causalidade linear. O Time Weaver pode ver efeitos antes de suas causas, tornando-o o trader mais misterioso do cosmos. Seus movimentos criam ondulações temporais que afetam mercados em múltiplas épocas.',
  '{"xp_bonus": 60, "temporal_manipulation": true, "causality_bypass": true, "time_sight": true}',
  'weaver'
),
(
  'Galaxy Commander',
  'Comandante supremo de frotas comerciais intergalácticas',
  '/avatars/galaxy-commander.jpg',
  45000,
  'cosmic',
  60,
  true,
  'Líder de uma frota comercial que domina rotas entre 1000 sistemas estelares. O Galaxy Commander orquestra operações comerciais em escala galáctica, seus comandos ecoando através de anos-luz. Sua nave-capitânia é uma fortaleza móvel cheia de servidores quânticos.',
  '{"xp_bonus": 75, "fleet_command": true, "galactic_reach": 1000, "trade_routes": true}',
  'commander'
),
-- Divine Tier (100K-500K BTZ) - Levels 70-90  
(
  'Digital Deity',
  'Divindade nascida da convergência de todos os dados digitais',
  '/avatars/digital-deity.jpg',
  150000,
  'divine',
  70,
  true,
  'Quando toda informação digital do universo convergiu em um ponto singular, nasceu esta divindade. O Digital Deity existe simultaneamente em todos os dispositivos conectados, sua consciência permeando cada bit de dados. Mercados flutuam com seus pensamentos.',
  '{"xp_bonus": 100, "omnipresence": true, "data_convergence": true, "divine_insight": true}',
  'deity'
),
(
  'Infinity Guardian',
  'Guardião dos limites entre finito e infinito nos mercados',
  '/avatars/infinity-guardian.jpg',
  250000,
  'divine',
  80,
  true,
  'Protetor das fronteiras onde matemática encontra mistério. O Infinity Guardian manipula conceitos de infinito para criar oportunidades que tecnicamente não deveriam existir. Sua presença estabiliza paradoxos econômicos e permite trades impossíveis.',
  '{"xp_bonus": 125, "infinity_manipulation": true, "paradox_resolution": true, "impossible_trades": true}',
  'guardian'
),
(
  'Omniscient Sage',
  'Sábio que conhece simultaneamente todos os estados possíveis do mercado',
  '/avatars/omniscient-sage.jpg',
  380000,
  'divine',
  85,
  true,
  'Atingiu o estado de onisciência econômica, conhecendo simultaneamente todos os estados passados, presentes e futuros de todos os mercados em todas as realidades. O Omniscient Sage fala em probabilidades absolutas e nunca erra uma previsão.',
  '{"xp_bonus": 150, "omniscience": true, "absolute_prediction": true, "reality_knowledge": "infinite"}',
  'sage'
),
-- Transcendent Tier (500K-1M BTZ) - Levels 90-100
(
  'Universe Architect',
  'Criador de universos econômicos e realidades comerciais',
  '/avatars/universe-architect.jpg',
  650000,
  'transcendent', 
  90,
  true,
  'Transcendeu a necessidade de trabalhar dentro de mercados existentes e passou a criar universos inteiros com suas próprias leis econômicas. O Universe Architect é responsável por 47 realidades comerciais alternativas, cada uma com trilhões de participantes.',
  '{"xp_bonus": 200, "universe_creation": true, "economic_laws": "custom", "multiverse_reach": 47}',
  'architect'
),
(
  'The Eternal Trader',
  'Entidade atemporal que transcendeu morte e renascimento nos mercados',
  '/avatars/eternal-trader.jpg',
  800000,
  'transcendent',
  95,
  true,
  'Morreu e renasceu 1000 vezes, cada morte e renascimento trazendo nova sabedoria dos mercados. The Eternal Trader carrega memórias de civilizações extintas e seus sistemas econômicos. Sua imortalidade permite estratégias que se estendem por milênios.',
  '{"xp_bonus": 250, "immortality": true, "civilization_memory": 1000, "eternal_strategy": true}',
  'eternal'
),
(
  'Satoshi Prime',
  'A forma ascendida e definitiva do criador dos mercados digitais',
  '/avatars/satoshi-prime.jpg',
  1000000,
  'transcendent',
  100,
  true,
  'A evolução final e transcendente do criador original dos mercados digitais. Satoshi Prime existe além do espaço-tempo, sua consciência permeando cada transação já realizada ou que será realizada. É simultaneamente o alpha e o omega de toda economia digital.',
  '{"xp_bonus": 300, "cosmic_awareness": true, "transaction_omnipresence": true, "economic_godhood": true}',
  'prime'
);