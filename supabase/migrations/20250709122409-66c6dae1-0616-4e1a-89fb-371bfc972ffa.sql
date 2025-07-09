-- ===================================================================
-- FASE 1: ESTRUTURA EDUCACIONAL CONSOLIDADA
-- ===================================================================

-- 1. Aprimorar tabela de questões com feedback específico
ALTER TABLE public.quiz_questions 
ADD COLUMN IF NOT EXISTS feedback_wrong_answers JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 10),
ADD COLUMN IF NOT EXISTS learning_objectives TEXT[],
ADD COLUMN IF NOT EXISTS estimated_time_seconds INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'drag_drop', 'scenario')),
ADD COLUMN IF NOT EXISTS cognitive_level TEXT DEFAULT 'knowledge' CHECK (cognitive_level IN ('knowledge', 'comprehension', 'application', 'analysis', 'synthesis', 'evaluation'));

-- 2. Criar tabela de módulos de aprendizado
CREATE TABLE IF NOT EXISTS public.learning_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    learning_objectives TEXT[],
    prerequisite_modules UUID[] DEFAULT '{}',
    estimated_duration_minutes INTEGER DEFAULT 60,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 10),
    module_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    sponsor_company TEXT,
    banner_image_url TEXT,
    icon TEXT DEFAULT '📚',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Associar questões aos módulos
ALTER TABLE public.quiz_questions 
ADD COLUMN IF NOT EXISTS learning_module_id UUID REFERENCES public.learning_modules(id);

-- 4. Criar tabela de progresso em módulos
CREATE TABLE IF NOT EXISTS public.user_module_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    module_id UUID NOT NULL REFERENCES public.learning_modules(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    current_lesson INTEGER DEFAULT 1,
    total_lessons INTEGER DEFAULT 1,
    mastery_score NUMERIC(3,2) DEFAULT 0.0 CHECK (mastery_score BETWEEN 0.0 AND 1.0),
    time_spent_minutes INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, module_id)
);

-- 5. Melhorar tabela de progresso do usuário (SRS)
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS concept_mastery NUMERIC(3,2) DEFAULT 0.0 CHECK (concept_mastery BETWEEN 0.0 AND 1.0),
ADD COLUMN IF NOT EXISTS learning_velocity NUMERIC(3,2) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS last_response_time_ms INTEGER,
ADD COLUMN IF NOT EXISTS consecutive_correct INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS learning_module_id UUID REFERENCES public.learning_modules(id),
ADD COLUMN IF NOT EXISTS difficulty_preference INTEGER DEFAULT 1 CHECK (difficulty_preference BETWEEN 1 AND 10);

-- 6. Criar tabela de conceitos educacionais
CREATE TABLE IF NOT EXISTS public.educational_concepts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_concept_id UUID REFERENCES public.educational_concepts(id),
    learning_module_id UUID REFERENCES public.learning_modules(id),
    fundamental_level INTEGER DEFAULT 1 CHECK (fundamental_level BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Associar questões aos conceitos
CREATE TABLE IF NOT EXISTS public.question_concepts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    concept_id UUID NOT NULL REFERENCES public.educational_concepts(id) ON DELETE CASCADE,
    relevance_weight NUMERIC(3,2) DEFAULT 1.0 CHECK (relevance_weight BETWEEN 0.0 AND 1.0),
    UNIQUE(question_id, concept_id)
);

-- 8. Criar tabela de mastery de conceitos por usuário
CREATE TABLE IF NOT EXISTS public.user_concept_mastery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    concept_id UUID NOT NULL REFERENCES public.educational_concepts(id),
    mastery_level NUMERIC(3,2) DEFAULT 0.0 CHECK (mastery_level BETWEEN 0.0 AND 1.0),
    total_exposures INTEGER DEFAULT 0,
    correct_responses INTEGER DEFAULT 0,
    last_reviewed TIMESTAMP WITH TIME ZONE DEFAULT now(),
    next_review TIMESTAMP WITH TIME ZONE DEFAULT now(),
    learning_strength NUMERIC(3,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, concept_id)
);

-- 9. Criar tabela de upload de planilhas
CREATE TABLE IF NOT EXISTS public.question_imports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    uploaded_by UUID NOT NULL,
    file_name TEXT NOT NULL,
    total_questions INTEGER DEFAULT 0,
    successful_imports INTEGER DEFAULT 0,
    failed_imports INTEGER DEFAULT 0,
    status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed', 'validated')),
    validation_errors JSONB DEFAULT '[]',
    learning_module_id UUID REFERENCES public.learning_modules(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- 10. Função melhorada para atualizar SRS com conceitos
CREATE OR REPLACE FUNCTION public.update_srs_with_concepts(
    p_user_id UUID,
    p_question_id UUID,
    p_is_correct BOOLEAN,
    p_response_time_ms INTEGER DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    concept_record RECORD;
    mastery_update JSONB DEFAULT '{}';
    total_concepts INTEGER := 0;
    improved_concepts INTEGER := 0;
BEGIN
    -- Atualizar mastery dos conceitos relacionados à questão
    FOR concept_record IN 
        SELECT c.id, c.name, qc.relevance_weight, ucm.mastery_level, ucm.total_exposures, ucm.correct_responses
        FROM public.question_concepts qc
        JOIN public.educational_concepts c ON qc.concept_id = c.id
        LEFT JOIN public.user_concept_mastery ucm ON ucm.concept_id = c.id AND ucm.user_id = p_user_id
        WHERE qc.question_id = p_question_id
    LOOP
        total_concepts := total_concepts + 1;
        
        -- Upsert concept mastery
        INSERT INTO public.user_concept_mastery (user_id, concept_id, total_exposures, correct_responses, mastery_level, last_reviewed)
        VALUES (
            p_user_id, 
            concept_record.id, 
            1, 
            CASE WHEN p_is_correct THEN 1 ELSE 0 END,
            CASE WHEN p_is_correct THEN 0.1 * concept_record.relevance_weight ELSE 0.0 END,
            now()
        )
        ON CONFLICT (user_id, concept_id) DO UPDATE SET
            total_exposures = user_concept_mastery.total_exposures + 1,
            correct_responses = user_concept_mastery.correct_responses + CASE WHEN p_is_correct THEN 1 ELSE 0 END,
            mastery_level = LEAST(1.0, user_concept_mastery.mastery_level + 
                CASE 
                    WHEN p_is_correct THEN 0.05 * concept_record.relevance_weight
                    ELSE -0.02 * concept_record.relevance_weight
                END
            ),
            last_reviewed = now(),
            updated_at = now();
            
        IF p_is_correct THEN
            improved_concepts := improved_concepts + 1;
        END IF;
    END LOOP;
    
    -- Atualizar user_progress existente
    UPDATE public.user_progress 
    SET 
        last_response_time_ms = p_response_time_ms,
        consecutive_correct = CASE 
            WHEN p_is_correct THEN consecutive_correct + 1 
            ELSE 0 
        END,
        concept_mastery = (
            SELECT AVG(mastery_level) 
            FROM public.user_concept_mastery 
            WHERE user_id = p_user_id
        )
    WHERE user_id = p_user_id AND question_id = p_question_id;
    
    RETURN jsonb_build_object(
        'concepts_updated', total_concepts,
        'concepts_improved', improved_concepts,
        'overall_mastery', (
            SELECT AVG(mastery_level) 
            FROM public.user_concept_mastery 
            WHERE user_id = p_user_id
        )
    );
END;
$$;

-- 11. RLS Policies
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_concept_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_imports ENABLE ROW LEVEL SECURITY;

-- Learning modules são visíveis para todos
CREATE POLICY "Learning modules are viewable by everyone" ON public.learning_modules
    FOR SELECT USING (is_active = true);

-- Usuários podem ver e atualizar seu próprio progresso
CREATE POLICY "Users can view their own module progress" ON public.user_module_progress
    FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own module progress" ON public.user_module_progress
    FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own module progress" ON public.user_module_progress
    FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Conceitos educacionais são visíveis para todos
CREATE POLICY "Educational concepts are viewable by everyone" ON public.educational_concepts
    FOR SELECT USING (true);

-- Question concepts são visíveis para todos
CREATE POLICY "Question concepts are viewable by everyone" ON public.question_concepts
    FOR SELECT USING (true);

-- Usuários podem ver e atualizar seu próprio mastery
CREATE POLICY "Users can view their own concept mastery" ON public.user_concept_mastery
    FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own concept mastery" ON public.user_concept_mastery
    FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own concept mastery" ON public.user_concept_mastery
    FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Admins podem gerenciar imports
CREATE POLICY "Admins can manage question imports" ON public.question_imports
    FOR ALL USING (
        uploaded_by IN (
            SELECT profiles.id FROM profiles 
            JOIN admin_users ON profiles.user_id = admin_users.user_id 
            WHERE admin_users.is_active = true
        )
    );

-- 12. Triggers para atualizar timestamps
CREATE TRIGGER update_learning_modules_updated_at
    BEFORE UPDATE ON public.learning_modules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_concept_mastery_updated_at
    BEFORE UPDATE ON public.user_concept_mastery
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 13. Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_module_progress_user_id ON public.user_module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_module_progress_module_id ON public.user_module_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_user_concept_mastery_user_id ON public.user_concept_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_user_concept_mastery_concept_id ON public.user_concept_mastery(concept_id);
CREATE INDEX IF NOT EXISTS idx_question_concepts_question_id ON public.question_concepts(question_id);
CREATE INDEX IF NOT EXISTS idx_question_concepts_concept_id ON public.question_concepts(concept_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_module_id ON public.quiz_questions(learning_module_id);

-- 14. Inserir dados iniciais de módulos
INSERT INTO public.learning_modules (name, description, learning_objectives, difficulty_level, module_order, sponsor_company, icon) VALUES
('Fundamentos Financeiros', 'Conceitos básicos de educação financeira', ARRAY['Entender o valor do dinheiro', 'Conceitos de juros', 'Inflação básica'], 1, 1, NULL, '💰'),
('Investimentos Básicos', 'Introdução ao mundo dos investimentos', ARRAY['Tipos de investimentos', 'Risco x Retorno', 'Diversificação'], 2, 2, 'XP Investimentos', '📈'),
('Planejamento Financeiro', 'Como organizar suas finanças pessoais', ARRAY['Orçamento pessoal', 'Reserva de emergência', 'Objetivos financeiros'], 2, 3, NULL, '📊'),
('Renda Variável', 'Ações e fundos de investimento', ARRAY['Mercado de ações', 'Análise fundamentalista', 'Análise técnica'], 4, 4, 'XP Investimentos', '🏦'),
('Criptomoedas', 'Introdução ao mundo cripto', ARRAY['Bitcoin e blockchain', 'Carteiras digitais', 'Riscos e oportunidades'], 3, 5, NULL, '₿');

-- 15. Inserir conceitos educacionais
INSERT INTO public.educational_concepts (name, description, learning_module_id, fundamental_level) VALUES
('Valor do Dinheiro no Tempo', 'Conceito de que o dinheiro tem valores diferentes em momentos diferentes', (SELECT id FROM learning_modules WHERE name = 'Fundamentos Financeiros'), 5),
('Juros Compostos', 'Sistema de juros sobre juros', (SELECT id FROM learning_modules WHERE name = 'Fundamentos Financeiros'), 5),
('Inflação', 'Aumento geral dos preços na economia', (SELECT id FROM learning_modules WHERE name = 'Fundamentos Financeiros'), 4),
('Diversificação', 'Estratégia de redução de riscos', (SELECT id FROM learning_modules WHERE name = 'Investimentos Básicos'), 4),
('Risco x Retorno', 'Relação entre risco assumido e retorno esperado', (SELECT id FROM learning_modules WHERE name = 'Investimentos Básicos'), 5);

-- 16. Função para atualizar progresso do módulo
CREATE OR REPLACE FUNCTION public.update_module_progress(
    p_user_id UUID,
    p_module_id UUID,
    p_lesson_completed BOOLEAN DEFAULT false
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    module_concepts_count INTEGER;
    user_mastery_avg NUMERIC;
BEGIN
    -- Contar conceitos do módulo
    SELECT COUNT(*) INTO module_concepts_count
    FROM public.educational_concepts
    WHERE learning_module_id = p_module_id;
    
    -- Calcular mastery médio do usuário nos conceitos do módulo
    SELECT COALESCE(AVG(ucm.mastery_level), 0.0) INTO user_mastery_avg
    FROM public.user_concept_mastery ucm
    JOIN public.educational_concepts ec ON ucm.concept_id = ec.id
    WHERE ucm.user_id = p_user_id AND ec.learning_module_id = p_module_id;
    
    -- Upsert progresso do módulo
    INSERT INTO public.user_module_progress (user_id, module_id, mastery_score, last_accessed)
    VALUES (p_user_id, p_module_id, user_mastery_avg, now())
    ON CONFLICT (user_id, module_id) DO UPDATE SET
        mastery_score = user_mastery_avg,
        is_completed = CASE WHEN user_mastery_avg >= 0.8 THEN true ELSE false END,
        completed_at = CASE WHEN user_mastery_avg >= 0.8 AND user_module_progress.completed_at IS NULL THEN now() ELSE user_module_progress.completed_at END,
        last_accessed = now();
END;
$$;