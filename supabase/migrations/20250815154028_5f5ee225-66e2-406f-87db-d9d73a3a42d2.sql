-- Add approval fields to questions table
ALTER TABLE public.questions 
ADD COLUMN is_approved boolean DEFAULT false,
ADD COLUMN approved_at timestamp with time zone,
ADD COLUMN approved_by uuid REFERENCES auth.users(id);

-- Create index for better performance on approved questions
CREATE INDEX idx_questions_approved ON public.questions(is_approved, is_active);

-- Update existing active questions to be considered as pending approval
UPDATE public.questions 
SET is_approved = false 
WHERE is_active = true;