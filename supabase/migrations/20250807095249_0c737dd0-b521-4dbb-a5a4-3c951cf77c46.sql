-- Adicionar coluna approval_status à tabela quiz_questions
ALTER TABLE quiz_questions 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';

-- Adicionar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_quiz_questions_approval_status 
ON quiz_questions (approval_status);

-- Criar tipo enum para status de aprovação
DO $$ BEGIN
  CREATE TYPE approval_status_type AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Alterar coluna para usar o enum (opcional, pode manter como text)
-- ALTER TABLE quiz_questions ALTER COLUMN approval_status TYPE approval_status_type USING approval_status::approval_status_type;