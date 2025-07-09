import { memo, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Trophy, Target } from "@/components/icons/optimized-icons";
import { useRenderPerformance } from "@/hooks/use-performance-monitor";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface UserStats {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  streak: number;
  completedLessons: number;
  points: number;
}

interface Subscription {
  tier: string;
  xpMultiplier: number;
  monthlyBeetz: number;
}

interface DashboardSummaryProps {
  userStats: UserStats;
  subscription: Subscription;
}

const DashboardSummaryOptimized = memo(function DashboardSummaryOptimized({ userStats, subscription }: DashboardSummaryProps) {
  useRenderPerformance('DashboardSummaryOptimized');
  
  // Verificações de segurança para dados não definidos
  if (!userStats || !subscription) {
    return (
      <Card className="mb-6 border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-6 bg-muted/20 animate-pulse rounded" />
            <div className="h-4 bg-muted/20 animate-pulse rounded w-3/4" />
            <div className="grid grid-cols-3 gap-3">
              <div className="h-16 bg-muted/20 animate-pulse rounded-lg" />
              <div className="h-16 bg-muted/20 animate-pulse rounded-lg" />
              <div className="h-16 bg-muted/20 animate-pulse rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Memoize XP progress calculation
  const xpProgress = useMemo(() => {
    const progress = ((userStats.currentXP || 0) / (userStats.nextLevelXP || 1)) * 100;
    return Math.min(progress, 100);
  }, [userStats.currentXP, userStats.nextLevelXP]);

  // Memoize streak badge color
  const streakBadgeColor = useMemo(() => {
    const streak = userStats.streak || 0;
    if (streak >= 30) return "bg-gradient-to-r from-purple-500 to-pink-500";
    if (streak >= 14) return "bg-gradient-to-r from-blue-500 to-cyan-500";
    if (streak >= 7) return "bg-gradient-to-r from-green-500 to-emerald-500";
    return "bg-gradient-to-r from-gray-500 to-slate-500";
  }, [userStats.streak]);

  // Memoize lesson progress calculation
  const lessonProgress = useMemo(() => {
    return ((userStats.completedLessons || 0) / 20) * 100;
  }, [userStats.completedLessons]);

  return (
    <Card className="mb-6 border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Progresso Hoje
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* XP Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              Experiência
            </span>
            <span className="text-xs text-muted-foreground">
              {userStats.currentXP || 0} / {userStats.nextLevelXP || 0} XP
            </span>
          </div>
          <Progress value={xpProgress} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Streak */}
          <div className="text-center p-3 rounded-lg bg-gradient-to-b from-muted/50 to-background">
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs ${streakBadgeColor}`}>
              🔥 {userStats.streak || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Sequência</p>
          </div>

          {/* Lessons */}
          <div className="text-center p-3 rounded-lg bg-gradient-to-b from-muted/50 to-background">
            <div className="text-sm font-bold text-primary flex items-center justify-center gap-1">
              <Target className="h-3 w-3" />
              {userStats.completedLessons || 0}
            </div>
            <p className="text-xs text-muted-foreground">Lições</p>
            <Progress value={lessonProgress} className="h-1 mt-1" />
          </div>

          {/* XP Multiplier */}
          <div className="text-center p-3 rounded-lg bg-gradient-to-b from-muted/50 to-background">
            <div className="text-sm font-bold text-success">
              {subscription.xpMultiplier || 1}x
            </div>
            <p className="text-xs text-muted-foreground">XP Boost</p>
            {subscription.tier && subscription.tier !== 'free' && (
              <Badge variant="secondary" className="text-xs mt-1">
                {subscription.tier.toUpperCase()}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export { DashboardSummaryOptimized };