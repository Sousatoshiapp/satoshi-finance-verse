-- Sistema de Vidas para BTZ Streak
CREATE TABLE IF NOT EXISTS public.user_lives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lives_count INTEGER NOT NULL DEFAULT 3,
  last_life_recovery TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_lives_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.user_lives ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own lives"
ON public.user_lives
FOR SELECT
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own lives"
ON public.user_lives
FOR UPDATE
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own lives"
ON public.user_lives
FOR INSERT
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Sistema de pacotes de vida
CREATE TABLE IF NOT EXISTS public.life_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  lives_count INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  discount_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for life packages
ALTER TABLE public.life_packages ENABLE ROW LEVEL SECURITY;

-- Life packages are viewable by everyone
CREATE POLICY "Life packages are viewable by everyone"
ON public.life_packages
FOR SELECT
USING (is_active = true);

-- Função para recuperar vidas automaticamente
CREATE OR REPLACE FUNCTION public.recover_user_lives()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  hours_since_last_recovery INTEGER;
  max_recoverable_lives INTEGER := 3;
BEGIN
  -- Calcular horas desde a última recuperação
  hours_since_last_recovery := EXTRACT(HOUR FROM (now() - NEW.last_life_recovery));
  
  -- Recuperar 1 vida a cada 8 horas, máximo 3 vidas
  IF hours_since_last_recovery >= 8 AND NEW.lives_count < max_recoverable_lives THEN
    NEW.lives_count := LEAST(max_recoverable_lives, NEW.lives_count + (hours_since_last_recovery / 8));
    NEW.last_life_recovery := now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para recuperação automática de vidas
CREATE TRIGGER auto_recover_lives
  BEFORE UPDATE ON public.user_lives
  FOR EACH ROW
  EXECUTE FUNCTION public.recover_user_lives();

-- Inserir pacotes de vida padrão
INSERT INTO public.life_packages (name, lives_count, price_cents, discount_percentage) VALUES
  ('Pacote Básico', 5, 299, 0),
  ('Pacote Premium', 15, 799, 15),
  ('Pacote Master', 30, 1499, 25),
  ('Super Combo', 50, 2199, 35)
ON CONFLICT DO NOTHING;