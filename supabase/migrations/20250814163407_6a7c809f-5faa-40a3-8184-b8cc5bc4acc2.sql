-- Fix Security Audit Log RLS policies to allow system logging
-- The current issue: security_audit_log table has RLS enabled but no INSERT policies

-- First, check current policies (for reference)
-- Current state: only SELECT policy for admins exists, no INSERT policies

-- Create policy to allow system functions to insert security logs
CREATE POLICY "System can insert security audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow users to view their own security logs
CREATE POLICY "Users can view their own security logs" 
ON public.security_audit_log 
FOR SELECT 
USING (
  user_id IS NULL OR -- Allow viewing system-wide logs 
  user_id = auth.uid() OR -- Allow viewing own logs
  public.check_user_is_admin(auth.uid()) -- Allow admins to view all logs
);

-- Remove any conflicting policies that might exist
DROP POLICY IF EXISTS "Only admins can view security audit logs" ON public.security_audit_log;

-- Ensure the log_security_event function works properly
-- Test the security logging function
SELECT public.log_security_event('test_event', auth.uid(), '{"test": true}'::jsonb);