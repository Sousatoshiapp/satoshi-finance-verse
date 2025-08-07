-- CRITICAL SECURITY FIXES - Phase 1 (Fixed): Database Security

-- 1. Fix nullable user_id in profiles table (CRITICAL RLS vulnerability)
ALTER TABLE public.profiles 
ALTER COLUMN user_id SET NOT NULL;

-- 2. Add missing RLS policies for critical tables (avoiding duplicates)

-- Secure activity_feed table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activity_feed' AND policyname = 'Users can delete their own activity') THEN
    CREATE POLICY "Users can delete their own activity" ON public.activity_feed
    FOR DELETE USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
  END IF;
END $$;

-- Secure user_avatars table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_avatars' AND policyname = 'Users can manage their own avatars') THEN
    CREATE POLICY "Users can manage their own avatars" ON public.user_avatars
    FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
  END IF;
END $$;

-- Secure user_badges table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'Users can view their own badges') THEN
    CREATE POLICY "Users can view their own badges" ON public.user_badges
    FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'System can create badges') THEN
    CREATE POLICY "System can create badges" ON public.user_badges
    FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Secure quiz_sessions table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quiz_sessions' AND policyname = 'Users can manage their own quiz sessions') THEN
    CREATE POLICY "Users can manage their own quiz sessions" ON public.quiz_sessions
    FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
  END IF;
END $$;

-- Secure messages table  
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can manage their own messages') THEN
    CREATE POLICY "Users can manage their own messages" ON public.messages
    FOR ALL USING (sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can view messages in their conversations') THEN
    CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
      conversation_id IN (
        SELECT id FROM conversations 
        WHERE participant1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR participant2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
      )
    );
  END IF;
END $$;

-- 3. Fix database function security (search_path) - Only functions that don't already have it set
ALTER FUNCTION public.calculate_user_level(integer) SET search_path TO 'public';

-- 4. Create secure admin verification function
CREATE OR REPLACE FUNCTION public.verify_admin_session(session_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  valid_session boolean := false;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM admin_sessions 
    WHERE session_token = $1 
    AND expires_at > now()
    AND user_id = auth.uid()
  ) INTO valid_session;
  
  RETURN valid_session;
END;
$$;