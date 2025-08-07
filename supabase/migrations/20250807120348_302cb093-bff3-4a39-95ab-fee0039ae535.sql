-- CRITICAL SECURITY FIXES - Phase 2: Enable RLS and Fix Remaining Issues

-- Enable RLS on all tables that need it
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_loot_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.district_duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Add comprehensive policies for newly secured tables
CREATE POLICY "Users can view their own weekly leaderboard entries" ON public.weekly_leaderboards
FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can manage weekly leaderboards" ON public.weekly_leaderboards
FOR ALL USING (true);

CREATE POLICY "Users can view district duels" ON public.district_duels
FOR SELECT USING (true);

CREATE POLICY "Team members can view team activities" ON public.team_members
FOR SELECT USING (
  user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
  team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can manage their own team membership" ON public.team_members
FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Add policies for loot boxes
CREATE POLICY "Users can view their own loot boxes" ON public.user_loot_boxes
FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can manage loot boxes" ON public.user_loot_boxes
FOR ALL USING (true);

-- Add policies for quiz questions - make them viewable by everyone
CREATE POLICY "Quiz questions are viewable by everyone" ON public.quiz_questions
FOR SELECT USING (true);

-- Create security monitoring table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid,
  event_data jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  severity text DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on security audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins and system can view security logs
CREATE POLICY "Admins can view all security logs" ON public.security_audit_log
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "System can create security logs" ON public.security_audit_log
FOR INSERT WITH CHECK (true);