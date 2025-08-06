import React from "react";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Progress } from "@/components/shared/ui/progress";
import { Badge } from "@/components/shared/ui/badge";
import { Check, Zap, ChevronRight, Target, Brain, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdaptiveMission } from "@/hooks/use-daily-missions";
import { useI18n } from "@/hooks/use-i18n";

interface AdaptiveMissionCardProps {
  mission: AdaptiveMission;
  onMissionClick: (mission: AdaptiveMission) => void;
  getDifficultyColor: (difficulty: string) => string;
  getCategoryIcon: (category: string) => any;
  showRewards?: boolean;
  compact?: boolean;
  className?: string;
}

export function AdaptiveMissionCard({
  mission,
  onMissionClick,
  getDifficultyColor,
  getCategoryIcon,
  showRewards = true,
  compact = false,
  className
}: AdaptiveMissionCardProps) {
  const { t } = useI18n();

  const progressPercentage = ((mission.progress || 0) / mission.target_value) * 100;
  const finalXP = Math.round(mission.adaptiveRewards.baseReward * mission.adaptiveRewards.streakBonus);
  const finalBTZ = Math.round(mission.beetz_reward * mission.adaptiveRewards.streakBonus);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        mission.completed ? "bg-green-500/10 border-green-500/30" : "hover:border-purple-500/50",
        mission.basedOnWeakness && "ring-2 ring-orange-500/30 bg-orange-500/5",
        mission.difficultyAdjusted && "border-blue-500/30 bg-blue-500/5",
        className
      )}
      onClick={() => onMissionClick(mission)}
    >
      <CardContent className={cn("p-4", compact && "p-3")}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {getCategoryIcon(mission.category)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cn("font-semibold truncate", compact ? "text-sm" : "text-base")}>
                  {mission.title}
                </h3>
                
                {mission.basedOnWeakness && (
                  <Badge variant="outline" className="text-xs bg-orange-500/10 border-orange-500/30 flex-shrink-0">
                    <Brain className="h-3 w-3 mr-1" />
                    Focus Area
                  </Badge>
                )}
                
                {mission.difficultyAdjusted && (
                  <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/30 flex-shrink-0">
                    <Target className="h-3 w-3 mr-1" />
                    Adaptive
                  </Badge>
                )}
              </div>
              
              {!compact && (
                <p className="text-xs text-muted-foreground">{mission.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {mission.is_weekend_special && (
              <Badge variant="outline" className="text-xs bg-purple-500/10 border-purple-500/30">
                <Star className="h-3 w-3 mr-1" />
                {t("missions.special")}
              </Badge>
            )}
            
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
            value={progressPercentage} 
            className={cn("h-2", compact && "h-1.5")}
          />
        </div>
        
        {mission.contextualHints.length > 0 && (
          <div className="mt-2 p-2 bg-orange-500/10 rounded text-xs">
            <div className="flex items-center gap-1 text-orange-600 mb-1">
              <Brain className="h-3 w-3" />
              <span className="font-medium">Personalized Hint:</span>
            </div>
            <p className="text-muted-foreground">
              Focus on {mission.contextualHints.join(", ")} to improve your weak areas
            </p>
          </div>
        )}
        
        {showRewards && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-blue-500" />
                <span>{finalXP} XP</span>
                {mission.adaptiveRewards.bonusMultiplier > 1 && (
                  <span className="text-orange-500 font-medium">
                    (+{Math.round((mission.adaptiveRewards.bonusMultiplier - 1) * 100)}%)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-yellow-500" />
                <span>{finalBTZ}</span>
              </div>
              {mission.adaptiveRewards.streakBonus > 1 && (
                <div className="text-purple-500 text-xs font-medium">
                  Streak x{mission.adaptiveRewards.streakBonus.toFixed(1)}
                </div>
              )}
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
      </CardContent>
    </Card>
  );
}
