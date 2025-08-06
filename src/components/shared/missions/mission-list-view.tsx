import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Progress } from "@/components/shared/ui/progress";
import { Badge } from "@/components/shared/ui/badge";
import { Check, Clock, Trophy, Zap, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdaptiveMission } from "@/hooks/use-daily-missions";

interface MissionListViewProps {
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

export function MissionListView({
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
}: MissionListViewProps) {
  if (loading) {
    return (
      <Card className={cn("border-purple-500/20 bg-gradient-to-br from-background to-purple-500/5", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-500" />
            {t("missions.dailyMissions")}
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

  if (missions.length === 0) {
    return (
      <Card className={cn("border-purple-500/20 bg-gradient-to-br from-background to-purple-500/5", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-500" />
            {t("missions.dailyMissions")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("missions.noMissionsAvailable")}</p>
            <p className="text-sm">{t("missions.newMissionsSoon")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-purple-500/20 bg-gradient-to-br from-background to-purple-500/5", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-500" />
            {t("missions.dailyMissions")}
          </CardTitle>
          
          {showProgress && (
            <div className="text-right">
              <div className="text-sm font-medium">{completedToday}/{missions.length}</div>
              <div className="text-xs text-muted-foreground">{t("missions.completed")}</div>
            </div>
          )}
        </div>
        
        {showProgress && (
          <div className="space-y-2">
            <Progress value={completionRate} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("missions.dailyProgress")}: {completionRate}%</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeUntilReset}
              </span>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className={cn(
              "border rounded-lg p-4 cursor-pointer transition-all hover:border-purple-500/50",
              mission.completed ? "bg-green-500/10 border-green-500/30" : "hover:bg-purple-500/5",
              mission.basedOnWeakness && "ring-2 ring-orange-500/30 bg-orange-500/5"
            )}
            onClick={() => onMissionClick(mission)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getCategoryIcon(mission.category)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{mission.title}</h3>
                    
                    {mission.basedOnWeakness && (
                      <Badge variant="outline" className="text-xs bg-orange-500/10 border-orange-500/30">
                        <Zap className="h-3 w-3 mr-1" />
                        Focus
                      </Badge>
                    )}
                    
                    {mission.is_weekend_special && (
                      <Badge variant="outline" className="text-xs bg-purple-500/10 border-purple-500/30">
                        <Star className="h-3 w-3 mr-1" />
                        {t("missions.special")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{mission.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getDifficultyColor(mission.difficulty))}
                >
                  {mission.difficulty}
                </Badge>
                
                {!mission.completed && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{mission.progress || 0}/{mission.target_value}</span>
              </div>
              <Progress 
                value={((mission.progress || 0) / mission.target_value) * 100} 
                className="h-2"
              />
            </div>
            
            {showRewards && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-blue-500" />
                    <span>{Math.round(mission.adaptiveRewards.baseReward * mission.adaptiveRewards.streakBonus)} XP</span>
                    {mission.adaptiveRewards.bonusMultiplier > 1 && (
                      <span className="text-orange-500 font-medium">
                        (+{Math.round((mission.adaptiveRewards.bonusMultiplier - 1) * 100)}%)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    <span>{Math.round(mission.beetz_reward * mission.adaptiveRewards.streakBonus)}</span>
                  </div>
                </div>
                
                {mission.completed ? (
                  <Badge variant="outline" className="text-green-500 border-green-500/30">
                    <Check className="h-3 w-3 mr-1" />
                    {t("missions.completed")}
                  </Badge>
                ) : (
                  <Button size="sm" variant="outline" className="text-xs">
                    {t("missions.claim")}
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
        
        {completedToday === missions.length && missions.length >= 3 && (
          <div className="text-center py-4 border-t">
            <div className="text-sm font-medium text-green-500 mb-1">
              🎉 {t("missions.comboCompleted")}
            </div>
            <div className="text-xs text-muted-foreground">
              All daily missions completed! Bonus rewards earned.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
