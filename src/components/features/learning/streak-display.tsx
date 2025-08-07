import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Progress } from "@/components/shared/ui/progress";
import { Flame, Calendar, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  lastActivity?: string;
  className?: string;
}

export function StreakDisplay({ currentStreak, longestStreak, lastActivity, className }: StreakDisplayProps) {
  const streakLevel = currentStreak >= 30 ? 'legendary' : 
                     currentStreak >= 14 ? 'epic' : 
                     currentStreak >= 7 ? 'rare' : 
                     currentStreak >= 3 ? 'uncommon' : 'common';

  const progressToNext = currentStreak >= 30 ? 100 : 
                        currentStreak >= 14 ? ((currentStreak - 14) / 16) * 100 :
                        currentStreak >= 7 ? ((currentStreak - 7) / 7) * 100 :
                        currentStreak >= 3 ? ((currentStreak - 3) / 4) * 100 :
                        (currentStreak / 3) * 100;

  const nextMilestone = currentStreak >= 30 ? 30 :
                       currentStreak >= 14 ? 30 :
                       currentStreak >= 7 ? 14 :
                       currentStreak >= 3 ? 7 : 3;

  const streakColors = {
    common: 'text-gray-600',
    uncommon: 'text-green-600',
    rare: 'text-blue-600',
    epic: 'text-purple-600',
    legendary: 'text-yellow-600'
  };

  return (
    <Card className={cn("bg-gradient-to-br from-orange-50 to-red-50 border-orange-200", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className={cn("h-6 w-6", streakColors[streakLevel])} />
            Sequência de Estudos
          </CardTitle>
          <Badge 
            variant="outline" 
            className={cn(
              "capitalize font-medium",
              streakLevel === 'legendary' && "bg-yellow-100 text-yellow-700 border-yellow-300",
              streakLevel === 'epic' && "bg-purple-100 text-purple-700 border-purple-300",
              streakLevel === 'rare' && "bg-blue-100 text-blue-700 border-blue-300",
              streakLevel === 'uncommon' && "bg-green-100 text-green-700 border-green-300",
              streakLevel === 'common' && "bg-gray-100 text-gray-700 border-gray-300"
            )}
          >
            {streakLevel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className={cn("text-3xl font-bold", streakColors[streakLevel])}>
              {currentStreak}
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Calendar className="h-3 w-3" />
              Dias atuais
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {longestStreak}
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Recorde
            </div>
          </div>
        </div>

        {currentStreak < nextMilestone && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Próxima meta:</span>
              <span className="font-medium flex items-center gap-1">
                <Target className="h-3 w-3" />
                {nextMilestone} dias
              </span>
            </div>
            <Progress value={progressToNext} className="h-2" />
            <div className="text-xs text-muted-foreground text-center">
              Faltam {nextMilestone - currentStreak} dias para a próxima conquista
            </div>
          </div>
        )}

        {lastActivity && (
          <div className="text-xs text-muted-foreground text-center">
            Última atividade: {new Date(lastActivity).toLocaleDateString('pt-BR')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
