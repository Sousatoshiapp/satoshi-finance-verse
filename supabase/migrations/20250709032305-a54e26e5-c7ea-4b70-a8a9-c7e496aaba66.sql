-- Create RLS policy for admin users table
CREATE POLICY "Admin sessions are viewable by their owners and super admins"
ON public.admin_sessions
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
    AND is_active = true
  )
);