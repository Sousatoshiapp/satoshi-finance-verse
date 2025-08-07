CREATE TABLE IF NOT EXISTS public.user_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  latitude FLOAT8 NOT NULL,
  longitude FLOAT8 NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_locations_visible ON public.user_locations(is_visible, updated_at);
CREATE INDEX IF NOT EXISTS idx_user_locations_coords ON public.user_locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON public.user_locations(user_id);

CREATE TABLE IF NOT EXISTS public.proximity_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  opponent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  notified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenger_id, opponent_id)
);

CREATE INDEX IF NOT EXISTS idx_proximity_notifications_time ON public.proximity_notifications(notified_at);
CREATE INDEX IF NOT EXISTS idx_proximity_notifications_challenger ON public.proximity_notifications(challenger_id);
CREATE INDEX IF NOT EXISTS idx_proximity_notifications_opponent ON public.proximity_notifications(opponent_id);

ALTER TABLE public.duels ADD COLUMN IF NOT EXISTS btz_amount INTEGER DEFAULT 10;
ALTER TABLE public.duels ADD COLUMN IF NOT EXISTS proximity_based BOOLEAN DEFAULT false;

ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own location" ON public.user_locations
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own location" ON public.user_locations
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own location" ON public.user_locations
  FOR UPDATE USING (
    user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view visible locations of others" ON public.user_locations
  FOR SELECT USING (
    is_visible = true AND updated_at > NOW() - INTERVAL '5 minutes'
  );

ALTER TABLE public.proximity_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.proximity_notifications
  FOR SELECT USING (
    challenger_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    opponent_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own notifications" ON public.proximity_notifications
  FOR INSERT WITH CHECK (
    challenger_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their own notifications" ON public.proximity_notifications
  FOR DELETE USING (
    challenger_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );
