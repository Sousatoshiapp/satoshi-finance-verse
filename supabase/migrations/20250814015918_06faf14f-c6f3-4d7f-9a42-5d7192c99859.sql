-- FASE 3: FOMO Features Database Tables

-- FOMO Events table for limited time challenges and events
CREATE TABLE public.fomo_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('flash_sale', 'limited_challenge', 'exclusive_item', 'secret_achievement')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  remaining_count INTEGER,
  max_count INTEGER,
  reward_btz INTEGER NOT NULL DEFAULT 0,
  reward_items TEXT[],
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 10),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Daily Shop Items for FOMO shopping
CREATE TABLE public.daily_shop_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price_btz INTEGER NOT NULL,
  original_price INTEGER,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  category TEXT NOT NULL CHECK (category IN ('avatar', 'power_up', 'cosmetic', 'exclusive')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  remaining_stock INTEGER,
  is_flash_sale BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Secret Achievements
CREATE TABLE public.user_secret_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trigger TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward_btz INTEGER NOT NULL DEFAULT 0,
  discovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fomo_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_secret_achievements ENABLE ROW LEVEL SECURITY;

-- FOMO Events policies (public read for active events)
CREATE POLICY "FOMO events are viewable by everyone" 
ON public.fomo_events 
FOR SELECT 
USING (is_active = true);

-- Daily shop policies (public read)
CREATE POLICY "Daily shop items are viewable by everyone" 
ON public.daily_shop_items 
FOR SELECT 
USING (expires_at > now());

-- Secret achievements policies
CREATE POLICY "Users can view their own secret achievements" 
ON public.user_secret_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own secret achievements" 
ON public.user_secret_achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);