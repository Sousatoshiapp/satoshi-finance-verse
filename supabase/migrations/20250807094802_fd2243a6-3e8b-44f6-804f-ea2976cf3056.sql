-- Fase 1: Limpeza das duplicatas existentes

-- Função para limpar duplicatas mantendo a pergunta mais recente
CREATE OR REPLACE FUNCTION clean_duplicate_questions() 
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    duplicate_record RECORD;
BEGIN
    -- Identificar e remover duplicatas mantendo apenas a mais recente
    FOR duplicate_record IN 
        WITH duplicates AS (
            SELECT 
                question,
                COUNT(*) as count,
                MIN(id) as oldest_id,
                MAX(id) as newest_id
            FROM quiz_questions 
            GROUP BY question 
            HAVING COUNT(*) > 1
        )
        SELECT oldest_id, newest_id, question, count
        FROM duplicates
    LOOP
        -- Deletar todas as versões exceto a mais recente
        DELETE FROM quiz_questions 
        WHERE question = duplicate_record.question 
        AND id != duplicate_record.newest_id;
        
        GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
        
        RAISE NOTICE 'Removidas % duplicatas da pergunta: %', 
            (duplicate_record.count - 1), duplicate_record.question;
    END LOOP;
    
    RETURN deleted_count;
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

-- Criar índice único para prevenir duplicatas futuras
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_questions_unique_question 
ON quiz_questions USING btree (md5(lower(trim(question))));

-- Adicionar função para verificar similaridade de perguntas
CREATE OR REPLACE FUNCTION calculate_question_similarity(text1 TEXT, text2 TEXT)
RETURNS FLOAT AS $$
DECLARE
    len1 INTEGER := length(text1);
    len2 INTEGER := length(text2);
    distance INTEGER;
    similarity FLOAT;
BEGIN
    -- Usar similaridade baseada em Levenshtein distance
    distance := levenshtein(lower(trim(text1)), lower(trim(text2)));
    
    -- Calcular similaridade como percentual
    IF len1 = 0 AND len2 = 0 THEN
        RETURN 1.0;
    END IF;
    
    similarity := 1.0 - (distance::FLOAT / GREATEST(len1, len2)::FLOAT);
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
    ORDER BY sim DESC;
END;
$$ LANGUAGE plpgsql;

-- Tabela para cache de hashes de perguntas (otimização)
CREATE TABLE IF NOT EXISTS question_hashes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
    question_hash TEXT NOT NULL,
    theme TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_question_hashes_lookup 
ON question_hashes (question_hash, theme, difficulty);

-- Trigger para manter hashes sincronizados
CREATE OR REPLACE FUNCTION update_question_hash()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO question_hashes (question_id, question_hash, theme, difficulty)
        VALUES (NEW.id, md5(lower(trim(NEW.question))), NEW.theme, NEW.difficulty);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE question_hashes 
        SET question_hash = md5(lower(trim(NEW.question))),
            theme = NEW.theme,
            difficulty = NEW.difficulty
        WHERE question_id = NEW.id;
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
SELECT id, md5(lower(trim(question))), theme, difficulty
FROM quiz_questions
ON CONFLICT DO NOTHING;