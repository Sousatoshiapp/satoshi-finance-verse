-- Fase 1: Limpeza das duplicatas existentes (versão corrigida)

-- Função simplificada para limpar duplicatas
CREATE OR REPLACE FUNCTION clean_duplicate_questions() 
RETURNS INTEGER AS $$
DECLARE
    total_deleted INTEGER := 0;
BEGIN
    -- Deletar duplicatas mantendo apenas a mais recente por pergunta
    WITH duplicates AS (
        SELECT 
            id,
            ROW_NUMBER() OVER (PARTITION BY question ORDER BY created_at DESC) as rn
        FROM quiz_questions
    )
    DELETE FROM quiz_questions 
    WHERE id IN (
        SELECT id FROM duplicates WHERE rn > 1
    );
    
    GET DIAGNOSTICS total_deleted = ROW_COUNT;
    
    RETURN total_deleted;
END;
$$ LANGUAGE plpgsql;

-- Normalizar temas inconsistentes
UPDATE quiz_questions SET theme = 'credit_cards' 
WHERE theme LIKE '%cartão%' OR theme LIKE '%crédito%';

UPDATE quiz_questions SET theme = 'investments' 
WHERE theme LIKE '%investimento%' OR theme LIKE '%aplicação%';

UPDATE quiz_questions SET theme = 'economics' 
WHERE theme LIKE '%economia%' OR theme LIKE '%inflação%';

UPDATE quiz_questions SET theme = 'portfolio' 
WHERE theme LIKE '%portfólio%' OR theme LIKE '%carteira%';

UPDATE quiz_questions SET theme = 'trading' 
WHERE theme LIKE '%trading%' OR theme LIKE '%negociação%';

-- Executar limpeza das duplicatas
SELECT clean_duplicate_questions();

-- Função para verificar similaridade usando extensão fuzzystrmatch
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;

-- Função para verificar similaridade de perguntas
CREATE OR REPLACE FUNCTION calculate_question_similarity(text1 TEXT, text2 TEXT)
RETURNS FLOAT AS $$
DECLARE
    clean_text1 TEXT := lower(trim(text1));
    clean_text2 TEXT := lower(trim(text2));
    distance INTEGER;
    max_len INTEGER;
    similarity FLOAT;
BEGIN
    -- Calcular distância e similaridade
    distance := levenshtein(clean_text1, clean_text2);
    max_len := GREATEST(length(clean_text1), length(clean_text2));
    
    IF max_len = 0 THEN
        RETURN 1.0;
    END IF;
    
    similarity := 1.0 - (distance::FLOAT / max_len::FLOAT);
    RETURN similarity;
END;
$$ LANGUAGE plpgsql;

-- Função para detectar perguntas similares
CREATE OR REPLACE FUNCTION find_similar_questions(new_question TEXT, similarity_threshold FLOAT DEFAULT 0.8)
RETURNS TABLE(id UUID, question TEXT, similarity FLOAT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.id,
        q.question,
        calculate_question_similarity(new_question, q.question) as sim
    FROM quiz_questions q
    WHERE calculate_question_similarity(new_question, q.question) >= similarity_threshold
    ORDER BY sim DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Tabela para cache de hashes de perguntas
CREATE TABLE IF NOT EXISTS question_hashes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
    question_hash TEXT NOT NULL,
    theme TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(question_hash, theme, difficulty)
);

CREATE INDEX IF NOT EXISTS idx_question_hashes_lookup 
ON question_hashes (question_hash, theme, difficulty);

-- Trigger para manter hashes sincronizados
CREATE OR REPLACE FUNCTION update_question_hash()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO question_hashes (question_id, question_hash, theme, difficulty)
        VALUES (NEW.id, md5(lower(trim(NEW.question))), COALESCE(NEW.theme, 'general'), NEW.difficulty)
        ON CONFLICT (question_hash, theme, difficulty) DO NOTHING;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        DELETE FROM question_hashes WHERE question_id = NEW.id;
        INSERT INTO question_hashes (question_id, question_hash, theme, difficulty)
        VALUES (NEW.id, md5(lower(trim(NEW.question))), COALESCE(NEW.theme, 'general'), NEW.difficulty)
        ON CONFLICT (question_hash, theme, difficulty) DO NOTHING;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM question_hashes WHERE question_id = OLD.id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_question_hash_sync
    AFTER INSERT OR UPDATE OR DELETE ON quiz_questions
    FOR EACH ROW EXECUTE FUNCTION update_question_hash();

-- Popular tabela de hashes para perguntas existentes
INSERT INTO question_hashes (question_id, question_hash, theme, difficulty)
SELECT id, md5(lower(trim(question))), COALESCE(theme, 'general'), difficulty
FROM quiz_questions
ON CONFLICT (question_hash, theme, difficulty) DO NOTHING;