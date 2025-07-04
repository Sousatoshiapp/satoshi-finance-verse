-- Criar tabela para o sistema SRS (Spaced Repetition System)
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para tracking do progresso SRS do usuário
CREATE TABLE public.user_question_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  easiness_factor REAL NOT NULL DEFAULT 2.5,
  repetition_count INTEGER NOT NULL DEFAULT 0,
  interval_days INTEGER NOT NULL DEFAULT 1,
  next_review_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_reviewed TIMESTAMP WITH TIME ZONE,
  quality_responses INTEGER[] DEFAULT '{}',
  total_reviews INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- Tabela para sessões de quiz com métricas detalhadas
CREATE TABLE public.quiz_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_type VARCHAR(20) NOT NULL DEFAULT 'review',
  difficulty VARCHAR(20),
  questions_total INTEGER NOT NULL DEFAULT 0,
  questions_correct INTEGER NOT NULL DEFAULT 0,
  questions_incorrect INTEGER NOT NULL DEFAULT 0,
  time_spent INTEGER, -- em segundos
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  questions_data JSONB DEFAULT '[]'
);

-- Enable RLS
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_question_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Quiz questions are viewable by everyone" 
ON public.quiz_questions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can view their own progress" 
ON public.user_question_progress 
FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own progress" 
ON public.user_question_progress 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own progress" 
ON public.user_question_progress 
FOR UPDATE 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their own quiz sessions" 
ON public.quiz_sessions 
FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own quiz sessions" 
ON public.quiz_sessions 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own quiz sessions" 
ON public.quiz_sessions 
FOR UPDATE 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Triggers para updated_at
CREATE TRIGGER update_quiz_questions_updated_at
BEFORE UPDATE ON public.quiz_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_question_progress_updated_at
BEFORE UPDATE ON public.user_question_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir questões financeiras de alta qualidade (50 fáceis)
INSERT INTO public.quiz_questions (question, options, correct_answer, explanation, difficulty, category, tags) VALUES

-- EASY LEVEL QUESTIONS (50)
('Qual é a primeira coisa que você deve fazer ao receber seu salário?', 
'["Gastar com o que quiser", "Separar dinheiro para poupança", "Comprar algo que deseja há tempo", "Pagar apenas as contas obrigatórias"]', 
'Separar dinheiro para poupança', 
'A regra "pague-se primeiro" é fundamental: separe dinheiro para poupança antes de qualquer outro gasto.', 
'easy', 'Orçamento Pessoal', '{"poupança", "salário", "planejamento"}'),

('O que significa a regra 50-30-20?', 
'["50% diversão, 30% casa, 20% comida", "50% necessidades, 30% desejos, 20% poupança", "50% poupança, 30% investimentos, 20% gastos", "50% salário, 30% bônus, 20% extra"]', 
'50% necessidades, 30% desejos, 20% poupança', 
'A regra 50-30-20 é uma forma simples de dividir a renda: 50% para necessidades básicas, 30% para desejos e 20% para poupança.', 
'easy', 'Orçamento Pessoal', '{"orçamento", "planejamento", "divisão de renda"}'),

('Qual o valor ideal para uma reserva de emergência?', 
'["1 mês de gastos", "3 a 6 meses de gastos", "1 ano de gastos", "Não precisa ter reserva"]', 
'3 a 6 meses de gastos', 
'A reserva de emergência deve cobrir de 3 a 6 meses dos seus gastos essenciais para proteger contra imprevistos.', 
'easy', 'Reserva de Emergência', '{"emergência", "segurança financeira", "planejamento"}'),

('O que é inflação?', 
'["Aumento geral dos preços", "Diminuição dos preços", "Valor fixo dos produtos", "Taxa de juros do banco"]', 
'Aumento geral dos preços', 
'Inflação é o aumento geral e contínuo dos preços na economia, reduzindo o poder de compra do dinheiro.', 
'easy', 'Economia Básica', '{"inflação", "preços", "economia"}'),

('Por que é importante anotar todos os gastos?', 
'["Para complicar a vida", "Para controlar e entender onde vai o dinheiro", "Por obrigação legal", "Para impressionar outros"]', 
'Para controlar e entender onde vai o dinheiro', 
'Anotar gastos ajuda a identificar padrões, eliminar desperdícios e tomar decisões financeiras mais conscientes.', 
'easy', 'Controle Financeiro', '{"controle", "gastos", "planejamento"}'),

('Qual a diferença entre necessidade e desejo?', 
'["Não há diferença", "Necessidade é essencial, desejo é opcional", "Desejo é mais importante", "Necessidade é mais cara"]', 
'Necessidade é essencial, desejo é opcional', 
'Necessidades são gastos essenciais para viver (moradia, alimentação), desejos são opcionais (entretenimento, luxos).', 
'easy', 'Orçamento Pessoal', '{"necessidades", "desejos", "prioridades"}'),

('O que fazer quando a conta não fecha no final do mês?', 
'["Ignorar o problema", "Revisar gastos e cortar supérfluos", "Pedir dinheiro emprestado", "Usar o cartão de crédito"]', 
'Revisar gastos e cortar supérfluos', 
'Quando a conta não fecha, é preciso analisar os gastos, identificar supérfluos e fazer ajustes no orçamento.', 
'easy', 'Orçamento Pessoal', '{"orçamento", "controle", "ajustes"}'),

('Qual a importância de ter objetivos financeiros?', 
'["Não é importante", "Ajuda a focar e planejar o futuro", "Só serve para ricos", "Complica demais"]', 
'Ajuda a focar e planejar o futuro', 
'Objetivos financeiros dão direção aos seus esforços, motivam a economizar e facilitam o planejamento.', 
'easy', 'Planejamento Financeiro', '{"objetivos", "planejamento", "motivação"}'),

('O que é renda passiva?', 
'["Salário do trabalho", "Dinheiro que você ganha sem trabalhar ativamente", "Dinheiro emprestado", "Gastos mensais"]', 
'Dinheiro que você ganha sem trabalhar ativamente', 
'Renda passiva é o dinheiro recebido regularmente com pouco ou nenhum esforço para mantê-la (aluguéis, dividendos).', 
'easy', 'Investimentos Básicos', '{"renda passiva", "investimentos", "independência"}'),

('Por que devemos evitar dívidas desnecessárias?', 
'["Porque são ilegais", "Porque geram juros e comprometem o orçamento futuro", "Porque são difíceis de conseguir", "Porque são sempre pequenas"]', 
'Porque geram juros e comprometem o orçamento futuro', 
'Dívidas desnecessárias geram juros, reduzem sua capacidade de poupança e limitam suas opções futuras.', 
'easy', 'Gestão de Dívidas', '{"dívidas", "juros", "planejamento"}'),

('O que é juros simples?', 
'["Juros que incidem apenas sobre o valor inicial", "Juros sobre juros", "Juros muito baixos", "Juros sem cobrança"]', 
'Juros que incidem apenas sobre o valor inicial', 
'Juros simples são calculados apenas sobre o capital inicial, sem considerar juros acumulados de períodos anteriores.', 
'easy', 'Matemática Financeira', '{"juros simples", "cálculos", "básico"}'),

('Qual a primeira coisa a fazer ao sair do vermelho?', 
'["Fazer uma festa", "Parar de fazer novas dívidas", "Comprar algo que desejava", "Diminuir a poupança"]', 
'Parar de fazer novas dívidas', 
'O primeiro passo para sair do vermelho é estancar o sangramento: pare de fazer novas dívidas.', 
'easy', 'Gestão de Dívidas', '{"dívidas", "controle", "recuperação"}'),

('O que significa "se pagar primeiro"?', 
'["Pagar suas contas pessoais antes das outras", "Separar dinheiro para você (poupança) antes dos gastos", "Dar preferência aos seus desejos", "Pagar apenas o que é seu"]', 
'Separar dinheiro para você (poupança) antes dos gastos', 
'Pagar-se primeiro significa separar dinheiro para sua poupança/investimentos antes de qualquer outro gasto.', 
'easy', 'Hábitos Financeiros', '{"poupança", "prioridades", "hábitos"}'),

('Por que é importante diversificar investimentos?', 
'["Para complicar as coisas", "Para reduzir riscos", "Para gastar mais dinheiro", "Não é importante"]', 
'Para reduzir riscos', 
'Diversificar investimentos ajuda a reduzir riscos: se um investimento vai mal, outros podem compensar.', 
'easy', 'Investimentos Básicos', '{"diversificação", "riscos", "estratégia"}'),

('O que é score de crédito?', 
'["Seu salário mensal", "Pontuação que indica seu risco de crédito", "Valor das suas dívidas", "Limite do cartão"]', 
'Pontuação que indica seu risco de crédito', 
'Score de crédito é uma pontuação que indica para o mercado qual é seu risco de não pagar dívidas.', 
'easy', 'Crédito e Financiamento', '{"score", "crédito", "histórico"}'),

('Qual a vantagem de quitar dívidas antecipadamente?', 
'["Não há vantagem", "Economiza juros", "Piora o score", "Complica o orçamento"]', 
'Economiza juros', 
'Quitar dívidas antecipadamente economiza o pagamento de juros futuros, liberando dinheiro para outros objetivos.', 
'easy', 'Gestão de Dívidas', '{"quitação", "juros", "economia"}'),

('O que é cartão de crédito pré-pago?', 
'["Cartão sem limite", "Cartão onde você carrega o valor antes de usar", "Cartão gratuito", "Cartão empresarial"]', 
'Cartão onde você carrega o valor antes de usar', 
'Cartão pré-pago funciona como um cartão de débito: você só pode gastar o que carregou nele previamente.', 
'easy', 'Produtos Bancários', '{"cartão", "pré-pago", "controle"}'),

('Por que ler os termos de um empréstimo?', 
'["É perda de tempo", "Para entender juros, prazos e condições", "Por obrigação legal apenas", "Para confundir a mente"]', 
'Para entender juros, prazos e condições', 
'Ler os termos é essencial para entender o que você está contratando: juros, prazos, multas e condições.', 
'easy', 'Crédito e Financiamento', '{"contratos", "termos", "transparência"}'),

('O que é taxa Selic?', 
'["Taxa de inflação", "Taxa básica de juros da economia", "Taxa de câmbio", "Taxa bancária"]', 
'Taxa básica de juros da economia', 
'A Selic é a taxa básica de juros da economia brasileira, que influencia todas as outras taxas do mercado.', 
'easy', 'Economia Básica', '{"Selic", "juros", "economia"}'),

('Qual o benefício de ter conta no banco?', 
'["Nenhum benefício", "Facilita pagamentos e recebimentos", "Só serve para empresas", "É mais caro que dinheiro"]', 
'Facilita pagamentos e recebimentos', 
'Conta bancária facilita transações, pagamentos, recebimentos e oferece segurança para guardar dinheiro.', 
'easy', 'Produtos Bancários', '{"conta bancária", "facilidade", "segurança"}'),

('O que é CDI?', 
'["Um tipo de investimento", "Taxa de juros entre bancos", "Imposto sobre investimentos", "Tipo de cartão"]', 
'Taxa de juros entre bancos', 
'CDI é a taxa de juros praticada em empréstimos entre bancos, servindo como referência para investimentos.', 
'easy', 'Investimentos Básicos', '{"CDI", "taxa", "referência"}'),

('Por que comparar preços antes de comprar?', 
'["É perda de tempo", "Para encontrar o melhor custo-benefício", "Para complicar a compra", "Não faz diferença"]', 
'Para encontrar o melhor custo-benefício', 
'Comparar preços ajuda a encontrar melhores ofertas, economizar dinheiro e fazer escolhas mais inteligentes.', 
'easy', 'Consumo Consciente', '{"comparação", "economia", "pesquisa"}'),

('O que fazer com dinheiro que sobra no mês?', 
'["Gastar rapidamente", "Guardar ou investir", "Deixar na conta corrente", "Emprestar para amigos"]', 
'Guardar ou investir', 
'Dinheiro que sobra deve ser direcionado para poupança ou investimentos para crescer no futuro.', 
'easy', 'Poupança e Investimento', '{"sobra", "poupança", "investimento"}'),

('Qual o risco de usar apenas cartão de crédito?', 
'["Nenhum risco", "Perder controle dos gastos", "Não funciona em todos os lugares", "É mais seguro"]', 
'Perder controle dos gastos', 
'Usar apenas cartão de crédito pode fazer você perder noção dos gastos e acumular dívidas sem perceber.', 
'easy', 'Controle Financeiro', '{"cartão", "controle", "gastos"}'),

('O que é importante ao escolher um banco?', 
'["Apenas a cor do cartão", "Tarifas, serviços e conveniência", "Só o nome famoso", "O banco mais próximo"]', 
'Tarifas, serviços e conveniência', 
'Ao escolher banco, considere tarifas cobradas, qualidade dos serviços e conveniência para seu uso.', 
'easy', 'Produtos Bancários', '{"banco", "tarifas", "serviços"}'),

('Por que evitar o rotativo do cartão?', 
'["Não há problema", "Tem juros muito altos", "É mais conveniente", "Melhora o score"]', 
'Tem juros muito altos', 
'O rotativo do cartão tem juros altíssimos (300%+ ao ano), sendo uma das formas mais caras de crédito.', 
'easy', 'Cartão de Crédito', '{"rotativo", "juros", "perigo"}'),

('O que é planejamento financeiro?', 
'["Complicar a vida", "Organizar recursos para alcançar objetivos", "Só para ricos", "Guardar dinheiro sem objetivo"]', 
'Organizar recursos para alcançar objetivos', 
'Planejamento financeiro é organizar seus recursos (renda, gastos, investimentos) para alcançar seus objetivos de vida.', 
'easy', 'Planejamento Financeiro', '{"planejamento", "objetivos", "organização"}'),

('Qual a diferença entre débito e crédito?', 
'["Não há diferença", "Débito desconta na hora, crédito você paga depois", "Crédito é mais barato", "Débito tem juros"]', 
'Débito desconta na hora, crédito você paga depois', 
'Débito desconta o dinheiro imediatamente da sua conta, crédito você recebe uma fatura para pagar depois.', 
'easy', 'Produtos Bancários', '{"débito", "crédito", "diferenças"}'),

('Por que ter mais de uma fonte de renda?', 
'["É desnecessário", "Aumenta segurança financeira", "Complica o imposto de renda", "Só confunde"]', 
'Aumenta segurança financeira', 
'Múltiplas fontes de renda oferecem segurança: se uma falha, você ainda tem outras para se sustentar.', 
'easy', 'Diversificação de Renda', '{"renda", "segurança", "diversificação"}'),

('O que é educação financeira?', 
'["Curso universitário caro", "Conhecimentos para tomar boas decisões com dinheiro", "Só para especialistas", "Teoria sem prática"]', 
'Conhecimentos para tomar boas decisões com dinheiro', 
'Educação financeira é adquirir conhecimentos e habilidades para tomar decisões conscientes e eficazes com o dinheiro.', 
'easy', 'Educação Financeira', '{"educação", "conhecimento", "decisões"}'),

('Qual o primeiro passo para organizar as finanças?', 
'["Começar a investir", "Saber quanto ganha e quanto gasta", "Cortar todos os gastos", "Pedir empréstimo"]', 
'Saber quanto ganha e quanto gasta', 
'O primeiro passo é fazer um diagnóstico: entender exatamente quanto dinheiro entra e sai mensalmente.', 
'easy', 'Organização Financeira', '{"diagnóstico", "receitas", "gastos"}'),

('O que é taxa de administração?', 
'["Taxa que você paga para administrar sua casa", "Taxa cobrada para gerenciar seu investimento", "Taxa do governo", "Taxa de inflação"]', 
'Taxa cobrada para gerenciar seu investimento', 
'Taxa de administração é o que você paga para que alguém gerencie profissionalmente seu investimento.', 
'easy', 'Investimentos Básicos', '{"taxa", "administração", "custos"}'),

('Por que é importante começar a investir cedo?', 
'["Não é importante a idade", "Tempo faz o dinheiro crescer mais (juros compostos)", "Jovens têm mais sorte", "É mais arriscado quando velho"]', 
'Tempo faz o dinheiro crescer mais (juros compostos)', 
'Começar cedo aproveita o poder dos juros compostos: quanto mais tempo, mais seu dinheiro cresce exponencialmente.', 
'easy', 'Investimentos Básicos', '{"tempo", "juros compostos", "crescimento"}'),

('O que fazer antes de fazer uma compra grande?', 
'["Comprar imediatamente", "Pesquisar, comparar e planejar", "Pedir emprestado", "Usar todo limite do cartão"]', 
'Pesquisar, comparar e planejar', 
'Antes de compras grandes: pesquise preços, compare opções, avalie se cabe no orçamento e planeje o pagamento.', 
'easy', 'Consumo Consciente', '{"pesquisa", "planejamento", "compras"}'),

('O que é um orçamento familiar?', 
'["Lista de supermercado", "Planejamento de receitas e gastos da família", "Conta do restaurante", "Valor do aluguel"]', 
'Planejamento de receitas e gastos da família', 
'Orçamento familiar é o planejamento de todas as receitas e gastos da família para um período determinado.', 
'easy', 'Orçamento Familiar', '{"orçamento", "família", "planejamento"}'),

('Qual a importância de ter disciplina financeira?', 
'["Não é importante", "Ajuda a cumprir planos e alcançar objetivos", "Torna a vida chata", "Só serve para ricos"]', 
'Ajuda a cumprir planos e alcançar objetivos', 
'Disciplina financeira é essencial para seguir seu planejamento, resistir a impulsos e alcançar seus objetivos.', 
'easy', 'Comportamento Financeiro', '{"disciplina", "objetivos", "controle"}'),

('O que é importante ensinar sobre dinheiro para crianças?', 
'["Que dinheiro não importa", "Valor do dinheiro, poupança e escolhas conscientes", "Que devem gastar tudo", "Só quando crescerem"]', 
'Valor do dinheiro, poupança e escolhas conscientes', 
'Ensinar crianças sobre o valor do dinheiro, importância da poupança e como fazer escolhas conscientes é fundamental.', 
'easy', 'Educação Financeira', '{"crianças", "educação", "valores"}'),

('Por que ler sobre finanças é importante?', 
'["É perda de tempo", "Aumenta conhecimento para melhores decisões", "Só confunde", "É muito difícil"]', 
'Aumenta conhecimento para melhores decisões', 
'Ler sobre finanças amplia seu conhecimento, ajuda a tomar melhores decisões e evitar armadilhas financeiras.', 
'easy', 'Educação Financeira', '{"leitura", "conhecimento", "decisões"}'),

('O que fazer quando não entende um produto financeiro?', 
'["Comprar mesmo assim", "Estudar e buscar informações antes de decidir", "Deixar outras pessoas decidirem", "Evitar para sempre"]', 
'Estudar e buscar informações antes de decidir', 
'Nunca contrate algo que não entende. Estude, pesquise, tire dúvidas e só então tome sua decisão.', 
'easy', 'Educação Financeira', '{"conhecimento", "produtos", "prudência"}'),

('Qual o benefício de automatizar poupança?', 
'["Nenhum benefício", "Garante que você vai poupar todo mês", "Complica o orçamento", "Só funciona para ricos"]', 
'Garante que você vai poupar todo mês', 
'Automatizar a poupança garante que você separe dinheiro mensalmente, criando o hábito sem depender de disciplina.', 
'easy', 'Hábitos Financeiros', '{"automação", "poupança", "hábitos"}'),

('O que é importante ao definir objetivos financeiros?', 
'["Que sejam impossíveis", "Que sejam específicos, mensuráveis e com prazo", "Que sejam só de curto prazo", "Que sejam iguais aos dos outros"]', 
'Que sejam específicos, mensuráveis e com prazo', 
'Objetivos devem ser SMART: específicos, mensuráveis, alcançáveis, relevantes e com prazo determinado.', 
'easy', 'Planejamento Financeiro', '{"objetivos", "SMART", "planejamento"}'),

('Por que é bom ter um controle visual dos gastos?', 
'["Não é necessário", "Facilita identificar padrões e excessos", "Só complica", "É coisa de contador"]', 
'Facilita identificar padrões e excessos', 
'Controle visual (gráficos, planilhas) ajuda a identificar padrões de gastos, excessos e oportunidades de economia.', 
'easy', 'Controle Financeiro', '{"visual", "padrões", "controle"}'),

('O que fazer quando recebe uma herança ou dinheiro inesperado?', 
'["Gastar tudo rapidamente", "Planejar bem o uso desse dinheiro", "Emprestar para amigos", "Ignorar que existe"]', 
'Planejar bem o uso desse dinheiro', 
'Dinheiro inesperado é uma oportunidade: planeje bem seu uso, considere quitar dívidas, formar reserva ou investir.', 
'easy', 'Planejamento Financeiro', '{"windfall", "planejamento", "oportunidade"}'),

('Qual a importância de revisar regularmente o orçamento?', 
'["Não é importante", "Permite ajustes conforme mudanças na vida", "Só complica as coisas", "Uma vez feito, não muda"]', 
'Permite ajustes conforme mudanças na vida', 
'Revisar o orçamento regularmente permite ajustar para mudanças na renda, gastos e objetivos de vida.', 
'easy', 'Orçamento Pessoal', '{"revisão", "ajustes", "flexibilidade"}'),

('O que é mais importante: ganhar mais ou gastar menos?', 
'["Ganhar mais", "Gastar menos", "Os dois são importantes", "Nenhum dos dois importa"]', 
'Os dois são importantes', 
'Tanto aumentar renda quanto controlar gastos são importantes: eles trabalham juntos para melhorar sua situação financeira.', 
'easy', 'Filosofia Financeira', '{"renda", "gastos", "equilíbrio"}'),

('Por que ter um parceiro financeiramente compatível é importante?', 
'["Não é importante", "Evita conflitos e facilita objetivos comuns", "Só importa se for rico", "Complica o relacionamento"]', 
'Evita conflitos e facilita objetivos comuns', 
'Compatibilidade financeira no relacionamento evita conflitos e facilita trabalhar juntos em direção a objetivos comuns.', 
'easy', 'Relacionamento e Dinheiro', '{"parceria", "objetivos", "harmonia"}'),

('O que é lifestyle inflation?', 
'["Aumento normal de preços", "Aumentar gastos proporcionalmente ao aumento de renda", "Inflação apenas de luxos", "Inflação do governo"]', 
'Aumentar gastos proporcionalmente ao aumento de renda', 
'Lifestyle inflation é quando você aumenta seus gastos na mesma proporção que sua renda aumenta, impedindo mais poupança.', 
'easy', 'Comportamento Financeiro', '{"lifestyle", "gastos", "armadilha"}'),

('Qual o primeiro investimento que iniciante deve considerar?', 
'["Ações de empresa famosa", "Reserva de emergência em produto seguro", "Criptomoedas", "Imóveis"]', 
'Reserva de emergência em produto seguro', 
'Antes de qualquer investimento, forme sua reserva de emergência em produtos seguros e líquidos.', 
'easy', 'Investimentos Básicos', '{"iniciante", "reserva", "segurança"}'),

('Por que é importante conhecer seu perfil de risco?', 
'["Não é importante", "Para escolher investimentos adequados ao seu perfil", "Só para investidores profissionais", "Para complicar as coisas"]', 
'Para escolher investimentos adequados ao seu perfil', 
'Conhecer seu perfil de risco ajuda a escolher investimentos compatíveis com sua tolerância a perdas e objetivos.', 
'easy', 'Investimentos Básicos', '{"perfil", "risco", "adequação"}');

-- Continuar com mais 100 questões (médio e difícil) em outra parte...