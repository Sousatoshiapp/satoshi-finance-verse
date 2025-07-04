-- Create avatars table for the marketplace
CREATE TABLE public.avatars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  rarity TEXT NOT NULL DEFAULT 'common',
  level_required INTEGER NOT NULL DEFAULT 1,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_avatars table to track owned avatars
CREATE TABLE public.user_avatars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  avatar_id UUID NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, avatar_id)
);

-- Enable RLS
ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_avatars ENABLE ROW LEVEL SECURITY;

-- Policies for avatars (public read)
CREATE POLICY "Avatars are viewable by everyone"
ON public.avatars 
FOR SELECT 
USING (true);

-- Policies for user_avatars
CREATE POLICY "Users can view their own avatars"
ON public.user_avatars 
FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own avatars"
ON public.user_avatars 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own avatars"
ON public.user_avatars 
FOR UPDATE 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Add avatar_id to profiles table
ALTER TABLE public.profiles ADD COLUMN avatar_id UUID REFERENCES avatars(id);

-- Insert the avatars from the uploaded images
INSERT INTO public.avatars (name, description, image_url, price, rarity, level_required) VALUES
('Satoshi Crypto Warrior', 'O lendário guerreiro digital com tecnologia avançada', '/lovable-uploads/01236e3b-e983-4249-8813-cbf166e1ad4b.png', 500, 'legendary', 10),
('Touro Investidor', 'Poderoso touro com armadura high-tech para dominar o mercado', '/lovable-uploads/15a107ba-3a0a-496f-bc89-575338ce86b9.png', 800, 'epic', 15),
('Unicórnio Estrategista', 'Místico unicórnio com asas tecnológicas e poderes de análise', '/lovable-uploads/af2a72fc-628e-4132-83e8-c79356163493.png', 1000, 'legendary', 20),
('Urso Analista', 'Especialista em análise de mercado com equipamentos de ponta', '/lovable-uploads/f4dd3e18-38d3-4b02-ba88-59aa36580d66.png', 300, 'rare', 5),
('Hacker Financeiro', 'Jovem prodígio das finanças digitais', '/lovable-uploads/2a6fc7d6-7ba5-4422-999b-e0a0418de38b.png', 200, 'common', 1),
('Cyborg Bitcoin', 'Ser cibernético especializado em criptomoedas', '/lovable-uploads/f80c1ede-597d-4c56-8227-24d048b3a704.png', 600, 'epic', 12),
('Soldado Crypto', 'Guerreiro das batalhas financeiras modernas', '/lovable-uploads/91c814aa-1ae6-4fdd-8678-2caf88401858.png', 400, 'rare', 8),
('Ninja Financeira', 'Especialista em investimentos stealth com katana tech', '/lovable-uploads/5e797ee2-1c1c-475a-be7a-3f5d3ea33045.png', 700, 'epic', 14),
('Punk Trader', 'Rebelde dos mercados com estilo único', '/lovable-uploads/9bc56377-946d-4528-8e16-916068c59e02.png', 350, 'rare', 6),
('Analista Cyber', 'Especialista em análise técnica do futuro', '/lovable-uploads/84ec18be-312b-4a14-92cb-823bcfa4f38e.png', 450, 'rare', 9);

-- Create trigger for avatar updated_at
CREATE TRIGGER update_avatars_updated_at
  BEFORE UPDATE ON public.avatars
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add points system to profiles for purchases
ALTER TABLE public.profiles ADD COLUMN points INTEGER NOT NULL DEFAULT 0;

-- Give existing users some starting points
UPDATE public.profiles SET points = 1000 WHERE points = 0;