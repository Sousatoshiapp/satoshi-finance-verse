import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/shared/ui/button";
import { BTZCounter } from "@/components/features/quiz/btz-counter";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { AvatarSelection } from "@/components/shared/avatar-selection";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { TournamentCarousel } from "@/components/features/gamification/tournament-carousel";
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
import { LoadingSpinner } from "@/components/shared/ui/loading-spinner";
import { useRealtimePoints } from "@/hooks/use-realtime-points";
import { useRealtime } from "@/contexts/RealtimeContext";
import { CrisisAlert } from "@/components/crisis/CrisisAlert";
import { CrisisIcon } from "@/components/crisis/CrisisIcon";
import { useCrisisState } from "@/hooks/use-crisis-state";
import { LanguageSwitch } from "@/components/shared/language-switch";
import { useI18n } from "@/hooks/use-i18n";
import { ProximityDetection } from "@/components/proximity/ProximityDetection";
import { useAvatarContext } from "@/contexts/AvatarContext";


const getGreeting = (t: any) => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return { text: t('dashboard.goodMorning'), icon: "☀️" };
  } else if (hour >= 12 && hour < 18) {
    return { text: t('dashboard.goodAfternoon'), icon: "🌤️" };
  } else {
    return { text: t('dashboard.goodNight'), icon: "🌙" };
  }
};

export default function Dashboard() {
  const { t } = useI18n();
  const [greeting, setGreeting] = useState(getGreeting(t));
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
    
    // Mark daily login for missions
    markDailyLogin();
    
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
        title: t('errors.paymentProcessingError'),
        description: t('errors.subscriptionActivationProblem'),
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
      completedLessons: dashboardData.profile?.completed_lessons || 0,
      points: realtimePoints || dashboardData.profile?.points || 0
    };
  }, [dashboardData, realtimePoints]);

  // Memoize user data extraction
  const userNickname = useMemo(() => dashboardData?.profile?.nickname || t('dashboard.student'), [dashboardData?.profile?.nickname, t]);
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
                      <span className="text-xs text-green-500">{t('online')}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-xs text-red-500">{t('offline')}</span>
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
                  ⭐ {t('common.pro')}
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

          {/* Consolidated Avatar & Level Section */}
          <div className="text-center mb-6">
            <div className="relative mb-4">
              {userAvatar ? (
                <div className="flex justify-center">
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
                      size="xl"
                      className="cursor-pointer hover:scale-105 transition-transform duration-200"
                      onClick={handleNavigateToProfile}
                    />
                    {/* Level Badge - Positioned Right Side */}
                    <div className="absolute -bottom-0.5 right-2">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-medium shadow-md flex items-center gap-1">
                        <span>{t('common.level')}</span>
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
                      <span>{t('common.level')}</span>
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
                <span>{t('common.xp')}: {userStats.currentXP}</span>
                <span>{t('dashboard.goal')}: {userStats.nextLevelXP}</span>
              </div>
            </div>

            {/* BTZ Counter com trend arrows */}
            <div className="w-full px-0">
              <BTZCounter />
            </div>
          </div>



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
          
          {/* <div className="mb-6">
            <DuelPlaygroundGrid />
          </div> */}

          {/* Proximity Detection */}
          <div className="mb-6">
            <ProximityDetection />
          </div>

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
