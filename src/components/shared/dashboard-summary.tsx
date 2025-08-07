import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/use-i18n";
import { StreakIcon, GiftIcon, TrophyIcon, SwordIcon, StarIcon, IconSystem } from "@/components/icons/icon-system";

interface DashboardSummaryProps {
  userStats: {
    streak: number;
    currentXP: number;
    level: number;
    points: number;
    completedLessons: number;
  };
  subscription: any;
}

export function DashboardSummary({ userStats, subscription }: DashboardSummaryProps) {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="bg-gradient-to-br from-card via-muted/50 to-card rounded-3xl p-6 mb-6 border border-border/50 shadow-elevated relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-3xl" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <IconSystem emoji="📊" size="xl" animated variant="glow" />
            {t('dashboard.dailySummary')}
          </h3>
          <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-5">
          {/* Streak */}
          <div 
            className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl p-4 text-center cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-lg"
            onClick={() => navigate('/profile')}
          >
            <div className="mb-2">
              <StreakIcon size="lg" animated={userStats.streak > 0} variant={userStats.streak > 0 ? "glow" : "default"} />
            </div>
            <div className="text-xs text-muted-foreground mb-1">{t('dashboard.sequence')}</div>
            <div className="text-lg font-bold text-foreground">{userStats.streak}</div>
            <div className="text-xs text-orange-600 font-medium">{t('dashboard.days')}</div>
          </div>

          {/* Daily Rewards */}
          <div 
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-4 text-center cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-lg"
            onClick={() => navigate('/missions')}
          >
            <div className="mb-2">
              <GiftIcon size="lg" animated variant="glow" />
            </div>
            <div className="text-xs text-muted-foreground mb-1">{t('dashboard.rewards')}</div>
            <div className="text-lg font-bold text-foreground">{userStats.completedLessons}/5</div>
            <div className="text-xs text-green-600 font-medium">{t('dashboard.missions')}</div>
          </div>

          {/* Badges */}
          <div 
            className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-2xl p-4 text-center cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-lg"
            onClick={() => navigate('/profile')}
          >
            <div className="mb-2">
              <TrophyIcon size="lg" animated variant="glow" />
            </div>
            <div className="text-xs text-muted-foreground mb-1">{t('dashboard.achievements')}</div>
            <div className="text-lg font-bold text-foreground">{Math.min(userStats.level * 2, 12)}</div>
            <div className="text-xs text-purple-600 font-medium">{t('dashboard.badges')}</div>
          </div>
        </div>

        {/* Duel Limit for Free Users */}
        {subscription.tier === 'free' && (
          <div className="bg-gradient-to-r from-muted/30 to-muted/10 border border-border/50 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <SwordIcon size="sm" />
                <span className="text-sm font-semibold text-foreground">{t('dashboard.dailyDuels')}</span>
              </div>
              <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-600">
                {subscription.dailyDuelsUsed}/{subscription.dailyDuelsLimit}
              </Badge>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(subscription.dailyDuelsUsed / subscription.dailyDuelsLimit) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{t('dashboard.resetIn24h')}</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/subscription-plans')}
                className="text-xs text-yellow-600 hover:text-yellow-500 hover:bg-yellow-500/10"
              >
                <span className="flex items-center gap-1">
                  {t('dashboard.upgrade')} <StarIcon size="xs" animated variant="glow" />
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
