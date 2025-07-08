import { useState, useEffect } from "react";
import { LessonCard } from "@/components/lesson-card";
import { XPCard } from "@/components/ui/xp-card";
import { StreakBadge } from "@/components/ui/streak-badge";
import { Button } from "@/components/ui/button";
import { FloatingNavbar } from "@/components/floating-navbar";
import { AvatarSelection } from "@/components/avatar-selection";
import { AvatarDisplay } from "@/components/avatar-display";
import { CompactStreakCounter } from "@/components/compact-streak-counter";
import { CompactBadgeShowcase } from "@/components/compact-badge-showcase";
import { CompactDailyRewards } from "@/components/compact-daily-rewards";
import { TournamentCarousel } from "@/components/tournaments/tournament-carousel";
import { DuelPlaygroundGrid } from "@/components/duel-playground-grid";
import { SubscriptionIndicator } from "@/components/subscription-indicator";
import { CarouselDailyMissions } from "@/components/carousel-daily-missions";
import { AnimatedLootBox } from "@/components/animated-loot-box";
import { CompactLeaderboard } from "@/components/compact-leaderboard";
import { CarouselSocialChallenges } from "@/components/carousel-social-challenges";
import { CarouselWeeklyTournaments } from "@/components/carousel-weekly-tournaments";
import { GuildSystem } from "@/components/guild-system";
import { MarketplacePromotionBanner } from "@/components/marketplace-promotion-banner";
import { CompactStreakRewards } from "@/components/compact-streak-rewards";
import { BannerAIAssistant } from "@/components/banner-ai-assistant";
import { BannerSocialTrading } from "@/components/banner-social-trading";
import { BannerAnalytics } from "@/components/banner-analytics";
import { BannerVIPMentorship } from "@/components/banner-vip-mentorship";
import { useSubscription } from "@/hooks/use-subscription";
import { useDailyMissions } from "@/hooks/use-daily-missions";
import { useNavigate } from "react-router-dom";
import { lessons } from "@/data/lessons";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getLevelInfo } from "@/data/levels";
import newLogo from "/lovable-uploads/874326e7-1122-419a-8916-5df0c112245d.png";

const getGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return { text: "BOM DIA", icon: "☀️" };
  } else if (hour >= 12 && hour < 18) {
    return { text: "BOA TARDE", icon: "🌤️" };
  } else {
    return { text: "BOA NOITE", icon: "🌙" };
  }
};

export default function Dashboard() {
  const [userStats, setUserStats] = useState({
    level: 3,
    currentXP: 245,
    nextLevelXP: 400,
    streak: 7,
    completedLessons: 3
  });
  const [userNickname, setUserNickname] = useState('Estudante');
  const [greeting, setGreeting] = useState(getGreeting());
  const [userAvatar, setUserAvatar] = useState<any>(null);
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  const [hasAvatar, setHasAvatar] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription, canCreateDuel, refreshSubscription } = useSubscription();
  const { markDailyLogin } = useDailyMissions();

  useEffect(() => {
    // Verificar se há parâmetros de sucesso do Stripe na URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const tier = urlParams.get('tier');
    
    if (sessionId && tier) {
      handlePaymentSuccess(sessionId, tier);
    }
    
    // Carregar dados do usuário
    loadUserData();
    
    // Marcar login diário para missões
    markDailyLogin();
    
    // Atualizar saudação a cada minuto
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    
    return () => clearInterval(interval);
  }, [navigate]);

  const handlePaymentSuccess = async (sessionId: string, tier: string) => {
    try {
      toast({
        title: "Processando pagamento...",
        description: "Aguarde enquanto ativamos sua assinatura.",
      });

      const { data, error } = await supabase.functions.invoke('process-subscription-success', {
        body: { session_id: sessionId }
      });

      if (error) throw error;

      if (data?.success) {
        // Limpar parâmetros da URL
        window.history.replaceState({}, document.title, "/dashboard");
        
        // Atualizar dados da assinatura
        refreshSubscription();
        
        toast({
          title: "🎉 Assinatura ativada!",
          description: `Seu plano ${tier.toUpperCase()} está ativo! ${data.beetz_awarded > 0 ? `Você ganhou ${data.beetz_awarded} Beetz!` : ''}`,
        });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Houve um problema ao ativar sua assinatura. Entre em contato com o suporte.",
        variant: "destructive"
      });
    }
  };

  const loadUserData = async () => {
    // Sempre carregar dados do localStorage primeiro
    const userData = localStorage.getItem('satoshi_user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserStats({
        level: user.level || 1,
        currentXP: user.xp || 0,
        nextLevelXP: (user.level || 1) * 100,
        streak: user.streak || 0,
        completedLessons: user.completedLessons || 0
      });
      setUserNickname(user.nickname || 'Estudante');
    }
    
    try {
      // Tentar carregar do Supabase para sobrescrever se disponível
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          *,
          avatars (
            id,
            name,
            description,
            image_url,
            avatar_class,
            district_theme,
            rarity,
            evolution_level
          )
        `)
        .eq('user_id', authUser.id)
        .single();

      if (profile) {
        setUserStats({
          level: profile.level || 1,
          currentXP: profile.xp || 0,
          nextLevelXP: (profile.level || 1) * 100,
          streak: profile.streak || 0,
          completedLessons: profile.completed_lessons || 0
        });
        setUserNickname(profile.nickname || 'Estudante');
        
        // Check if user has an avatar
        if (profile.avatars) {
          setUserAvatar(profile.avatars);
          setHasAvatar(true);
        } else {
          // Check if user is new and should see avatar selection
          setShowAvatarSelection(true);
        }
      }
    } catch (error) {
      console.error('Error loading user data from Supabase:', error);
      // Dados do localStorage já foram carregados acima
    }
  };

  const handleAvatarSelected = () => {
    // Reload user data to get the new avatar
    loadUserData();
  };

  const handleAvatarAction = () => {
    if (hasAvatar) {
      // Navigate to avatar evolution/upgrade section in store
      navigate('/store?tab=avatars');
    } else {
      // Show avatar selection dialog
      setShowAvatarSelection(true);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with Profile */}
      <div className="px-4 pt-8 pb-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{greeting.icon} {greeting.text}</p>
              <h1 className="text-xl font-bold text-foreground">{userNickname}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-avatar rounded-full flex items-center justify-center text-white font-bold text-lg shadow-glow">
                  {userNickname.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -top-1 -right-1">
                  <SubscriptionIndicator tier={subscription.tier} size="sm" />
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
                ⚙️
              </Button>
              {subscription.tier === 'free' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/subscription-plans')}
                  className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 hover:from-yellow-600 hover:to-orange-600"
                >
                  ⭐ Upgrade
                </Button>
              )}
            </div>
          </div>

          {/* Avatar Section */}
          <div className="text-center mb-6">
            <div className="relative mb-4">
              {userAvatar ? (
                <div className="flex justify-center">
                  <div className="relative">
                    <AvatarDisplay 
                      avatar={userAvatar} 
                      size="xl"
                      showBadge={true}
                      evolutionLevel={userAvatar.evolution_level || 1}
                    />
                    {/* Level Badge - Centered at bottom of avatar */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border border-orange-400">
                        NÍVEL {userStats.level}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="w-48 h-48 mx-auto bg-gradient-to-b from-muted to-card rounded-full flex items-center justify-center overflow-hidden shadow-elevated">
                    <div className="text-8xl mb-4">🤖</div>
                  </div>
                  {/* Level Badge for placeholder avatar */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border border-orange-400">
                      NÍVEL {userStats.level}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <Button 
              className="bg-gradient-to-r from-primary to-success text-black px-8 py-3 rounded-full text-lg font-semibold shadow-glow mb-4"
              onClick={handleAvatarAction}
            >
              {hasAvatar ? 'Evoluir Avatar' : 'Escolher Avatar'}
            </Button>
            
            <p className="text-muted-foreground text-sm mb-2">
              {hasAvatar 
                ? 'Continue jogando para evoluir seu cidadão digital' 
                : 'Selecione seu primeiro avatar para começar'
              }
            </p>
            
            <div className="flex items-center justify-between text-sm mb-4">
              <span className="text-foreground font-medium">
                {userAvatar ? userAvatar.name : 'Cidadão Anônimo'}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/levels')}
                className="text-muted-foreground hover:text-foreground"
              >
                {getLevelInfo(userStats.level).name} →
              </Button>
            </div>
            
            <div 
              className="w-full bg-muted rounded-full h-2 mb-6 cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => navigate('/levels')}
            >
              <div 
                className="bg-gradient-to-r from-success to-primary h-2 rounded-full"
                style={{ width: `${(userStats.currentXP / userStats.nextLevelXP) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
              <span>XP: {userStats.currentXP}</span>
              <span>Próximo: {getLevelInfo(userStats.level + 1).name}</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div 
              className="bg-gradient-experience rounded-2xl p-4 text-center shadow-card cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate('/levels')}
            >
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-xs text-white mb-1">XP</div>
              <div className="text-2xl font-bold text-white">{userStats.currentXP}</div>
            </div>
            <div 
              className="bg-gradient-level rounded-2xl p-4 text-center shadow-card cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate('/levels')}
            >
              <div className="text-2xl mb-1">🏅</div>
              <div className="text-xs text-white mb-1">Nível</div>
              <div className="text-2xl font-bold text-white">{String(userStats.level).padStart(2, '0')}</div>
            </div>
            <div 
              className="bg-gradient-beetz rounded-2xl p-4 text-center shadow-card cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate('/beetz-info')}
            >
              <div className="text-2xl mb-1">🥕</div>
              <div className="text-xs text-white mb-1">Beetz</div>
              <div className="text-2xl font-bold text-white">{userStats.currentXP * 2}</div>
            </div>
          </div>

          {/* Compact Engagement Components */}
            <div className="grid gap-3 mb-8">
              <CompactStreakCounter currentStreak={userStats.streak} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <CompactDailyRewards />
                <CompactBadgeShowcase />
              </div>
              
              {/* Duel Limit Card for Free Users only */}
              {subscription.tier === 'free' && (
                <div className="bg-muted/30 border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Duelos Diários</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/subscription-plans')}
                      className="text-yellow-500 hover:text-yellow-400 text-xs"
                    >
                      Upgrade ⭐
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>{subscription.dailyDuelsUsed}/{subscription.dailyDuelsLimit} usados hoje</span>
                      <span className="text-muted-foreground">Reset em 24h</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded-full transition-all"
                        style={{ width: `${(subscription.dailyDuelsUsed / subscription.dailyDuelsLimit) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          {/* Daily Missions Carousel */}
          <div className="mb-6">
            <CarouselDailyMissions />
          </div>

          {/* Torneios Épicos, Duelo Financeiro, Playground */}
          <div className="mb-6">
            <TournamentCarousel />
          </div>
          
          <div className="mb-6">
            <DuelPlaygroundGrid />
          </div>

          {/* Weekly Ranking - Compact */}
          <div className="mb-6">
            <CompactLeaderboard />
          </div>

          {/* Social Challenges Carousel */}
          <div className="mb-6">
            <CarouselSocialChallenges />
          </div>

          {/* Weekly Tournaments Carousel */}
          <div className="mb-6">
            <CarouselWeeklyTournaments />
          </div>

          {/* Guild System */}
          <div className="mb-6">
            <GuildSystem />
          </div>

          {/* Streak Rewards - Compact */}
          <div className="mb-6">
            <CompactStreakRewards />
          </div>

          {/* AI Components as Banners */}
          <div className="mb-4">
            <BannerAIAssistant />
          </div>

          <div className="mb-4">
            <BannerSocialTrading />
          </div>

          <div className="mb-4">
            <BannerAnalytics />
          </div>

          <div className="mb-6">
            <BannerVIPMentorship />
          </div>

          {/* Marketplace Promotion Banner (appears on login) */}
          <MarketplacePromotionBanner />
          
          {/* Animated Loot Box (when available) */}
          <AnimatedLootBox isAvailable={true} />

          {/* Tournament Carousel */}
          <TournamentCarousel />

          {/* Duel and Playground Grid */}
          <DuelPlaygroundGrid />
        </div>
      </div>
      
      <FloatingNavbar />
      
      {/* Avatar Selection Dialog */}
      <AvatarSelection 
        open={showAvatarSelection}
        onOpenChange={setShowAvatarSelection}
        onAvatarSelected={handleAvatarSelected}
      />
    </div>
  );
}