-- Limpar perguntas antigas sem tema específico
DELETE FROM quiz_questions WHERE theme IS NULL OR theme = '';

-- Resetar para garantir perguntas temáticas consistentes
DELETE FROM quiz_questions WHERE theme IN ('trading', 'cryptocurrency', 'portfolio', 'basic_investments', 'financial_education', 'budgeting', 'economics');