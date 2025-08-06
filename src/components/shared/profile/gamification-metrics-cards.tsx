import { Card, CardContent } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { Progress } from '@/components/shared/ui/progress';
import { Trophy, Zap, Flame, Coins } from 'lucide-react';
import { useI18n } from '@/hooks/use-i18n';

interface MetricsCardsProps {
  currentLevel: number;
  nextLevelProgress: number;
  activeStreak: number;
  todaysBTZ: number;
  availableRewards: number;
  currentMultiplier: number;
}

export function GamificationMetricsCards({
  currentLevel,
  nextLevelProgress,
  activeStreak,
  todaysBTZ,
  availableRewards,
  currentMultiplier
}: MetricsCardsProps) {
  const { t } = useI18n();

  const metrics = [
    {
      icon: <Trophy className="w-5 h-5 text-yellow-500" />,
      label: t('profile.gamification.currentLevel'),
      value: currentLevel,
      subtitle: `${nextLevelProgress}% ${t('profile.gamification.nextLevel')}`,
      progress: nextLevelProgress
    },
    {
      icon: <Flame className="w-5 h-5 text-orange-500" />,
      label: t('profile.gamification.activeStreak'),
      value: activeStreak,
      subtitle: `${currentMultiplier}x ${t('profile.gamification.multiplier')}`,
      badge: `${currentMultiplier}x`
    },
    {
      icon: <Coins className="w-5 h-5 text-purple-500" />,
      label: t('profile.gamification.todaysBtz'),
      value: todaysBTZ,
      subtitle: t('common.beetz')
    },
    {
      icon: <Zap className="w-5 h-5 text-blue-500" />,
      label: t('profile.gamification.availableRewards'),
      value: availableRewards,
      subtitle: t('profile.gamification.rewards')
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="p-4">
          <CardContent className="p-0">
            <div className="flex items-center gap-3 mb-2">
              {metric.icon}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground truncate">
                  {metric.label}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {metric.value}
                  </p>
                  {metric.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {metric.badge}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {metric.progress !== undefined && (
              <Progress value={metric.progress} className="h-2 mt-2" />
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {metric.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
