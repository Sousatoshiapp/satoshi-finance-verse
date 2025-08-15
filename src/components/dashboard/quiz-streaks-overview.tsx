import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { Flame, TrendingUp, Target } from 'lucide-react';
import { useQuizStreak } from '@/hooks/use-quiz-streak';

const CATEGORIES = [
  { name: 'Finanças do Dia a Dia', icon: '💰' },
  { name: 'ABC das Finanças', icon: '👓' },
  { name: 'Cripto', icon: '₿' }
];

export function QuizStreaksOverview() {
  const { streaks, getStreakForCategory } = useQuizStreak();

  const getStreakColor = (days: number) => {
    if (days >= 30) return 'text-orange-500';
    if (days >= 14) return 'text-red-500';
    if (days >= 7) return 'text-yellow-500';
    if (days >= 3) return 'text-blue-500';
    return 'text-muted-foreground';
  };

  const getStreakBadge = (days: number) => {
    if (days >= 30) return { label: 'LENDÁRIO', variant: 'default' as const };
    if (days >= 14) return { label: 'ÉPICO', variant: 'secondary' as const };
    if (days >= 7) return { label: 'INCRÍVEL', variant: 'outline' as const };
    if (days >= 3) return { label: 'BOM', variant: 'outline' as const };
    return null;
  };

  const totalQuizzes = streaks.reduce((acc, s) => acc + s.total_quizzes_completed, 0);
  const activeStreaks = streaks.filter(s => s.current_streak > 0).length;
  const longestStreak = Math.max(...streaks.map(s => s.longest_streak), 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Quiz Streaks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats gerais */}
        <div className="grid grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{activeStreaks}</div>
            <div className="text-xs text-muted-foreground">Ativos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{longestStreak}</div>
            <div className="text-xs text-muted-foreground">Recorde</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{totalQuizzes}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>

        {/* Streaks por categoria */}
        <div className="space-y-2">
          {CATEGORIES.map((category) => {
            const streak = getStreakForCategory(category.name);
            const badge = streak ? getStreakBadge(streak.current_streak) : null;
            
            return (
              <div 
                key={category.name}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{category.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{category.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {streak ? `${streak.total_quizzes_completed} quizzes` : 'Nenhum quiz ainda'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {badge && (
                    <Badge variant={badge.variant} className="text-xs">
                      {badge.label}
                    </Badge>
                  )}
                  {streak && streak.current_streak > 0 ? (
                    <div className="flex items-center gap-1">
                      <Flame className={`h-4 w-4 ${getStreakColor(streak.current_streak)}`} />
                      <span className={`font-bold ${getStreakColor(streak.current_streak)}`}>
                        {streak.current_streak}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Target className="h-4 w-4" />
                      <span className="text-sm">0</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Motivação */}
        {activeStreaks === 0 && (
          <div className="text-center py-4">
            <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Complete um quiz hoje para começar seu streak!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}