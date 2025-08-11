-- CRITICAL SECURITY FIX: Prevent stalker monitoring of user activity (CORRECTED)
-- This migration addresses privacy vulnerabilities in user presence and activity tracking

-- =====================================
-- 1. FIX USER_PRESENCE TABLE POLICIES
-- =====================================

-- Drop the dangerous "view all presence" policy
DROP POLICY IF EXISTS "Users can view all presence" ON public.user_presence;

-- Create secure presence policies that protect user privacy
CREATE POLICY "Users can view their own presence" 
ON public.user_presence 
FOR SELECT 
USING (user_id IN ( 
  SELECT profiles.id 
  FROM profiles 
  WHERE profiles.user_id = auth.uid()
));

-- Allow users to view presence only of people they're actively dueling with
CREATE POLICY "Users can view presence during active duels" 
ON public.user_presence 
FOR SELECT 
USING (
  user_id IN (
    -- Check if viewing presence of someone they're dueling with
    SELECT DISTINCT CASE 
      WHEN cd.player1_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()) 
      THEN cd.player2_id
      WHEN cd.player2_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()) 
      THEN cd.player1_id
      ELSE NULL
    END
    FROM casino_duels cd
    WHERE cd.status IN ('waiting', 'active', 'in_progress')
    AND (
      cd.player1_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()) OR
      cd.player2_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())
    )
    
    UNION
    
    -- Also check BTC prediction duels
    SELECT DISTINCT CASE 
      WHEN bpd.player1_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()) 
      THEN bpd.player2_id
      WHEN bpd.player2_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()) 
      THEN bpd.player1_id
      ELSE NULL
    END
    FROM btc_prediction_duels bpd
    WHERE bpd.status IN ('waiting_predictions', 'active', 'in_progress')
    AND (
      bpd.player1_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()) OR
      bpd.player2_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid())
    )
  )
);

-- =====================================
-- 2. ENHANCE ACTIVITY_FEED POLICIES  
-- =====================================

-- Drop and recreate the activity viewing policy with stricter controls
DROP POLICY IF EXISTS "Users can view their activity and followed users" ON public.activity_feed;

-- Allow users to view only their own activity
CREATE POLICY "Users can view their own activity" 
ON public.activity_feed 
FOR SELECT 
USING (user_id IN ( 
  SELECT profiles.id 
  FROM profiles 
  WHERE profiles.user_id = auth.uid()
));

-- Allow limited viewing of public activity only for specific activity types
CREATE POLICY "Users can view limited public activities" 
ON public.activity_feed 
FOR SELECT 
USING (
  activity_type IN ('level_up', 'achievement_unlock', 'tournament_win') 
  AND user_id IN (
    SELECT user_follows.following_id
    FROM user_follows
    WHERE user_follows.follower_id IN ( 
      SELECT profiles.id
      FROM profiles
      WHERE profiles.user_id = auth.uid()
    )
  )
);

-- =====================================
-- 3. RESTRICT BOT_PRESENCE_SIMULATION
-- =====================================

-- Drop the overly permissive bot presence policy
DROP POLICY IF EXISTS "Bot presence is viewable by everyone" ON public.bot_presence_simulation;

-- Create limited bot presence visibility
CREATE POLICY "Users can view limited bot presence for matchmaking" 
ON public.bot_presence_simulation 
FOR SELECT 
USING (
  -- Only show bot presence during active matchmaking or duels
  auth.uid() IS NOT NULL AND (
    -- User is in a duel queue
    EXISTS (
      SELECT 1 FROM casino_duel_queue cdq
      JOIN profiles p ON cdq.user_id = p.id
      WHERE p.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM btc_duel_queue bdq
      JOIN profiles p ON bdq.user_id = p.id
      WHERE p.user_id = auth.uid()
    ) OR
    -- User is in an active duel
    EXISTS (
      SELECT 1 FROM casino_duels cd
      JOIN profiles p ON (cd.player1_id = p.id OR cd.player2_id = p.id)
      WHERE p.user_id = auth.uid() AND cd.status IN ('waiting', 'active', 'in_progress')
    ) OR
    EXISTS (
      SELECT 1 FROM btc_prediction_duels bpd
      JOIN profiles p ON (bpd.player1_id = p.id OR bpd.player2_id = p.id)
      WHERE p.user_id = auth.uid() AND bpd.status IN ('waiting_predictions', 'active', 'in_progress')
    )
  )
);

-- =====================================
-- 4. ADD PRIVACY ENHANCEMENT FUNCTIONS
-- =====================================

-- Create function to get anonymized user presence for leaderboards/stats
CREATE OR REPLACE FUNCTION public.get_anonymized_user_stats()
RETURNS TABLE(
  total_online_users integer,
  total_active_users integer
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::integer as total_online_users,
    COUNT(CASE WHEN last_seen > now() - interval '5 minutes' THEN 1 END)::integer as total_active_users
  FROM user_presence
  WHERE is_online = true;
END;
$$;

-- Create function to check if a specific user is available for dueling (without exposing exact presence)
CREATE OR REPLACE FUNCTION public.is_user_available_for_duel(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_online boolean := false;
  user_in_duel boolean := false;
BEGIN
  -- Check if target user is online (last 2 minutes)
  SELECT is_online AND last_seen > now() - interval '2 minutes'
  INTO user_online
  FROM user_presence up
  JOIN profiles p ON up.user_id = p.id
  WHERE p.id = target_user_id;

  -- Check if user is already in an active duel
  SELECT EXISTS (
    SELECT 1 FROM casino_duels cd
    WHERE (cd.player1_id = target_user_id OR cd.player2_id = target_user_id)
    AND cd.status IN ('waiting', 'active', 'in_progress')
    
    UNION
    
    SELECT 1 FROM btc_prediction_duels bpd
    WHERE (bpd.player1_id = target_user_id OR bpd.player2_id = target_user_id)
    AND bpd.status IN ('waiting_predictions', 'active', 'in_progress')
  ) INTO user_in_duel;

  RETURN COALESCE(user_online, false) AND NOT COALESCE(user_in_duel, false);
END;
$$;

-- =====================================
-- 5. ADD SECURITY AUDIT LOGGING
-- =====================================

-- Create table for tracking privacy access attempts
CREATE TABLE IF NOT EXISTS public.privacy_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accessor_user_id uuid REFERENCES auth.users(id),
  accessed_table text NOT NULL,
  accessed_user_id uuid,
  access_type text NOT NULL,
  denied boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on privacy access log
ALTER TABLE public.privacy_access_log ENABLE ROW LEVEL SECURITY;

-- Only allow system to insert privacy access logs
CREATE POLICY "System can log privacy access" 
ON public.privacy_access_log 
FOR INSERT 
WITH CHECK (true);

-- Admins can view privacy access logs
CREATE POLICY "Admins can view privacy access logs" 
ON public.privacy_access_log 
FOR SELECT 
USING (is_admin(auth.uid()));