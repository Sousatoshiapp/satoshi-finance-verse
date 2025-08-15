import React from 'react';
import { Card, CardContent } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { Flame, Trophy, Target } from 'lucide-react';
import { useQuizStreak } from '@/hooks/use-quiz-streak';

interface QuizStreakDisplayProps {
  category: string;
  className?: string;
}

export function QuizStreakDisplay({ category, className }: QuizStreakDisplayProps) {
  const { getStreakForCategory } = useQuizStreak();
  const streak = getStreakForCategory(category);

  if (!streak) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Flame className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Comece seu streak!</p>
              <p className="text-xs text-muted-foreground">Complete quizzes diariamente</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStreakColor = (days: number) => {
    if (days >= 30) return 'text-orange-500';
    if (days >= 14) return 'text-red-500';
    if (days >= 7) return 'text-yellow-500';
    if (days >= 3) return 'text-blue-500';
    return 'text-muted-foreground';
  };

  const getStreakLabel = (days: number) => {
    if (days >= 30) return 'LENDÁRIO';
    if (days >= 14) return 'ÉPICO';
    if (days >= 7) return 'INCRÍVEL';
    if (days >= 3) return 'BOM';
    return 'INICIANTE';
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center`}>
              <Flame className={`h-5 w-5 ${getStreakColor(streak.current_streak)}`} />
            </div>
            <div>
              <p className="text-sm font-medium">
                {streak.current_streak} {streak.current_streak === 1 ? 'dia' : 'dias'} seguidos
              </p>
              <p className="text-xs text-muted-foreground">
                {streak.total_quizzes_completed} quizzes completados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {getStreakLabel(streak.current_streak)}
            </Badge>
            
            {streak.longest_streak > streak.current_streak && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Trophy className="h-3 w-3" />
                <span>Melhor: {streak.longest_streak}</span>
              </div>
            )}
          </div>
        </div>

        {/* Barra de progresso para próximo milestone */}
        {streak.current_streak < 30 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Próximo milestone</span>
              <span>
                {streak.current_streak}/
                {streak.current_streak < 3 ? 3 : 
                 streak.current_streak < 7 ? 7 : 
                 streak.current_streak < 14 ? 14 : 30}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1">
              <div 
                className="bg-orange-500 h-1 rounded-full transition-all duration-300" 
                style={{
                  width: `${(streak.current_streak / 
                    (streak.current_streak < 3 ? 3 : 
                     streak.current_streak < 7 ? 7 : 
                     streak.current_streak < 14 ? 14 : 30)) * 100}%`
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}