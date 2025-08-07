-- Inserir questões de conexão conceitual para o tema basic_finance
INSERT INTO public.concept_connection_questions (
  theme,
  difficulty,
  left_concepts,
  right_concepts,
  correct_connections,
  explanation,
  is_active
) VALUES 
(
  'basic_finance',
  'basic',
  '["Poupança", "CDB", "Tesouro Direto", "Ações"]'::jsonb,
  '["Baixo risco e liquidez diária", "Renda fixa com garantia do FGC", "Títulos públicos do governo", "Renda variável com dividendos"]'::jsonb,
  '{"Poupança": "Baixo risco e liquidez diária", "CDB": "Renda fixa com garantia do FGC", "Tesouro Direto": "Títulos públicos do governo", "Ações": "Renda variável com dividendos"}'::jsonb,
  'Conceitos básicos de investimentos e suas características principais.',
  true
),
(
  'basic_finance',
  'basic',
  '["Inflação", "Taxa Selic", "CDI", "IPCA"]'::jsonb,
  '["Índice oficial de inflação", "Taxa básica de juros", "Referência para renda fixa", "Perda do poder de compra"]'::jsonb,
  '{"Inflação": "Perda do poder de compra", "Taxa Selic": "Taxa básica de juros", "CDI": "Referência para renda fixa", "IPCA": "Índice oficial de inflação"}'::jsonb,
  'Indicadores econômicos fundamentais para entender o mercado financeiro.',
  true
),
(
  'basic_finance',
  'basic',
  '["Liquidez", "Rentabilidade", "Risco", "Diversificação"]'::jsonb,
  '["Facilidade de conversão em dinheiro", "Distribuir investimentos", "Possibilidade de perda", "Retorno do investimento"]'::jsonb,
  '{"Liquidez": "Facilidade de conversão em dinheiro", "Rentabilidade": "Retorno do investimento", "Risco": "Possibilidade de perda", "Diversificação": "Distribuir investimentos"}'::jsonb,
  'Princípios fundamentais para uma estratégia de investimentos eficiente.',
  true
);