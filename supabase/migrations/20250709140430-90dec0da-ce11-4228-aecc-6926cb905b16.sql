-- Fase 5: Sistema de Monetização e Economia

-- Enum para tipos de produtos
CREATE TYPE product_type AS ENUM ('premium_subscription', 'beetz_pack', 'avatar', 'powerup', 'loot_box', 'course_access');

-- Enum para status de transações
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');

-- Enum para tipos de moeda
CREATE TYPE currency_type AS ENUM ('BRL', 'USD', 'EUR');

-- Tabela de produtos disponíveis para compra
CREATE TABLE public.store_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  product_type product_type NOT NULL,
  price_cents INTEGER NOT NULL,
  currency currency_type NOT NULL DEFAULT 'BRL',
  stripe_price_id TEXT,
  virtual_reward JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  discount_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de transações/compras
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.store_products(id),
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency currency_type NOT NULL DEFAULT 'BRL',
  status transaction_status NOT NULL DEFAULT 'pending',
  virtual_rewards_data JSONB DEFAULT '{}',
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de assinaturas premium
CREATE TABLE public.premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de NFTs/itens colecionáveis
CREATE TABLE public.collectible_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  rarity TEXT NOT NULL DEFAULT 'common',
  category TEXT NOT NULL,
  image_url TEXT,
  attributes JSONB DEFAULT '{}',
  mint_price_beetz INTEGER,
  total_supply INTEGER,
  current_supply INTEGER DEFAULT 0,
  is_mintable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de itens NFT de usuários
CREATE TABLE public.user_collectibles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  collectible_id UUID REFERENCES public.collectible_items(id),
  token_id TEXT,
  is_listed_for_sale BOOLEAN DEFAULT false,
  sale_price_beetz INTEGER,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de marketplace - vendas entre usuários
CREATE TABLE public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  user_collectible_id UUID REFERENCES public.user_collectibles(id),
  price_beetz INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de vendas no marketplace
CREATE TABLE public.marketplace_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.marketplace_listings(id),
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  price_beetz INTEGER NOT NULL,
  platform_fee_beetz INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de afiliados/referrals monetários
CREATE TABLE public.affiliate_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  commission_rate DECIMAL(5,4) DEFAULT 0.05, -- 5%
  total_referrals INTEGER DEFAULT 0,
  total_commission_earned INTEGER DEFAULT 0, -- em centavos
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de comissões de afiliados
CREATE TABLE public.affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.affiliate_programs(id),
  transaction_id UUID REFERENCES public.transactions(id),
  commission_amount_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de carteiras virtuais (histórico de beetz)
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  transaction_type TEXT NOT NULL, -- 'earn', 'spend', 'purchase', 'transfer'
  amount INTEGER NOT NULL, -- pode ser negativo para gastos
  balance_after INTEGER NOT NULL,
  source_type TEXT, -- 'quiz', 'purchase', 'referral', 'marketplace'
  source_id UUID, -- ID da transação/atividade origem
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_premium_subscriptions_user_id ON public.premium_subscriptions(user_id);
CREATE INDEX idx_premium_subscriptions_stripe_id ON public.premium_subscriptions(stripe_subscription_id);
CREATE INDEX idx_user_collectibles_user_id ON public.user_collectibles(user_id);
CREATE INDEX idx_marketplace_listings_active ON public.marketplace_listings(is_active) WHERE is_active = true;
CREATE INDEX idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX idx_affiliate_programs_referral_code ON public.affiliate_programs(referral_code);

-- RLS Policies
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collectible_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_collectibles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Policies para store_products
CREATE POLICY "Store products are viewable by everyone" ON public.store_products
FOR SELECT USING (is_active = true);

-- Policies para transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can create transactions" ON public.transactions
FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update transactions" ON public.transactions
FOR UPDATE USING (true);

-- Policies para premium_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.premium_subscriptions
FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can manage subscriptions" ON public.premium_subscriptions
FOR ALL USING (true);

-- Policies para collectible_items
CREATE POLICY "Collectible items are viewable by everyone" ON public.collectible_items
FOR SELECT USING (true);

-- Policies para user_collectibles
CREATE POLICY "Users can view their own collectibles" ON public.user_collectibles
FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their own collectibles" ON public.user_collectibles
FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Policies para marketplace_listings
CREATE POLICY "Active listings are viewable by everyone" ON public.marketplace_listings
FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create listings for their items" ON public.marketplace_listings
FOR INSERT WITH CHECK (seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own listings" ON public.marketplace_listings
FOR UPDATE USING (seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Policies para marketplace_sales
CREATE POLICY "Users can view sales they participated in" ON public.marketplace_sales
FOR SELECT USING (
  buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
  seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Policies para affiliate_programs
CREATE POLICY "Users can view their own affiliate program" ON public.affiliate_programs
FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own affiliate program" ON public.affiliate_programs
FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Policies para affiliate_commissions
CREATE POLICY "Users can view their own commissions" ON public.affiliate_commissions
FOR SELECT USING (affiliate_id IN (
  SELECT id FROM affiliate_programs WHERE user_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
));

-- Policies para wallet_transactions
CREATE POLICY "Users can view their own wallet transactions" ON public.wallet_transactions
FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can create wallet transactions" ON public.wallet_transactions
FOR INSERT WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_store_products_updated_at
BEFORE UPDATE ON public.store_products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_premium_subscriptions_updated_at
BEFORE UPDATE ON public.premium_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_listings_updated_at
BEFORE UPDATE ON public.marketplace_listings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliate_programs_updated_at
BEFORE UPDATE ON public.affiliate_programs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para processar compra de produto virtual
CREATE OR REPLACE FUNCTION public.process_virtual_purchase(
  p_user_id UUID,
  p_product_id UUID,
  p_transaction_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  product_data RECORD;
  user_profile_id UUID;
  current_balance INTEGER;
  rewards JSONB;
BEGIN
  -- Buscar dados do produto
  SELECT * INTO product_data FROM store_products WHERE id = p_product_id;
  
  -- Buscar profile do usuário
  SELECT id INTO user_profile_id FROM profiles WHERE user_id = p_user_id;
  
  -- Processar rewards baseado no tipo de produto
  rewards := product_data.virtual_reward;
  
  CASE product_data.product_type
    WHEN 'beetz_pack' THEN
      -- Adicionar beetz
      UPDATE profiles 
      SET points = points + (rewards->>'beetz')::INTEGER
      WHERE id = user_profile_id;
      
    WHEN 'powerup' THEN
      -- Adicionar powerup ao inventário
      INSERT INTO user_powerups (user_id, powerup_id, quantity)
      VALUES (user_profile_id, (rewards->>'powerup_id')::UUID, (rewards->>'quantity')::INTEGER)
      ON CONFLICT (user_id, powerup_id) 
      DO UPDATE SET quantity = user_powerups.quantity + (rewards->>'quantity')::INTEGER;
      
    WHEN 'loot_box' THEN
      -- Adicionar loot box
      INSERT INTO user_loot_boxes (user_id, loot_box_id, source)
      VALUES (user_profile_id, (rewards->>'loot_box_id')::UUID, 'purchase');
      
    WHEN 'avatar' THEN
      -- Desbloquear avatar
      INSERT INTO user_avatars (user_id, avatar_id, unlocked_at)
      VALUES (user_profile_id, (rewards->>'avatar_id')::UUID, now())
      ON CONFLICT DO NOTHING;
  END CASE;
  
  -- Registrar transação na carteira
  SELECT points INTO current_balance FROM profiles WHERE id = user_profile_id;
  
  INSERT INTO wallet_transactions (
    user_id, transaction_type, amount, balance_after, 
    source_type, source_id, description
  ) VALUES (
    user_profile_id, 'purchase', 
    CASE WHEN product_data.product_type = 'beetz_pack' THEN (rewards->>'beetz')::INTEGER ELSE 0 END,
    current_balance, 'store_purchase', p_transaction_id,
    'Compra: ' || product_data.name
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'rewards', rewards,
    'new_balance', current_balance
  );
END;
$$;

-- Função para criar programa de afiliado
CREATE OR REPLACE FUNCTION public.create_affiliate_program(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile_id UUID;
  referral_code TEXT;
BEGIN
  -- Buscar profile do usuário
  SELECT id INTO user_profile_id FROM profiles WHERE user_id = p_user_id;
  
  -- Gerar código de referral único
  referral_code := 'REF' || UPPER(substring(encode(gen_random_bytes(4), 'hex'), 1, 8));
  
  -- Criar programa de afiliado
  INSERT INTO affiliate_programs (user_id, referral_code)
  VALUES (user_profile_id, referral_code);
  
  RETURN referral_code;
END;
$$;

-- Inserir produtos exemplo na loja
INSERT INTO public.store_products (name, description, product_type, price_cents, virtual_reward, featured) VALUES
('Pacote 1000 Beetz', 'Pacote básico de moedas virtuais', 'beetz_pack', 999, '{"beetz": 1000}', false),
('Pacote 5000 Beetz', 'Pacote intermediário de moedas virtuais', 'beetz_pack', 4999, '{"beetz": 5000, "bonus": 500}', true),
('Pacote 10000 Beetz', 'Pacote premium de moedas virtuais', 'beetz_pack', 9999, '{"beetz": 10000, "bonus": 2000}', true),
('Power-up Multiplicador XP', 'Dobra o XP por 24 horas', 'powerup', 1999, '{"powerup_id": "xp_multiplier", "duration": 24}', false),
('Caixa Misteriosa Premium', 'Caixa com itens raros garantidos', 'loot_box', 2999, '{"loot_box_id": "premium_mystery", "guaranteed_rare": true}', true),
('Avatar Exclusivo - Investidor', 'Avatar premium para investidores', 'avatar', 4999, '{"avatar_id": "exclusive_investor"}', false);

-- Inserir itens colecionáveis exemplo
INSERT INTO public.collectible_items (name, description, rarity, category, mint_price_beetz, total_supply) VALUES
('Carta Bitcoin Genesis', 'Primeira carta da coleção Bitcoin', 'legendary', 'cards', 5000, 100),
('Badge Milionário', 'Badge exclusivo para grandes investidores', 'epic', 'badges', 2500, 500),
('NFT Distrito Financeiro', 'NFT representando o distrito financeiro', 'rare', 'districts', 1000, 1000),
('Troféu Duelista', 'Troféu para campeões de duelos', 'uncommon', 'trophies', 500, 2000),
('Selo Educador', 'Selo para usuários que ajudam outros', 'common', 'seals', 100, 10000);