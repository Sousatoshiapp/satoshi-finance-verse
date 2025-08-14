import { useState, useEffect } from "react";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { XPCard } from "@/components/shared/ui/xp-card";
import { StreakBadge } from "@/components/shared/ui/streak-badge";
import { ProgressBar } from "@/components/shared/ui/progress-bar";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { SubscriptionIndicator } from "@/components/shared/subscription-indicator";
import { InventoryCarousel } from "@/components/shared/profile/inventory-carousel";
import { AvatarCarousel } from "@/components/shared/profile/avatar-carousel";
import { AchievementsCarousel } from "@/components/shared/profile/achievements-carousel";
import { StatsGrid } from "@/components/shared/profile/stats-grid";

import { UserEvolutionChart } from "@/components/shared/profile/user-evolution-chart";
import { ActiveRewardsPanel } from "@/components/shared/profile/active-rewards-panel";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/use-subscription";
import { useI18n } from "@/hooks/use-i18n";
import { getLevelInfo as getStaticLevelInfo } from "@/data/levels";
import { useProgressionSystem } from "@/hooks/use-progression-system";
import { useAvatarContext } from "@/contexts/AvatarContext";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { Crown, Star, Shield, Camera, Palette } from "lucide-react";
import { ProfileStyleLoader } from "@/components/shared/ui/profile-style-loader";


interface UserProfile {
  id: string;
  nickname: string;
  level: number;
  xp: number;
  streak: number;
  points: number;
  profile_image_url?: string;
  current_avatar_id?: string;
  subscription_tier?: 'free' | 'pro' | 'elite';
  avatars?: {
    id: string;
    name: string;
    image_url: string;
  };
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
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { invalidateAvatarCaches } = useAvatarContext();
  const { subscription } = useSubscription();
  const { t } = useI18n();
  const { getNextLevelXP } = useProgressionSystem();
  const { completedLessonsCount, progressGoal } = useLessonProgress();
  

  useEffect(() => {
    loadUserProfile();
  }, [navigate]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();

      // Load user profile from Supabase or fallback to localStorage
      let profile = null;
      if (authUser) {
        const { data: supabaseProfile, error } = await supabase
          .from('profiles')
          .select(`
            id,
            nickname,
            level,
            xp,
            streak,
            points,
            profile_image_url,
            current_avatar_id,
            subscription_tier,
            avatars!current_avatar_id (
              id, name, image_url
            )
          `)
          .eq('user_id', authUser.id)
          .maybeSingle();
        
        if (error) {
          console.error('❌ Supabase Profile Query Error:', error);
          toast({
            title: "Erro ao carregar perfil",
            description: "Usando dados locais como fallback",
            variant: "destructive"
          });
        } else {
          console.log('🔍 Profile Query Result:', supabaseProfile);
          profile = supabaseProfile;
        }
      }

      // If no Supabase profile, use localStorage data
      if (!profile) {
        const userData = localStorage.getItem('satoshi_user');
        if (userData) {
          try {
            const localUser = JSON.parse(userData);
            profile = {
              id: 'local-user',
              nickname: localUser.nickname || 'Usuário',
              level: localUser.level || 1,
              xp: localUser.xp || 0,
              streak: localUser.streak || 0,
              points: localUser.coins || 0,
              profile_image_url: localUser.profileImageUrl,
              avatar_id: localUser.avatarId
            };
            console.log('📱 Using localStorage profile:', profile);
          } catch (parseError) {
            console.error('❌ Error parsing localStorage:', parseError);
            // Create default profile
            profile = {
              id: 'default-user',
              nickname: 'Usuário',
              level: 1,
              xp: 0,
              streak: 0,
              points: 0
            };
          }
        } else {
          // No local data, create minimal profile
          profile = {
            id: 'guest-user',
            nickname: 'Usuário',
            level: 1,
            xp: 0,
            streak: 0,
            points: 0
          };
        }
      }

      setUser(profile);
      // Avatar data is already included in the profile query
      setUserAvatar(profile?.avatars || null);
      
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      toast({
        title: "Erro no carregamento",
        description: "Erro ao carregar perfil do usuário",
        variant: "destructive"
      });
      
      // Set default user to prevent crash
      setUser({
        id: 'error-user',
        nickname: 'Usuário',
        level: 1,
        xp: 0,
        streak: 0,
        points: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpdated = (newImageUrl: string) => {
    if (user) {
      setUser({ ...user, profile_image_url: newImageUrl });
      // CORREÇÃO 1: Invalidar caches quando foto é atualizada
      invalidateAvatarCaches();
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

  // Always render something to avoid hook violations
  if (loading) {
    return <ProfileStyleLoader />;
  }

  // If no user after loading, show error state instead of early return
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 max-w-md mx-auto">
          <CardContent className="text-center">
            <h2 className="text-xl font-bold mb-4">Perfil não encontrado</h2>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar seus dados.
            </p>
            <div className="space-y-2">
              <Button onClick={loadUserProfile} className="w-full">
                Tentar novamente
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full">
                Voltar ao Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24" 
         style={{ paddingTop: '50px' }}>
      {/* Header - Enhanced mobile spacing */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-6 py-4 pt-18" 
           style={{ top: 'env(safe-area-inset-top, 0px)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                ← {t('navigation.dashboard')}
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
              {t('navigation.settings')}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Profile Header - Enhanced Mobile Design */}
        <Card className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              <div className="relative self-center md:self-auto">
                <AvatarDisplayUniversal
                  avatarData={{
                    profile_image_url: user.profile_image_url,
                    current_avatar_id: user.current_avatar_id,
                    avatars: userAvatar
                  }}
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
                {getStaticLevelInfo(user.level).name} • {user.points} Beetz
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

        {/* User Evolution Chart */}
        <UserEvolutionChart 
          userId={user.id} 
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />

        {/* Stats Grid */}
        <StatsGrid
          xp={user.xp}
          completedLessons={completedLessonsCount}
          streak={user.streak}
          points={user.points}
        />

        {/* XP and Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <XPCard
            level={user.level}
            currentXP={user.xp}
            nextLevelXP={getNextLevelXP ? getNextLevelXP(user.level) : user.level * 100}
          />
          
          <Card className="p-4 md:p-6">
            <h3 className="font-bold text-foreground mb-4">Progresso Geral</h3>
            <ProgressBar
              value={completedLessonsCount}
              max={progressGoal}
              showLabel
              className="mb-3"
            />
            <p className="text-sm text-muted-foreground">
              {completedLessonsCount} de {progressGoal} lições diárias completas
            </p>
          </Card>
        </div>

        {/* Carousels Section */}
        <div className="space-y-6">
          <AchievementsCarousel />

          <AvatarCarousel
            userProfileId={user.id}
            currentAvatarId={user.current_avatar_id}
            onAvatarChanged={(avatarId) => {
              setUser(prev => ({ ...prev, current_avatar_id: avatarId }));
              invalidateAvatarCaches();
              toast({
                title: "Avatar atualizado! ✨",
                description: "Seu avatar foi alterado com sucesso.",
              });
            }}
          />

          <InventoryCarousel />
        </div>

        {/* Active Rewards Panel */}
        <ActiveRewardsPanel userId={user.id} showHistory={true} />

        {/* Subscription Plan Card */}
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

        {/* ============================================
        // PERSONALIZAÇÃO EXTREMA - TEMPORARIAMENTE DESABILITADA
        // ============================================
        // Esta funcionalidade foi temporariamente removida para 
        // revisão e melhorias futuras. Será reativada em breve.
        // 
        // Funcionalidades incluídas:
        // - Avatar 2.0 com customização avançada
        // - Sistema de pets companions
        // - Banners de perfil personalizados  
        // - Títulos e badges animados
        // - Analytics de visualizações do perfil
        // ============================================
        
        {/* FASE 2: Avatar 2.0 Button - COMENTADO
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Personalização Extrema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/profile-customization')}
              className="w-full"
            >
              Customizar Avatar & Perfil
            </Button>
          </CardContent>
        </Card>
        */}
      </div>
      
      <FloatingNavbar />
    </div>
  );
}
