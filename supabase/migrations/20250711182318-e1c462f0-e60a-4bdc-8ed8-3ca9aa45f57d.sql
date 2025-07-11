-- Remove non-finance related technology questions
DELETE FROM quiz_questions WHERE category = 'technology';