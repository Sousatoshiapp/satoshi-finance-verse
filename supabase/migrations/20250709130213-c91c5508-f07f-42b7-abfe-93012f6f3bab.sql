-- Create table for user onboarding profiles
CREATE TABLE IF NOT EXISTS public.user_onboarding_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  experience_level TEXT NOT NULL,
  study_goals TEXT[] DEFAULT '{}',
  available_time_minutes INTEGER DEFAULT 30,
  preferred_difficulty TEXT,
  learning_style TEXT,
  motivation_factors TEXT[] DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_onboarding_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own onboarding profile"
ON public.user_onboarding_profiles
FOR SELECT
USING (user_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create their own onboarding profile"
ON public.user_onboarding_profiles
FOR INSERT
WITH CHECK (user_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update their own onboarding profile"
ON public.user_onboarding_profiles
FOR UPDATE
USING (user_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));

-- Create trigger for updating updated_at
CREATE OR REPLACE TRIGGER update_user_onboarding_profiles_updated_at
  BEFORE UPDATE ON public.user_onboarding_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_onboarding_profiles_user_id 
ON public.user_onboarding_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_user_onboarding_profiles_completed_at 
ON public.user_onboarding_profiles(completed_at);