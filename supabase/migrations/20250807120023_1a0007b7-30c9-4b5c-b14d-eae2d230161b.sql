-- CRITICAL SECURITY FIXES - Phase 1: Database Security

-- 1. Fix nullable user_id in profiles table (CRITICAL RLS vulnerability)
ALTER TABLE public.profiles 
ALTER COLUMN user_id SET NOT NULL;

-- 2. Add missing RLS policies for critical tables

-- Secure activity_feed table
CREATE POLICY "Users can delete their own activity" ON public.activity_feed
FOR DELETE USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Secure user_achievements table  
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can insert achievements" ON public.user_achievements
FOR INSERT WITH CHECK (true);

-- Secure user_avatars table
CREATE POLICY "Users can manage their own avatars" ON public.user_avatars
FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Secure user_badges table
CREATE POLICY "Users can view their own badges" ON public.user_badges
FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can create badges" ON public.user_badges
FOR INSERT WITH CHECK (true);

-- Secure quiz_sessions table
CREATE POLICY "Users can manage their own quiz sessions" ON public.quiz_sessions
FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Secure messages table  
CREATE POLICY "Users can manage their own messages" ON public.messages
FOR ALL USING (sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view messages in their conversations" ON public.messages
FOR SELECT USING (
  conversation_id IN (
    SELECT id FROM conversations 
    WHERE participant1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR participant2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);

-- 3. Fix database function security (search_path)
-- Update all functions to use secure search_path

ALTER FUNCTION public.update_guild_member_count() SET search_path TO 'public';
ALTER FUNCTION public.is_master_admin(text) SET search_path TO 'public'; 
ALTER FUNCTION public.clean_expired_btc_queue() SET search_path TO 'public';
ALTER FUNCTION public.update_user_theme_progress_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.recover_user_lives() SET search_path TO 'public';
ALTER FUNCTION public.is_admin(uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_admin_role(uuid) SET search_path TO 'public';
ALTER FUNCTION public.update_city_emergency_progress() SET search_path TO 'public';
ALTER FUNCTION public.finalize_expired_emergencies() SET search_path TO 'public';
ALTER FUNCTION public.simulate_bot_presence() SET search_path TO 'public';
ALTER FUNCTION public.request_guild_membership(uuid, uuid, text) SET search_path TO 'public';
ALTER FUNCTION public.update_user_streak(uuid, date) SET search_path TO 'public';
ALTER FUNCTION public.auto_update_user_level() SET search_path TO 'public';
ALTER FUNCTION public.process_guild_request(uuid, uuid, boolean) SET search_path TO 'public';
ALTER FUNCTION public.award_xp(uuid, integer, text) SET search_path TO 'public';
ALTER FUNCTION public.apply_btz_penalty(uuid) SET search_path TO 'public';
ALTER FUNCTION public.check_duel_limit(uuid) SET search_path TO 'public';
ALTER FUNCTION public.increment_duel_count(uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_xp_multiplier(uuid) SET search_path TO 'public';
ALTER FUNCTION public.is_guild_member(uuid, uuid) SET search_path TO 'public';
ALTER FUNCTION public.improve_bot_data() SET search_path TO 'public';
ALTER FUNCTION public.is_guild_leader_or_officer(uuid, uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_user_profile_id() SET search_path TO 'public';
ALTER FUNCTION public.generate_daily_missions() SET search_path TO 'public';
ALTER FUNCTION public.update_srs_with_concepts(uuid, uuid, boolean, integer) SET search_path TO 'public';
ALTER FUNCTION public.assign_bot_achievements() SET search_path TO 'public';
ALTER FUNCTION public.update_module_progress(uuid, uuid, boolean) SET search_path TO 'public';
ALTER FUNCTION public.get_next_level_xp(integer) SET search_path TO 'public';
ALTER FUNCTION public.detect_suspicious_activity() SET search_path TO 'public';
ALTER FUNCTION public.track_district_metric(uuid, text, numeric, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.update_learning_streak(uuid, uuid) SET search_path TO 'public';
ALTER FUNCTION public.open_loot_box(uuid, uuid) SET search_path TO 'public';
ALTER FUNCTION public.update_learning_analytics(uuid, integer, integer, integer) SET search_path TO 'public';
ALTER FUNCTION public.clean_duplicate_questions() SET search_path TO 'public';
ALTER FUNCTION public.add_user_to_district_on_team_creation() SET search_path TO 'public';
ALTER FUNCTION public.generate_ai_recommendations(uuid) SET search_path TO 'public';
ALTER FUNCTION public.auto_update_streaks_and_analytics() SET search_path TO 'public';
ALTER FUNCTION public.update_login_streak(uuid) SET search_path TO 'public';
ALTER FUNCTION public.update_crisis_progress() SET search_path TO 'public';
ALTER FUNCTION public.get_or_create_weekly_entry(uuid) SET search_path TO 'public';
ALTER FUNCTION public.check_user_team_membership(uuid, uuid) SET search_path TO 'public';
ALTER FUNCTION public.update_team_sponsor_motto() SET search_path TO 'public';
ALTER FUNCTION public.start_district_duel(uuid, uuid) SET search_path TO 'public';
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