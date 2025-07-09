import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BeetzIcon } from "@/components/ui/beetz-icon";
import { XPCard } from "@/components/ui/xp-card";
import { StreakBadge } from "@/components/ui/streak-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FloatingNavbar } from "@/components/floating-navbar";
import { AvatarDisplayUniversal } from "@/components/avatar-display-universal";

import { AvatarSelector } from "@/components/avatar-selector";
import { UserInventory } from "@/components/profile/user-inventory";
import { SubscriptionIndicator } from "@/components/subscription-indicator";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/use-subscription";
import { useGamification } from "@/hooks/use-gamification";
import { getLevelInfo } from "@/data/levels";
import { Crown, Star, Shield, Camera, ArrowRight } from "lucide-react";
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
  const { achievements: realAchievements, badges, loading: gamificationLoading, getRecentAchievements } = useGamification();
  
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
      default: return 'Plano Gratuito';
    }
  };

  const achievements = [
    { id: 'first_lesson', name: 'Primeira Lição', icon: '🎯', earned: true },
    { id: 'streak_7', name: '7 Dias Seguidos', icon: '🔥', earned: user?.streak >= 7 },
    { id: 'level_5', name: 'Nível 5', icon: '⭐', earned: user?.level >= 5 },
    { id: 'quiz_master', name: 'Mestre dos Quiz', icon: '🧠', earned: false },
    { id: 'investor', name: 'Primeiro Investimento', icon: '📈', earned: false },
    { id: 'saver', name: 'Poupador Expert', icon: '🏦', earned: false }
  ];

  const stats = [
    { 
      label: 'XP Atual', 
      value: user?.xp || 0, 
      icon: '⚡',
      route: '/levels'
    },
    { 
      label: 'Lições Completas', 
      value: user?.completed_lessons || 0, 
      icon: '📚',
      route: '/levels'
    },
    { 
      label: 'Dias de Sequência', 
      value: user?.streak || 0, 
      icon: '🔥',
      route: '/profile'
    },
    { 
      label: 'Beetz', 
      value: user?.points || 0, 
      icon: <BeetzIcon size="lg" />,
      route: '/beetz-info'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                ← Dashboard
              </Button>
              <h1 className="text-xl font-bold text-foreground">Meu Perfil</h1>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
              Configurações
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header - Mobile Optimized */}
        <Card className="p-4 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="relative self-center sm:self-auto">
              <AvatarDisplayUniversal
                avatarName={userAvatar?.name}
                avatarUrl={userAvatar?.image_url}
                profileImageUrl={user.profile_image_url}
                nickname={user.nickname}
                size="xl"
                className="w-16 h-16 sm:w-20 sm:h-20"
              />
              
              {/* Small upload icon */}
              <label htmlFor="image-upload" className="absolute -bottom-1 -right-1 cursor-pointer">
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary-foreground" />
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
            
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 truncate">{user.nickname}</h2>
              <p className="text-muted-foreground mb-3 text-sm sm:text-base">Nível {user.level} • {user.points} Beetz</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                <StreakBadge days={user.streak} />
                <Badge variant="outline" className="text-xs sm:text-sm">{getLevelInfo(user.level).name}</Badge>
                <div className="flex items-center gap-2">
                  <SubscriptionIndicator tier={subscription.tier} size="sm" />
                  <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">{getPlanName(subscription.tier)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Subscription Plan Card */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getPlanIcon(subscription.tier)}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">{getPlanName(subscription.tier)}</h3>
                <p className="text-sm text-muted-foreground">
                  {subscription.tier === 'free' 
                    ? 'Faça upgrade para desbloquear benefícios exclusivos'
                    : `XP ${subscription.xpMultiplier}x • Duelos Ilimitados • ${subscription.monthlyBeetz} Beetz/mês`
                  }
                </p>
              </div>
            </div>
            <Button 
              variant={subscription.tier === 'free' ? 'default' : 'outline'}
              onClick={() => navigate('/subscription-plans')}
              className={subscription.tier === 'free' 
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0' 
                : ''
              }
            >
              {subscription.tier === 'free' ? '⭐ Fazer Upgrade' : 'Gerenciar Plano'}
            </Button>
          </div>
          
          {subscription.tier !== 'free' && (
            <div className="grid grid-cols-3 gap-4 mt-4 text-xs">
              <div className="text-center">
                <div className="text-purple-400 font-bold">∞</div>
                <div className="text-muted-foreground">Duelos</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 font-bold">{subscription.xpMultiplier}x</div>
                <div className="text-muted-foreground">XP Boost</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 font-bold">{subscription.monthlyBeetz}</div>
                <div className="text-muted-foreground">Beetz/mês</div>
              </div>
            </div>
          )}
        </Card>

        {/* XP and Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <XPCard
            level={user.level}
            currentXP={user.xp}
            nextLevelXP={user.level * 100}
          />
          
          <Card className="p-6">
            <h3 className="font-bold text-foreground mb-4">Progresso Geral</h3>
            <ProgressBar
              value={user.completed_lessons}
              max={20}
              showLabel
              className="mb-3"
            />
            <p className="text-sm text-muted-foreground">
              {user.completed_lessons} de 20 lições principais completadas
            </p>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card 
              key={stat.label} 
              className="p-4 text-center cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-lg"
              onClick={() => navigate(stat.route)}
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Avatar Selector */}
        <div className="mb-8">
          <AvatarSelector
            userProfileId={user.id}
            currentAvatarId={user.avatar_id}
            onAvatarChanged={handleAvatarChanged}
          />
        </div>

        {/* User Inventory */}
        <div className="mb-8">
          <UserInventory />
        </div>

        {/* Achievements */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Conquistas Recentes</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/achievements')}
              className="text-primary hover:text-primary/80"
            >
              Ver todas <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {gamificationLoading ? (
              // Skeleton loading
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center p-3 rounded-lg border-2 bg-muted/30 animate-pulse">
                  <div className="w-8 h-8 bg-muted rounded mb-1"></div>
                  <div className="w-16 h-3 bg-muted rounded"></div>
                </div>
              ))
            ) : (
              getRecentAchievements(6).map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex flex-col items-center p-3 rounded-lg border-2 bg-gradient-to-b from-yellow-50 to-yellow-100 border-yellow-300 text-yellow-800 transition-all"
                >
                  <div className="text-2xl mb-1">{achievement.achievements.badge_icon || '🏆'}</div>
                  <div className="text-xs font-medium text-center">{achievement.achievements.name}</div>
                </div>
              ))
            )}
          </div>
          {!gamificationLoading && getRecentAchievements(6).length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">Complete atividades para desbloquear conquistas!</p>
            </div>
          )}
        </Card>

        {/* Power-ups */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Power-ups</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/powerups')}
              className="text-primary hover:text-primary/80"
            >
              Gerenciar <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {badges.slice(0, 4).map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border"
              >
                <div className="text-lg">⚡</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{badge.badge_name}</div>
                  <div className="text-xs text-muted-foreground">Ativo</div>
                </div>
              </div>
            ))}
          </div>
          {badges.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">Nenhum power-up disponível</p>
            </div>
          )}
        </Card>
      </div>
      
      <FloatingNavbar />
    </div>
  );
}