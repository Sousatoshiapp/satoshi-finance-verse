import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Progress } from "@/components/shared/ui/progress";
import { Badge } from "@/components/shared/ui/badge";
import { Check, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdaptiveMission } from "@/hooks/use-daily-missions";

interface MissionCompactViewProps {
  missions: AdaptiveMission[];
  loading: boolean;
  completedToday: number;
  completionRate: number;
  timeUntilReset: string;
  onMissionClick: (mission: AdaptiveMission) => void;
  getDifficultyColor: (difficulty: string) => string;
  getCategoryIcon: (category: string) => any;
  showProgress: boolean;
  showRewards: boolean;
  className?: string;
  t: (key: string) => string;
}

export function MissionCompactView({
  missions,
  loading,
  completedToday,
  completionRate,
  timeUntilReset,
  onMissionClick,
  getDifficultyColor,
  getCategoryIcon,
  showProgress,
  showRewards,
  className,
  t
}: MissionCompactViewProps) {
  if (loading) {
    return (
      <Card className={cn("border-purple-500/20 bg-gradient-to-br from-background to-purple-500/5", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-purple-500" />
            <span className="font-medium text-sm">{t("missions.dailyMissions")}</span>
          </div>
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="bg-muted/30 rounded p-2 animate-pulse">
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (missions.length === 0) {
    return (
      <Card className={cn("border-purple-500/20 bg-gradient-to-br from-background to-purple-500/5", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-purple-500" />
            <span className="font-medium text-sm">{t("missions.dailyMissions")}</span>
          </div>
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-xs">{t("missions.noMissionsAvailable")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-purple-500/20 bg-gradient-to-br from-background to-purple-500/5", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-purple-500" />
            <span className="font-medium text-sm">{t("missions.dailyMissions")}</span>
          </div>
          
          {showProgress && (
            <div className="text-xs text-muted-foreground">
              {completedToday}/{missions.length}
            </div>
          )}
        </div>
        
        {showProgress && (
          <div className="mb-3">
            <Progress value={completionRate} className="h-1.5" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{completionRate}%</span>
              <span>{timeUntilReset}</span>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          {missions.slice(0, 3).map((mission) => (
            <div
              key={mission.id}
              className={cn(
                "flex items-center gap-2 p-2 rounded cursor-pointer transition-all hover:bg-purple-500/5",
                mission.completed ? "bg-green-500/10" : "",
                mission.basedOnWeakness && "bg-orange-500/5 border-l-2 border-orange-500/50"
              )}
              onClick={() => onMissionClick(mission)}
            >
              <div className="flex-shrink-0">
                {getCategoryIcon(mission.category)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs font-medium truncate">{mission.title}</span>
                  
                  {mission.basedOnWeakness && (
                    <Zap className="h-3 w-3 text-orange-500 flex-shrink-0" />
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Progress 
                    value={((mission.progress || 0) / mission.target_value) * 100} 
                    className="h-1 flex-1"
                  />
                  <span className="text-xs text-muted-foreground">
                    {mission.progress || 0}/{mission.target_value}
                  </span>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                {mission.completed ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs px-1 py-0", getDifficultyColor(mission.difficulty))}
                  >
                    {mission.difficulty.charAt(0).toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {showRewards && completedToday > 0 && (
          <div className="mt-3 pt-2 border-t text-center">
            <div className="text-xs text-muted-foreground">
              Today's rewards: {completedToday * 100} XP + {completedToday * 200} BTZ
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
