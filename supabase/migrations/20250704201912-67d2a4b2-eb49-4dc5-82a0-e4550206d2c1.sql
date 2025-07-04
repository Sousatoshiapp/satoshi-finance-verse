-- Create products table for general marketplace items
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'boost',
  rarity TEXT NOT NULL DEFAULT 'common',
  level_required INTEGER NOT NULL DEFAULT 1,
  is_available BOOLEAN NOT NULL DEFAULT true,
  effects JSONB DEFAULT '{}',
  duration_hours INTEGER DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_products table to track owned products
CREATE TABLE public.user_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_products ENABLE ROW LEVEL SECURITY;

-- Policies for products (public read)
CREATE POLICY "Products are viewable by everyone"
ON public.products 
FOR SELECT 
USING (true);

-- Policies for user_products
CREATE POLICY "Users can view their own products"
ON public.user_products 
FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own products"
ON public.user_products 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own products"
ON public.user_products 
FOR UPDATE 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Insert marketplace products
INSERT INTO public.products (name, description, price, category, rarity, level_required, effects, duration_hours) VALUES
-- Boosts
('XP em Dobro', 'Duplica toda experiência ganha por 24 horas', 150, 'boost', 'rare', 1, '{"xp_multiplier": 2}', 24),
('Protetor de Sequência', 'Protege sua sequência por 3 dias se você perder um dia', 200, 'boost', 'epic', 3, '{"streak_protection": true}', 72),
('Chuva de Pontos', 'Ganhe 500 pontos instantaneamente', 100, 'boost', 'common', 1, '{"instant_points": 500}', NULL),
('Mega XP', 'Triplica XP por 12 horas - muito raro!', 400, 'boost', 'legendary', 10, '{"xp_multiplier": 3}', 12),
('Energia Infinita', 'Respostas ilimitadas em quizzes por 6 horas', 250, 'boost', 'epic', 5, '{"unlimited_energy": true}', 6),

-- Cosméticos
('Tema Dourado Premium', 'Interface dourada luxuosa', 300, 'cosmetic', 'epic', 8, '{"theme": "golden"}', NULL),
('Tema Neon Cyber', 'Visual futurista com neons', 350, 'cosmetic', 'epic', 10, '{"theme": "neon"}', NULL),
('Pack Animações VIP', 'Animações exclusivas e efeitos especiais', 180, 'cosmetic', 'rare', 5, '{"animations": "vip"}', NULL),
('Título: Mestre Financeiro', 'Título exclusivo para seu perfil', 500, 'cosmetic', 'legendary', 15, '{"title": "Mestre Financeiro"}', NULL),

-- Utilidades
('Dica Especial', 'Receba uma dica valiosa em qualquer quiz', 50, 'utility', 'common', 1, '{"quiz_hint": true}', NULL),
('Passe Livre', 'Pule uma pergunta difícil sem penalidade', 120, 'utility', 'rare', 3, '{"skip_question": true}', NULL),
('Vida Extra', 'Uma chance extra se errar em duelos', 80, 'utility', 'common', 2, '{"extra_life": true}', NULL),
('Análise de Perfil', 'Veja estatísticas detalhadas de outros jogadores', 200, 'utility', 'rare', 7, '{"profile_analysis": true}', NULL);

-- Create trigger for products updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();