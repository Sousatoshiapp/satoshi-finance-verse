-- Create subscription system tables
CREATE TYPE public.subscription_tier AS ENUM ('free', 'pro', 'elite');

-- Add subscription_tier to profiles table
ALTER TABLE public.profiles 
ADD COLUMN subscription_tier subscription_tier DEFAULT 'free',
ADD COLUMN subscription_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN daily_duels_used INTEGER DEFAULT 0,
ADD COLUMN daily_duels_reset_date DATE DEFAULT CURRENT_DATE;

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.subscriptions 
FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own subscriptions" 
ON public.subscriptions 
FOR UPDATE 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own subscriptions" 
ON public.subscriptions 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier subscription_tier UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL DEFAULT 0,
  price_yearly INTEGER,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default plans
INSERT INTO public.subscription_plans (tier, name, description, price_monthly, features) VALUES
('free', 'Plano Gratuito', 'Ideal para começar sua jornada', 0, '["10 duelos por dia", "XP normal (1x)", "Avatares básicos", "Acesso a funcionalidades básicas"]'),
('pro', 'Satoshi Pro', 'Para traders sérios', 1490, '["Duelos ilimitados", "XP Boost 2x", "50 Beetz mensais", "Avatares exclusivos ⭐", "Sem anúncios", "Prioridade em torneios"]'),
('elite', 'Satoshi Elite', 'Para mestres do mercado', 2990, '["Todos benefícios Pro", "XP Boost 3x", "100 Beetz mensais", "Avatares lendários 💎", "AI Trading Advisor", "Acesso antecipado", "Relatórios personalizados"]');

-- RLS for subscription plans (public read)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subscription plans are viewable by everyone" 
ON public.subscription_plans 
FOR SELECT 
USING (true);

-- Function to check daily duel limit
CREATE OR REPLACE FUNCTION public.check_duel_limit(profile_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_tier subscription_tier;
  duels_used INTEGER;
  reset_date DATE;
BEGIN
  -- Get user subscription info
  SELECT subscription_tier, daily_duels_used, daily_duels_reset_date 
  INTO user_tier, duels_used, reset_date
  FROM public.profiles
  WHERE id = profile_id;
  
  -- Reset daily count if it's a new day
  IF reset_date < CURRENT_DATE THEN
    UPDATE public.profiles 
    SET daily_duels_used = 0, daily_duels_reset_date = CURRENT_DATE
    WHERE id = profile_id;
    duels_used := 0;
  END IF;
  
  -- Free users have limit of 10 duels per day
  IF user_tier = 'free' AND duels_used >= 10 THEN
    RETURN FALSE;
  END IF;
  
  -- Pro and Elite users have unlimited duels
  RETURN TRUE;
END;
$$;

-- Function to increment duel count
CREATE OR REPLACE FUNCTION public.increment_duel_count(profile_id uuid)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET daily_duels_used = daily_duels_used + 1
  WHERE id = profile_id;
END;
$$;

-- Function to get XP multiplier based on subscription
CREATE OR REPLACE FUNCTION public.get_xp_multiplier(profile_id uuid)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  user_tier subscription_tier;
BEGIN
  SELECT subscription_tier INTO user_tier
  FROM public.profiles
  WHERE id = profile_id;
  
  CASE user_tier
    WHEN 'pro' THEN RETURN 2;
    WHEN 'elite' THEN RETURN 3;
    ELSE RETURN 1;
  END CASE;
END;
$$;

-- Update award_xp function to use subscription multiplier
CREATE OR REPLACE FUNCTION public.award_xp(profile_id uuid, xp_amount integer, activity_type text DEFAULT 'general')
RETURNS TABLE(new_xp integer, new_level integer, level_up boolean, rewards jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_xp INTEGER;
  old_level INTEGER;
  updated_xp INTEGER;
  updated_level INTEGER;
  level_changed BOOLEAN DEFAULT FALSE;
  level_rewards JSONB DEFAULT '{}';
  xp_multiplier INTEGER;
BEGIN
  -- Get current user stats and multiplier
  SELECT xp, level INTO old_xp, old_level
  FROM public.profiles
  WHERE id = profile_id;
  
  -- Get XP multiplier based on subscription
  SELECT public.get_xp_multiplier(profile_id) INTO xp_multiplier;
  
  -- Calculate new XP with multiplier
  updated_xp := old_xp + (xp_amount * xp_multiplier);
  updated_level := public.calculate_user_level(updated_xp);
  level_changed := updated_level > old_level;
  
  -- Get rewards for new level if leveled up
  IF level_changed THEN
    SELECT level_tiers.rewards INTO level_rewards
    FROM public.level_tiers
    WHERE level_tiers.level = updated_level;
    
    -- Award beetz from level rewards
    IF level_rewards ? 'beetz' THEN
      UPDATE public.profiles 
      SET points = points + (level_rewards->>'beetz')::INTEGER
      WHERE id = profile_id;
    END IF;
    
    -- Create badge if specified in rewards
    IF level_rewards ? 'badge' THEN
      INSERT INTO public.user_badges (user_id, badge_name, badge_type, badge_description)
      VALUES (
        profile_id,
        level_rewards->>'badge',
        'level',
        'Conquistado ao alcançar nível ' || updated_level
      ) ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  -- Update user profile
  UPDATE public.profiles 
  SET 
    xp = updated_xp,
    level = updated_level,
    updated_at = NOW()
  WHERE id = profile_id;
  
  -- Log activity
  INSERT INTO public.activity_feed (user_id, activity_type, activity_data)
  VALUES (
    profile_id,
    'xp_earned',
    jsonb_build_object(
      'xp_amount', xp_amount,
      'xp_multiplier', xp_multiplier,
      'total_xp_earned', xp_amount * xp_multiplier,
      'activity_type', activity_type,
      'old_level', old_level,
      'new_level', updated_level,
      'level_up', level_changed
    )
  );
  
  RETURN QUERY SELECT updated_xp, updated_level, level_changed, level_rewards;
END;
$$;