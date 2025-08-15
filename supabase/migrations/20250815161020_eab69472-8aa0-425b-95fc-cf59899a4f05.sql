-- Add RLS policies for quiz_questions table to allow question management

-- Allow authenticated users to update quiz questions (for approval functionality)
CREATE POLICY "Authenticated users can update quiz questions" 
ON public.quiz_questions 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to insert quiz questions
CREATE POLICY "Authenticated users can insert quiz questions" 
ON public.quiz_questions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to delete quiz questions
CREATE POLICY "Authenticated users can delete quiz questions" 
ON public.quiz_questions 
FOR DELETE 
USING (auth.uid() IS NOT NULL);