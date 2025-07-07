-- Add enhanced avatar data for better detail pages
UPDATE public.avatars SET 
  backstory = CASE 
    WHEN name = 'Neo Trader' THEN 'Nascido nas ruas digitais de Satoshi City, domina algoritmos de trading como ninguém. Seus reflexos são aprimorados por implantes neurais que conectam diretamente aos mercados globais.'
    WHEN name = 'Crypto Analyst' THEN 'Ex-analista de Wall Street que mergulhou no mundo crypto. Possui visão aguçada para padrões de mercado e consegue prever tendências com precisão assustadora usando IA avançada.'
    WHEN name = 'Finance Hacker' THEN 'Hacker ético especializado em segurança financeira. Usa suas habilidades para proteger investidores e expor fraudes no mundo das finanças digitais.'
    WHEN name = 'Investment Scholar' THEN 'Acadêmico brilhante que revolucionou a teoria de investimentos com algoritmos quânticos. Seus modelos são usados pelos maiores fundos do mundo.'
    WHEN name = 'Quantum Broker' THEN 'Corretor que opera em múltiplas dimensões financeiras simultaneamente. Usa computação quântica para executar trades impossíveis na realidade convencional.'
    WHEN name = 'DeFi Samurai' THEN 'Guerreiro das finanças descentralizadas. Segue o código de honra dos protocolos DeFi e luta contra a centralização financeira com sua katana digital.'
    WHEN name = 'The Satoshi' THEN 'Figura lendária e misteriosa, considerado o criador das finanças digitais modernas. Sua identidade permanece um segredo, mas sua influência molda toda Satoshi City.'
    WHEN name = 'Neural Architect' THEN 'Projetista de redes neurais financeiras. Suas criações IA conseguem otimizar portfolios com precisão sobre-humana, revolucionando a gestão de ativos.'
    WHEN name = 'Data Miner' THEN 'Minerador de dados financeiros que escava insights valiosos nos vastos oceanos de informação. Cada byte descoberto pode valer milhões no mercado.'
    WHEN name = 'Blockchain Guardian' THEN 'Protetor das redes blockchain, garantindo a segurança e integridade de todas as transações. Sua presença inspira confiança nos investidores.'
    WHEN name = 'Quantum Physician' THEN 'Médico especializado em curar portfolios doentes. Diagnostica problemas financeiros com precisão quântica e prescreve as melhores estratégias de recuperação.'
    WHEN name = 'Virtual Realtor' THEN 'Corretor de imóveis virtuais e NFTs. Domina os mercados de ativos digitais e propriedades no metaverso, onde o futuro já chegou.'
    WHEN name = 'Code Assassin' THEN 'Assassino silencioso de bugs e vulnerabilidades em contratos inteligentes. Seus códigos são letais para qualquer falha de segurança.'
    WHEN name = 'Crypto Shaman' THEN 'Xamã das criptomoedas que se conecta com os espíritos dos mercados. Suas previsões místicas surpreendem até os analistas mais céticos.'
    WHEN name = 'Market Prophet' THEN 'Profeta que enxerga o futuro dos mercados financeiros. Suas profecias econômicas se tornam realidade com frequência impressionante.'
    WHEN name = 'Digital Nomad' THEN 'Nômade digital que viaja pelo ciberespaço gerenciando investimentos globais. Não tem base fixa, mas seus lucros são constantes.'
    WHEN name = 'Neon Detective' THEN 'Detetive especializado em crimes financeiros cibernéticos. Suas investigações desvendam esquemas complexos de lavagem de dinheiro digital.'
    WHEN name = 'Hologram Dancer' THEN 'Dançarina holográfica que usa arte e movimento para visualizar tendências de mercado. Sua performance revela padrões ocultos nos dados.'
    WHEN name = 'Cyber Mechanic' THEN 'Mecânico que repara e otimiza sistemas de trading automatizado. Seus ajustes fine-tuning podem dobrar a performance de qualquer algoritmo.'
    WHEN name = 'Ghost Trader' THEN 'Trader fantasma que opera nas sombras dos mercados. Ninguém sabe sua identidade real, mas seus trades movimentam bilhões silenciosamente.'
    WHEN name = 'Binary Monk' THEN 'Monge digital que encontrou iluminação através do código binário. Medita com algoritmos e alcança estados superiores de consciência financeira.'
    WHEN name = 'Pixel Artist' THEN 'Artista que cria NFTs valiosos usando apenas pixels. Cada obra é uma representação única de movimentos de mercado e dados financeiros.'
    WHEN name = 'Quantum Thief' THEN 'Ladrão quântico que rouba oportunidades perdidas no tempo. Viaja entre realidades paralelas para capturar os melhores momentos de investimento.'
    WHEN name = 'Memory Keeper' THEN 'Guardião das memórias financeiras da humanidade. Armazena toda a história dos mercados em sua mente cibernética ampliada.'
    WHEN name = 'Storm Hacker' THEN 'Hacker que domina tempestades digitais e manipula dados como um mago controla os elementos. Especialista em weather derivatives e trading de volatilidade.'
    WHEN name = 'Dream Architect' THEN 'Arquiteto de sonhos financeiros que constrói realidades onde todos os investimentos são lucrativos. Projeta futuros prósperos para seus clientes.'
    WHEN name = 'Chrome Gladiator' THEN 'Gladiador cromado que luta nas arenas de trading de alta frequência. Cada batalha é medida em microsegundos e milhões de transações.'
    ELSE backstory
  END,
  avatar_class = CASE 
    WHEN name LIKE '%Trader%' OR name LIKE '%Broker%' THEN 'trader'
    WHEN name LIKE '%Analyst%' OR name LIKE '%Scholar%' THEN 'analyst'
    WHEN name LIKE '%Hacker%' OR name LIKE '%Assassin%' THEN 'hacker'
    WHEN name LIKE '%Guardian%' OR name LIKE '%Samurai%' OR name LIKE '%Gladiator%' THEN 'guardian'
    WHEN name LIKE '%Architect%' OR name LIKE '%Prophet%' THEN 'architect'
    WHEN name LIKE '%Shaman%' OR name LIKE '%Monk%' THEN 'mystic'
    WHEN name LIKE '%Detective%' OR name LIKE '%Physician%' THEN 'specialist'
    WHEN name = 'The Satoshi' THEN 'legend'
    ELSE 'citizen'
  END,
  district_theme = CASE 
    WHEN name IN ('Neo Trader', 'Quantum Broker', 'Ghost Trader') THEN 'trading_district'
    WHEN name IN ('Crypto Analyst', 'Investment Scholar', 'Market Prophet') THEN 'financial_analytics'
    WHEN name IN ('Finance Hacker', 'Code Assassin', 'Storm Hacker') THEN 'cyber_security'
    WHEN name IN ('DeFi Samurai', 'Blockchain Guardian') THEN 'blockchain_core'
    WHEN name IN ('Neural Architect', 'Quantum Physician', 'Memory Keeper') THEN 'neural_networks'
    WHEN name IN ('Data Miner', 'Cyber Mechanic') THEN 'data_mining'
    WHEN name IN ('Virtual Realtor', 'Digital Nomad') THEN 'metaverse_district'
    WHEN name IN ('Neon Detective', 'Binary Monk') THEN 'investigation_bureau'
    WHEN name IN ('Hologram Dancer', 'Pixel Artist', 'Dream Architect') THEN 'creative_labs'
    WHEN name IN ('Crypto Shaman', 'Quantum Thief', 'Chrome Gladiator') THEN 'quantum_realm'
    WHEN name = 'The Satoshi' THEN 'central_nexus'
    ELSE 'neutral_zone'
  END,
  bonus_effects = CASE 
    WHEN name LIKE '%Trader%' OR name LIKE '%Broker%' THEN '{"trading_boost": 15, "market_analysis": 10}'::jsonb
    WHEN name LIKE '%Analyst%' OR name LIKE '%Scholar%' THEN '{"research_speed": 20, "pattern_recognition": 15}'::jsonb
    WHEN name LIKE '%Hacker%' OR name LIKE '%Assassin%' THEN '{"security_bonus": 25, "vulnerability_detection": 20}'::jsonb
    WHEN name LIKE '%Guardian%' OR name LIKE '%Samurai%' THEN '{"protection_aura": 30, "integrity_boost": 15}'::jsonb
    WHEN name LIKE '%Architect%' OR name LIKE '%Prophet%' THEN '{"foresight": 25, "strategy_optimization": 20}'::jsonb
    WHEN name = 'The Satoshi' THEN '{"legend_status": 50, "all_bonuses": 25, "mystery_aura": 100}'::jsonb
    ELSE '{"basic_bonus": 5}'::jsonb
  END
WHERE name IN (
  'Neo Trader', 'Crypto Analyst', 'Finance Hacker', 'Investment Scholar', 
  'Quantum Broker', 'DeFi Samurai', 'The Satoshi', 'Neural Architect', 
  'Data Miner', 'Blockchain Guardian', 'Quantum Physician', 'Virtual Realtor',
  'Code Assassin', 'Crypto Shaman', 'Market Prophet', 'Digital Nomad',
  'Neon Detective', 'Hologram Dancer', 'Cyber Mechanic', 'Ghost Trader',
  'Binary Monk', 'Pixel Artist', 'Quantum Thief', 'Memory Keeper',
  'Storm Hacker', 'Dream Architect', 'Chrome Gladiator'
);