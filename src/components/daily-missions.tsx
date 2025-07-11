import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BeetzIcon } from "@/components/ui/beetz-icon";
import { useDailyMissions } from "@/hooks/use-daily-missions";
import { Check, Clock, Trophy, Zap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { StarIcon, IconSystem } from "@/components/icons/icon-system";
import { SmartText } from "@/components/icons/icon-system";

export function DailyMissions() {
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

  const handleMissionClick = (mission: any) => {
    if (mission.completed) return;
    
    // Redirect based on mission category
    switch (mission.category) {
      case 'quiz':
        navigate('/quiz');
        break;
      case 'social':
        if (mission.mission_type === 'duel_wins') {
          navigate('/duels');
        } else {
          navigate('/social');
        }
        break;
      case 'streak':
        // Already handled by daily login
        break;
      case 'shop':
        navigate('/store');
        break;
      case 'exploration':
        navigate('/satoshi-city');
        break;
      default:
        navigate('/quiz');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Missões Diárias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-muted/30 rounded-lg p-3 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-muted/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Missões Diárias
            <Badge variant="secondary" className="ml-2">
              {completedToday}/{missions.length}
            </Badge>
          </CardTitle>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Reset em</div>
            <div className="text-sm font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeUntilReset}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso Diário</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>
        
        {/* Combo Bonus Info */}
        {completedToday >= 4 && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
            <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
            <div className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              <SmartText iconVariant="glow" animated>
                <span className="flex items-center gap-2">
                  <IconSystem emoji="🎉" size="sm" animated variant="glow" />
                  Combo Completado! +500 XP + 1000 Beetz + Loot Box Rara!
                </span>
              </SmartText>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {missions.map((mission) => (
          <div
            key={mission.id}
            onClick={() => handleMissionClick(mission)}
            className={cn(
              "border rounded-lg p-4 transition-all duration-200 hover:shadow-md cursor-pointer hover:scale-[1.02]",
              mission.completed 
                ? "bg-green-500/10 border-green-500/30 cursor-default" 
                : mission.is_weekend_special
                ? "bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50"
                : "bg-card border-border hover:border-primary/50"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="text-2xl">
                  {getCategoryIcon(mission.category)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={cn(
                      "font-medium text-sm",
                      mission.completed ? "line-through text-muted-foreground" : ""
                    )}>
                      {mission.title}
                    </h3>
                    
                    {mission.is_weekend_special && (
                      <Badge variant="outline" className="text-xs bg-purple-500/10 border-purple-500/30">
                        <span className="flex items-center gap-1">
                          <StarIcon size="xs" variant="glow" /> Especial
                        </span>
                      </Badge>
                    )}
                    
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getDifficultyColor(mission.difficulty))}
                    >
                      {mission.difficulty}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {mission.description}
                  </p>
                  
                  {/* Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progresso</span>
                      <span className="font-medium">
                        {Math.min(mission.progress || 0, mission.target_value)}/{mission.target_value}
                      </span>
                    </div>
                    <Progress 
                      value={(Math.min(mission.progress || 0, mission.target_value) / mission.target_value) * 100} 
                      className="h-1.5"
                    />
                  </div>
                  
                  {/* Rewards */}
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <div className="flex items-center gap-1 text-blue-500">
                      <Zap className="h-3 w-3" />
                      +{mission.xp_reward} XP
                    </div>
                    <div className="flex items-center gap-1 text-orange-500">
                      <BeetzIcon size="xs" /> +{mission.beetz_reward} Beetz
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Status Icon and Arrow */}
              <div className="ml-2 flex items-center gap-2">
                {mission.completed ? (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                ) : (
                  <>
                    <div className="w-6 h-6 rounded-full border-2 border-muted"></div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {missions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma missão disponível no momento</p>
            <p className="text-sm">Novas missões aparecerão em breve!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}