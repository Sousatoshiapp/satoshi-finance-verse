-- Fix missing RLS policy for user_challenge_progress table
CREATE POLICY "Users can view their own challenge progress" 
ON public.user_challenge_progress 
FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Add missing UPDATE and DELETE policies for user_challenge_progress
CREATE POLICY "Users can update their own challenge progress" 
ON public.user_challenge_progress 
FOR UPDATE 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own challenge progress" 
ON public.user_challenge_progress 
FOR DELETE 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Add additional security constraints
ALTER TABLE public.user_challenge_progress 
ADD CONSTRAINT check_progress_bounds 
CHECK (current_progress >= 0 AND current_progress <= 1000000);

-- Add audit table for security events
CREATE TABLE IF NOT EXISTS security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  severity TEXT DEFAULT 'low',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON security_audit_log 
FOR SELECT 
USING (false); -- Will be updated when admin system is implemented