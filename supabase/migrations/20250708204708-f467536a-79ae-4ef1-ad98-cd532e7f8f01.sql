
-- Create sponsor admin system
CREATE TABLE IF NOT EXISTS public.sponsor_admin_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  district_id UUID REFERENCES public.districts(id) ON DELETE CASCADE NOT NULL,
  access_level TEXT DEFAULT 'manager' CHECK (access_level IN ('owner', 'manager', 'viewer')),
  granted_by UUID REFERENCES public.profiles(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  permissions JSONB DEFAULT '{"manage_store": true, "view_analytics": true, "manage_events": false}',
  UNIQUE(user_id, district_id)
);

-- Create sponsor events table for special promotions
CREATE TABLE IF NOT EXISTS public.sponsor_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID REFERENCES public.districts(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'promotion' CHECK (event_type IN ('promotion', 'tournament', 'challenge', 'sale')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  rewards JSONB DEFAULT '{}',
  requirements JSONB DEFAULT '{}',
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  banner_image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics tracking table
CREATE TABLE IF NOT EXISTS public.district_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID REFERENCES public.districts(id) ON DELETE CASCADE NOT NULL,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_data JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sponsor_admin_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.district_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sponsor_admin_access
CREATE POLICY "Users can view their own sponsor access" ON public.sponsor_admin_access FOR SELECT
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "District owners can manage access" ON public.sponsor_admin_access FOR ALL
USING (
  district_id IN (
    SELECT district_id FROM public.sponsor_admin_access 
    WHERE user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND access_level = 'owner'
  )
);

-- RLS Policies for sponsor_events
CREATE POLICY "Everyone can view active events" ON public.sponsor_events FOR SELECT
USING (is_active = true);

CREATE POLICY "Sponsor admins can manage events" ON public.sponsor_events FOR ALL
USING (
  district_id IN (
    SELECT district_id FROM public.sponsor_admin_access 
    WHERE user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND is_active = true
    AND (permissions->>'manage_events')::boolean = true
  )
);

-- RLS Policies for district_analytics
CREATE POLICY "Sponsor admins can view analytics" ON public.district_analytics FOR SELECT
USING (
  district_id IN (
    SELECT district_id FROM public.sponsor_admin_access 
    WHERE user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND is_active = true
    AND (permissions->>'view_analytics')::boolean = true
  )
);

CREATE POLICY "System can insert analytics" ON public.district_analytics FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sponsor_admin_access_user_district ON public.sponsor_admin_access(user_id, district_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_events_district_active ON public.sponsor_events(district_id, is_active);
CREATE INDEX IF NOT EXISTS idx_district_analytics_district_date ON public.district_analytics(district_id, recorded_at DESC);

-- Create function to track district metrics
CREATE OR REPLACE FUNCTION public.track_district_metric(
  p_district_id UUID,
  p_metric_type TEXT,
  p_metric_value NUMERIC,
  p_metric_data JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.district_analytics (
    district_id,
    metric_type,
    metric_value,
    metric_data
  ) VALUES (
    p_district_id,
    p_metric_type,
    p_metric_value,
    p_metric_data
  );
END;
$$;

-- Enable realtime for sponsor events
ALTER PUBLICATION supabase_realtime ADD TABLE public.sponsor_events;
