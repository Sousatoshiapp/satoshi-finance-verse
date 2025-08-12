// FASE 4: Loading Strategy Revolucionária - Skeleton-First Rendering
import React, { memo, useMemo, useEffect } from 'react';
import { useDashboardSuperQuery } from '@/hooks/use-dashboard-super-query';
import { UltraBTZCounter } from './UltraBTZCounter';
import { ProfileStyleLoader } from '@/components/shared/ui/profile-style-loader';
import { useI18n } from '@/hooks/use-i18n';

// Ultra-minimalist dashboard that renders skeleton immediately
const UltraOptimizedDashboard = memo(() => {
  const { t } = useI18n();
  const { data, isLoading } = useDashboardSuperQuery();

  // Greeting calculation memoized
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: t('dashboard.goodMorning'), icon: "☀️" };
    if (hour >= 12 && hour < 18) return { text: t('dashboard.goodAfternoon'), icon: "🌤️" };
    return { text: t('dashboard.goodNight'), icon: "🌙" };
  }, [t]);

  // User stats memoized - using ONLY database data as source of truth
  const userStats = useMemo(() => {
    if (!data) return {
      level: 1,
      currentXP: 0,
      nextLevelXP: 100,
      currentLevelXP: 0,
      xpProgress: 0,
      streak: 0,
      points: 0,
      nickname: t('dashboard.student')
    };

    // Use currentLevelXP from database (RPC now returns it)
    const currentLevelXP = data.currentLevelXP || 0;
    const xpInCurrentLevel = data.xp - currentLevelXP;
    const xpNeededForLevel = data.nextLevelXP - currentLevelXP;
    const progressPercentage = xpNeededForLevel > 0 ? (xpInCurrentLevel / xpNeededForLevel) * 100 : 0;

    // Debug logging para verificar cálculos
    console.log('XP Progress Debug:', {
      currentXP: data.xp,
      currentLevelXP,
      nextLevelXP: data.nextLevelXP,
      xpInCurrentLevel,
      xpNeededForLevel,
      progressPercentage: Math.min(Math.max(progressPercentage, 0), 100)
    });

    return {
      level: data.level,
      currentXP: data.xp,
      nextLevelXP: data.nextLevelXP,
      currentLevelXP,
      xpProgress: Math.min(Math.max(progressPercentage, 0), 100),
      streak: data.streak,
      points: data.points,
      nickname: data.profile?.nickname || t('dashboard.student')
    };
  }, [data, t]);

  // FASE 5: Performance optimization - Remove problematic external CSS
  useEffect(() => {
    const removeExternalCSS = () => {
      const links = document.querySelectorAll('link[href*="quizconomy.com"]');
      links.forEach(link => link.remove());
    };
    removeExternalCSS();
  }, []);

  // Always render loading for immediate paint
  if (isLoading || !data) {
    return <ProfileStyleLoader />;
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-[60px]">
      <div className="px-6 pb-4">
        <div className="max-w-md mx-auto">
          {/* Ultra-fast header */}
          <div className="flex items-center justify-between mb-14">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                <span>{greeting.icon}</span> <span>{greeting.text}</span>
              </p>
              <h1 className="text-xl font-bold text-foreground ml-[1.2ch]">{userStats.nickname}</h1>
            </div>
          </div>

          {/* Critical BTZ Counter - ultra-light version */}
          <div className="mb-10">
            <UltraBTZCounter 
              points={userStats.points} 
              level={userStats.level}
            />
          </div>

          {/* Corrected progress bar - shows progress between levels */}
          <div className="mb-6">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-success to-primary h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${userStats.xpProgress}%` 
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Level {userStats.level}</span>
              <span>{userStats.currentXP - userStats.currentLevelXP}/{userStats.nextLevelXP - userStats.currentLevelXP} XP</span>
            </div>
          </div>

          {/* Quick action buttons - minimal */}
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-card rounded-lg border text-left hover:bg-muted/50 transition-colors">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-sm font-medium">Quiz</div>
            </button>
            <button className="p-4 bg-card rounded-lg border text-left hover:bg-muted/50 transition-colors">
              <div className="text-2xl mb-2">🏆</div>
              <div className="text-sm font-medium">Ranking</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

UltraOptimizedDashboard.displayName = 'UltraOptimizedDashboard';

export default UltraOptimizedDashboard;