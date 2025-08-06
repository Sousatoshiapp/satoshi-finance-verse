import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { GamificationMetricsCards } from './gamification-metrics-cards';
import { Trophy } from 'lucide-react';
import { useUnifiedRewards } from '@/hooks/use-unified-rewards';
import { useI18n } from '@/hooks/use-i18n';

interface GamificationUnifiedPanelProps {
  userId: string;
  userStats: {
    level: number;
    xp: number;
    streak: number;
    points: number;
  };
}

export function GamificationUnifiedPanel({ userId, userStats }: GamificationUnifiedPanelProps) {
  const { t } = useI18n();
  const unifiedRewards = useUnifiedRewards();

  const nextLevelXP = userStats.level * 100;
  const nextLevelProgress = Math.round((userStats.xp / nextLevelXP) * 100);

  const todaysBTZ = Math.floor(userStats.points * 0.1);

  const availableRewards = unifiedRewards.achievements.filter(a => !a.unlocked).length;

  const getMultiplier = (streak: number) => {
    if (streak >= 30) return 3;
    if (streak >= 14) return 2;
    if (streak >= 7) return 1.5;
    if (streak >= 3) return 1.2;
    return 1;
  };

  if (!unifiedRewards.isLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            {t('profile.gamification.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          {t('profile.gamification.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <GamificationMetricsCards
          currentLevel={unifiedRewards.currentLevel}
          nextLevelProgress={nextLevelProgress}
          activeStreak={unifiedRewards.currentStreak}
          todaysBTZ={todaysBTZ}
          availableRewards={availableRewards}
          currentMultiplier={getMultiplier(unifiedRewards.currentStreak)}
        />
      </CardContent>
    </Card>
  );
}
