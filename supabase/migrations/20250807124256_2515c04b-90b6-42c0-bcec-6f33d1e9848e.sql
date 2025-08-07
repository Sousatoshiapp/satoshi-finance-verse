-- Fix RLS security issue for question_hashes table

-- Enable Row Level Security on question_hashes table
ALTER TABLE public.question_hashes ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for authenticated users to view question hashes
CREATE POLICY "Authenticated users can view question hashes" 
ON public.question_hashes 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create RLS policy for system (service_role) to manage question hashes
CREATE POLICY "System can manage question hashes" 
ON public.question_hashes 
FOR ALL 
USING (auth.role() = 'service_role');

-- Update the trigger function to include SECURITY DEFINER for proper RLS operation
CREATE OR REPLACE FUNCTION public.update_question_hash()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  question_hash TEXT;
BEGIN
  -- Generate hash from question text and options
  question_hash := encode(
    digest(
      NEW.question || array_to_string(NEW.options, '||') || NEW.correct_answer,
      'sha256'
    ),
    'hex'
  );
  
  -- Check if hash already exists
  IF EXISTS (SELECT 1 FROM public.question_hashes WHERE hash = question_hash) THEN
    RAISE EXCEPTION 'Duplicate question detected. Hash: %', question_hash;
  END IF;
  
  -- Insert new hash
  INSERT INTO public.question_hashes (hash, question_id, created_at)
  VALUES (question_hash, NEW.id, now())
  ON CONFLICT (hash) DO NOTHING;
  
  RETURN NEW;
END;
$$;