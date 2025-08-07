-- 1. Create bots table for fallback opponents
CREATE TABLE IF NOT EXISTS public.btc_bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) NOT NULL,
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  min_bet_amount INTEGER DEFAULT 100,
  max_bet_amount INTEGER DEFAULT 5000,
  win_rate DECIMAL(3,2) DEFAULT 0.50,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.btc_bots ENABLE ROW LEVEL SECURITY;

-- RLS policies for btc_bots (read-only for all authenticated users)
CREATE POLICY "Anyone can view active bots" ON public.btc_bots
  FOR SELECT USING (is_active = true);