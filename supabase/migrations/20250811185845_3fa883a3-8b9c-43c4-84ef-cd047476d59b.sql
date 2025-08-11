-- Remove overly permissive RLS policies and fix security vulnerabilities
-- Use IF EXISTS and conditional logic to avoid conflicts

-- Fix crypto_payments table - remove overly permissive service role policy
DROP POLICY IF EXISTS "crypto_payments_service_role" ON public.crypto_payments;
DROP POLICY IF EXISTS "Users can view their own crypto payments" ON public.crypto_payments;
DROP POLICY IF EXISTS "Users can insert their own crypto payments" ON public.crypto_payments;
DROP POLICY IF EXISTS "Service role can update payment status" ON public.crypto_payments;

-- Add proper restrictive policies for crypto_payments
CREATE POLICY "Users can view their own crypto payments" 
ON public.crypto_payments 
FOR SELECT 
USING (user_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert their own crypto payments" 
ON public.crypto_payments 
FOR INSERT 
WITH CHECK (user_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Service role can update payment status" 
ON public.crypto_payments 
FOR UPDATE 
TO service_role
USING (true)
WITH CHECK (true);

-- Fix admin_tokens table - make it more restrictive
DROP POLICY IF EXISTS "admin_tokens_service" ON public.admin_tokens;
DROP POLICY IF EXISTS "Admin tokens are service role only" ON public.admin_tokens;
DROP POLICY IF EXISTS "Service role can manage admin tokens" ON public.admin_tokens;

CREATE POLICY "Service role can manage admin tokens" 
ON public.admin_tokens 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Block regular user access to admin tokens
CREATE POLICY "Block user access to admin tokens" 
ON public.admin_tokens 
FOR ALL 
TO authenticated
USING (false) 
WITH CHECK (false);

-- Fix profiles table - remove any overly permissive policies
DROP POLICY IF EXISTS "profiles_public_view" ON public.profiles;
DROP POLICY IF EXISTS "public_profiles_view" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public leaderboard data only" ON public.profiles;

-- Create strict profile policies
CREATE POLICY "Users can view their own profile data" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

-- Allow limited public access for leaderboards only through specific functions
CREATE POLICY "Limited public data for system functions" 
ON public.profiles 
FOR SELECT 
USING (
  -- Only allow through specific system functions
  current_setting('role', true) = 'service_role' OR
  pg_has_role(current_user, 'service_role', 'member')
);

-- Fix admin_sessions table - restrict to admin users only
DROP POLICY IF EXISTS "admin_sessions_public" ON public.admin_sessions;
DROP POLICY IF EXISTS "admin_sessions_owner" ON public.admin_sessions;
DROP POLICY IF EXISTS "Admin session owner only" ON public.admin_sessions;

CREATE POLICY "Admin sessions restricted to owners" 
ON public.admin_sessions 
FOR ALL 
USING (
  user_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
)
WITH CHECK (
  user_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
);

-- Fix conversations for privacy
DROP POLICY IF EXISTS "conversations_public" ON public.conversations;
DROP POLICY IF EXISTS "Conversation participants only" ON public.conversations;

CREATE POLICY "Conversations private to participants" 
ON public.conversations 
FOR ALL 
USING (
  participant1_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  participant2_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
)
WITH CHECK (
  participant1_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  participant2_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Fix direct_messages table if exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'direct_messages' AND table_schema = 'public') THEN
    -- Enable RLS
    EXECUTE 'ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY';
    
    -- Drop existing policies
    EXECUTE 'DROP POLICY IF EXISTS "direct_messages_public" ON public.direct_messages';
    
    -- Add restrictive policy
    EXECUTE 'CREATE POLICY "Direct messages private to participants" 
    ON public.direct_messages 
    FOR ALL 
    USING (
      sender_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
      receiver_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
    WITH CHECK (
      sender_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )';
  END IF;
END
$$;

-- Add protective comments about Security Definer Views
COMMENT ON VIEW public.leaderboard_data IS 'Security Definer view - intentional for controlled public leaderboard access';
COMMENT ON VIEW public.public_activities IS 'Security Definer view - intentional for filtered public activity feed';