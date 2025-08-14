-- FASE 4 & 5: Community Building & Viral Mechanics
-- Create enum types
CREATE TYPE influencer_tier AS ENUM ('bronze', 'silver', 'gold', 'diamond');
CREATE TYPE guild_war_status AS ENUM ('upcoming', 'active', 'completed');
CREATE TYPE challenge_status AS ENUM ('active', 'completed', 'upcoming');
CREATE TYPE meme_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');

-- 1. Knowledge Creators (Influencer Program)
CREATE TABLE public.knowledge_creators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tier influencer_tier NOT NULL DEFAULT 'bronze',
  total_referrals INTEGER NOT NULL DEFAULT 0,
  monthly_referrals INTEGER NOT NULL DEFAULT 0,
  total_earnings INTEGER NOT NULL DEFAULT 0,
  conversion_rate NUMERIC(4,2) NOT NULL DEFAULT 0.00,
  content_created INTEGER NOT NULL DEFAULT 0,
  engagement_score NUMERIC(8,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Creator Analytics
CREATE TABLE public.creator_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  analytics_date DATE NOT NULL DEFAULT CURRENT_DATE,
  referrals_count INTEGER NOT NULL DEFAULT 0,
  earnings_amount INTEGER NOT NULL DEFAULT 0,
  content_views INTEGER NOT NULL DEFAULT 0,
  engagement_rate NUMERIC(4,2) NOT NULL DEFAULT 0.00,
  quiz_completions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(creator_id, analytics_date)
);

-- 3. Guild Wars
CREATE TABLE public.guild_wars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status guild_war_status NOT NULL DEFAULT 'upcoming',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 50,
  xp_goal INTEGER NOT NULL DEFAULT 100000,
  prize_pool JSONB NOT NULL DEFAULT '{"first": 10000, "second": 5000, "third": 2500}',
  winner_guild_id UUID,
  total_xp_earned INTEGER NOT NULL DEFAULT 0,
  participants_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Guild War Participants
CREATE TABLE public.guild_war_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  war_id UUID NOT NULL,
  guild_id UUID NOT NULL,
  user_id UUID NOT NULL,
  xp_contributed INTEGER NOT NULL DEFAULT 0,
  quizzes_completed INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(war_id, user_id)
);

-- 5. Viral Challenges
CREATE TABLE public.viral_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  hashtag TEXT NOT NULL,
  status challenge_status NOT NULL DEFAULT 'upcoming',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  target_shares INTEGER NOT NULL DEFAULT 1000,
  current_shares INTEGER NOT NULL DEFAULT 0,
  rewards JSONB NOT NULL DEFAULT '{"xp": 500, "beetz": 1000}',
  challenge_type TEXT NOT NULL DEFAULT 'social_share',
  is_seasonal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Challenge Participation
CREATE TABLE public.challenge_participation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL,
  user_id UUID NOT NULL,
  shares_count INTEGER NOT NULL DEFAULT 0,
  engagement_score NUMERIC(8,2) NOT NULL DEFAULT 0.00,
  completion_rate NUMERIC(4,2) NOT NULL DEFAULT 0.00,
  rewards_earned JSONB NOT NULL DEFAULT '{}',
  participated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(challenge_id, user_id)
);

-- 7. Meme Economy Items
CREATE TABLE public.meme_economy_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  rarity meme_rarity NOT NULL DEFAULT 'common',
  price_beetz INTEGER NOT NULL DEFAULT 100,
  is_animated BOOLEAN NOT NULL DEFAULT false,
  is_exclusive BOOLEAN NOT NULL DEFAULT false,
  unlock_requirements JSONB NOT NULL DEFAULT '{}',
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. User Meme Collection
CREATE TABLE public.user_meme_collection (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  meme_id UUID NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, meme_id)
);

-- 9. Viral Shares Tracking
CREATE TABLE public.viral_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL, -- 'achievement', 'challenge', 'meme'
  content_id UUID NOT NULL,
  platform TEXT NOT NULL, -- 'tiktok', 'twitter', 'instagram'
  share_url TEXT,
  hashtags TEXT[],
  engagement_metrics JSONB DEFAULT '{}',
  viral_score NUMERIC(8,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Foreign Key Constraints
ALTER TABLE public.knowledge_creators ADD CONSTRAINT fk_knowledge_creators_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.creator_analytics ADD CONSTRAINT fk_creator_analytics_creator FOREIGN KEY (creator_id) REFERENCES public.knowledge_creators(id) ON DELETE CASCADE;
ALTER TABLE public.guild_war_participants ADD CONSTRAINT fk_guild_war_participants_war FOREIGN KEY (war_id) REFERENCES public.guild_wars(id) ON DELETE CASCADE;
ALTER TABLE public.guild_war_participants ADD CONSTRAINT fk_guild_war_participants_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.challenge_participation ADD CONSTRAINT fk_challenge_participation_challenge FOREIGN KEY (challenge_id) REFERENCES public.viral_challenges(id) ON DELETE CASCADE;
ALTER TABLE public.challenge_participation ADD CONSTRAINT fk_challenge_participation_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.user_meme_collection ADD CONSTRAINT fk_user_meme_collection_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.user_meme_collection ADD CONSTRAINT fk_user_meme_collection_meme FOREIGN KEY (meme_id) REFERENCES public.meme_economy_items(id) ON DELETE CASCADE;
ALTER TABLE public.viral_shares ADD CONSTRAINT fk_viral_shares_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.knowledge_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_wars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_war_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viral_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meme_economy_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_meme_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viral_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Knowledge Creators
CREATE POLICY "Users can view all creators" ON public.knowledge_creators FOR SELECT USING (true);
CREATE POLICY "Users can manage their own creator profile" ON public.knowledge_creators FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Creator Analytics
CREATE POLICY "Creators can view their analytics" ON public.creator_analytics FOR SELECT USING (creator_id IN (SELECT id FROM knowledge_creators WHERE user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));
CREATE POLICY "System can insert analytics" ON public.creator_analytics FOR INSERT WITH CHECK (true);

-- Guild Wars
CREATE POLICY "Everyone can view active guild wars" ON public.guild_wars FOR SELECT USING (true);
CREATE POLICY "Admins can manage guild wars" ON public.guild_wars FOR ALL USING (is_admin(auth.uid()));

-- Guild War Participants
CREATE POLICY "Users can view war participants" ON public.guild_war_participants FOR SELECT USING (true);
CREATE POLICY "Users can join wars" ON public.guild_war_participants FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can update their participation" ON public.guild_war_participants FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Viral Challenges
CREATE POLICY "Everyone can view active challenges" ON public.viral_challenges FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can manage challenges" ON public.viral_challenges FOR ALL USING (is_admin(auth.uid()));

-- Challenge Participation
CREATE POLICY "Users can view all participation" ON public.challenge_participation FOR SELECT USING (true);
CREATE POLICY "Users can manage their participation" ON public.challenge_participation FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Meme Economy
CREATE POLICY "Everyone can view active memes" ON public.meme_economy_items FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage memes" ON public.meme_economy_items FOR ALL USING (is_admin(auth.uid()));

-- User Meme Collection
CREATE POLICY "Users can view their meme collection" ON public.user_meme_collection FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage their meme collection" ON public.user_meme_collection FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Viral Shares
CREATE POLICY "Users can view their viral shares" ON public.viral_shares FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can create viral shares" ON public.viral_shares FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_knowledge_creators_user_id ON public.knowledge_creators(user_id);
CREATE INDEX idx_knowledge_creators_tier ON public.knowledge_creators(tier);
CREATE INDEX idx_creator_analytics_creator_date ON public.creator_analytics(creator_id, analytics_date);
CREATE INDEX idx_guild_wars_status ON public.guild_wars(status);
CREATE INDEX idx_guild_war_participants_war_guild ON public.guild_war_participants(war_id, guild_id);
CREATE INDEX idx_viral_challenges_status ON public.viral_challenges(status);
CREATE INDEX idx_challenge_participation_challenge_user ON public.challenge_participation(challenge_id, user_id);
CREATE INDEX idx_meme_economy_rarity ON public.meme_economy_items(rarity);
CREATE INDEX idx_user_meme_collection_user ON public.user_meme_collection(user_id);
CREATE INDEX idx_viral_shares_user_platform ON public.viral_shares(user_id, platform);

-- Update functions
CREATE OR REPLACE FUNCTION update_creator_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_knowledge_creators_updated_at
  BEFORE UPDATE ON public.knowledge_creators
  FOR EACH ROW
  EXECUTE FUNCTION update_creator_updated_at();

CREATE TRIGGER update_guild_wars_updated_at
  BEFORE UPDATE ON public.guild_wars
  FOR EACH ROW
  EXECUTE FUNCTION update_creator_updated_at();

CREATE TRIGGER update_viral_challenges_updated_at
  BEFORE UPDATE ON public.viral_challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_creator_updated_at();

CREATE TRIGGER update_meme_economy_items_updated_at
  BEFORE UPDATE ON public.meme_economy_items
  FOR EACH ROW
  EXECUTE FUNCTION update_creator_updated_at();