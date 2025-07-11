-- BTZ Monetary System - Complete Implementation
-- Add new fields to profiles table for BTZ economics
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_yield_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS protected_btz INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS yield_rate DECIMAL(4,3) DEFAULT 0.005,
ADD COLUMN IF NOT EXISTS last_login_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS consecutive_login_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_yield_earned INTEGER DEFAULT 0;

-- Create BTZ yield history table
CREATE TABLE IF NOT EXISTS public.btz_yield_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  yield_amount INTEGER NOT NULL,
  btz_before INTEGER NOT NULL,
  btz_after INTEGER NOT NULL,
  yield_rate DECIMAL(4,3) NOT NULL,
  streak_bonus DECIMAL(4,3) DEFAULT 0,
  subscription_bonus DECIMAL(4,3) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create BTZ penalty history table  
CREATE TABLE IF NOT EXISTS public.btz_penalty_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  penalty_amount INTEGER NOT NULL,
  days_inactive INTEGER NOT NULL,
  penalty_rate DECIMAL(4,3) NOT NULL,
  btz_before INTEGER NOT NULL,
  btz_after INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.btz_yield_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.btz_penalty_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for yield history
CREATE POLICY "Users can view their own yield history" 
ON public.btz_yield_history FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can insert yield history" 
ON public.btz_yield_history FOR INSERT 
WITH CHECK (true);

-- RLS policies for penalty history
CREATE POLICY "Users can view their own penalty history" 
ON public.btz_penalty_history FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can insert penalty history" 
ON public.btz_penalty_history FOR INSERT 
WITH CHECK (true);

-- Function to calculate daily yield
CREATE OR REPLACE FUNCTION public.calculate_daily_yield(profile_id UUID)
RETURNS TABLE(yield_applied BOOLEAN, yield_amount INTEGER, new_total INTEGER, streak_bonus DECIMAL)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_record RECORD;
  base_rate DECIMAL(4,3) := 0.005; -- 0.5% base rate
  subscription_bonus DECIMAL(4,3) := 0;
  streak_multiplier DECIMAL(4,3) := 0;
  total_yield_rate DECIMAL(4,3);
  calculated_yield INTEGER;
  new_protected_btz INTEGER;
BEGIN
  -- Get user data
  SELECT * INTO user_record 
  FROM profiles 
  WHERE id = profile_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 0, 0.0;
    RETURN;
  END IF;
  
  -- Check if yield already applied today
  IF user_record.last_yield_date = CURRENT_DATE THEN
    RETURN QUERY SELECT false, 0, user_record.points, 0.0;
    RETURN;
  END IF;
  
  -- Calculate subscription bonus
  CASE user_record.subscription_tier
    WHEN 'pro' THEN subscription_bonus := 0.005; -- +0.5%
    WHEN 'elite' THEN subscription_bonus := 0.010; -- +1.0%
    ELSE subscription_bonus := 0;
  END CASE;
  
  -- Calculate streak bonus (+0.1% for every 5 days, max +1.5%)
  streak_multiplier := LEAST(0.015, (user_record.consecutive_login_days / 5) * 0.001);
  
  -- Total yield rate
  total_yield_rate := base_rate + subscription_bonus + streak_multiplier;
  
  -- Calculate yield amount
  calculated_yield := FLOOR(user_record.points * total_yield_rate);
  
  -- Minimum yield of 1 BTZ if user has any BTZ
  IF user_record.points > 0 AND calculated_yield = 0 THEN
    calculated_yield := 1;
  END IF;
  
  -- Update user BTZ and protected BTZ
  new_protected_btz := FLOOR((user_record.points + calculated_yield) * 0.20);
  
  UPDATE profiles 
  SET 
    points = points + calculated_yield,
    protected_btz = GREATEST(protected_btz, new_protected_btz),
    last_yield_date = CURRENT_DATE,
    total_yield_earned = total_yield_earned + calculated_yield
  WHERE id = profile_id;
  
  -- Record yield history
  INSERT INTO btz_yield_history (
    user_id, yield_amount, btz_before, btz_after, 
    yield_rate, streak_bonus, subscription_bonus
  ) VALUES (
    profile_id, calculated_yield, user_record.points, 
    user_record.points + calculated_yield, total_yield_rate, 
    streak_multiplier, subscription_bonus
  );
  
  RETURN QUERY SELECT true, calculated_yield, user_record.points + calculated_yield, streak_multiplier;
END;
$$;

-- Function to apply BTZ penalty for inactivity
CREATE OR REPLACE FUNCTION public.apply_btz_penalty(profile_id UUID)
RETURNS TABLE(penalty_applied BOOLEAN, penalty_amount INTEGER, days_inactive INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_record RECORD;
  inactive_days INTEGER;
  penalty_rate DECIMAL(4,3) := 0;
  calculated_penalty INTEGER;
  unprotected_btz INTEGER;
BEGIN
  -- Get user data
  SELECT * INTO user_record 
  FROM profiles 
  WHERE id = profile_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 0;
    RETURN;
  END IF;
  
  -- Calculate days inactive
  inactive_days := CURRENT_DATE - user_record.last_login_date;
  
  -- No penalty for 1 day or less
  IF inactive_days <= 1 THEN
    RETURN QUERY SELECT false, 0, inactive_days;
    RETURN;
  END IF;
  
  -- Set penalty rate based on days inactive
  CASE 
    WHEN inactive_days BETWEEN 2 AND 3 THEN penalty_rate := 0.01; -- 1%
    WHEN inactive_days BETWEEN 4 AND 7 THEN penalty_rate := 0.02; -- 2%
    WHEN inactive_days >= 8 THEN penalty_rate := 0.05; -- 5%
  END CASE;
  
  -- Calculate unprotected BTZ (can be lost)
  unprotected_btz := GREATEST(0, user_record.points - user_record.protected_btz);
  
  -- Calculate penalty amount
  calculated_penalty := FLOOR(unprotected_btz * penalty_rate);
  
  -- Apply penalty if any
  IF calculated_penalty > 0 THEN
    UPDATE profiles 
    SET points = GREATEST(protected_btz, points - calculated_penalty)
    WHERE id = profile_id;
    
    -- Record penalty history
    INSERT INTO btz_penalty_history (
      user_id, penalty_amount, days_inactive, penalty_rate,
      btz_before, btz_after
    ) VALUES (
      profile_id, calculated_penalty, inactive_days, penalty_rate,
      user_record.points, user_record.points - calculated_penalty
    );
  END IF;
  
  RETURN QUERY SELECT calculated_penalty > 0, calculated_penalty, inactive_days;
END;
$$;

-- Function to update login streak
CREATE OR REPLACE FUNCTION public.update_login_streak(profile_id UUID)
RETURNS TABLE(streak_updated BOOLEAN, new_streak INTEGER, yield_bonus DECIMAL)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_record RECORD;
  new_streak_count INTEGER;
  days_since_last_login INTEGER;
BEGIN
  -- Get user data
  SELECT * INTO user_record 
  FROM profiles 
  WHERE id = profile_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 0.0;
    RETURN;
  END IF;
  
  days_since_last_login := CURRENT_DATE - user_record.last_login_date;
  
  -- Update streak based on login pattern
  CASE
    WHEN days_since_last_login = 0 THEN 
      -- Same day login, no change
      new_streak_count := user_record.consecutive_login_days;
    WHEN days_since_last_login = 1 THEN 
      -- Consecutive day, increment streak
      new_streak_count := user_record.consecutive_login_days + 1;
    ELSE 
      -- Missed days, reset streak
      new_streak_count := 1;
  END CASE;
  
  -- Update user record
  UPDATE profiles 
  SET 
    last_login_date = CURRENT_DATE,
    consecutive_login_days = new_streak_count
  WHERE id = profile_id;
  
  -- Calculate yield bonus
  DECLARE
    yield_bonus_rate DECIMAL(4,3);
  BEGIN
    yield_bonus_rate := LEAST(0.015, (new_streak_count / 5) * 0.001);
    RETURN QUERY SELECT true, new_streak_count, yield_bonus_rate;
  END;
END;
$$;