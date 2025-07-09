-- Create admin roles system
CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'moderator');

-- Create admin users table for proper role-based authentication
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role admin_role NOT NULL DEFAULT 'admin',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(user_id)
);

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin roles
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.user_id = user_uuid
    AND au.is_active = true
  );
$$;

-- Create function to get admin role
CREATE OR REPLACE FUNCTION public.get_admin_role(user_uuid UUID DEFAULT auth.uid())
RETURNS admin_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT au.role
  FROM public.admin_users au
  WHERE au.user_id = user_uuid
  AND au.is_active = true
  LIMIT 1;
$$;

-- RLS policies for admin_users
CREATE POLICY "Super admins can view all admin users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
    AND is_active = true
  )
);

CREATE POLICY "Super admins can manage admin users"
ON public.admin_users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
    AND is_active = true
  )
);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_admin_users_updated_at();

-- Create admin sessions table for secure session management
CREATE TABLE public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on admin_sessions
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policy for admin sessions
CREATE POLICY "Users can view their own admin sessions"
ON public.admin_sessions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create function to verify admin session
CREATE OR REPLACE FUNCTION public.verify_admin_session(session_token TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_sessions ads
    JOIN public.admin_users au ON ads.user_id = au.user_id
    WHERE ads.session_token = $1
    AND ads.expires_at > now()
    AND au.is_active = true
  );
$$;

-- Insert initial super admin (you'll need to create this user in Supabase Auth first)
-- This is a placeholder - replace with actual user ID after creating the auth user
-- INSERT INTO public.admin_users (user_id, role, created_by)
-- VALUES (
--   '00000000-0000-0000-0000-000000000000', -- Replace with actual admin user UUID
--   'super_admin',
--   '00000000-0000-0000-0000-000000000000'  -- Replace with creator UUID
-- );

-- Update existing admin_password_tokens table to link with users
ALTER TABLE public.admin_password_tokens 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX idx_admin_users_role ON public.admin_users(role);
CREATE INDEX idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_expires ON public.admin_sessions(expires_at);