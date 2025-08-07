import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/shared/ui/button";
import { BTZCounter } from "@/components/features/quiz/btz-counter";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { AvatarSelection } from "@/components/shared/avatar-selection";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
// import { TournamentCarousel } from "@/components/features/gamification/tournament-carousel";
// import { DuelPlaygroundGrid } from "@/components/shared/duel-playground-grid";
import { SubscriptionIndicator } from "@/components/shared/subscription-indicator";
import { CarouselDailyMissions } from "@/components/shared/carousel-daily-missions";
import { useSubscription } from "@/hooks/use-subscription";
import { useDailyMissions } from "@/hooks/use-daily-missions";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DashboardSummaryOptimized } from "@/components/shared/dashboard-summary-optimized";
import { QuickActionsOptimized } from "@/components/shared/quick-actions-optimized";
import { DistrictCircleBadge } from "@/components/features/gamification/district-circle-badge";
import { CompactLeaderboard } from "@/components/shared/compact-leaderboard";
import { BtcDuelCard } from "@/components/features/duels/btc/BtcDuelCard";
import { LoadingSpinner } from "@/components/shared/ui/loading-spinner";
import { useRealtimePoints } from "@/hooks/use-realtime-points";
import { useRealtime } from "@/contexts/RealtimeContext";
import { CrisisAlert } from "@/components/crisis/CrisisAlert";
import { CrisisIcon } from "@/components/crisis/CrisisIcon";
import { useCrisisState } from "@/hooks/use-crisis-state";
import { LanguageSwitch } from "@/components/shared/language-switch";
// import { ProximityDetection } from "@/components/proximity/ProximityDetection";
import { useAvatarContext } from "@/contexts/AvatarContext";


const getGreeting = (t: any) => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return { text: "Bom dia", icon: "☀️" };
  } else if (hour >= 12 && hour < 18) {
    return { text: "Boa tarde", icon: "🌤️" };
  } else {
    return { text: "Boa noite", icon: "🌙" };
  }
};

export default function Dashboard() {
  const [greeting, setGreeting] = useState(getGreeting(null));
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { invalidateAvatarCaches } = useAvatarContext();
  const { subscription, refreshSubscription } = useSubscription();
  const { markDailyLogin } = useDailyMissions();
  const { data: dashboardData, isLoading, error } = useDashboardData();
  const { points: realtimePoints, isOnline } = useRealtime();
  const { crisis, shouldShowBanner, shouldShowIcon, dismissBanner, openBanner, markAsContributed } = useCrisisState();
  
  console.log('Dashboard crisis state:', { shouldShowBanner, shouldShowIcon, crisis: !!crisis });

  // Memoize navigation handlers
  const handleNavigateToLevels = useCallback(() => navigate('/levels'), [navigate]);
  const handleNavigateToBeetzInfo = useCallback(() => navigate('/beetz-info'), [navigate]);
  const handleNavigateToProfile = useCallback(() => navigate('/profile'), [navigate]);
  const handleNavigateToStore = useCallback(() => navigate('/store'), [navigate]);
  const handleNavigateToSubscription = useCallback(() => navigate('/subscription-plans'), [navigate]);

  useEffect(() => {
    // Preload critical resources in background - with throttling
    const loadOptimizations = async () => {
      // Only run optimizations every 10 seconds to prevent spam
      const lastOptimization = localStorage.getItem('last-optimization');
      const now = Date.now();
      
      if (!lastOptimization || (now - parseInt(lastOptimization)) > 10000) {
        try {
          const { preloadCriticalResources, optimizeMemoryUsage } = await import('@/utils/bundle-optimizer');
          preloadCriticalResources();
          optimizeMemoryUsage();
          localStorage.setItem('last-optimization', now.toString());
        } catch (error) {
          // Silent fail for non-critical optimization
          console.debug('Bundle optimization failed:', error);
        }
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
    
    // Mark daily login for missions (only for users older than 1 hour)
    if (dashboardData?.profile) {
      const userCreatedAt = new Date(dashboardData.profile.created_at);
      const hoursAgo = (Date.now() - userCreatedAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursAgo >= 1) {
        markDailyLogin();
      }
    }
    
    // Update greeting every minute
    const interval = setInterval(() => {
      setGreeting(getGreeting(t));
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
        description: "Problema na ativação da assinatura",
        variant: "destructive"
      });
    }
  }, [toast, refreshSubscription]);

  // Memoize avatar selection handler
  const handleAvatarSelected = useCallback(() => {
    // Invalidate all avatar-related caches for real-time updates
    invalidateAvatarCaches();
  }, [invalidateAvatarCaches]);

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
      completedLessons: dashboardData.completedQuizzes || 0, // Use real quiz data
      points: realtimePoints || dashboardData.profile?.points || 0
    };
  }, [dashboardData, realtimePoints]);

  // Memoize user data extraction
  const userNickname = useMemo(() => dashboardData?.profile?.nickname || "Estudante", [dashboardData?.profile?.nickname]);
  const userAvatar = useMemo(() => dashboardData?.avatar, [dashboardData?.avatar]);
  const hasAvatar = useMemo(() => !!userAvatar, [userAvatar]);
  const userDistrict = useMemo(() => dashboardData?.district, [dashboardData?.district]);

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
              <p className="text-sm text-muted-foreground mb-1">
                {greeting.icon} {greeting.text}
                {/* Realtime connection indicator */}
                <span className="ml-2">
                  {isOnline ? (
                    <span className="inline-flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-500">Online</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-xs text-red-500">Offline</span>
                    </span>
                  )}
                </span>
              </p>
              <h1 className="text-xl font-bold text-foreground">{userNickname}</h1>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitch />
              {shouldShowIcon && (
                <CrisisIcon onClick={() => {
                  console.log('CrisisIcon clicked, calling openBanner');
                  openBanner();
                }} />
              )}
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

          {/* Crisis Alert - Non-invasive placement */}
          <CrisisAlert 
            crisis={crisis}
            shouldShowBanner={shouldShowBanner}
            onDismiss={() => {
              console.log('CrisisAlert dismiss button clicked');
              dismissBanner();
            }} 
            onContributed={markAsContributed} 
          />

          {/* Consolidated Avatar & User Info - Horizontal Layout */}
          <div className="flex items-center gap-4 mb-6">
            {/* Avatar with badges on the left */}
            <div className="relative flex-shrink-0">
              {userAvatar ? (
                <div className="relative">
                  {(() => {
                    console.log('🔍 Dashboard Avatar Data:', {
                      profile_image_url: dashboardData?.profile?.profile_image_url,
                      current_avatar_id: dashboardData?.profile?.current_avatar_id,
                      userAvatar: userAvatar,
                      fullProfile: dashboardData?.profile
                    });
                    return null;
                  })()}
                  <AvatarDisplayUniversal
                    avatarData={{
                      profile_image_url: dashboardData?.profile?.profile_image_url,
                      current_avatar_id: dashboardData?.profile?.current_avatar_id,
                      avatars: userAvatar
                    }}
                    nickname={dashboardData?.profile?.nickname || 'User'}
                    size="lg"
                    className="cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={handleNavigateToProfile}
                  />
                  {/* Botão + Discreto (smaller) */}
                  <div className="absolute top-0 left-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToStore();
                      }}
                      className="bg-gradient-to-r from-success/80 to-primary/80 text-white w-5 h-5 rounded-full text-xs font-bold hover:from-success hover:to-primary transition-all duration-200 shadow-md flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className="relative cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={handleNavigateToProfile}
                >
                  <div className="w-16 h-16 bg-gradient-to-b from-muted to-card rounded-full flex items-center justify-center overflow-hidden shadow-elevated">
                    <div className="text-2xl">🤖</div>
                  </div>
                  {/* Botão + Discreto (smaller) */}
                  <div className="absolute top-0 left-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToStore();
                      }}
                      className="bg-gradient-to-r from-success/80 to-primary/80 text-white w-5 h-5 rounded-full text-xs font-bold hover:from-success hover:to-primary transition-all duration-200 shadow-md flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* User information on the right */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-3">Nível {userStats.level}</p>
              
              {/* Compact Progress Bar */}
              <div className="w-full">
                <div 
                  className="w-full bg-muted rounded-full h-1.5 mb-2 cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={handleNavigateToLevels}
                >
                  <div 
                    className="bg-gradient-to-r from-success to-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((userStats.currentXP / userStats.nextLevelXP) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>XP: {userStats.currentXP}</span>
                  <span>Meta: {userStats.nextLevelXP}</span>
                </div>
              </div>
            </div>
          </div>

          {/* BTZ Counter - Separate section */}
          <div className="mb-6">
            <BTZCounter />
          </div>



          {/* Ranking Semanal de Beetz */}
          <div className="mb-4">
            <CompactLeaderboard />
          </div>

          {/* BTC Duelo Rápido Card */}
          <div className="mb-4">
            <BtcDuelCard />
          </div>

          {/* Enhanced Daily Summary */}
          <DashboardSummaryOptimized userStats={userStats} subscription={subscription} />

          {/* Core Actions */}
          <div className="mb-6">
            <CarouselDailyMissions />
          </div>

          {/* Torneios Épicos - Coming Soon Card */}
          <div className="mb-6">
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="font-semibold text-foreground mb-2">Torneios Épicos</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Prepare-se para batalhas épicas e prêmios incríveis!
              </p>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-primary">Em breve!</span>
              </div>
            </div>
          </div>
          
          {/* <div className="mb-6">
            <TournamentCarousel />
          </div> */}
          
          {/* <div className="mb-6">
            <DuelPlaygroundGrid />
          </div> */}

          {/* Proximity Detection - Commented for future use */}
          {/* <div className="mb-6">
            <ProximityDetection />
          </div> */}

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
