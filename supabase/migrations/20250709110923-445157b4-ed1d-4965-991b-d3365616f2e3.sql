-- Remove the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can manage all posts" ON public.social_posts;

-- Create a simpler policy that doesn't cause recursion
-- Only allow service role to manage posts for now, regular users can only see approved posts
CREATE POLICY "Users can view approved posts"
ON public.social_posts
FOR SELECT
TO authenticated
USING (is_approved = true OR is_approved IS NULL);

-- Users can still create their own posts
CREATE POLICY "Users can create their own posts" 
ON public.social_posts
FOR INSERT
TO authenticated
WITH CHECK (user_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));