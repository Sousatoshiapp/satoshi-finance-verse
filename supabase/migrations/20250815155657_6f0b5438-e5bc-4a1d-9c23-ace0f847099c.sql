-- Add approved_at column to quiz_questions table
ALTER TABLE public.quiz_questions 
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;

-- Fix inconsistent data: questions with approval_status = 'pending' but is_approved = true
UPDATE public.quiz_questions 
SET approval_status = 'approved',
    approved_at = updated_at
WHERE approval_status = 'pending' AND is_approved = true;

-- Set approved_at for existing approved questions that don't have it
UPDATE public.quiz_questions 
SET approved_at = updated_at
WHERE approval_status = 'approved' AND approved_at IS NULL;