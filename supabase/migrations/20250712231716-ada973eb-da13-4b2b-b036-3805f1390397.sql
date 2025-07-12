-- Create crisis management tables for Satoshi City narrative system

-- Main crisis events table
CREATE TABLE public.crisis_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  crisis_type TEXT NOT NULL DEFAULT 'financial_hack',
  status TEXT NOT NULL DEFAULT 'active',
  total_btz_goal INTEGER NOT NULL DEFAULT 50000,
  total_xp_goal INTEGER NOT NULL DEFAULT 100000,
  current_btz_contributions INTEGER NOT NULL DEFAULT 0,
  current_xp_contributions INTEGER NOT NULL DEFAULT 0,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '72 hours'),
  reward_data JSONB DEFAULT '{"badges": ["crisis_hero"], "multiplier": 1.5}',
  narrative_data JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crisis contributions tracking
CREATE TABLE public.crisis_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crisis_id UUID NOT NULL REFERENCES public.crisis_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  district_id UUID REFERENCES public.districts(id) ON DELETE SET NULL,
  btz_contributed INTEGER NOT NULL DEFAULT 0,
  xp_contributed INTEGER NOT NULL DEFAULT 0,
  contribution_type TEXT NOT NULL DEFAULT 'manual',
  heroic_action TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(crisis_id, user_id)
);

-- District-specific crisis goals and progress
CREATE TABLE public.crisis_district_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crisis_id UUID NOT NULL REFERENCES public.crisis_events(id) ON DELETE CASCADE,
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  btz_goal INTEGER NOT NULL DEFAULT 5000,
  xp_goal INTEGER NOT NULL DEFAULT 10000,
  current_btz INTEGER NOT NULL DEFAULT 0,
  current_xp INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(crisis_id, district_id)
);

-- Enable RLS on all crisis tables
ALTER TABLE public.crisis_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crisis_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crisis_district_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies for crisis_events (everyone can view active crises)
CREATE POLICY "Anyone can view active crisis events" 
ON public.crisis_events 
FOR SELECT 
USING (is_active = true);

-- RLS policies for crisis_contributions
CREATE POLICY "Users can view all crisis contributions" 
ON public.crisis_contributions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own contributions" 
ON public.crisis_contributions 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own contributions" 
ON public.crisis_contributions 
FOR UPDATE 
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS policies for crisis_district_goals
CREATE POLICY "Anyone can view district crisis goals" 
ON public.crisis_district_goals 
FOR SELECT 
USING (true);

CREATE POLICY "System can manage district goals" 
ON public.crisis_district_goals 
FOR ALL 
USING (true);

-- Function to update crisis progress when contributions are made
CREATE OR REPLACE FUNCTION public.update_crisis_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_btz INTEGER;
  total_xp INTEGER;
BEGIN
  -- Update main crisis totals
  SELECT 
    COALESCE(SUM(btz_contributed), 0),
    COALESCE(SUM(xp_contributed), 0)
  INTO total_btz, total_xp
  FROM public.crisis_contributions 
  WHERE crisis_id = NEW.crisis_id;
  
  UPDATE public.crisis_events 
  SET 
    current_btz_contributions = total_btz,
    current_xp_contributions = total_xp,
    updated_at = now()
  WHERE id = NEW.crisis_id;
  
  -- Update district-specific goals if district is specified
  IF NEW.district_id IS NOT NULL THEN
    UPDATE public.crisis_district_goals 
    SET 
      current_btz = COALESCE((
        SELECT SUM(btz_contributed) 
        FROM public.crisis_contributions 
        WHERE crisis_id = NEW.crisis_id AND district_id = NEW.district_id
      ), 0),
      current_xp = COALESCE((
        SELECT SUM(xp_contributed) 
        FROM public.crisis_contributions 
        WHERE crisis_id = NEW.crisis_id AND district_id = NEW.district_id
      ), 0),
      updated_at = now()
    WHERE crisis_id = NEW.crisis_id AND district_id = NEW.district_id;
    
    -- Check if district goal is completed
    UPDATE public.crisis_district_goals 
    SET 
      is_completed = (current_btz >= btz_goal AND current_xp >= xp_goal),
      completed_at = CASE 
        WHEN (current_btz >= btz_goal AND current_xp >= xp_goal) AND completed_at IS NULL 
        THEN now() 
        ELSE completed_at 
      END
    WHERE crisis_id = NEW.crisis_id AND district_id = NEW.district_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updating crisis progress
CREATE TRIGGER update_crisis_progress_trigger
  AFTER INSERT OR UPDATE ON public.crisis_contributions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_crisis_progress();

-- Function to create a new crisis event
CREATE OR REPLACE FUNCTION public.create_crisis_event(
  p_title TEXT,
  p_description TEXT,
  p_crisis_type TEXT DEFAULT 'financial_hack',
  p_btz_goal INTEGER DEFAULT 50000,
  p_xp_goal INTEGER DEFAULT 100000,
  p_duration_hours INTEGER DEFAULT 72
) RETURNS UUID AS $$
DECLARE
  crisis_id UUID;
  district_record RECORD;
BEGIN
  -- Create the main crisis event
  INSERT INTO public.crisis_events (
    title, description, crisis_type, total_btz_goal, total_xp_goal, end_time
  ) VALUES (
    p_title, p_description, p_crisis_type, p_btz_goal, p_xp_goal, 
    now() + (p_duration_hours || ' hours')::INTERVAL
  ) RETURNING id INTO crisis_id;
  
  -- Create district-specific goals for all active districts
  FOR district_record IN 
    SELECT id FROM public.districts WHERE is_active = true
  LOOP
    INSERT INTO public.crisis_district_goals (
      crisis_id, district_id, btz_goal, xp_goal
    ) VALUES (
      crisis_id, district_record.id, 
      p_btz_goal / 8, -- Divide by estimated number of districts
      p_xp_goal / 8
    );
  END LOOP;
  
  RETURN crisis_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert the first crisis event: "The Great Satoshi City Hack"
SELECT public.create_crisis_event(
  'O Grande Hack de Satoshi City',
  'Hackers maliciosos infiltraram os servidores centrais de Satoshi City! Os dados financeiros estão sob ameaça. Apenas a colaboração épica entre todos os distritos pode salvar nossa cidade digital. Contribuam com BTZ e XP para fortalecer nossas defesas!',
  'cyber_attack',
  75000,
  150000,
  72
);