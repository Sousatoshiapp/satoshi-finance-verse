-- FASE 2: Personalização Extrema - Complete Database Schema

-- Avatar Items (roupas, acessórios, customizações)
CREATE TABLE public.avatar_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'hair', 'clothing', 'accessories', 'eyes', 'skin'
  subcategory TEXT, -- 'shirt', 'pants', 'glasses', 'hat', etc.
  image_url TEXT NOT NULL,
  unlock_requirement JSONB NOT NULL DEFAULT '{}', -- {"type": "streak", "value": 7}
  rarity TEXT NOT NULL DEFAULT 'common', -- common, uncommon, rare, epic, legendary
  price_beetz INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Avatar Items (itens desbloqueados por usuário)
CREATE TABLE public.user_avatar_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES public.avatar_items(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unlock_method TEXT DEFAULT 'purchase', -- purchase, achievement, streak, level
  UNIQUE(user_id, item_id)
);

-- Avatar Pets/Companions
CREATE TABLE public.avatar_pets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  species TEXT NOT NULL, -- 'cat', 'dog', 'dragon', 'robot'
  evolution_stage INTEGER NOT NULL DEFAULT 1, -- 1=baby, 2=teen, 3=adult
  evolution_name TEXT NOT NULL, -- 'Baby Cat', 'Teen Cat', 'Wise Cat'
  image_url TEXT NOT NULL,
  unlock_streak_required INTEGER NOT NULL DEFAULT 0,
  special_abilities JSONB DEFAULT '{}',
  rarity TEXT NOT NULL DEFAULT 'common',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Pets
CREATE TABLE public.user_pets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pet_id UUID NOT NULL REFERENCES public.avatar_pets(id) ON DELETE CASCADE,
  current_evolution INTEGER NOT NULL DEFAULT 1,
  evolution_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT false, -- only one active pet per user
  nickname TEXT,
  acquired_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, pet_id)
);

-- Profile Banners
CREATE TABLE public.profile_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  unlock_requirement JSONB NOT NULL DEFAULT '{}',
  rarity TEXT NOT NULL DEFAULT 'common',
  is_animated BOOLEAN DEFAULT false,
  animation_data JSONB DEFAULT '{}',
  price_beetz INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Profile Banners
CREATE TABLE public.user_profile_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  banner_id UUID NOT NULL REFERENCES public.profile_banners(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unlock_method TEXT DEFAULT 'purchase',
  UNIQUE(user_id, banner_id)
);

-- Profile Titles
CREATE TABLE public.profile_titles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  unlock_requirement JSONB NOT NULL DEFAULT '{}',
  rarity TEXT NOT NULL DEFAULT 'common',
  color_scheme JSONB DEFAULT '{"primary": "#ffffff", "secondary": "#000000"}',
  is_animated BOOLEAN DEFAULT false,
  animation_type TEXT, -- 'glow', 'pulse', 'rainbow'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Profile Titles
CREATE TABLE public.user_profile_titles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title_id UUID NOT NULL REFERENCES public.profile_titles(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT false, -- only one active title per user
  unlock_method TEXT DEFAULT 'achievement',
  UNIQUE(user_id, title_id)
);

-- Profile Views (contador de visualizações)
CREATE TABLE public.profile_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  viewer_id UUID, -- null for anonymous views
  profile_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Avatar Customizations (customizações salvas do avatar)
CREATE TABLE public.avatar_customizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  avatar_data JSONB NOT NULL DEFAULT '{}', -- complete avatar configuration
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Avatar Frames (frames animados)
CREATE TABLE public.avatar_frames (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  css_class TEXT NOT NULL, -- CSS class for animation
  unlock_requirement JSONB NOT NULL DEFAULT '{}',
  rarity TEXT NOT NULL DEFAULT 'common',
  animation_type TEXT NOT NULL, -- 'pulse', 'glow', 'particles', 'rainbow'
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Avatar Frames
CREATE TABLE public.user_avatar_frames (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  frame_id UUID NOT NULL REFERENCES public.avatar_frames(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT false, -- only one active frame per user
  unlock_method TEXT DEFAULT 'achievement',
  UNIQUE(user_id, frame_id)
);

-- Enable RLS on all tables
ALTER TABLE public.avatar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_avatar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profile_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profile_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_avatar_frames ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Avatar Items
CREATE POLICY "Avatar items are viewable by everyone" ON public.avatar_items FOR SELECT USING (is_active = true);

-- RLS Policies for User Avatar Items
CREATE POLICY "Users can view their own avatar items" ON public.user_avatar_items FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert their own avatar items" ON public.user_avatar_items FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for Avatar Pets
CREATE POLICY "Avatar pets are viewable by everyone" ON public.avatar_pets FOR SELECT USING (is_active = true);

-- RLS Policies for User Pets
CREATE POLICY "Users can manage their own pets" ON public.user_pets FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for Profile Banners
CREATE POLICY "Profile banners are viewable by everyone" ON public.profile_banners FOR SELECT USING (is_active = true);

-- RLS Policies for User Profile Banners
CREATE POLICY "Users can manage their own banners" ON public.user_profile_banners FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for Profile Titles
CREATE POLICY "Profile titles are viewable by everyone" ON public.profile_titles FOR SELECT USING (is_active = true);

-- RLS Policies for User Profile Titles
CREATE POLICY "Users can manage their own titles" ON public.user_profile_titles FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for Profile Views
CREATE POLICY "Anyone can create profile views" ON public.profile_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own profile views" ON public.profile_views FOR SELECT USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for Avatar Customizations
CREATE POLICY "Users can manage their own avatar customizations" ON public.avatar_customizations FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for Avatar Frames
CREATE POLICY "Avatar frames are viewable by everyone" ON public.avatar_frames FOR SELECT USING (is_active = true);

-- RLS Policies for User Avatar Frames
CREATE POLICY "Users can manage their own frames" ON public.user_avatar_frames FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_user_avatar_items_user_id ON public.user_avatar_items(user_id);
CREATE INDEX idx_user_pets_user_id ON public.user_pets(user_id);
CREATE INDEX idx_user_profile_banners_user_id ON public.user_profile_banners(user_id);
CREATE INDEX idx_user_profile_titles_user_id ON public.user_profile_titles(user_id);
CREATE INDEX idx_profile_views_profile_id ON public.profile_views(profile_id);
CREATE INDEX idx_profile_views_viewed_at ON public.profile_views(viewed_at);
CREATE INDEX idx_avatar_customizations_user_id ON public.avatar_customizations(user_id);
CREATE INDEX idx_user_avatar_frames_user_id ON public.user_avatar_frames(user_id);

-- Add foreign key constraints
ALTER TABLE public.user_avatar_items ADD CONSTRAINT fk_user_avatar_items_user_id FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.user_pets ADD CONSTRAINT fk_user_pets_user_id FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.user_profile_banners ADD CONSTRAINT fk_user_profile_banners_user_id FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.user_profile_titles ADD CONSTRAINT fk_user_profile_titles_user_id FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.profile_views ADD CONSTRAINT fk_profile_views_profile_id FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.avatar_customizations ADD CONSTRAINT fk_avatar_customizations_user_id FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.user_avatar_frames ADD CONSTRAINT fk_user_avatar_frames_user_id FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Insert sample avatar items
INSERT INTO public.avatar_items (name, category, subcategory, image_url, unlock_requirement, rarity) VALUES
('Basic T-Shirt', 'clothing', 'shirt', '/avatar-items/basic-tshirt.png', '{"type": "default"}', 'common'),
('Cool Sunglasses', 'accessories', 'glasses', '/avatar-items/sunglasses.png', '{"type": "streak", "value": 7}', 'uncommon'),
('Golden Crown', 'accessories', 'hat', '/avatar-items/golden-crown.png', '{"type": "level", "value": 25}', 'epic'),
('Crypto Hoodie', 'clothing', 'hoodie', '/avatar-items/crypto-hoodie.png', '{"type": "quiz_perfect", "value": 10}', 'rare'),
('Diamond Earrings', 'accessories', 'earrings', '/avatar-items/diamond-earrings.png', '{"type": "points", "value": 100000}', 'legendary');

-- Insert sample pets
INSERT INTO public.avatar_pets (name, species, evolution_stage, evolution_name, image_url, unlock_streak_required, rarity) VALUES
('Baby Bitcoin Cat', 'cat', 1, 'Kitten', '/pets/btc-cat-baby.png', 0, 'common'),
('Teen Bitcoin Cat', 'cat', 2, 'Young Cat', '/pets/btc-cat-teen.png', 14, 'uncommon'),
('Wise Bitcoin Cat', 'cat', 3, 'Elder Cat', '/pets/btc-cat-adult.png', 30, 'rare'),
('Ethereum Dragon', 'dragon', 1, 'Hatchling', '/pets/eth-dragon-baby.png', 50, 'epic'),
('Satoshi Robot', 'robot', 1, 'Mark I', '/pets/satoshi-robot.png', 100, 'legendary');

-- Insert sample profile banners
INSERT INTO public.profile_banners (name, image_url, unlock_requirement, rarity) VALUES
('Financial Guru', '/banners/financial-guru.jpg', '{"type": "quiz_expertise", "value": 100}', 'rare'),
('Streak Master', '/banners/streak-master.jpg', '{"type": "streak", "value": 50}', 'epic'),
('BTZ Millionaire', '/banners/btz-millionaire.jpg', '{"type": "points", "value": 1000000}', 'legendary'),
('Crypto Scholar', '/banners/crypto-scholar.jpg', '{"type": "level", "value": 20}', 'uncommon'),
('Default Banner', '/banners/default.jpg', '{"type": "default"}', 'common');

-- Insert sample profile titles
INSERT INTO public.profile_titles (title, description, unlock_requirement, rarity, animation_type) VALUES
('The Satoshi', 'Legendary Bitcoin Expert', '{"type": "level", "value": 100}', 'legendary', 'rainbow'),
('Crypto Sensei', 'Master of Digital Assets', '{"type": "streak", "value": 100}', 'epic', 'glow'),
('BTZ Millionaire', 'Wealthy in BeetzCoins', '{"type": "points", "value": 1000000}', 'rare', 'pulse'),
('Quiz Champion', 'Perfect Quiz Master', '{"type": "quiz_perfect", "value": 25}', 'uncommon', 'glow'),
('Scholar', 'Dedicated Learner', '{"type": "level", "value": 10}', 'common', null);

-- Insert sample avatar frames
INSERT INTO public.avatar_frames (name, css_class, unlock_requirement, rarity, animation_type) VALUES
('Golden Pulse', 'avatar-frame-golden-pulse', '{"type": "streak", "value": 30}', 'epic', 'pulse'),
('Rainbow Glow', 'avatar-frame-rainbow', '{"type": "level", "value": 50}', 'legendary', 'rainbow'),
('Diamond Sparkle', 'avatar-frame-diamond', '{"type": "points", "value": 500000}', 'rare', 'particles'),
('Silver Ring', 'avatar-frame-silver', '{"type": "streak", "value": 14}', 'uncommon', 'glow'),
('Bronze Border', 'avatar-frame-bronze', '{"type": "level", "value": 5}', 'common', 'pulse');

-- Update profiles table to include new customization fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS active_banner_id UUID REFERENCES public.profile_banners(id),
ADD COLUMN IF NOT EXISTS active_title_id UUID REFERENCES public.profile_titles(id),
ADD COLUMN IF NOT EXISTS active_frame_id UUID REFERENCES public.avatar_frames(id),
ADD COLUMN IF NOT EXISTS profile_views_count INTEGER DEFAULT 0;