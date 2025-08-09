-- Inserir 3 perguntas educativas estilo GenZ
INSERT INTO quiz_questions (
  question, 
  options, 
  correct_answer, 
  explanation, 
  category, 
  difficulty, 
  is_approved,
  created_by_admin
) VALUES 

-- 1. Finanças do Dia a Dia
(
  'Ganho R$ 2.000, gasto R$ 1.800 fixo. Quanto sobra? 💰',
  ARRAY[
    'R$ 200 📊',
    'R$ 300 💸', 
    'R$ 400 🚀',
    'Nada, só prejuízo 😭'
  ],
  'R$ 200 📊',
  'Sobra = Renda - Gastos = R$ 2.000 - R$ 1.800 = R$ 200. Essa sobra é sua chance de investir ou criar uma reserva! 💪',
  'Finanças do Dia a Dia',
  'facil',
  true,
  true
),

-- 2. ABC das Finanças  
(
  'Reserva de emergência ideal = quantos meses de gasto? 🚨',
  ARRAY[
    '1 mês só 📅',
    '3-6 meses 🛡️',
    '1 ano inteiro 📈', 
    'Não precisa disso 🤷‍♀️'
  ],
  '3-6 meses 🛡️',
  'A reserva ideal cobre 3-6 meses dos seus gastos. É sua proteção contra imprevistos como desemprego ou emergências médicas. Essencial! 🔒',
  'ABC das Finanças',
  'facil', 
  true,
  true
),

-- 3. Cripto
(
  'Bitcoin usa qual tecnologia pra funcionar? 🔗',
  ARRAY[
    'Blockchain ⛓️',
    'Internet Banking 🏦',
    'PayPal 2.0 💳',
    'Excel online 📊'
  ],
  'Blockchain ⛓️',
  'Blockchain é tipo um livro público onde todas as transações ficam registradas de forma segura e transparente. É a base de todas as cryptos! 🚀',
  'Cripto',
  'facil',
  true,
  true
);