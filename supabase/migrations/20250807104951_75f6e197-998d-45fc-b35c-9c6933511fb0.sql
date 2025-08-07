-- Executar correção das questões problemáticas
-- Vamos corrigir as questões que têm "Opção A/B/C/D" como resposta correta

-- Questão: O que é orçamento pessoal?
UPDATE quiz_questions 
SET correct_answer = 'Um planejamento de receitas e despesas'
WHERE id = '148d9013-813c-42ae-b667-d15ab831baa0';

-- Questão: Qual é a principal função de uma poupança?
UPDATE quiz_questions 
SET correct_answer = 'Guardar dinheiro com rendimento'
WHERE id = 'd90bd764-69bd-45bd-8b6d-c9014f48d037';

-- Questão: O que é taxa de juros?
UPDATE quiz_questions 
SET correct_answer = 'O custo do empréstimo de dinheiro'
WHERE id = '896c9a83-c3cb-45dc-a444-8698c8ff782a';

-- Questão: O que significa 'diversificação' em investimentos?
UPDATE quiz_questions 
SET correct_answer = 'Investir em diferentes tipos de ativos'
WHERE id = 'cbfd44e4-1457-4218-8020-7f391efecbc6';

-- Questão: O que é um cartão de crédito?
UPDATE quiz_questions 
SET correct_answer = 'Uma forma de pagamento que permite parcelar compras'
WHERE id = 'bb897998-7c82-4083-8bb7-d70243533932';

-- Questão: Qual é a importância de ter uma reserva de emergência?
UPDATE quiz_questions 
SET correct_answer = 'Cobrir gastos inesperados'
WHERE id = '0f6487f9-6879-41f2-9528-895bf1f3881b';

-- Questão: Qual é a função de um planejamento financeiro?
UPDATE quiz_questions 
SET correct_answer = 'Organizar as finanças pessoais'
WHERE id = 'abd1293a-1d3f-406b-940b-de2bb3e42687';

-- Questão: O que é um empréstimo?
UPDATE quiz_questions 
SET correct_answer = 'Um valor que é emprestado e deve ser pago com juros'
WHERE id = '448fea41-d5ed-4ac7-9d8f-1778fd243ee5';

-- Questão: O que é a educação financeira?
UPDATE quiz_questions 
SET correct_answer = 'O conhecimento sobre como gerenciar dinheiro'
WHERE id = '82d6fc4a-6129-49ce-b4d0-7fc6b36b7036';