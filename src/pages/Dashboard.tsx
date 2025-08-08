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
import UltraOptimizedDashboard from '@/components/dashboard/UltraOptimizedDashboard';
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
    <div className="min-h-screen bg-background">
      <FloatingNavbar />
      
      {/* Ultra-simplified dashboard usando apenas UltraOptimizedDashboard */}
      <UltraOptimizedDashboard />

      {/* Avatar Selection Modal */}
      <AvatarSelection 
        open={showAvatarSelection}
        onOpenChange={setShowAvatarSelection}
        onAvatarSelected={handleAvatarSelected}
      />
    </div>
  );
}
