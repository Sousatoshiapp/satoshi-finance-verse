import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XPCard } from "@/components/ui/xp-card";
import { StreakBadge } from "@/components/ui/streak-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FloatingNavbar } from "@/components/floating-navbar";
import { AvatarDisplayUniversal } from "@/components/avatar-display-universal";
import { SubscriptionIndicator } from "@/components/subscription-indicator";
import { InventoryCarousel } from "@/components/profile/inventory-carousel";
import { AvatarCarousel } from "@/components/profile/avatar-carousel";
import { AchievementsCarousel } from "@/components/profile/achievements-carousel";
import { StatsGrid } from "@/components/profile/stats-grid";
import { QuickActions } from "@/components/profile/quick-actions";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/use-subscription";
import { useI18n } from "@/hooks/use-i18n";
import { getLevelInfo } from "@/data/levels";
import { Crown, Star, Shield, Camera } from "lucide-react";
import { LightningIcon, BookIcon, StreakIcon, TrophyIcon } from "@/components/icons/game-icons";
import satoshiLogo from "/lovable-uploads/f344f3a7-aa34-4a5f-a2e0-8ac072c6aac5.png";

// Import avatar images
import neoTrader from "@/assets/avatars/neo-trader.jpg";
import cryptoAnalyst from "@/assets/avatars/crypto-analyst.jpg";
import financeHacker from "@/assets/avatars/finance-hacker.jpg";
import investmentScholar from "@/assets/avatars/investment-scholar.jpg";
import quantumBroker from "@/assets/avatars/quantum-broker.jpg";
import defiSamurai from "@/assets/avatars/defi-samurai.jpg";
import theSatoshi from "@/assets/avatars/the-satoshi.jpg";
import neuralArchitect from "@/assets/avatars/neural-architect.jpg";
import dataMiner from "@/assets/avatars/data-miner.jpg";
import blockchainGuardian from "@/assets/avatars/blockchain-guardian.jpg";
import quantumPhysician from "@/assets/avatars/quantum-physician.jpg";
import virtualRealtor from "@/assets/avatars/virtual-realtor.jpg";
import codeAssassin from "@/assets/avatars/code-assassin.jpg";
import cryptoShaman from "@/assets/avatars/crypto-shaman.jpg";
import marketProphet from "@/assets/avatars/market-prophet.jpg";
import digitalNomad from "@/assets/avatars/digital-nomad.jpg";
import neonDetective from "@/assets/avatars/neon-detective.jpg";
import hologramDancer from "@/assets/avatars/hologram-dancer.jpg";
import cyberMechanic from "@/assets/avatars/cyber-mechanic.jpg";
import ghostTrader from "@/assets/avatars/ghost-trader.jpg";
import binaryMonk from "@/assets/avatars/binary-monk.jpg";
import pixelArtist from "@/assets/avatars/pixel-artist.jpg";
import quantumThief from "@/assets/avatars/quantum-thief.jpg";
import memoryKeeper from "@/assets/avatars/memory-keeper.jpg";
import stormHacker from "@/assets/avatars/storm-hacker.jpg";
import dreamArchitect from "@/assets/avatars/dream-architect.jpg";
import chromeGladiator from "@/assets/avatars/chrome-gladiator.jpg";

const avatarImages = {
  'neo-trader': neoTrader,
  'crypto-analyst': cryptoAnalyst,
  'finance-hacker': financeHacker,
  'investment-scholar': investmentScholar,
  'quantum-broker': quantumBroker,
  'defi-samurai': defiSamurai,
  'the-satoshi': theSatoshi,
  'neural-architect': neuralArchitect,
  'data-miner': dataMiner,
  'blockchain-guardian': blockchainGuardian,
  'quantum-physician': quantumPhysician,
  'virtual-realtor': virtualRealtor,
  'code-assassin': codeAssassin,
  'crypto-shaman': cryptoShaman,
  'market-prophet': marketProphet,
  'digital-nomad': digitalNomad,
  'neon-detective': neonDetective,
  'hologram-dancer': hologramDancer,
  'cyber-mechanic': cyberMechanic,
  'ghost-trader': ghostTrader,
  'binary-monk': binaryMonk,
  'pixel-artist': pixelArtist,
  'quantum-thief': quantumThief,
  'memory-keeper': memoryKeeper,
  'storm-hacker': stormHacker,
  'dream-architect': dreamArchitect,
  'chrome-gladiator': chromeGladiator,
};

interface UserProfile {
  id: string;
  nickname: string;
  level: number;
  xp: number;
  streak: number;
  completed_lessons: number;
  points: number;
  profile_image_url?: string;
  avatar_id?: string;
  subscription_tier?: 'free' | 'pro' | 'elite';
}

interface UserAvatar {
  id: string;
  name: string;
  image_url: string;
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userAvatar, setUserAvatar] = useState<UserAvatar | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription } = useSubscription();
  const { t } = useI18n();
  
  const getAvatarImage = (avatarName?: string) => {
    if (!avatarName) return satoshiLogo;
    console.log('Avatar name:', avatarName);
    const key = avatarName.toLowerCase().replace(' ', '-') as keyof typeof avatarImages;
    console.log('Mapped key:', key);
    console.log('Found image:', avatarImages[key]);
    return avatarImages[key] || satoshiLogo;
  };

  useEffect(() => {
    loadUserProfile();
  }, [navigate]);

  const loadUserProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      // Load user profile from Supabase or fallback to localStorage
      let profile = null;
      if (authUser) {
        const { data: supabaseProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', authUser.id)
          .single();
        profile = supabaseProfile;
      }

      // If no Supabase profile, use localStorage data
      if (!profile) {
        const userData = localStorage.getItem('satoshi_user');
        if (userData) {
          const localUser = JSON.parse(userData);
          profile = {
            id: 'local-user',
            nickname: localUser.nickname || 'Usuário',
            level: localUser.level || 1,
            xp: localUser.xp || 0,
            streak: localUser.streak || 0,
            completed_lessons: localUser.completedLessons || 0,
            points: localUser.coins || 0,
            profile_image_url: localUser.profileImageUrl,
            avatar_id: localUser.avatarId
          };
        }
      }

      if (profile) {
        setUser(profile);
        
        // Load user avatar if they have one
        if (profile.avatar_id) {
          console.log('Loading avatar for ID:', profile.avatar_id);
          const { data: avatarData } = await supabase
            .from('avatars')
            .select('id, name, image_url')
            .eq('id', profile.avatar_id)
            .single();
          
          console.log('Avatar data loaded:', avatarData);
          if (avatarData) {
            setUserAvatar(avatarData);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpdated = (newImageUrl: string) => {
    if (user) {
      setUser({ ...user, profile_image_url: newImageUrl });
    }
  };

  const handleAvatarChanged = async (avatarId: string) => {
    if (user) {
      setUser({ ...user, avatar_id: avatarId });
      
      // Load the new avatar data
      if (avatarId) {
        const { data: avatarData } = await supabase
          .from('avatars')
          .select('id, name, image_url')
          .eq('id', avatarId)
          .single();
        
        if (avatarData) {
          setUserAvatar(avatarData);
        }
      } else {
        setUserAvatar(null);
      }
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // File validation
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Erro",
          description: "Tipo de arquivo não permitido. Use apenas JPEG, PNG, GIF ou WebP",
          variant: "destructive"
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter menos de 5MB",
          variant: "destructive"
        });
        return;
      }

      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      // Create secure file path
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const timestamp = Date.now();
      const fileName = `${authUser.id}/profile_${timestamp}.${fileExt}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      const imageUrl = data.publicUrl;

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image_url: imageUrl })
        .eq('user_id', authUser.id);

      if (updateError) throw updateError;

      handleImageUpdated(imageUrl);
      
      toast({
        title: "✅ Imagem atualizada!",
        description: "Sua foto de perfil foi atualizada com sucesso"
      });

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível fazer o upload da imagem",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'pro': return <Star className="w-5 h-5 text-yellow-500" />;
      case 'elite': return <Crown className="w-5 h-5 text-purple-500" />;
      default: return <Shield className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPlanName = (tier: string) => {
    switch (tier) {
      case 'pro': return 'Satoshi Pro';
      case 'elite': return 'Satoshi Elite';
      default: return t('subscription.free');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                ← {t('navigation.dashboard')}
              </Button>
              <h1 className="text-xl font-bold text-foreground">{t('profile.userProfile')}</h1>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
              {t('navigation.settings')}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
        {/* Profile Header - Enhanced Mobile Design */}
        <Card className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className="relative self-center md:self-auto">
              <AvatarDisplayUniversal
                avatarName={userAvatar?.name}
                avatarUrl={userAvatar?.image_url}
                profileImageUrl={user.profile_image_url}
                nickname={user.nickname}
                size="xl"
                className="w-20 h-20 md:w-24 md:h-24"
              />
              
              <label htmlFor="image-upload" className="absolute -bottom-1 -right-1 cursor-pointer">
                <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Camera className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              </label>
              
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
            </div>
            
            <div className="flex-1 min-w-0 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 truncate">
                {user.nickname}
              </h2>
              <p className="text-muted-foreground mb-3 text-sm md:text-base">
                {getLevelInfo(user.level).name} • {user.points} {t('common.beetz')}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3">
                <StreakBadge days={user.streak} />
                <SubscriptionIndicator tier={subscription.tier} size="sm" />
                <Badge variant="outline" className="text-xs md:text-sm">
                  {t('common.level')} {user.level}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <QuickActions subscription={subscription} />

        {/* Stats Grid */}
        <StatsGrid
          xp={user.xp}
          completedLessons={user.completed_lessons}
          streak={user.streak}
          points={user.points}
        />

        {/* XP and Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <XPCard
            level={user.level}
            currentXP={user.xp}
            nextLevelXP={user.level * 100}
          />
          
          <Card className="p-4 md:p-6">
            <h3 className="font-bold text-foreground mb-4">{t('levels.progress')}</h3>
            <ProgressBar
              value={user.completed_lessons}
              max={20}
              showLabel
              className="mb-3"
            />
            <p className="text-sm text-muted-foreground">
              {user.completed_lessons} {t('profile.stats.of')} 20 {t('profile.stats.lessonsCompleted')}
            </p>
          </Card>
        </div>

        {/* Carousels Section */}
        <div className="space-y-6">
          {/* Achievements Carousel */}
          <AchievementsCarousel />

          {/* Avatar Carousel */}
          <AvatarCarousel
            userProfileId={user.id}
            currentAvatarId={user.avatar_id}
            onAvatarChanged={handleAvatarChanged}
          />

          {/* Inventory Carousel */}
          <InventoryCarousel />
        </div>

        {/* Subscription Plan Card - Compact Design */}
        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getPlanIcon(subscription.tier)}
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {getPlanName(subscription.tier)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {subscription.tier === 'free' 
                    ? t('subscription.benefits')
                    : `XP ${subscription.xpMultiplier}x • ${subscription.monthlyBeetz} ${t('common.beetz')}/mês`
                  }
                </p>
              </div>
            </div>
            <Button 
              variant={subscription.tier === 'free' ? 'default' : 'outline'}
              size="sm"
              onClick={() => navigate('/subscription-plans')}
              className={subscription.tier === 'free' 
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white' 
                : ''
              }
            >
              {subscription.tier === 'free' ? '⭐ Upgrade' : t('subscription.subscribe')}
            </Button>
          </div>
        </Card>
      </div>
      
      <FloatingNavbar />
    </div>
  );
}
