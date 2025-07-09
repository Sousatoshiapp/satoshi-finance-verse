-- Add moderation columns to social_posts table
ALTER TABLE public.social_posts 
ADD COLUMN is_approved BOOLEAN DEFAULT NULL,
ADD COLUMN is_flagged BOOLEAN DEFAULT FALSE;

-- Add indexes for better performance
CREATE INDEX idx_social_posts_is_approved ON public.social_posts(is_approved);
CREATE INDEX idx_social_posts_is_flagged ON public.social_posts(is_flagged);

-- Update RLS policies to allow admins to manage posts
CREATE POLICY "Admins can manage all posts"
ON public.social_posts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.user_id = auth.uid()
    AND au.is_active = true
  )
);

-- Create social_challenges table
CREATE TABLE public.social_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL,
  target_value INTEGER NOT NULL DEFAULT 1,
  rewards JSONB DEFAULT '{}',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.social_challenges ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing challenges
CREATE POLICY "Challenges are viewable by everyone"
ON public.social_challenges
FOR SELECT
USING (is_active = true);

-- Create social_challenge_progress table
CREATE TABLE public.social_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  challenge_id UUID NOT NULL REFERENCES public.social_challenges(id),
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS
ALTER TABLE public.social_challenge_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for challenge progress
CREATE POLICY "Users can view their own challenge progress"
ON public.social_challenge_progress
FOR SELECT
USING (user_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "System can insert challenge progress"
ON public.social_challenge_progress
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update challenge progress"
ON public.social_challenge_progress
FOR UPDATE
USING (true);