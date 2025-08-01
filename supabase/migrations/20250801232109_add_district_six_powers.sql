ALTER TABLE public.districts 
ADD COLUMN monetary_power INTEGER DEFAULT 0 CHECK (monetary_power >= 0 AND monetary_power <= 100),
ADD COLUMN tech_power INTEGER DEFAULT 0 CHECK (tech_power >= 0 AND tech_power <= 100),
ADD COLUMN military_power INTEGER DEFAULT 0 CHECK (military_power >= 0 AND military_power <= 100),
ADD COLUMN energy_power INTEGER DEFAULT 0 CHECK (energy_power >= 0 AND energy_power <= 100),
ADD COLUMN commercial_power INTEGER DEFAULT 0 CHECK (commercial_power >= 0 AND commercial_power <= 100),
ADD COLUMN social_power INTEGER DEFAULT 0 CHECK (social_power >= 0 AND social_power <= 100);

CREATE TABLE IF NOT EXISTS public.district_power_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID REFERENCES public.districts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  power_type TEXT NOT NULL,
  power_change INTEGER NOT NULL,
  previous_value INTEGER NOT NULL,
  new_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_district_power_logs_district_user ON public.district_power_logs(district_id, user_id);
CREATE INDEX idx_district_power_logs_created_at ON public.district_power_logs(created_at);
CREATE INDEX idx_district_power_logs_action_type ON public.district_power_logs(action_type);

ALTER TABLE public.district_power_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view district power logs" ON public.district_power_logs FOR SELECT USING (true);
CREATE POLICY "Users can create their own power logs" ON public.district_power_logs FOR INSERT
WITH CHECK (
  user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

UPDATE public.districts SET 
  monetary_power = FLOOR(RANDOM() * 21) + 10,
  tech_power = FLOOR(RANDOM() * 21) + 10,
  military_power = FLOOR(RANDOM() * 21) + 10,
  energy_power = FLOOR(RANDOM() * 21) + 10,
  commercial_power = FLOOR(RANDOM() * 21) + 10,
  social_power = FLOOR(RANDOM() * 21) + 10
WHERE monetary_power IS NULL;
