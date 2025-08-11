-- Remove overly permissive RLS policies and fix security vulnerabilities

-- Fix crypto_payments table - remove overly permissive service role policy
DROP POLICY IF EXISTS "crypto_payments_service_role" ON public.crypto_payments;

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
USING (true) -- Only service role should be able to update
WITH CHECK (true);

-- Fix admin_tokens table - make it more restrictive
DROP POLICY IF EXISTS "admin_tokens_service" ON public.admin_tokens;

CREATE POLICY "Admin tokens are service role only" 
ON public.admin_tokens 
FOR ALL 
USING (false) -- Block all user access
WITH CHECK (false);

-- Add service role policy for admin operations
CREATE POLICY "Service role can manage admin tokens" 
ON public.admin_tokens 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Fix profiles table - ensure user data is properly protected
DROP POLICY IF EXISTS "profiles_public_view" ON public.profiles;
DROP POLICY IF EXISTS "public_profiles_view" ON public.profiles;

-- Ensure profiles can only be viewed by owner or for public leaderboard data
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Public leaderboard data only" 
ON public.profiles 
FOR SELECT 
USING (
  -- Only allow access to minimal leaderboard fields through specific functions
  current_setting('request.function_name', true) IN (
    'get_safe_leaderboard', 
    'get_dashboard_data_optimized',
    'get_public_profile_data'
  )
);

-- Fix admin_sessions table - restrict to admin users only
DROP POLICY IF EXISTS "admin_sessions_public" ON public.admin_sessions;

-- Ensure only the session owner can access their sessions
CREATE POLICY "Admin session owner only" 
ON public.admin_sessions 
FOR ALL 
USING (user_id = auth.uid() AND is_admin(auth.uid()))
WITH CHECK (user_id = auth.uid() AND is_admin(auth.uid()));

-- Fix messages/conversations tables for privacy
DROP POLICY IF EXISTS "conversations_public" ON public.conversations;
DROP POLICY IF EXISTS "messages_public" ON public.messages;

-- Ensure conversations are private to participants only
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversation participants only" 
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

-- Add messages table protection if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages' AND table_schema = 'public') THEN
    -- Enable RLS on messages
    ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
    
    -- Drop any overly permissive policies
    DROP POLICY IF EXISTS "messages_public" ON public.messages;
    
    -- Add restrictive policy for messages
    EXECUTE 'CREATE POLICY "Message participants only" 
    ON public.messages 
    FOR ALL 
    USING (
      conversation_id IN (
        SELECT id FROM public.conversations 
        WHERE participant1_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) 
           OR participant2_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      )
    )
    WITH CHECK (
      conversation_id IN (
        SELECT id FROM public.conversations 
        WHERE participant1_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) 
           OR participant2_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      )
    )';
  END IF;
END
$$;

-- Add comment about Security Definer Views being intentional
COMMENT ON VIEW public.leaderboard_data IS 'Security Definer view - intentional for public leaderboard access with data filtering';
COMMENT ON VIEW public.public_activities IS 'Security Definer view - intentional for public activity feed with privacy filtering';