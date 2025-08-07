-- Tabela para eventos de emergência da cidade
CREATE TABLE IF NOT EXISTS public.city_emergency_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  crisis_type text NOT NULL DEFAULT 'financial_hack',
  duration_hours integer DEFAULT 72,
  btz_goal integer NOT NULL DEFAULT 50000,
  xp_goal integer NOT NULL DEFAULT 100000,
  current_btz_contributions integer DEFAULT 0,
  current_xp_contributions integer DEFAULT 0,
  reward_multiplier numeric DEFAULT 2.0,
  penalty_multiplier numeric DEFAULT 0.5,
  is_active boolean DEFAULT false,
  theme_data jsonb DEFAULT '{}',
  start_time timestamptz DEFAULT now(),
  end_time timestamptz DEFAULT (now() + INTERVAL '72 hours'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS para city_emergency_events
ALTER TABLE public.city_emergency_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active city emergencies"
ON public.city_emergency_events
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage city emergencies"
ON public.city_emergency_events
FOR ALL
USING (public.is_admin(auth.uid()));

-- Tabela para contribuições da cidade de emergência
CREATE TABLE IF NOT EXISTS public.city_emergency_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emergency_id uuid NOT NULL REFERENCES public.city_emergency_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  btz_contributed integer DEFAULT 0,
  xp_contributed integer DEFAULT 0,
  contribution_type text DEFAULT 'manual',
  heroic_action text,
  created_at timestamptz DEFAULT now()
);

-- RLS para city_emergency_contributions
ALTER TABLE public.city_emergency_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all emergency contributions"
ON public.city_emergency_contributions
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own emergency contributions"
ON public.city_emergency_contributions
FOR INSERT
WITH CHECK (user_id IN (
  SELECT profiles.id 
  FROM profiles 
  WHERE profiles.user_id = auth.uid()
));

-- Tabela para configurações de push notifications
CREATE TABLE IF NOT EXISTS public.push_notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  endpoint text,
  p256dh_key text,
  auth_key text,
  is_enabled boolean DEFAULT true,
  notification_types jsonb DEFAULT '{"duels": true, "achievements": true, "emergencies": true, "missions": true}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS para push_notification_settings
ALTER TABLE public.push_notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notification settings"
ON public.push_notification_settings
FOR ALL
USING (user_id IN (
  SELECT profiles.id 
  FROM profiles 
  WHERE profiles.user_id = auth.uid()
));

-- Tabela para logs de push notifications
CREATE TABLE IF NOT EXISTS public.push_notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  notification_type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  data jsonb DEFAULT '{}',
  status text DEFAULT 'pending',
  sent_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- RLS para push_notification_logs
ALTER TABLE public.push_notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification logs"
ON public.push_notification_logs
FOR SELECT
USING (user_id IN (
  SELECT profiles.id 
  FROM profiles 
  WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "System can manage notification logs"
ON public.push_notification_logs
FOR ALL
USING (true);