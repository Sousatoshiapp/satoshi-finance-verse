-- Create social features tables

-- User follows table
CREATE TABLE public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- User likes table (for posts, portfolios, etc)
CREATE TABLE public.user_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_type TEXT NOT NULL, -- 'profile', 'portfolio', 'post'
  target_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, target_type, target_id)
);

-- Activity feed table
CREATE TABLE public.activity_feed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL, -- 'follow', 'like', 'create_portfolio', 'achievement'
  activity_data JSONB DEFAULT '{}'::jsonb,
  target_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Investment portfolios table
CREATE TABLE public.portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  district_theme TEXT,
  initial_balance DECIMAL(15,2) NOT NULL DEFAULT 10000.00,
  current_balance DECIMAL(15,2) NOT NULL DEFAULT 10000.00,
  performance_percentage DECIMAL(8,4) DEFAULT 0.0000,
  likes_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Portfolio holdings table
CREATE TABLE public.portfolio_holdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL,
  asset_symbol TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL, -- 'stock', 'crypto', 'fund', 'bond'
  quantity DECIMAL(15,8) NOT NULL,
  avg_price DECIMAL(15,2) NOT NULL,
  current_price DECIMAL(15,2),
  total_value DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Market events table (for simulated market crashes, etc)
CREATE TABLE public.market_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL, -- 'crash', 'boom', 'sector_impact', 'crypto_volatility'
  impact_percentage DECIMAL(8,4) NOT NULL, -- -50.00 to +50.00
  affected_assets TEXT[], -- asset symbols affected
  is_active BOOLEAN NOT NULL DEFAULT false,
  duration_hours INTEGER DEFAULT 24,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  activated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_follows
CREATE POLICY "Users can view follows" ON public.user_follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON public.user_follows
  FOR INSERT WITH CHECK (
    follower_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can unfollow" ON public.user_follows
  FOR DELETE USING (
    follower_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- RLS Policies for user_likes
CREATE POLICY "Users can view likes" ON public.user_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like content" ON public.user_likes
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can unlike content" ON public.user_likes
  FOR DELETE USING (
    user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- RLS Policies for activity_feed
CREATE POLICY "Users can view their activity and followed users" ON public.activity_feed
  FOR SELECT USING (
    user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    user_id IN (
      SELECT following_id FROM user_follows 
      WHERE follower_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create their activity" ON public.activity_feed
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- RLS Policies for portfolios
CREATE POLICY "Users can view public portfolios and their own" ON public.portfolios
  FOR SELECT USING (
    is_public = true OR 
    user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create their own portfolios" ON public.portfolios
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own portfolios" ON public.portfolios
  FOR UPDATE USING (
    user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their own portfolios" ON public.portfolios
  FOR DELETE USING (
    user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- RLS Policies for portfolio_holdings
CREATE POLICY "Users can view holdings of accessible portfolios" ON public.portfolio_holdings
  FOR SELECT USING (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE 
      is_public = true OR 
      user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage their portfolio holdings" ON public.portfolio_holdings
  FOR ALL USING (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE 
      user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

-- RLS Policies for market_events (public read-only)
CREATE POLICY "Everyone can view active market events" ON public.market_events
  FOR SELECT USING (is_active = true);

-- Add foreign key constraints
ALTER TABLE public.user_follows
  ADD CONSTRAINT fk_user_follows_follower 
  FOREIGN KEY (follower_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.user_follows
  ADD CONSTRAINT fk_user_follows_following 
  FOREIGN KEY (following_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.user_likes
  ADD CONSTRAINT fk_user_likes_user 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.activity_feed
  ADD CONSTRAINT fk_activity_feed_user 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.activity_feed
  ADD CONSTRAINT fk_activity_feed_target_user 
  FOREIGN KEY (target_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.portfolios
  ADD CONSTRAINT fk_portfolios_user 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.portfolio_holdings
  ADD CONSTRAINT fk_portfolio_holdings_portfolio 
  FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows(following_id);
CREATE INDEX idx_user_likes_user ON public.user_likes(user_id);
CREATE INDEX idx_user_likes_target ON public.user_likes(target_type, target_id);
CREATE INDEX idx_activity_feed_user ON public.activity_feed(user_id);
CREATE INDEX idx_activity_feed_created ON public.activity_feed(created_at DESC);
CREATE INDEX idx_portfolios_user ON public.portfolios(user_id);
CREATE INDEX idx_portfolios_public ON public.portfolios(is_public) WHERE is_public = true;
CREATE INDEX idx_portfolio_holdings_portfolio ON public.portfolio_holdings(portfolio_id);
CREATE INDEX idx_market_events_active ON public.market_events(is_active) WHERE is_active = true;

-- Add triggers for updated_at
CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON public.portfolios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_holdings_updated_at
  BEFORE UPDATE ON public.portfolio_holdings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();