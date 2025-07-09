import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { BeetzIcon } from "@/components/ui/beetz-icon";
import { FloatingNavbar } from "@/components/floating-navbar";
import { AvatarSelection } from "@/components/avatar-selection";
import { AvatarDisplayOptimized } from "@/components/avatar-display-optimized";
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
import { DashboardSummaryOptimized } from "@/components/dashboard-summary-optimized";
import { QuickActionsOptimized } from "@/components/quick-actions-optimized";
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

  // Memoize navigation handlers
  const handleNavigateToLevels = useCallback(() => navigate('/levels'), [navigate]);
  const handleNavigateToBeetzInfo = useCallback(() => navigate('/beetz-info'), [navigate]);
  const handleNavigateToProfile = useCallback(() => navigate('/profile'), [navigate]);
  const handleNavigateToStore = useCallback(() => navigate('/store'), [navigate]);
  const handleNavigateToSubscription = useCallback(() => navigate('/subscription-plans'), [navigate]);

  useEffect(() => {
    // Preload critical resources in background
    const loadOptimizations = async () => {
      try {
        const { preloadCriticalResources, optimizeMemoryUsage } = await import('@/utils/bundle-optimizer');
        preloadCriticalResources();
        optimizeMemoryUsage();
      } catch (error) {
        // Silent fail for non-critical optimization
        console.debug('Bundle optimization failed:', error);
      }
    };
    
    loadOptimizations();

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

  // Memoize payment success handler
  const handlePaymentSuccess = useCallback(async (sessionId: string, tier: string) => {
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
  }, [toast, refreshSubscription]);

  // Memoize avatar selection handler
  const handleAvatarSelected = useCallback(() => {
    window.location.reload();
  }, []);

  // Memoize loading state
  const loadingComponent = useMemo(() => (
    <div className="min-h-screen bg-background">
      <LoadingSpinner />
    </div>
  ), []);

  // Memoize user stats calculation
  const userStats = useMemo(() => {
    if (!dashboardData) {
      return {
        level: 1,
        currentXP: 0,
        nextLevelXP: 100,
        streak: 0,
        completedLessons: 0,
        points: 0
      };
    }
    
    return {
      level: dashboardData.profile?.level || 1,
      currentXP: dashboardData.profile?.xp || 0,
      nextLevelXP: dashboardData.nextLevelXP || 100,
      streak: dashboardData.profile?.streak || 0,
      completedLessons: dashboardData.profile?.completed_lessons || 0,
      points: dashboardData.profile?.points || 0
    };
  }, [dashboardData]);

  // Memoize user data extraction
  const userNickname = useMemo(() => dashboardData?.profile?.nickname || 'Estudante', [dashboardData?.profile?.nickname]);
  const userAvatar = useMemo(() => dashboardData?.avatar, [dashboardData?.avatar]);
  const hasAvatar = useMemo(() => !!userAvatar, [userAvatar]);
  const userDistrict = useMemo(() => dashboardData?.district, [dashboardData?.district]);
  const userTeam = useMemo(() => dashboardData?.team, [dashboardData?.team]);

  // Loading state
  if (isLoading) {
    return loadingComponent;
  }

  // Error state  
  if (error) {
    console.error('Dashboard data error:', error);
  }

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
                  onClick={handleNavigateToSubscription}
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
                  <div 
                    className="relative cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={handleNavigateToProfile}
                  >
                    <AvatarDisplayOptimized 
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
                    {/* Botão + Discreto */}
                    <div className="absolute top-0 left-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigateToStore();
                        }}
                        className="bg-gradient-to-r from-success/80 to-primary/80 text-white w-6 h-6 rounded-full text-sm font-bold hover:from-success hover:to-primary transition-all duration-200 shadow-md flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className="relative cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={handleNavigateToProfile}
                >
                  <div className="w-32 h-32 mx-auto bg-gradient-to-b from-muted to-card rounded-full flex items-center justify-center overflow-hidden shadow-elevated">
                    <div className="text-5xl">🤖</div>
                  </div>
                  <div className="absolute -bottom-0.5 right-2">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-medium shadow-md flex items-center gap-1">
                      <span>Nível</span>
                      <span className="font-bold">{userStats.level}</span>
                    </div>
                  </div>
                  {/* Botão + Discreto */}
                  <div className="absolute top-0 left-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToStore();
                      }}
                      className="bg-gradient-to-r from-success/80 to-primary/80 text-white w-6 h-6 rounded-full text-sm font-bold hover:from-success hover:to-primary transition-all duration-200 shadow-md flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Responsive Progress Bar */}
            <div className="w-full max-w-sm mx-auto px-2 sm:px-0">
              <div 
                className="w-full bg-muted rounded-full h-2 mb-3 cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={handleNavigateToLevels}
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

            {/* XP and Beetz Cards - Mobile Optimized */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* XP Card */}
              <div 
                className="border border-[#adff2f] rounded-2xl px-4 py-5 cursor-pointer hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                onClick={handleNavigateToLevels}
                style={{ borderWidth: '0.5px' }}
              >
                <span className="text-xl">⚡</span>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground leading-none">XP</div>
                  <div className="text-base font-bold text-foreground leading-none">{userStats.currentXP}</div>
                </div>
              </div>

              {/* Beetz Card */}
              <div 
                className="border border-[#adff2f] rounded-2xl px-4 py-5 cursor-pointer hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                onClick={handleNavigateToBeetzInfo}
                style={{ borderWidth: '0.5px' }}
              >
                <BeetzIcon size="md" />
                <div className="text-center">
                  <div className="text-sm text-muted-foreground leading-none">Beetz</div>
                  <div className="text-base font-bold text-foreground leading-none">{userStats.points}</div>
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
          <DashboardSummaryOptimized userStats={userStats} subscription={subscription} />

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
          <QuickActionsOptimized />

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