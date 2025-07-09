-- Remove the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can manage all posts" ON public.social_posts;

-- Create a simpler policy that doesn't cause recursion
-- Only allow viewing of approved posts or posts without moderation status
CREATE POLICY "Users can view posts"
ON public.social_posts
FOR SELECT
TO authenticated
USING (is_approved = true OR is_approved IS NULL);