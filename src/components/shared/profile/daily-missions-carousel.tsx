import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { Progress } from '@/components/shared/ui/progress';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/shared/ui/carousel';
import { useDailyMissions } from '@/hooks/use-daily-missions';
import { Zap, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/hooks/use-i18n';

interface DailyMissionsCarouselProps {
  userId: string;
  compact?: boolean;
}

export function DailyMissionsCarousel({ userId, compact = false }: DailyMissionsCarouselProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const {
    missions,
    loading,
    completedToday,
    completionRate,
    timeUntilReset,
    getDifficultyColor,
    getCategoryIcon
  } = useDailyMissions();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            {t('profile.gamification.dailyMissions')}
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

  const displayMissions = compact ? missions.slice(0, 3) : missions;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            {t('profile.gamification.dailyMissions')}
            <Badge variant="secondary" className="ml-2">
              {completedToday}/{missions.length}
            </Badge>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/missions')}
            className="text-primary hover:text-primary/80"
          >
            Ver Todas <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>{t('missions.dailyProgress')}</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Reset em {timeUntilReset}
          </p>
        </div>

        {displayMissions.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground mb-2">
              {t('missions.noMissionsAvailable')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('missions.newMissionsSoon')}
            </p>
          </div>
        ) : (
          <Carousel className="w-full">
            <CarouselContent>
              {displayMissions.map((mission) => (
                <CarouselItem key={mission.id} className="basis-full md:basis-1/2 lg:basis-1/3">
                  <Card className={`h-full ${mission.completed ? 'bg-green-50 border-green-200' : 'hover:shadow-md transition-shadow'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">
                          {getCategoryIcon(mission.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm truncate">
                              {mission.title}
                            </h4>
                            {mission.completed && (
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {mission.description}
                          </p>
                          
                          <div className="space-y-2">
                            <Progress 
                              value={(mission.progress || 0) / mission.target_value * 100} 
                              className="h-1.5" 
                            />
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-muted-foreground">
                                {mission.progress || 0}/{mission.target_value}
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="text-blue-600">+{mission.xp_reward} XP</span>
                                <span className="text-purple-600">+{mission.beetz_reward} BTZ</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        )}
      </CardContent>
    </Card>
  );
}
