-- Fase 2: Gamificação Avançada
CREATE TABLE public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    achievement_id UUID REFERENCES public.achievements(id),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    progress_data JSONB DEFAULT '{}',
    UNIQUE(user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE TABLE public.learning_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    module_id UUID REFERENCES public.learning_modules(id),
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity DATE DEFAULT CURRENT_DATE,
    streak_type TEXT DEFAULT 'daily', -- daily, weekly, monthly
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE TABLE public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    badge_name TEXT NOT NULL,
    badge_type TEXT NOT NULL,
    badge_description TEXT,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    badge_data JSONB DEFAULT '{}',
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Fase 3: Personalização por IA
CREATE TABLE public.learning_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    analytics_date DATE DEFAULT CURRENT_DATE,
    total_study_time_minutes INTEGER DEFAULT 0,
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    concepts_mastered INTEGER DEFAULT 0,
    difficulty_preference TEXT DEFAULT 'medium',
    learning_velocity NUMERIC(3,2) DEFAULT 1.0,
    attention_span_minutes INTEGER DEFAULT 15,
    preferred_session_length INTEGER DEFAULT 20,
    optimal_time_of_day TEXT DEFAULT 'evening',
    learning_style_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, analytics_date),
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE TABLE public.ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    recommendation_type TEXT NOT NULL, -- 'module', 'concept', 'difficulty', 'timing'
    recommendation_data JSONB NOT NULL,
    confidence_score NUMERIC(3,2) DEFAULT 0.5,
    applied BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Adicionar colunas para personalização nas tabelas existentes
ALTER TABLE public.user_module_progress 
ADD COLUMN IF NOT EXISTS difficulty_preference TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS adaptive_next_lesson INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS personalized_path JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS time_spent_minutes INTEGER DEFAULT 0;

-- RLS Policies
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Políticas para user_achievements
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
    FOR SELECT USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Políticas para learning_streaks
CREATE POLICY "Users can manage their own streaks" ON public.learning_streaks
    FOR ALL USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Políticas para user_badges
CREATE POLICY "Users can view their own badges" ON public.user_badges
    FOR SELECT USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own badges" ON public.user_badges
    FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Políticas para learning_analytics
CREATE POLICY "Users can manage their own analytics" ON public.learning_analytics
    FOR ALL USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Políticas para ai_recommendations
CREATE POLICY "Users can view their own recommendations" ON public.ai_recommendations
    FOR SELECT USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can create recommendations" ON public.ai_recommendations
    FOR INSERT WITH CHECK (true);

-- Funções para gamificação
CREATE OR REPLACE FUNCTION public.update_learning_streak(p_user_id UUID, p_module_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    streak_record RECORD;
    new_streak INTEGER;
    streak_broken BOOLEAN := false;
    result JSONB;
BEGIN
    -- Buscar streak atual
    SELECT * INTO streak_record 
    FROM public.learning_streaks 
    WHERE user_id = p_user_id 
    AND (module_id = p_module_id OR p_module_id IS NULL)
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Se não existe, criar novo
    IF streak_record IS NULL THEN
        INSERT INTO public.learning_streaks (user_id, module_id, current_streak, longest_streak, last_activity)
        VALUES (p_user_id, p_module_id, 1, 1, CURRENT_DATE)
        RETURNING current_streak, longest_streak INTO new_streak, new_streak;
    ELSE
        -- Verificar se atividade foi ontem ou hoje
        IF streak_record.last_activity = CURRENT_DATE THEN
            -- Já estudou hoje, manter streak
            new_streak := streak_record.current_streak;
        ELSIF streak_record.last_activity = CURRENT_DATE - INTERVAL '1 day' THEN
            -- Estudou ontem, incrementar streak
            new_streak := streak_record.current_streak + 1;
            
            UPDATE public.learning_streaks 
            SET current_streak = new_streak,
                longest_streak = GREATEST(longest_streak, new_streak),
                last_activity = CURRENT_DATE,
                updated_at = now()
            WHERE id = streak_record.id;
        ELSE
            -- Streak quebrado, começar novo
            new_streak := 1;
            streak_broken := true;
            
            UPDATE public.learning_streaks 
            SET current_streak = 1,
                last_activity = CURRENT_DATE,
                updated_at = now()
            WHERE id = streak_record.id;
        END IF;
    END IF;
    
    -- Verificar conquistas de streak
    IF new_streak IN (3, 7, 14, 30, 100) THEN
        INSERT INTO public.user_badges (user_id, badge_name, badge_type, badge_description, badge_data)
        VALUES (
            p_user_id,
            'streak_' || new_streak,
            'streak',
            'Manteve uma sequência de ' || new_streak || ' dias de estudo',
            jsonb_build_object('streak_days', new_streak, 'module_id', p_module_id)
        ) ON CONFLICT DO NOTHING;
    END IF;
    
    result := jsonb_build_object(
        'current_streak', new_streak,
        'streak_broken', streak_broken,
        'achievement_unlocked', new_streak IN (3, 7, 14, 30, 100)
    );
    
    RETURN result;
END;
$$;

-- Função para análise de aprendizado
CREATE OR REPLACE FUNCTION public.update_learning_analytics(p_user_id UUID, p_study_time INTEGER, p_questions_attempted INTEGER, p_questions_correct INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    analytics_record RECORD;
    performance_ratio NUMERIC;
    learning_velocity NUMERIC;
BEGIN
    -- Calcular métricas
    performance_ratio := CASE 
        WHEN p_questions_attempted > 0 THEN p_questions_correct::NUMERIC / p_questions_attempted::NUMERIC
        ELSE 0
    END;
    
    learning_velocity := CASE
        WHEN p_study_time > 0 THEN p_questions_correct::NUMERIC / (p_study_time::NUMERIC / 60.0)
        ELSE 0
    END;
    
    -- Upsert analytics diárias
    INSERT INTO public.learning_analytics (
        user_id, 
        analytics_date,
        total_study_time_minutes,
        questions_attempted,
        questions_correct,
        learning_velocity
    )
    VALUES (
        p_user_id,
        CURRENT_DATE,
        p_study_time,
        p_questions_attempted,
        p_questions_correct,
        learning_velocity
    )
    ON CONFLICT (user_id, analytics_date) DO UPDATE SET
        total_study_time_minutes = learning_analytics.total_study_time_minutes + p_study_time,
        questions_attempted = learning_analytics.questions_attempted + p_questions_attempted,
        questions_correct = learning_analytics.questions_correct + p_questions_correct,
        learning_velocity = CASE 
            WHEN (learning_analytics.total_study_time_minutes + p_study_time) > 0 
            THEN (learning_analytics.questions_correct + p_questions_correct)::NUMERIC / 
                 ((learning_analytics.total_study_time_minutes + p_study_time)::NUMERIC / 60.0)
            ELSE 0
        END;
    
    RETURN jsonb_build_object(
        'performance_ratio', performance_ratio,
        'learning_velocity', learning_velocity,
        'total_study_time', p_study_time
    );
END;
$$;

-- Função para recomendações de IA
CREATE OR REPLACE FUNCTION public.generate_ai_recommendations(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_analytics RECORD;
    weak_concepts TEXT[];
    recommended_modules UUID[];
    recommendations JSONB := '[]';
BEGIN
    -- Buscar analytics do usuário
    SELECT * INTO user_analytics
    FROM public.learning_analytics
    WHERE user_id = p_user_id
    ORDER BY analytics_date DESC
    LIMIT 1;
    
    -- Identificar conceitos fracos (mastery < 0.6)
    SELECT ARRAY_AGG(ec.name) INTO weak_concepts
    FROM public.user_concept_mastery ucm
    JOIN public.educational_concepts ec ON ucm.concept_id = ec.id
    WHERE ucm.user_id = p_user_id 
    AND ucm.mastery_level < 0.6
    LIMIT 5;
    
    -- Recomendar módulos baseado em conceitos fracos
    IF array_length(weak_concepts, 1) > 0 THEN
        INSERT INTO public.ai_recommendations (user_id, recommendation_type, recommendation_data, confidence_score)
        VALUES (
            p_user_id,
            'concept_focus',
            jsonb_build_object(
                'weak_concepts', weak_concepts,
                'suggestion', 'Focar nestes conceitos para melhorar o desempenho',
                'priority', 'high'
            ),
            0.8
        );
        
        recommendations := recommendations || jsonb_build_object(
            'type', 'concept_focus',
            'concepts', weak_concepts
        );
    END IF;
    
    -- Recomendação de dificuldade baseada em performance
    IF user_analytics.questions_attempted > 0 THEN
        DECLARE
            performance_ratio NUMERIC := user_analytics.questions_correct::NUMERIC / user_analytics.questions_attempted::NUMERIC;
            recommended_difficulty TEXT;
        BEGIN
            recommended_difficulty := CASE
                WHEN performance_ratio > 0.9 THEN 'hard'
                WHEN performance_ratio > 0.7 THEN 'medium'
                ELSE 'easy'
            END;
            
            INSERT INTO public.ai_recommendations (user_id, recommendation_type, recommendation_data, confidence_score)
            VALUES (
                p_user_id,
                'difficulty_adjustment',
                jsonb_build_object(
                    'recommended_difficulty', recommended_difficulty,
                    'current_performance', performance_ratio,
                    'reasoning', 'Baseado na performance recente'
                ),
                0.7
            );
            
            recommendations := recommendations || jsonb_build_object(
                'type', 'difficulty_adjustment',
                'difficulty', recommended_difficulty,
                'performance', performance_ratio
            );
        END;
    END IF;
    
    RETURN recommendations;
END;
$$;

-- Triggers para automação
CREATE OR REPLACE FUNCTION public.auto_update_streaks_and_analytics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Atualizar streak quando completar questão
    IF NEW.is_correct = true THEN
        PERFORM public.update_learning_streak(NEW.user_id);
    END IF;
    
    -- Atualizar analytics
    PERFORM public.update_learning_analytics(
        NEW.user_id,
        COALESCE(NEW.response_time / 1000, 30), -- tempo estimado em segundos se não informado
        1, -- uma questão tentada
        CASE WHEN NEW.is_correct THEN 1 ELSE 0 END -- questões corretas
    );
    
    RETURN NEW;
END;
$$;

-- Aplicar trigger na tabela user_question_progress
CREATE TRIGGER trigger_update_streaks_analytics
    AFTER INSERT ON public.user_question_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_update_streaks_and_analytics();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_streaks_user_module ON public.learning_streaks(user_id, module_id);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_user_date ON public.learning_analytics(user_id, analytics_date);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_type ON public.ai_recommendations(user_id, recommendation_type);

-- Inserir alguns achievements padrão
INSERT INTO public.achievements (name, description, type, requirement_data, reward_data, rarity) VALUES
('first_steps', 'Complete seu primeiro quiz', 'quiz', '{"quizzes_completed": 1}', '{"xp": 100, "beetz": 50}', 'common'),
('speed_demon', 'Responda 10 questões em menos de 30 segundos cada', 'speed', '{"fast_answers": 10, "max_time": 30}', '{"xp": 250, "beetz": 150}', 'uncommon'),
('perfectionist', 'Acerte 20 questões consecutivas', 'accuracy', '{"consecutive_correct": 20}', '{"xp": 500, "beetz": 300}', 'rare'),
('concept_master', 'Domine 10 conceitos diferentes', 'learning', '{"concepts_mastered": 10}', '{"xp": 750, "beetz": 500}', 'epic'),
('streak_warrior', 'Mantenha um streak de 7 dias', 'streak', '{"streak_days": 7}', '{"xp": 300, "beetz": 200}', 'uncommon'),
('dedication', 'Mantenha um streak de 30 dias', 'streak', '{"streak_days": 30}', '{"xp": 1000, "beetz": 750}', 'legendary')
ON CONFLICT (name) DO NOTHING;