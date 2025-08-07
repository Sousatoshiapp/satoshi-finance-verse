-- Criar tabela para questões de conexão de conceitos
CREATE TABLE public.concept_connection_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  theme TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'basic',
  left_concepts JSONB NOT NULL, -- Array de conceitos do lado esquerdo
  right_concepts JSONB NOT NULL, -- Array de conceitos do lado direito  
  correct_connections JSONB NOT NULL, -- Mapeamento das conexões corretas
  explanation TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.concept_connection_questions ENABLE ROW LEVEL SECURITY;

-- Política para visualização pública das questões ativas
CREATE POLICY "Active concept questions are viewable by everyone"
ON public.concept_connection_questions
FOR SELECT
USING (is_active = true);

-- Adicionar índices para performance
CREATE INDEX idx_concept_questions_theme ON public.concept_connection_questions(theme);
CREATE INDEX idx_concept_questions_difficulty ON public.concept_connection_questions(difficulty);

-- Inserir dados iniciais para o tema "basic_finance"
INSERT INTO public.concept_connection_questions (theme, difficulty, left_concepts, right_concepts, correct_connections, explanation) VALUES

-- Nível Básico (1-5)
('basic_finance', 'basic', 
 '["Inflação", "Juros", "Poupança", "Investimento", "Dívida", "Orçamento"]',
 '["Aumento geral dos preços", "Taxa cobrada por empréstimo", "Reserva de dinheiro", "Aplicação para obter lucro", "Valor devido a terceiros", "Planejamento financeiro"]',
 '{"Inflação": "Aumento geral dos preços", "Juros": "Taxa cobrada por empréstimo", "Poupança": "Reserva de dinheiro", "Investimento": "Aplicação para obter lucro", "Dívida": "Valor devido a terceiros", "Orçamento": "Planejamento financeiro"}',
 'Conceitos fundamentais da educação financeira básica'),

('basic_finance', 'basic',
 '["Cartão de Crédito", "Conta Corrente", "PIX", "Empréstimo", "Financiamento", "Cheque"]',
 '["Pagamento instantâneo", "Conta bancária básica", "Crédito rotativo", "Empréstimo específico", "Dinheiro emprestado", "Ordem de pagamento"]',
 '{"PIX": "Pagamento instantâneo", "Conta Corrente": "Conta bancária básica", "Cartão de Crédito": "Crédito rotativo", "Financiamento": "Empréstimo específico", "Empréstimo": "Dinheiro emprestado", "Cheque": "Ordem de pagamento"}',
 'Produtos e serviços bancários essenciais'),

-- Nível Intermediário (6-15)  
('basic_finance', 'intermediate',
 '["CDB", "Tesouro Direto", "LCI/LCA", "Fundos de Investimento", "Ações", "FGTS"]',
 '["Títulos públicos", "Depósito bancário", "Papéis de empresas", "Gestão profissional", "Isenção de IR", "Fundo trabalhista"]',
 '{"Tesouro Direto": "Títulos públicos", "CDB": "Depósito bancário", "Ações": "Papéis de empresas", "Fundos de Investimento": "Gestão profissional", "LCI/LCA": "Isenção de IR", "FGTS": "Fundo trabalhista"}',
 'Produtos de investimento intermediários'),

('basic_finance', 'intermediate',
 '["CDI", "IPCA", "Selic", "IGP-M", "Taxa DI", "Spread"]',
 '["Índice de inflação", "Taxa básica de juros", "Diferença de taxas", "Índice interbancário", "Índice geral de preços", "Taxa de depósitos"]',
 '{"IPCA": "Índice de inflação", "Selic": "Taxa básica de juros", "Spread": "Diferença de taxas", "CDI": "Índice interbancário", "IGP-M": "Índice geral de preços", "Taxa DI": "Taxa de depósitos"}',
 'Principais indicadores econômicos'),

-- Nível Avançado (16-25)
('basic_finance', 'advanced',
 '["Diversificação", "Hedge", "Alavancagem", "Volatilidade", "Beta", "Sharpe"]',
 '["Proteção contra risco", "Indicador de risco/retorno", "Variação de preços", "Risco comparativo", "Uso de capital terceiros", "Distribuir investimentos"]',
 '{"Hedge": "Proteção contra risco", "Sharpe": "Indicador de risco/retorno", "Volatilidade": "Variação de preços", "Beta": "Risco comparativo", "Alavancagem": "Uso de capital terceiros", "Diversificação": "Distribuir investimentos"}',
 'Conceitos avançados de gestão de risco'),

('basic_finance', 'advanced',
 '["Duration", "Convexidade", "Yield", "Credit Spread", "VaR", "Stress Test"]',
 '["Sensibilidade a juros", "Curvatura do preço", "Rendimento do ativo", "Risco de crédito", "Perda máxima", "Teste de cenário"]',
 '{"Duration": "Sensibilidade a juros", "Convexidade": "Curvatura do preço", "Yield": "Rendimento do ativo", "Credit Spread": "Risco de crédito", "VaR": "Perda máxima", "Stress Test": "Teste de cenário"}',
 'Métricas avançadas de renda fixa');

-- Adicionar trigger para updated_at
CREATE TRIGGER update_concept_questions_updated_at
BEFORE UPDATE ON public.concept_connection_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela para histórico de sessões de conexão
CREATE TABLE public.concept_connection_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question_id UUID NOT NULL REFERENCES public.concept_connection_questions(id),
  connections_made JSONB NOT NULL DEFAULT '{}',
  correct_connections INTEGER NOT NULL DEFAULT 0,
  total_connections INTEGER NOT NULL DEFAULT 0,
  time_seconds INTEGER NOT NULL DEFAULT 0,
  btz_earned NUMERIC NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.concept_connection_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas para sessões de conexão
CREATE POLICY "Users can create their own connection sessions"
ON public.concept_connection_sessions
FOR INSERT
WITH CHECK (user_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can view their own connection sessions"
ON public.concept_connection_sessions
FOR SELECT
USING (user_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));

-- Índices para performance
CREATE INDEX idx_connection_sessions_user ON public.concept_connection_sessions(user_id);
CREATE INDEX idx_connection_sessions_question ON public.concept_connection_sessions(question_id);