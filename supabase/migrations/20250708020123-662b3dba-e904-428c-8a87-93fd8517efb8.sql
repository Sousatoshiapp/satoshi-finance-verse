-- Create weekly leaderboards table for better performance
CREATE TABLE IF NOT EXISTS public.weekly_leaderboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start_date DATE NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  quiz_score INTEGER DEFAULT 0,
  duels_won INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  league_id UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start_date)
);

-- Enable RLS
ALTER TABLE public.weekly_leaderboards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Weekly leaderboards are viewable by everyone" 
ON public.weekly_leaderboards 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own weekly leaderboard" 
ON public.weekly_leaderboards 
FOR ALL
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Add foreign key constraint
ALTER TABLE public.weekly_leaderboards 
ADD CONSTRAINT fk_weekly_leaderboards_user 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_weekly_leaderboards_updated_at
BEFORE UPDATE ON public.weekly_leaderboards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get or create weekly leaderboard entry
CREATE OR REPLACE FUNCTION public.get_or_create_weekly_entry(profile_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_week_start DATE;
  leaderboard_id UUID;
BEGIN
  -- Get current week start (Monday)
  current_week_start := date_trunc('week', CURRENT_DATE)::DATE;
  
  -- Try to get existing entry
  SELECT id INTO leaderboard_id
  FROM public.weekly_leaderboards
  WHERE user_id = profile_id AND week_start_date = current_week_start;
  
  -- Create if doesn't exist
  IF leaderboard_id IS NULL THEN
    INSERT INTO public.weekly_leaderboards (user_id, week_start_date)
    VALUES (profile_id, current_week_start)
    RETURNING id INTO leaderboard_id;
  END IF;
  
  RETURN leaderboard_id;
END;
$$;