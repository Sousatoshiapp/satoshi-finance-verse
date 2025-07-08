-- Add district-specific exclusivity to avatars and products
ALTER TABLE public.avatars ADD COLUMN IF NOT EXISTS is_district_exclusive BOOLEAN DEFAULT FALSE;
ALTER TABLE public.avatars ADD COLUMN IF NOT EXISTS exclusive_district_id UUID REFERENCES public.districts(id);
ALTER TABLE public.avatars ADD COLUMN IF NOT EXISTS unlock_requirements JSONB DEFAULT '{}';

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_district_exclusive BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS exclusive_district_id UUID REFERENCES public.districts(id);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sponsor_branded BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unlock_requirements JSONB DEFAULT '{}';

-- Create district store items table for sponsor-branded content
CREATE TABLE IF NOT EXISTS public.district_store_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID REFERENCES public.districts(id) NOT NULL,
  item_type TEXT NOT NULL, -- 'avatar', 'accessory', 'boost', 'uniform'
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price_beetz INTEGER DEFAULT 0,
  price_real_money DECIMAL(10,2) DEFAULT 0,
  sponsor_branded BOOLEAN DEFAULT FALSE,
  unlock_requirements JSONB DEFAULT '{}', -- level, residence_days, etc.
  is_available BOOLEAN DEFAULT TRUE,
  rarity TEXT DEFAULT 'common',
  effects JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user purchases table
CREATE TABLE IF NOT EXISTS public.user_store_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.district_store_items(id) NOT NULL,
  district_id UUID REFERENCES public.districts(id) NOT NULL,
  purchase_type TEXT NOT NULL, -- 'beetz', 'real_money', 'unlock'
  amount_paid DECIMAL(10,2) DEFAULT 0,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Enable RLS
ALTER TABLE public.district_store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_store_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for district_store_items
CREATE POLICY "Store items are viewable by everyone" ON public.district_store_items FOR SELECT USING (is_available = true);

-- RLS Policies for user_store_purchases
CREATE POLICY "Users can view their own purchases" ON public.user_store_purchases FOR SELECT
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own purchases" ON public.user_store_purchases FOR INSERT
WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Insert sample district-exclusive items
INSERT INTO public.district_store_items (district_id, item_type, name, description, price_beetz, sponsor_branded, unlock_requirements, rarity, effects) 
SELECT 
  d.id,
  'uniform',
  d.sponsor_company || ' Elite Uniform',
  'Uniforme exclusivo dos residentes de ' || d.name,
  2500,
  TRUE,
  jsonb_build_object('residence_required', true, 'min_days', 7),
  'rare',
  jsonb_build_object('xp_bonus', 0.15, 'prestige', 10)
FROM public.districts d 
WHERE d.sponsor_company IS NOT NULL
ON CONFLICT DO NOTHING;

-- Insert district-exclusive avatars
INSERT INTO public.district_store_items (district_id, item_type, name, description, price_beetz, unlock_requirements, rarity, effects)
SELECT 
  d.id,
  'avatar',
  'Guardian of ' || d.name,
  'Avatar exclusivo para defensores de ' || d.name,
  5000,
  jsonb_build_object('residence_required', true, 'min_level', 10, 'battles_won', 3),
  'legendary',
  jsonb_build_object('power_bonus', 0.20, 'special_ability', 'district_champion')
FROM public.districts d
ON CONFLICT DO NOTHING;