import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Progress } from "@/components/shared/ui/progress";
import { Trophy, Target, Calendar, Zap, Star, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface LevelStatsPanelProps {
  user: {
    level: number;
    xp: number;
    streak?: number;
  };
  totalLevels?: number;
  averageXPPerLevel?: number;
  estimatedTimeToNext?: string;
  className?: string;
}

export function LevelStatsPanel({ 
  user, 
  totalLevels = 100,
  averageXPPerLevel = 150,
  estimatedTimeToNext = "2-3 dias",
  className 
}: LevelStatsPanelProps) {
  const completionPercentage = (user.level / totalLevels) * 100;
  const levelsRemaining = totalLevels - user.level;
  
  const achievements = [
    { 
      name: "Primeiro Nível", 
      earned: user.level >= 1, 
      icon: <Star className="w-4 h-4" />,
      description: "Completou o primeiro nível"
    },
    { 
      name: "Streak de 7 dias", 
      earned: (user.streak || 0) >= 7, 
      icon: <Target className="w-4 h-4" />,
      description: "Manteve streak por 7 dias"
    },
    { 
      name: "Nível 10", 
      earned: user.level >= 10, 
      icon: <Trophy className="w-4 h-4" />,
      description: "Alcançou o nível 10"
    },
    { 
      name: "Nível 25", 
      earned: user.level >= 25, 
      icon: <Award className="w-4 h-4" />,
      description: "Alcançou o nível 25"
    },
    { 
      name: "Metade do Caminho", 
      earned: user.level >= 50, 
      icon: <Zap className="w-4 h-4" />,
      description: "Completou 50% dos níveis"
    }
  ];

  const earnedAchievements = achievements.filter(a => a.earned);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Visão Geral
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progresso Geral</span>
              <span className="font-medium">{completionPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{user.level}</div>
              <div className="text-muted-foreground">Nível Atual</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{levelsRemaining}</div>
              <div className="text-muted-foreground">Restantes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">XP Total</span>
            <span className="font-medium">{user.xp.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">XP Médio/Nível</span>
            <span className="font-medium">{averageXPPerLevel}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">Streak Atual</span>
            <span className="font-medium">{user.streak || 0} dias</span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Tempo p/ Próximo</span>
            <span className="font-medium text-primary">{estimatedTimeToNext}</span>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Conquistas
            <Badge variant="secondary" className="ml-auto">
              {earnedAchievements.length}/{achievements.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            Marcos importantes na sua jornada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <div 
                key={index}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-colors",
                  achievement.earned 
                    ? "bg-green-500/10 border border-green-500/20" 
                    : "bg-muted/30 opacity-60"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  achievement.earned 
                    ? "bg-green-500 text-white" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className={cn(
                    "text-sm font-medium",
                    !achievement.earned && "text-muted-foreground"
                  )}>
                    {achievement.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {achievement.description}
                  </div>
                </div>
                {achievement.earned && (
                  <Badge variant="default" className="text-xs">
                    ✓
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Continue sua jornada:
          </div>
          <div className="space-y-1 text-sm">
            <div>• Complete mais quizzes (+10 XP cada)</div>
            <div>• Mantenha seu streak diário (+5 XP)</div>
            <div>• Participe de desafios especiais</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}