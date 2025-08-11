-- Remove overly permissive RLS policies and fix security vulnerabilities
-- Fixed version without problematic direct_messages assumptions

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
DROP POLICY IF EXISTS "Block user access to admin tokens" ON public.admin_tokens;

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
DROP POLICY IF EXISTS "Users can view their own profile data" ON public.profiles;
DROP POLICY IF EXISTS "Limited public data for system functions" ON public.profiles;

-- Create strict profile policies
CREATE POLICY "Users can view their own profile data" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

-- Allow limited public access for leaderboards only through service role
CREATE POLICY "Limited public data for system functions" 
ON public.profiles 
FOR SELECT 
USING (
  -- Only allow through service role for system functions
  current_setting('role', true) = 'service_role'
);

-- Fix admin_sessions table - restrict to admin users only
DROP POLICY IF EXISTS "admin_sessions_public" ON public.admin_sessions;
DROP POLICY IF EXISTS "admin_sessions_owner" ON public.admin_sessions;
DROP POLICY IF EXISTS "Admin session owner only" ON public.admin_sessions;
DROP POLICY IF EXISTS "Admin sessions restricted to owners" ON public.admin_sessions;

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
DROP POLICY IF EXISTS "Conversations private to participants" ON public.conversations;

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

-- Protect transactions table
DROP POLICY IF EXISTS "transactions_public" ON public.transactions;
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (
  sender_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  receiver_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Protect premium_subscriptions table if exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'premium_subscriptions' AND table_schema = 'public') THEN
    EXECUTE 'ALTER TABLE public.premium_subscriptions ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "premium_subscriptions_public" ON public.premium_subscriptions';
    EXECUTE 'CREATE POLICY "Users can view their own subscriptions" 
    ON public.premium_subscriptions 
    FOR ALL 
    USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
    WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))';
  END IF;
END
$$;

-- Add protective comments about Security Definer Views
COMMENT ON VIEW public.leaderboard_data IS 'Security Definer view - intentional for controlled public leaderboard access';
COMMENT ON VIEW public.public_activities IS 'Security Definer view - intentional for filtered public activity feed';