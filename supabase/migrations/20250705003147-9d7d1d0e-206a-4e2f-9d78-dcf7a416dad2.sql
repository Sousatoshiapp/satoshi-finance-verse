-- Associar perguntas existentes aos distritos apropriados baseado nas categorias

-- XP Investimentos District (renda variável, ações, fundos)
UPDATE quiz_questions 
SET district_id = '0645a23d-6f02-465a-b9a5-8571853ebdec' 
WHERE category IN (
  'Investimentos Básicos', 'Análise de Investimentos', 'Análise Fundamentalista',
  'Gestão de Carteira', 'Análise de Risco', 'Análise de Retorno', 'Análise de Volatilidade',
  'Diversificação de Renda', 'Performance de Carteira', 'Otimização de Carteira',
  'Factor Investing', 'Dynamic Asset Allocation', 'Portfolio Optimization',
  'Teoria de Investimentos', 'Ética em Investimentos', 'Investimento Sustentável'
);

-- Banking Sector (sistema bancário e fintechs)
UPDATE quiz_questions 
SET district_id = '6add63a5-9c43-4859-8f9c-282223d6b077' 
WHERE category IN (
  'Produtos Bancários', 'Análise de Crédito', 'Crédito e Financiamento',
  'Cartão de Crédito', 'Financiamentos', 'Credit Portfolio Management',
  'Credit Trading', 'Custos de Crédito', 'Estruturas de Crédito',
  'Mercado de Crédito', 'Asset Liability Management', 'Regulamentação Bancária',
  'Liquidity Risk Management', 'Operational Risk'
);

-- Cripto Valley (criptomoedas, DeFi, blockchain)
UPDATE quiz_questions 
SET district_id = '5a562d56-efde-4341-8789-87fd3d4cf703' 
WHERE category IN (
  'Derivativos Avançados', 'Produtos Estruturados', 'Structured Products',
  'Multi-Asset Derivatives', 'Exotic Options Hedging', 'Options Trading Avançado',
  'Interest Rate Derivatives', 'Volatility Products', 'Vol Trading Advanced'
);

-- Tech Finance Hub (fintech, open banking)
UPDATE quiz_questions 
SET district_id = 'e1f9ede2-3a54-4a4f-a533-4f85b9d9025c' 
WHERE category IN (
  'Algorithmic Trading', 'High Frequency Trading', 'Trading Quantitativo',
  'Quantitative Finance', 'Engenharia Financeira', 'Market Making',
  'Hedge Avançado', 'Estratégias Quantitativas', 'Model Risk Management',
  'Model Calibration', 'Modelos Estocásticos', 'Modelos de Salto'
);

-- International Trade (mercados globais, câmbio)
UPDATE quiz_questions 
SET district_id = 'c04f1a05-07f2-426b-8ea6-2fb783054111' 
WHERE category IN (
  'Investimentos Internacionais', 'Estratégias Internacionais', 'Mercado de Capitais',
  'Macroeconomia', 'Política Monetária', 'Análise Macroeconômica',
  'Estrutura de Mercado', 'Psicologia de Mercado'
);

-- Real Estate Zone (fundos imobiliários)
UPDATE quiz_questions 
SET district_id = '366870a4-fc67-48c2-be47-d3b35e5b523e' 
WHERE category IN (
  'Renda Fixa Avançada', 'Fixed Income Attribution', 'Valuation',
  'Valuation de Ativos', 'Teoria de Apreçamento', 'Instrumentos Financeiros'
);

-- Anima Educação District (educação financeira)
UPDATE quiz_questions 
SET district_id = '1c58cbaa-9ed2-45ba-b2f9-6b666e94e937' 
WHERE category IN (
  'Educação Financeira', 'Planejamento Financeiro', 'Orçamento Pessoal',
  'Orçamento Familiar', 'Economia Pessoal', 'Economia Básica',
  'Controle Financeiro', 'Organização Financeira', 'Gestão de Dívidas',
  'Reserva de Emergência', 'Poupança e Investimento', 'Matemática Financeira',
  'Comportamento Financeiro', 'Hábitos Financeiros', 'Consumo Consciente',
  'Relacionamento e Dinheiro', 'Filosofia Financeira', 'Economia Comportamental',
  'Assessoria Financeira', 'Métricas Financeiras', 'Contabilidade Financeira',
  'Tributação', 'Tributação de Investimentos'
);

-- Restante das categorias avançadas que não se encaixaram acima vão para Tech Finance
UPDATE quiz_questions 
SET district_id = 'e1f9ede2-3a54-4a4f-a533-4f85b9d9025c' 
WHERE district_id IS NULL AND category IN (
  'Gestão de Risco', 'Gestão de Risco Quantitativa', 'Risk Management Avançado',
  'Risco de Contraparte', 'Tail Risk Management', 'VaR Backtesting',
  'Regulamentação FRTB', 'XVA Framework', 'Estratégias Avançadas',
  'Teoria dos Contratos'
);

-- Criar algumas perguntas específicas para testar o sistema de duelos
INSERT INTO quiz_questions (question, options, correct_answer, explanation, category, difficulty, district_id) VALUES
('Em um duelo financeiro, qual é a melhor estratégia para diversificar riscos?', 
 '["Concentrar em um único ativo", "Diversificar entre diferentes classes de ativos", "Investir apenas em renda fixa", "Seguir apenas tendências de mercado"]',
 'Diversificar entre diferentes classes de ativos',
 'A diversificação entre diferentes classes de ativos reduz o risco total da carteira.',
 'Duelos Estratégicos',
 'medium',
 '0645a23d-6f02-465a-b9a5-8571853ebdec'),
 
('No distrito Banking Sector, qual produto é mais adequado para emergências?', 
 '["Ações de alta volatilidade", "Conta poupança com liquidez diária", "Fundos de investimento de longo prazo", "Criptomoedas"]',
 'Conta poupança com liquidez diária',
 'Para emergências, a liquidez e baixo risco são fundamentais.',
 'Duelos Bancários',
 'easy',
 '6add63a5-9c43-4859-8f9c-282223d6b077'),
 
('No Cripto Valley, qual é o principal risco dos contratos inteligentes?', 
 '["Volatilidade de preços", "Bugs no código", "Regulamentação", "Taxas de transação"]',
 'Bugs no código',
 'Bugs no código podem causar perdas permanentes em contratos inteligentes.',
 'Duelos Cripto',
 'hard',
 '5a562d56-efde-4341-8789-87fd3d4cf703');