import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { Button } from '@/components/shared/ui/button';
import { useGamification } from '@/hooks/use-gamification';
import { Trophy, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/hooks/use-i18n';

interface AchievementsTimelineProps {
  userId: string;
  limit?: number;
}

export function AchievementsTimeline({ userId, limit = 10 }: AchievementsTimelineProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { achievements, loading, getRecentAchievements } = useGamification();

  const recentAchievements = getRecentAchievements(limit);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-purple-500 bg-purple-50 border-purple-200';
      case 'epic': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'rare': return 'text-green-500 bg-green-50 border-green-200';
      case 'common': return 'text-gray-500 bg-gray-50 border-gray-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hoje';
    if (diffDays === 2) return 'Ontem';
    if (diffDays <= 7) return `${diffDays} dias atrás`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            {t('profile.gamification.recentAchievements')}
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            {t('profile.gamification.recentAchievements')}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/achievements')}
            className="text-primary hover:text-primary/80"
          >
            Ver Todas <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentAchievements.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground mb-2">
              Nenhuma conquista ainda
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate('/levels')}>
              Começar Jornada
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentAchievements.map((achievement, index) => (
              <div key={achievement.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRarityColor(achievement.achievements.rarity)}`}>
                    <span className="text-lg">
                      {achievement.achievements.badge_icon || '🏆'}
                    </span>
                  </div>
                  {index < recentAchievements.length - 1 && (
                    <div className="w-px h-8 bg-border mt-2"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1">
                        {achievement.achievements.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {achievement.achievements.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {achievement.achievements.rarity}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDate(achievement.earned_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
