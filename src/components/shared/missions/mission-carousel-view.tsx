import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Progress } from "@/components/shared/ui/progress";
import { Badge } from "@/components/shared/ui/badge";
import { Check, Clock, Trophy, Zap, ChevronRight, ChevronLeft, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdaptiveMission } from "@/hooks/use-daily-missions";

interface MissionCarouselViewProps {
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

export function MissionCarouselView({
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
}: MissionCarouselViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.min(missions.length, 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.min(missions.length, 3)) % Math.min(missions.length, 3));
  };

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

  const visibleMissions = missions.slice(0, 3);
  const currentMission = visibleMissions[currentSlide];

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
      
      <CardContent className="space-y-4">
        <div className="relative">
          <div className="overflow-hidden rounded-lg">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {visibleMissions.map((mission) => (
                <div key={mission.id} className="w-full flex-shrink-0">
                  <div 
                    className={cn(
                      "border rounded-lg p-4 cursor-pointer transition-all hover:border-purple-500/50",
                      mission.completed ? "bg-green-500/10 border-green-500/30" : "hover:bg-purple-500/5",
                      mission.basedOnWeakness && "ring-2 ring-orange-500/30 bg-orange-500/5"
                    )}
                    onClick={() => onMissionClick(mission)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(mission.category)}
                        <div>
                          <h3 className="font-semibold text-sm">{mission.title}</h3>
                          <p className="text-xs text-muted-foreground">{mission.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
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
                        
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getDifficultyColor(mission.difficulty))}
                        >
                          {mission.difficulty}
                        </Badge>
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
                </div>
              ))}
            </div>
          </div>
          
          {visibleMissions.length > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={prevSlide}
                disabled={currentSlide === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex gap-2">
                {visibleMissions.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      index === currentSlide ? "bg-purple-500" : "bg-muted"
                    )}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={nextSlide}
                disabled={currentSlide === visibleMissions.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
