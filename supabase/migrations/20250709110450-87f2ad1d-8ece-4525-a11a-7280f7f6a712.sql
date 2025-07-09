-- Add moderation columns to social_posts table
ALTER TABLE public.social_posts 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_social_posts_is_approved ON public.social_posts(is_approved);
CREATE INDEX IF NOT EXISTS idx_social_posts_is_flagged ON public.social_posts(is_flagged);

-- Update RLS policies to allow admins to manage posts
DROP POLICY IF EXISTS "Admins can manage all posts" ON public.social_posts;
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