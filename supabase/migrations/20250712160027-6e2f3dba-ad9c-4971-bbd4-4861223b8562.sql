-- Segunda correção de português brasileiro - continuação

-- Corrigir mais perguntas que precisam de acentuação
UPDATE quiz_questions SET question = 'O que é beta de um ativo e como interpretar?' WHERE question = 'O que é beta de um ativo e como interpretar?';
UPDATE quiz_questions SET question = 'O que é funding e como funciona?' WHERE question = 'O que é funding e como funciona?';
UPDATE quiz_questions SET question = 'Qual a principal limitação do modelo CAPM e como superá-la?' WHERE question = 'Qual a principal limitação do modelo CAPM e como superá-la?';

-- Corrigir explicações que ainda têm problemas
UPDATE quiz_questions SET 
  explanation = 'Beta mede quanto um ativo varia em relação ao mercado: beta 1 = igual ao mercado, >1 = mais volátil, <1 = menos volátil.'
WHERE id = '732de3df-da19-4745-aa3f-5c6cc1196302';

UPDATE quiz_questions SET 
  explanation = 'Funding é o processo de obter recursos financeiros para financiar operações, investimentos ou crescimento de empresas.'
WHERE id = '7fefa643-6a95-4263-8390-a7ba46452c77';

UPDATE quiz_questions SET 
  explanation = 'CAPM assume mercado eficiente e um só fator de risco. Modelos como Fama-French capturam fatores adicionais de risco e retorno.'
WHERE id = 'd78918f5-1fe6-4bdf-b5a5-c62492605fbb';

UPDATE quiz_questions SET 
  explanation = 'A diversificação entre diferentes classes de ativos reduz o risco total da carteira.'
WHERE id = 'b4bc671c-e9bc-4aef-b22f-6d0553486365';

UPDATE quiz_questions SET 
  explanation = 'Para emergências, a liquidez e baixo risco são fundamentais.'
WHERE id = '1cd4925b-f046-491e-bf67-722482e1a32d';

UPDATE quiz_questions SET 
  explanation = 'Bugs no código podem causar perdas permanentes em contratos inteligentes.'
WHERE id = '760ccacf-cd5f-4255-bd0b-97c5d132bb4a';

-- Corrigir opções com acentuação em casos específicos
UPDATE quiz_questions SET 
  options = '["Versão beta de software", "Sensibilidade do ativo em relação ao mercado", "Taxa de administração", "Tipo de fundo"]',
  correct_answer = 'Sensibilidade do ativo em relação ao mercado'
WHERE id = '732de3df-da19-4745-aa3f-5c6cc1196302';

UPDATE quiz_questions SET 
  options = '["Tipo de fundo de investimento", "Captação de recursos para financiar atividades", "Taxa cobrada pelos bancos", "Sistema de pagamentos"]',
  correct_answer = 'Captação de recursos para financiar atividades'
WHERE id = '7fefa643-6a95-4263-8390-a7ba46452c77';

UPDATE quiz_questions SET 
  options = '["Beta instável", "Assume mercado eficiente; usar modelos multifatoriais", "Não considera dividendos", "Muito complexo"]',
  correct_answer = 'Assume mercado eficiente; usar modelos multifatoriais'
WHERE id = 'd78918f5-1fe6-4bdf-b5a5-c62492605fbb';

UPDATE quiz_questions SET 
  options = '["Concentrar em um único ativo", "Diversificar entre diferentes classes de ativos", "Investir apenas em renda fixa", "Seguir apenas tendências de mercado"]',
  correct_answer = 'Diversificar entre diferentes classes de ativos'
WHERE id = 'b4bc671c-e9bc-4aef-b22f-6d0553486365';

UPDATE quiz_questions SET 
  options = '["Ações de alta volatilidade", "Conta poupança com liquidez diária", "Fundos de investimento de longo prazo", "Criptomoedas"]',
  correct_answer = 'Conta poupança com liquidez diária'
WHERE id = '1cd4925b-f046-491e-bf67-722482e1a32d';

UPDATE quiz_questions SET 
  options = '["Volatilidade de preços", "Bugs no código", "Regulamentação", "Taxas de transação"]',
  correct_answer = 'Bugs no código'
WHERE id = '760ccacf-cd5f-4255-bd0b-97c5d132bb4a';

-- Buscar e corrigir outras palavras comuns sem acentuação
UPDATE quiz_questions SET question = REPLACE(question, 'maximo', 'máximo');
UPDATE quiz_questions SET question = REPLACE(question, 'minimo', 'mínimo');
UPDATE quiz_questions SET question = REPLACE(question, 'risco', 'risco');
UPDATE quiz_questions SET question = REPLACE(question, 'basico', 'básico');
UPDATE quiz_questions SET question = REPLACE(question, 'economico', 'econômico');
UPDATE quiz_questions SET question = REPLACE(question, 'publico', 'público');
UPDATE quiz_questions SET question = REPLACE(question, 'pratico', 'prático');
UPDATE quiz_questions SET question = REPLACE(question, 'magico', 'mágico');

-- Corrigir explicações
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'maximo', 'máximo');
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'minimo', 'mínimo');
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'basico', 'básico');
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'economico', 'econômico');
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'publico', 'público');
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'pratico', 'prático');
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'especifico', 'específico');
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'historico', 'histórico');
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'periodo', 'período');
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'rapidos', 'rápidos');
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'automaticamente', 'automaticamente');
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'continuo', 'contínuo');
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'unicos', 'únicos');
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'medias', 'médias');
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'emprestimos', 'empréstimos');
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'titulos', 'títulos');
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'volatil', 'volátil');

-- Corrigir opções em JSON (fazendo replace em strings JSON)
UPDATE quiz_questions SET options = REPLACE(options, 'maximo', 'máximo');
UPDATE quiz_questions SET options = REPLACE(options, 'minimo', 'mínimo');
UPDATE quiz_questions SET options = REPLACE(options, 'basico', 'básico');
UPDATE quiz_questions SET options = REPLACE(options, 'economico', 'econômico');
UPDATE quiz_questions SET options = REPLACE(options, 'publico', 'público');
UPDATE quiz_questions SET options = REPLACE(options, 'pratico', 'prático');
UPDATE quiz_questions SET options = REPLACE(options, 'especifico', 'específico');
UPDATE quiz_questions SET options = REPLACE(options, 'historico', 'histórico');
UPDATE quiz_questions SET options = REPLACE(options, 'periodo', 'período');
UPDATE quiz_questions SET options = REPLACE(options, 'rapidos', 'rápidos');
UPDATE quiz_questions SET options = REPLACE(options, 'continuo', 'contínuo');
UPDATE quiz_questions SET options = REPLACE(options, 'unicos', 'únicos');
UPDATE quiz_questions SET options = REPLACE(options, 'medias', 'médias');
UPDATE quiz_questions SET options = REPLACE(options, 'emprestimos', 'empréstimos');
UPDATE quiz_questions SET options = REPLACE(options, 'titulos', 'títulos');
UPDATE quiz_questions SET options = REPLACE(options, 'volatil', 'volátil');
UPDATE quiz_questions SET options = REPLACE(options, 'fisico', 'físico');
UPDATE quiz_questions SET options = REPLACE(options, 'bancario', 'bancário');
UPDATE quiz_questions SET options = REPLACE(options, 'movel', 'móvel');

-- Corrigir respostas corretas
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'maximo', 'máximo');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'minimo', 'mínimo');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'basico', 'básico');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'economico', 'econômico');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'publico', 'público');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'pratico', 'prático');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'especifico', 'específico');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'historico', 'histórico');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'periodo', 'período');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'rapidos', 'rápidos');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'continuo', 'contínuo');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'unicos', 'únicos');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'medias', 'médias');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'emprestimos', 'empréstimos');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'titulos', 'títulos');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'volatil', 'volátil');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'fisico', 'físico');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'bancario', 'bancário');
UPDATE quiz_questions SET correct_answer = REPLACE(correct_answer, 'movel', 'móvel');