-- Phase 1: Critical RLS Policy Fixes

-- Add missing INSERT policy for notifications table
CREATE POLICY "System can insert notifications for users" 
ON public.notifications 
FOR INSERT 
WITH CHECK (
  user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Add missing DELETE policies for messages table
CREATE POLICY "Users can delete their own messages" 
ON public.messages 
FOR DELETE 
USING (
  sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Add missing DELETE policy for conversations table
CREATE POLICY "Users can delete their own conversations" 
ON public.conversations 
FOR DELETE 
USING (
  participant1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
  participant2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Add security function for audit logging
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  user_id UUID,
  event_data JSONB DEFAULT '{}'::jsonb
) RETURNS void AS $$
BEGIN
  INSERT INTO public.activity_feed (
    activity_type,
    user_id,
    activity_data,
    created_at
  ) VALUES (
    'security_' || event_type,
    user_id,
    event_data,
    now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for suspicious activity detection on failed auth attempts
CREATE OR REPLACE FUNCTION public.detect_suspicious_activity()
RETURNS trigger AS $$
BEGIN
  -- Log failed login attempts
  IF NEW.event_message LIKE '%authentication failed%' THEN
    PERFORM public.log_security_event(
      'failed_login',
      NEW.user_id,
      jsonb_build_object('timestamp', now(), 'ip', NEW.event_message)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;