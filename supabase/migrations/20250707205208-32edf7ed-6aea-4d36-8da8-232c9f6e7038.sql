-- Create level progression system
CREATE TABLE IF NOT EXISTS public.level_tiers (
  id SERIAL PRIMARY KEY,
  level INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  xp_required INTEGER NOT NULL,
  rewards JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert 20 levels with proper XP scaling
INSERT INTO public.level_tiers (level, name, description, xp_required, rewards) VALUES
(1, 'Digital Newbie', 'Seus primeiros passos no mundo financeiro digital', 0, '{"beetz": 50, "badge": "first_steps"}'),
(2, 'Crypto Rookie', 'Descobrindo os segredos das criptomoedas', 100, '{"beetz": 75, "badge": "crypto_starter"}'),
(3, 'DeFi Explorer', 'Explorando o universo das finanças descentralizadas', 250, '{"beetz": 100, "badge": "defi_explorer"}'),
(4, 'Trading Ninja', 'Desenvolvendo habilidades furtivas de trading', 450, '{"beetz": 125, "badge": "trading_ninja"}'),
(5, 'Finance Hacker', 'Hackeando o sistema financeiro tradicional', 700, '{"beetz": 150, "badge": "finance_hacker", "avatar_unlock": true}'),
(6, 'Blockchain Warrior', 'Lutando nas trincheiras da revolução blockchain', 1000, '{"beetz": 175, "badge": "blockchain_warrior"}'),
(7, 'Yield Farmer', 'Cultivando lucros nas fazendas de rendimento', 1350, '{"beetz": 200, "badge": "yield_farmer"}'),
(8, 'NFT Collector', 'Colecionando ativos digitais únicos', 1750, '{"beetz": 225, "badge": "nft_collector"}'),
(9, 'Smart Contract Dev', 'Desenvolvendo contratos inteligentes', 2200, '{"beetz": 250, "badge": "smart_contract_dev"}'),
(10, 'Crypto Whale', 'Movendo oceanos no mercado cripto', 2700, '{"beetz": 300, "badge": "crypto_whale", "avatar_unlock": true}'),
(11, 'DeFi Architect', 'Construindo o futuro das finanças', 3250, '{"beetz": 350, "badge": "defi_architect"}'),
(12, 'Web3 Pioneer', 'Desbravando a nova internet descentralizada', 3850, '{"beetz": 400, "badge": "web3_pioneer"}'),
(13, 'Metaverse Tycoon', 'Dominando economias virtuais', 4500, '{"beetz": 450, "badge": "metaverse_tycoon"}'),
(14, 'DAO Commander', 'Liderando organizações autônomas', 5200, '{"beetz": 500, "badge": "dao_commander"}'),
(15, 'Alpha Hunter', 'Caçando as melhores oportunidades', 5950, '{"beetz": 600, "badge": "alpha_hunter", "avatar_unlock": true}'),
(16, 'Liquidity Lord', 'Controlando os fluxos de liquidez', 6750, '{"beetz": 700, "badge": "liquidity_lord"}'),
(17, 'Protocol Master', 'Dominando protocolos complexos', 7600, '{"beetz": 800, "badge": "protocol_master"}'),
(18, 'Ecosystem King', 'Reinando sobre ecossistemas inteiros', 8500, '{"beetz": 900, "badge": "ecosystem_king"}'),
(19, 'Crypto Legend', 'Lenda viva do mundo cripto', 9450, '{"beetz": 1000, "badge": "crypto_legend"}'),
(20, 'The Satoshi', 'O mestre supremo das finanças descentralizadas', 10450, '{"beetz": 1500, "badge": "the_satoshi", "avatar_unlock": true}');

-- Create function to calculate user level based on XP
CREATE OR REPLACE FUNCTION public.calculate_user_level(user_xp INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  calculated_level INTEGER DEFAULT 1;
BEGIN
  SELECT COALESCE(MAX(level), 1) INTO calculated_level
  FROM public.level_tiers 
  WHERE xp_required <= user_xp;
  
  RETURN calculated_level;
END;
$$;

-- Create function to get XP needed for next level
CREATE OR REPLACE FUNCTION public.get_next_level_xp(current_level INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  next_xp INTEGER;
BEGIN
  SELECT xp_required INTO next_xp
  FROM public.level_tiers 
  WHERE level = current_level + 1;
  
  RETURN COALESCE(next_xp, (SELECT MAX(xp_required) FROM public.level_tiers));
END;
$$;

-- Create function to award XP and handle level ups
CREATE OR REPLACE FUNCTION public.award_xp(profile_id UUID, xp_amount INTEGER, activity_type TEXT DEFAULT 'general')
RETURNS TABLE(
  new_xp INTEGER,
  new_level INTEGER,
  level_up BOOLEAN,
  rewards JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_xp INTEGER;
  old_level INTEGER;
  updated_xp INTEGER;
  updated_level INTEGER;
  level_changed BOOLEAN DEFAULT FALSE;
  level_rewards JSONB DEFAULT '{}';
BEGIN
  -- Get current user stats
  SELECT xp, level INTO old_xp, old_level
  FROM public.profiles
  WHERE id = profile_id;
  
  -- Calculate new XP and level
  updated_xp := old_xp + xp_amount;
  updated_level := public.calculate_user_level(updated_xp);
  level_changed := updated_level > old_level;
  
  -- Get rewards for new level if leveled up
  IF level_changed THEN
    SELECT rewards INTO level_rewards
    FROM public.level_tiers
    WHERE level = updated_level;
    
    -- Award beetz from level rewards
    IF level_rewards ? 'beetz' THEN
      UPDATE public.profiles 
      SET points = points + (level_rewards->>'beetz')::INTEGER
      WHERE id = profile_id;
    END IF;
    
    -- Create badge if specified in rewards
    IF level_rewards ? 'badge' THEN
      INSERT INTO public.user_badges (user_id, badge_name, badge_type, badge_description)
      VALUES (
        profile_id,
        level_rewards->>'badge',
        'level',
        'Conquistado ao alcançar nível ' || updated_level
      ) ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  -- Update user profile
  UPDATE public.profiles 
  SET 
    xp = updated_xp,
    level = updated_level,
    updated_at = NOW()
  WHERE id = profile_id;
  
  -- Log activity
  INSERT INTO public.activity_feed (user_id, activity_type, activity_data)
  VALUES (
    profile_id,
    'xp_earned',
    jsonb_build_object(
      'xp_amount', xp_amount,
      'activity_type', activity_type,
      'old_level', old_level,
      'new_level', updated_level,
      'level_up', level_changed
    )
  );
  
  RETURN QUERY SELECT updated_xp, updated_level, level_changed, level_rewards;
END;
$$;

-- Create streak system functions
CREATE OR REPLACE FUNCTION public.update_user_streak(profile_id UUID, activity_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_streak INTEGER DEFAULT 0;
  last_activity DATE;
  new_streak INTEGER;
BEGIN
  SELECT streak, updated_at::DATE INTO current_streak, last_activity
  FROM public.profiles
  WHERE id = profile_id;
  
  -- If first activity or last activity was yesterday, increment streak
  IF last_activity IS NULL OR last_activity = activity_date - INTERVAL '1 day' THEN
    new_streak := current_streak + 1;
  -- If last activity was today, keep current streak
  ELSIF last_activity = activity_date THEN
    new_streak := current_streak;
  -- If gap in activities, reset streak
  ELSE
    new_streak := 1;
  END IF;
  
  -- Update profile
  UPDATE public.profiles 
  SET 
    streak = new_streak,
    updated_at = NOW()
  WHERE id = profile_id;
  
  -- Award streak milestones
  IF new_streak IN (3, 7, 14, 30, 100) THEN
    INSERT INTO public.user_badges (user_id, badge_name, badge_type, badge_description)
    VALUES (
      profile_id,
      'streak_' || new_streak,
      'streak',
      'Manteve uma sequência de ' || new_streak || ' dias'
    ) ON CONFLICT DO NOTHING;
    
    -- Award bonus XP for streaks
    PERFORM public.award_xp(profile_id, new_streak * 5, 'streak_bonus');
  END IF;
  
  RETURN new_streak;
END;
$$;

-- Make some products immediately available without level requirements
UPDATE public.products 
SET level_required = 1 
WHERE category IN ('boost') 
AND name IN ('XP Multiplier', 'Quantum Energy Drink', 'Crypto Booster');

-- Enable RLS on level_tiers
ALTER TABLE public.level_tiers ENABLE ROW LEVEL SECURITY;

-- Create policy for level_tiers (public read access)
CREATE POLICY "Level tiers are viewable by everyone"
ON public.level_tiers
FOR SELECT
USING (true);

-- Create trigger to auto-update user level when XP changes
CREATE OR REPLACE FUNCTION public.auto_update_user_level()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only update level if XP changed
  IF NEW.xp != OLD.xp THEN
    NEW.level := public.calculate_user_level(NEW.xp);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_update_user_level
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_user_level();