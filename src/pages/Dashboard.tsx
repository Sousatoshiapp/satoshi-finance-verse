import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/shared/ui/button";
import { LazyBTZCounter } from "@/components/dashboard/LazyBTZCounter";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { AvatarSelection } from "@/components/shared/avatar-selection";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
// import { TournamentCarousel } from "@/components/features/gamification/tournament-carousel";
// import { DuelPlaygroundGrid } from "@/components/shared/duel-playground-grid";
import { SubscriptionIndicator } from "@/components/shared/subscription-indicator";
// Removed direct import - now using LazyDailyMissions
import { useSubscription } from "@/hooks/use-subscription";
import { useDailyMissions } from "@/hooks/use-daily-missions";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useDashboardSuperQuery } from "@/hooks/use-dashboard-super-query";
import { usePerformanceOptimization } from "@/hooks/use-performance-optimization";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DistrictCircleBadge } from "@/components/features/gamification/district-circle-badge";
import { 
  LazyDashboardSummary, 
  LazyQuickActions, 
  LazyLeaderboard, 
  // LazyDailyMissions, // PERFORMANCE: Removido temporariamente - Hook complexo de missões
  // LazyBtcDuelCard // PERFORMANCE: Removido temporariamente - BTC WebSocket causando overhead
} from "@/components/dashboard/LazyDashboardSections";
import { LoadingSpinner } from "@/components/shared/ui/loading-spinner";
import { useRealtimePoints } from "@/hooks/use-realtime-points";
import { useRealtime } from "@/contexts/RealtimeContext";
import { useOnlineStatus } from "@/contexts/OnlineStatusContext";
import { CrisisAlert } from "@/components/crisis/CrisisAlert";
import { CrisisIcon } from "@/components/crisis/CrisisIcon";
import { useCrisisState } from "@/hooks/use-crisis-state";
import { LanguageSwitch } from "@/components/shared/language-switch";
import { useI18n } from "@/hooks/use-i18n";
// import { ProximityDetection } from "@/components/proximity/ProximityDetection";
import { useAvatarContext } from "@/contexts/AvatarContext";
import { getLevelInfo } from "@/data/levels";
import { useIsMobile } from "@/hooks/use-mobile";


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

// Helper function to get XP required for current level
const getCurrentLevelXP = (level: number) => {
  if (level === 1) return 0;
  
  // XP requirements by level (XP needed to REACH each level) - From database
  const xpTable: { [key: number]: number } = {
    1: 0, 2: 100, 3: 250, 4: 450, 5: 700,
    6: 1000, 7: 1350, 8: 1750, 9: 2200, 10: 2700,
    11: 3250, 12: 3850, 13: 4500, 14: 5200, 15: 5950,
    16: 6750, 17: 7600, 18: 8500, 19: 9450, 20: 10450,
    21: 10500, 22: 11000, 23: 11500, 24: 12000, 25: 12500
  };
  
  return xpTable[level] || 0;
};

export default function Dashboard() {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const [greeting, setGreeting] = useState(getGreeting(t));
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { invalidateAvatarCaches } = useAvatarContext();
  const { subscription, refreshSubscription } = useSubscription();
  const { markDailyLogin } = useDailyMissions();
  // ULTRA PERFORMANCE: Usar super query unificado
  const { data: superData, isLoading, error } = useDashboardSuperQuery();
  const { points: realtimePoints } = useRealtime();
  const { isOnline } = useOnlineStatus();
  const { crisis, shouldShowBanner, shouldShowIcon, dismissBanner, openBanner, markAsContributed } = useCrisisState();
  
  // Fallback para dados antigos se super query falhar
  const { data: fallbackData } = useDashboardData();
  const dashboardData = superData || fallbackData;
  
  // Remove logging para melhorar performance
  // console.log('Dashboard crisis state:', { shouldShowBanner, shouldShowIcon, crisis: !!crisis });

  // Memoize navigation handlers
  const handleNavigateToLevels = useCallback(() => navigate('/levels'), [navigate]);
  const handleNavigateToBeetzInfo = useCallback(() => navigate('/beetz-info'), [navigate]);
  const handleNavigateToProfile = useCallback(() => navigate('/profile'), [navigate]);
  const handleNavigateToStore = useCallback(() => navigate('/store'), [navigate]);
  const handleNavigateToSubscription = useCallback(() => navigate('/subscription-plans'), [navigate]);

  // ULTRA PERFORMANCE: Ativar otimizações críticas
  usePerformanceOptimization({
    enableQueryOptimization: true,
    enableBundleAnalysis: false, // Desligar em produção
  });

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
    // Remove logging para melhorar performance
    // console.log('🔍 Dashboard Avatar Data:', { ... });
    
    // Only show avatar selection if user has no avatar AND no profile image
    if (dashboardData && dashboardData.profile && 
        !dashboardData.profile.current_avatar_id && 
        !dashboardData.profile.profile_image_url && 
        !dashboardData.avatar) {
      // console.log('📱 Opening avatar selection modal - no avatar found');
      setShowAvatarSelection(true);
    } else if (dashboardData) {
      // console.log('✅ User has avatar, closing modal if open');
      setShowAvatarSelection(false);
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
    // console.log('🎯 Avatar selected - closing modal and invalidating caches');
    
    // Close the modal immediately
    setShowAvatarSelection(false);
    
    // Invalidate all avatar-related caches for real-time updates
    invalidateAvatarCaches();
    
    // Show success message
    toast({
      title: "Avatar selecionado!",
      description: "Seu avatar foi atualizado com sucesso.",
    });
  }, [invalidateAvatarCaches, toast]);

  // Memoize loading state
  const loadingComponent = useMemo(() => (
    <div className="min-h-screen bg-background">
      <LoadingSpinner />
    </div>
  ), []);

  // Memoize user stats calculation
  const userStats = useMemo(() => {
    // Remove logging para melhorar performance
    // console.log('🔍 Dashboard Data RAW:', dashboardData);
    
    if (!dashboardData) {
      // console.log('🔍 No dashboard data, returning defaults');
      return {
        level: 1,
        currentXP: 0,
        nextLevelXP: 100,
        streak: 0,
        completedLessons: 0,
        points: 0
      };
    }
    
    const currentLevel = dashboardData.profile?.level || 1;
    const currentXP = dashboardData.profile?.xp || 0;
    const nextLevelXP = dashboardData.nextLevelXP || 100;
    const currentLevelXP = getCurrentLevelXP(currentLevel);
    
    // Remove debug logging para melhorar performance
    // console.log('🔍 XP CALCULATION DEBUG:', { ... });
    
    return {
      level: currentLevel,
      currentXP,
      nextLevelXP,
      streak: dashboardData.profile?.streak || 0,
      completedLessons: dashboardData.completedQuizzes || 0,
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
    <div className={`min-h-screen bg-background ${isMobile ? 'pb-safe-area-bottom pb-24' : 'pb-20'}`}>
      {/* Optimized Header with Consolidated Profile - Mobile Adjusted */}
      <div className={`${isMobile ? 'px-8 pb-4' : 'px-6 pt-8 pb-4'}`} style={isMobile ? { paddingTop: '50px' } : {}}>
        <div className={`mx-auto ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
          {/* Simplified Header - Mobile Optimized */}
          <div className={`flex items-center justify-between ${isMobile ? 'mb-12' : 'mb-14'}`}>
            <div>
              <p className={`text-muted-foreground mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <span>{greeting.icon}</span> <span>{greeting.text}</span>
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
              <h1 className={`font-bold text-foreground ml-[1.2ch] ${isMobile ? 'text-lg' : 'text-xl'}`}>{userNickname}</h1>
            </div>
            <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
              <LanguageSwitch />
              {shouldShowIcon && (
                <CrisisIcon onClick={() => {
                  // console.log('CrisisIcon clicked, calling openBanner');
                  openBanner();
                }} />
              )}
              <SubscriptionIndicator tier={subscription.tier} size="sm" />
              {subscription.tier === 'free' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleNavigateToSubscription}
                  className={`bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 ${isMobile ? 'text-xs px-2 py-1 h-7' : 'text-xs'}`}
                >
                  ⭐ {t('common.pro')}
                </Button>
              )}
            </div>
          </div>

          {/* Crisis Alert - TEMPORARIAMENTE COMENTADO - Performance Fix */}
          {/*
          <CrisisAlert 
            crisis={crisis}
            shouldShowBanner={shouldShowBanner}
            onDismiss={() => {
              // console.log('CrisisAlert dismiss button clicked');
              dismissBanner();
            }}
            onContributed={markAsContributed} 
          />
          */}

          {/* Consolidated Avatar & User Info - Horizontal Layout - Mobile Optimized */}
          <div className={`flex items-center ${isMobile ? 'gap-3 mb-8' : 'gap-4 mb-10'}`}>
            {/* Avatar with badges on the left - Mobile Smaller */}
            <div className="relative flex-shrink-0">
              <div className="relative">
                {/* Always render AvatarDisplayUniversal with all available data */}
                <AvatarDisplayUniversal
                  avatarData={{
                    profile_image_url: dashboardData?.profile?.profile_image_url,
                    current_avatar_id: dashboardData?.profile?.current_avatar_id,
                    avatars: userAvatar
                  }}
                  nickname={dashboardData?.profile?.nickname || 'User'}
                  size={isMobile ? "md" : "lg"}
                  className="cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={handleNavigateToProfile}
                />
                {/* Botão + Discreto (smaller for mobile) */}
                <div className="absolute top-0 left-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigateToStore();
                    }}
                    className={`bg-gradient-to-r from-success/80 to-primary/80 text-white rounded-full font-bold hover:from-success hover:to-primary transition-all duration-200 shadow-md flex items-center justify-center ${isMobile ? 'w-4 h-4 text-xs' : 'w-5 h-5 text-xs'}`}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            {/* User information on the right - Mobile Optimized */}
            <div className="flex-1 min-w-0">
              <div className={`flex items-center gap-2 ${isMobile ? 'mb-2' : 'mb-3'}`}>
                <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>{t('common.level')} {userStats.level}</p>
                <span className={`${isMobile ? 'text-xs' : 'text-sm'}`} style={{ color: '#adff2f', opacity: 0.2 }}>{getLevelInfo(userStats.level).name}</span>
              </div>
              
              {/* Compact Progress Bar - Mobile Adjusted */}
              <div className="w-full">
                <div 
                  className={`w-full bg-muted rounded-full cursor-pointer hover:bg-muted/80 transition-colors ${isMobile ? 'h-1 mb-1.5' : 'h-1.5 mb-2'}`}
                  onClick={handleNavigateToLevels}
                >
                  <div 
                    className={`bg-gradient-to-r from-success to-primary rounded-full transition-all duration-300 ${isMobile ? 'h-1' : 'h-1.5'}`}
                    style={{ 
                      width: `${Math.min(((userStats.currentXP - getCurrentLevelXP(userStats.level)) / Math.max(1, userStats.nextLevelXP - getCurrentLevelXP(userStats.level))) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                
                <div className={`flex justify-between items-center text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
                  <span>{t('common.xp')}: {userStats.currentXP}</span>
                  <span>Faltam: {Math.max(0, userStats.nextLevelXP - userStats.currentXP)} XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* BTZ Counter - Separate section - Mobile Adjusted */}
          <div className={`${isMobile ? 'mb-8' : 'mb-10'}`}>
            <LazyBTZCounter />
          </div>

          {/* Botão Principal Jogar - Circular Gamer */}
          <div className={`${isMobile ? 'mb-6' : 'mb-8'} text-center`}>
            <Button 
              onClick={() => navigate('/game-mode')}
              className="jogar-button w-20 h-20 bg-gradient-to-br from-green-400 via-emerald-500 to-cyan-500 text-white text-sm font-bold rounded-full shadow-xl hover:shadow-2xl hover:shadow-green-500/50 border-2 border-green-300/50 relative overflow-hidden group"
            >
              <div className="relative z-10 flex flex-col items-center gap-1">
                <svg className="w-6 h-6 group-hover:animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 6v12l10-6z"/>
                </svg>
                <span className="text-xs">{t('common.play')}</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-75 transition-opacity duration-300 animate-pulse"></div>
            </Button>
          </div>

          {/* Ranking Semanal de Beetz - Mobile Spacing */}
          <div className={`${isMobile ? 'mb-10' : 'mb-12'}`}>
            <LazyLeaderboard />
          </div>

          {/* BTC Duelo Rápido Card - PERFORMANCE: Removido temporariamente */}
          {/*
          <div className="mb-4">
            <LazyBtcDuelCard />
          </div>
          */}

          {/* Enhanced Daily Summary */}
          <div className={`${isMobile ? 'mb-10' : 'mb-12'}`}>
            <LazyDashboardSummary userStats={userStats} subscription={subscription} />
          </div>


          {/* Core Actions - PERFORMANCE: Daily Missions removidas temporariamente */}
          {/*
          <div className="mb-6">
            <LazyDailyMissions />
          </div>
          */}

          {/* Torneios Épicos - Coming Soon Card - Mobile Optimized */}
          <div className={`${isMobile ? 'mb-4' : 'mb-6'}`}>
            <div className={`bg-card border border-border rounded-lg text-center ${isMobile ? 'p-4' : 'p-6'}`}>
              <div className={`mb-3 ${isMobile ? 'text-3xl' : 'text-4xl'}`}>🏆</div>
              <h3 className={`font-semibold text-foreground mb-2 ${isMobile ? 'text-sm' : ''}`}>Torneios Épicos</h3>
              <p className={`text-muted-foreground mb-3 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Prepare-se para batalhas épicas e prêmios incríveis!
              </p>
              <div className={`inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full ${isMobile ? 'px-2 py-1' : 'px-3 py-1.5'}`}>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className={`font-medium text-primary ${isMobile ? 'text-xs' : 'text-sm'}`}>Em breve!</span>
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
