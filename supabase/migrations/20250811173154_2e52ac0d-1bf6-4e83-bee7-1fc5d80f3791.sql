-- SECURITY FIX: Remove hardcoded admin email and implement token-based admin verification

-- Create admin_tokens table for secure token-based admin operations
CREATE TABLE IF NOT EXISTS public.admin_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  admin_email TEXT NOT NULL,
  token_type TEXT NOT NULL DEFAULT 'password_reset',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on admin_tokens
ALTER TABLE public.admin_tokens ENABLE ROW LEVEL SECURITY;

-- Policy for service role to manage tokens
CREATE POLICY "Service role can manage admin tokens" 
ON public.admin_tokens 
FOR ALL 
USING (true);

-- Add SET search_path to critical database functions for security
-- This prevents search_path attacks by ensuring functions only access the public schema

-- Update is_master_admin function
CREATE OR REPLACE FUNCTION public.is_master_admin(email_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check against admin_users table instead of hardcoding
  RETURN EXISTS (
    SELECT 1 FROM admin_users au
    JOIN auth.users u ON au.user_id = u.id
    WHERE u.email = email_check 
    AND au.role = 'super_admin'
    AND au.is_active = true
  );
END;
$$;

-- Update get_admin_role function
CREATE OR REPLACE FUNCTION public.get_admin_role(user_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_email text;
  user_role text;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = user_uuid;
  
  -- Check if user is super admin via admin_users table
  SELECT role::text INTO user_role
  FROM admin_users
  WHERE user_id = user_uuid AND is_active = true;
  
  RETURN COALESCE(user_role, 'user');
END;
$$;

-- Update is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = user_uuid AND is_active = true
  );
END;
$$;

-- Create secure admin token validation function
CREATE OR REPLACE FUNCTION public.validate_admin_token(token_value text, operation_type text DEFAULT 'password_reset')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  token_record RECORD;
BEGIN
  -- Find valid token
  SELECT * INTO token_record
  FROM admin_tokens
  WHERE token = token_value
  AND token_type = operation_type
  AND used = false
  AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Invalid or expired token'
    );
  END IF;
  
  -- Mark token as used
  UPDATE admin_tokens 
  SET used = true, used_at = now()
  WHERE id = token_record.id;
  
  RETURN jsonb_build_object(
    'valid', true,
    'admin_email', token_record.admin_email,
    'token_id', token_record.id
  );
END;
$$;