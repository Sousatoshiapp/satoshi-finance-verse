import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BeetzIcon } from "@/components/ui/beetz-icon";
import { FloatingNavbar } from "@/components/floating-navbar";
import { AvatarSelection } from "@/components/avatar-selection";
import { AvatarDisplay } from "@/components/avatar-display";
import { TournamentCarousel } from "@/components/tournaments/tournament-carousel";
import { DuelPlaygroundGrid } from "@/components/duel-playground-grid";
import { SubscriptionIndicator } from "@/components/subscription-indicator";
import { CarouselDailyMissions } from "@/components/carousel-daily-missions";
import { useSubscription } from "@/hooks/use-subscription";
import { useDailyMissions } from "@/hooks/use-daily-missions";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DashboardSummary } from "@/components/dashboard-summary";
import { QuickActions } from "@/components/quick-actions";
import { UserAffiliation } from "@/components/user-affiliation";
import { CompactLeaderboard } from "@/components/compact-leaderboard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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
  const [greeting, setGreeting] = useState(getGreeting());
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription, refreshSubscription } = useSubscription();
  const { markDailyLogin } = useDailyMissions();
  const { data: dashboardData, isLoading, error } = useDashboardData();

  useEffect(() => {
    // Check for payment success parameters
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const tier = urlParams.get('tier');
    
    if (sessionId && tier) {
      handlePaymentSuccess(sessionId, tier);
    }
    
    // Mark daily login for missions
    markDailyLogin();
    
    // Update greeting every minute
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    
    return () => clearInterval(interval);
  }, [markDailyLogin]);

  // Show avatar selection for new users without avatar
  useEffect(() => {
    if (dashboardData && !dashboardData.avatar) {
      setShowAvatarSelection(true);
    }
  }, [dashboardData]);

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
        window.history.replaceState({}, document.title, "/dashboard");
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

  const handleAvatarSelected = () => {
    // Refetch dashboard data to get the new avatar
    window.location.reload();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state  
  if (error) {
    console.error('Dashboard data error:', error);
  }

  // Extract data with fallbacks
  const userStats = dashboardData ? {
    level: dashboardData.profile?.level || 1,
    currentXP: dashboardData.profile?.xp || 0,
    nextLevelXP: dashboardData.nextLevelXP || 100,
    streak: dashboardData.profile?.streak || 0,
    completedLessons: dashboardData.profile?.completed_lessons || 0,
    points: dashboardData.profile?.points || 0
  } : {
    level: 1,
    currentXP: 0,
    nextLevelXP: 100,
    streak: 0,
    completedLessons: 0,
    points: 0
  };

  const userNickname = dashboardData?.profile?.nickname || 'Estudante';
  const userAvatar = dashboardData?.avatar;
  const hasAvatar = !!userAvatar;
  const userDistrict = dashboardData?.district;
  const userTeam = dashboardData?.team;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Optimized Header with Consolidated Profile */}
      <div className="px-4 pt-8 pb-4">
        <div className="max-w-md mx-auto">
          {/* Simplified Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{greeting.icon} {greeting.text}</p>
              <h1 className="text-xl font-bold text-foreground">{userNickname}</h1>
            </div>
            <div className="flex items-center gap-2">
              <SubscriptionIndicator tier={subscription.tier} size="sm" />
              {subscription.tier === 'free' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/subscription-plans')}
                  className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0"
                >
                  ⭐ Pro
                </Button>
              )}
            </div>
          </div>

          {/* Consolidated Avatar & Level Section */}
          <div className="text-center mb-6">
            <div className="relative mb-4">
              {userAvatar ? (
                <div className="flex justify-center">
                  <div className="relative">
                    <AvatarDisplay 
                      avatar={userAvatar} 
                      size="lg"
                      showBadge={true}
                      evolutionLevel={userAvatar.evolution_level || 1}
                    />
                    {/* Level Badge - Positioned Right Side */}
                    <div className="absolute -bottom-0.5 right-2">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-medium shadow-md flex items-center gap-1">
                        <span>Nível</span>
                        <span className="font-bold">{userStats.level}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-b from-muted to-card rounded-full flex items-center justify-center overflow-hidden shadow-elevated">
                    <div className="text-5xl">🤖</div>
                  </div>
                  <div className="absolute -bottom-0.5 right-2">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-medium shadow-md flex items-center gap-1">
                      <span>Nível</span>
                      <span className="font-bold">{userStats.level}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Responsive Progress Bar */}
            <div className="w-full max-w-sm mx-auto px-2 sm:px-0">
              <div 
                className="w-full bg-muted rounded-full h-2 mb-3 cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => navigate('/levels')}
              >
                <div 
                  className="bg-gradient-to-r from-success to-primary h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((userStats.currentXP / userStats.nextLevelXP) * 100, 100)}%` 
                  }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center text-xs text-muted-foreground mb-4 px-1">
                <span>XP: {userStats.currentXP}</span>
                <span>Meta: {userStats.nextLevelXP}</span>
              </div>
            </div>

            {/* Profile Button with Side Badges - Responsive */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4">
              {/* XP Badge - Left Side */}
              <div 
                className="border border-[#adff2f] rounded-full px-3 sm:px-6 py-2 cursor-pointer hover:scale-105 transition-all duration-200 flex items-center justify-center gap-1.5 w-full sm:w-[120px] max-w-[120px]"
                onClick={() => navigate('/levels')}
                style={{ borderWidth: '0.5px' }}
              >
                <span className="text-sm">⚡</span>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground leading-none">XP</div>
                  <div className="text-xs font-bold text-foreground leading-none">{userStats.currentXP}</div>
                </div>
              </div>

              {/* Profile Button */}
              <Button 
                className="bg-gradient-to-r from-primary to-success text-black px-3 sm:px-6 py-2 rounded-full font-semibold shadow-glow w-full sm:w-[120px] max-w-[120px] text-xs sm:text-sm"
                onClick={() => navigate(hasAvatar ? '/profile' : '/store')}
              >
                {hasAvatar ? 'Meu Perfil' : 'Escolher Avatar'}
              </Button>

              {/* Beetz Badge - Right Side */}
              <div 
                className="border border-[#adff2f] rounded-full px-3 sm:px-6 py-2 cursor-pointer hover:scale-105 transition-all duration-200 flex items-center justify-center gap-1.5 w-full sm:w-[120px] max-w-[120px]"
                onClick={() => navigate('/beetz-info')}
                style={{ borderWidth: '0.5px' }}
              >
                <BeetzIcon size="md" />
                <div className="text-center">
                  <div className="text-xs text-muted-foreground leading-none">Beetz</div>
                  <div className="text-xs font-bold text-foreground leading-none">{userStats.points}</div>
                </div>
              </div>
            </div>
          </div>

          {/* User Affiliation - District & Team */}
          <UserAffiliation district={userDistrict} team={userTeam} />

          {/* Ranking Semanal de Beetz */}
          <div className="mb-4">
            <CompactLeaderboard />
          </div>

          {/* Enhanced Daily Summary */}
          <DashboardSummary userStats={userStats} subscription={subscription} />

          {/* Core Actions */}
          <div className="mb-6">
            <CarouselDailyMissions />
          </div>

          <div className="mb-6">
            <TournamentCarousel />
          </div>
          
          <div className="mb-6">
            <DuelPlaygroundGrid />
          </div>

          {/* Quick Actions */}
          <QuickActions />

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