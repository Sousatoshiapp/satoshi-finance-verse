-- Sistema de Duelos Inteligente e Melhorias

-- 1. Fila de duelos (para matching automático)
CREATE TABLE IF NOT EXISTS public.duel_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  preferred_topic TEXT DEFAULT 'financas',
  skill_level INTEGER DEFAULT 1,
  district_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '5 minutes'),
  is_active BOOLEAN DEFAULT true
);

-- 2. Sistema de bot automático para duelos
CREATE TABLE IF NOT EXISTS public.bot_duel_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_profile_id UUID NOT NULL,
  difficulty_level INTEGER DEFAULT 1, -- 1-5 (fácil a muito difícil)
  response_time_min INTEGER DEFAULT 2000, -- ms
  response_time_max INTEGER DEFAULT 8000, -- ms
  accuracy_percentage NUMERIC DEFAULT 0.70, -- 70% de acerto
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Sistema de torneios automáticos melhorado
CREATE TABLE IF NOT EXISTS public.automated_tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  tournament_type TEXT DEFAULT 'daily', -- daily, weekly, special
  start_time TIME NOT NULL,
  duration_hours INTEGER DEFAULT 2,
  max_participants INTEGER DEFAULT 64,
  entry_cost INTEGER DEFAULT 0, -- beetz
  prize_pool JSONB DEFAULT '{"first": 1000, "second": 500, "third": 250}',
  questions_per_match INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Participações em torneios automáticos
CREATE TABLE IF NOT EXISTS public.tournament_participations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL,
  user_id UUID NOT NULL,
  bracket_position INTEGER,
  current_round INTEGER DEFAULT 1,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  is_eliminated BOOLEAN DEFAULT false,
  final_position INTEGER,
  prizes_won JSONB DEFAULT '{}',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

-- 5. Playground - Trading virtual melhorado
CREATE TABLE IF NOT EXISTS public.virtual_portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Meu Portfolio',
  initial_balance NUMERIC DEFAULT 100000.00,
  current_balance NUMERIC DEFAULT 100000.00,
  total_invested NUMERIC DEFAULT 0.00,
  portfolio_value NUMERIC DEFAULT 100000.00,
  profit_loss NUMERIC DEFAULT 0.00,
  profit_loss_percentage NUMERIC DEFAULT 0.00,
  trades_count INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  best_trade_profit NUMERIC DEFAULT 0.00,
  worst_trade_loss NUMERIC DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Assets virtuais para trading
CREATE TABLE IF NOT EXISTS public.virtual_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'crypto', -- crypto, stock, forex, commodity
  current_price NUMERIC NOT NULL DEFAULT 100.00,
  price_change_24h NUMERIC DEFAULT 0.00,
  price_change_percentage_24h NUMERIC DEFAULT 0.00,
  volatility_level INTEGER DEFAULT 3, -- 1-5
  is_active BOOLEAN DEFAULT true,
  market_cap NUMERIC,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Holdings do portfolio virtual
CREATE TABLE IF NOT EXISTS public.virtual_holdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL,
  asset_id UUID NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  avg_buy_price NUMERIC NOT NULL DEFAULT 0,
  total_invested NUMERIC NOT NULL DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  profit_loss NUMERIC DEFAULT 0,
  profit_loss_percentage NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(portfolio_id, asset_id)
);

-- 8. Histórico de trades virtuais
CREATE TABLE IF NOT EXISTS public.virtual_trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL,
  asset_id UUID NOT NULL,
  trade_type TEXT NOT NULL, -- buy, sell
  quantity NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  fees NUMERIC DEFAULT 0,
  profit_loss NUMERIC DEFAULT 0,
  notes TEXT,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. Market events para afetar preços
CREATE TABLE IF NOT EXISTS public.virtual_market_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'news', -- news, economic, technical
  affected_assets TEXT[] DEFAULT '{}',
  price_impact_percentage NUMERIC DEFAULT 0, -- pode ser positivo ou negativo
  duration_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT false,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 10. Leaderboards de trading
CREATE TABLE IF NOT EXISTS public.trading_leaderboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  portfolio_id UUID NOT NULL,
  timeframe TEXT DEFAULT 'weekly', -- daily, weekly, monthly, all_time
  period_start DATE NOT NULL,
  period_end DATE,
  starting_balance NUMERIC DEFAULT 100000.00,
  ending_balance NUMERIC DEFAULT 100000.00,
  profit_loss NUMERIC DEFAULT 0.00,
  profit_loss_percentage NUMERIC DEFAULT 0.00,
  trades_count INTEGER DEFAULT 0,
  win_rate NUMERIC DEFAULT 0.00,
  rank_position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, timeframe, period_start)
);

-- Enable RLS
ALTER TABLE public.duel_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_duel_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_market_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_leaderboards ENABLE ROW LEVEL SECURITY;

-- RLS Policies para duel_queue
CREATE POLICY "Users can manage their own duel queue" ON public.duel_queue
FOR ALL USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view active duel queue" ON public.duel_queue
FOR SELECT USING (is_active = true);

-- RLS Policies para bot_duel_configs
CREATE POLICY "Bot configs are viewable by everyone" ON public.bot_duel_configs
FOR SELECT USING (is_active = true);

-- RLS Policies para automated_tournaments
CREATE POLICY "Tournaments are viewable by everyone" ON public.automated_tournaments
FOR SELECT USING (is_active = true);

-- RLS Policies para tournament_participations
CREATE POLICY "Users can manage their tournament participations" ON public.tournament_participations
FOR ALL USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Tournament participations are viewable by everyone" ON public.tournament_participations
FOR SELECT USING (true);

-- RLS Policies para virtual_portfolios
CREATE POLICY "Users can manage their own portfolios" ON public.virtual_portfolios
FOR ALL USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies para virtual_assets
CREATE POLICY "Virtual assets are viewable by everyone" ON public.virtual_assets
FOR SELECT USING (is_active = true);

-- RLS Policies para virtual_holdings
CREATE POLICY "Users can manage their portfolio holdings" ON public.virtual_holdings
FOR ALL USING (portfolio_id IN (
  SELECT id FROM public.virtual_portfolios 
  WHERE user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
));

-- RLS Policies para virtual_trades
CREATE POLICY "Users can manage their trades" ON public.virtual_trades
FOR ALL USING (portfolio_id IN (
  SELECT id FROM public.virtual_portfolios 
  WHERE user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
));

CREATE POLICY "Users can view all trades for leaderboards" ON public.virtual_trades
FOR SELECT USING (true);

-- RLS Policies para virtual_market_events
CREATE POLICY "Market events are viewable by everyone" ON public.virtual_market_events
FOR SELECT USING (true);

-- RLS Policies para trading_leaderboards
CREATE POLICY "Trading leaderboards are viewable by everyone" ON public.trading_leaderboards
FOR SELECT USING (true);

CREATE POLICY "Users can manage their leaderboard entries" ON public.trading_leaderboards
FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_virtual_portfolios_updated_at BEFORE UPDATE ON public.virtual_portfolios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_virtual_assets_updated_at BEFORE UPDATE ON public.virtual_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_virtual_holdings_updated_at BEFORE UPDATE ON public.virtual_holdings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir alguns assets virtuais iniciais
INSERT INTO public.virtual_assets (symbol, name, category, current_price, volatility_level, description) VALUES
('BTC', 'Bitcoin', 'crypto', 45000.00, 4, 'A primeira e maior criptomoeda do mundo'),
('ETH', 'Ethereum', 'crypto', 3000.00, 4, 'Plataforma de contratos inteligentes'),
('AAPL', 'Apple Inc.', 'stock', 175.00, 2, 'Empresa de tecnologia multinacional'),
('TSLA', 'Tesla Inc.', 'stock', 250.00, 5, 'Fabricante de veículos elétricos'),
('GOLD', 'Ouro', 'commodity', 2000.00, 2, 'Metal precioso tradicional'),
('EURUSD', 'Euro/Dólar', 'forex', 1.0850, 3, 'Par de moedas mais negociado'),
('SPY', 'S&P 500 ETF', 'stock', 450.00, 3, 'ETF que rastreia o índice S&P 500'),
('NVDA', 'NVIDIA Corp.', 'stock', 450.00, 5, 'Líder em chips de IA e gráficos'),
('AMZN', 'Amazon.com Inc.', 'stock', 140.00, 3, 'Gigante do e-commerce e cloud'),
('GOOGL', 'Alphabet Inc.', 'stock', 140.00, 3, 'Empresa-mãe do Google');

-- Inserir configurações de bots automáticos
INSERT INTO public.bot_duel_configs (bot_profile_id, difficulty_level, accuracy_percentage, response_time_min, response_time_max)
SELECT 
  id,
  CASE 
    WHEN level <= 10 THEN 1
    WHEN level <= 20 THEN 2
    WHEN level <= 30 THEN 3
    WHEN level <= 40 THEN 4
    ELSE 5
  END,
  CASE 
    WHEN level <= 10 THEN 0.60
    WHEN level <= 20 THEN 0.70
    WHEN level <= 30 THEN 0.80
    WHEN level <= 40 THEN 0.85
    ELSE 0.90
  END,
  2000,
  8000
FROM public.profiles 
WHERE is_bot = true;

-- Inserir torneios automáticos
INSERT INTO public.automated_tournaments (name, description, tournament_type, start_time, duration_hours, max_participants, prize_pool) VALUES
('Torneio Diário Matutino', 'Compete todas as manhãs no torneio de finanças', 'daily', '09:00', 2, 32, '{"first": 1000, "second": 500, "third": 250, "participation": 50}'),
('Torneio Diário Vespertino', 'Torneio de tarde para warriors urbanos', 'daily', '15:00', 2, 32, '{"first": 1000, "second": 500, "third": 250, "participation": 50}'),
('Torneio Diário Noturno', 'Desafie a noite cyberpunk', 'daily', '20:00', 3, 64, '{"first": 2000, "second": 1000, "third": 500, "participation": 100}'),
('Mega Torneio Semanal', 'O maior desafio da semana', 'weekly', '19:00', 4, 128, '{"first": 5000, "second": 3000, "third": 1500, "top10": 500}');

-- Função para encontrar oponente automático
CREATE OR REPLACE FUNCTION public.find_automatic_opponent(p_user_id UUID, p_topic TEXT DEFAULT 'financas')
RETURNS TABLE(opponent_id UUID, opponent_type TEXT, match_found BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_level INTEGER;
  found_user_id UUID;
  bot_id UUID;
BEGIN
  -- Buscar level do usuário
  SELECT level INTO user_level
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Primeiro, tentar encontrar usuário real na fila
  SELECT user_id INTO found_user_id
  FROM public.duel_queue
  WHERE user_id != p_user_id 
  AND preferred_topic = p_topic
  AND is_active = true
  AND expires_at > now()
  ORDER BY created_at ASC
  LIMIT 1;
  
  IF found_user_id IS NOT NULL THEN
    -- Remove ambos da fila
    DELETE FROM public.duel_queue WHERE user_id IN (p_user_id, found_user_id);
    
    RETURN QUERY SELECT found_user_id, 'human'::TEXT, true;
    RETURN;
  END IF;
  
  -- Se não encontrou usuário real, buscar bot compatível
  SELECT bdc.bot_profile_id INTO bot_id
  FROM public.bot_duel_configs bdc
  JOIN public.profiles p ON bdc.bot_profile_id = p.id
  WHERE p.is_bot = true 
  AND bdc.is_active = true
  AND ABS(p.level - user_level) <= 5 -- Bots com nível similar
  ORDER BY RANDOM()
  LIMIT 1;
  
  IF bot_id IS NOT NULL THEN
    -- Remove usuário da fila
    DELETE FROM public.duel_queue WHERE user_id = p_user_id;
    
    RETURN QUERY SELECT bot_id, 'bot'::TEXT, true;
    RETURN;
  END IF;
  
  -- Se não encontrou nada, adicionar à fila
  INSERT INTO public.duel_queue (user_id, preferred_topic, skill_level)
  VALUES (p_user_id, p_topic, user_level)
  ON CONFLICT (user_id) DO UPDATE SET
    preferred_topic = EXCLUDED.preferred_topic,
    skill_level = EXCLUDED.skill_level,
    created_at = now(),
    expires_at = now() + INTERVAL '5 minutes';
  
  RETURN QUERY SELECT NULL::UUID, 'waiting'::TEXT, false;
END;
$$;