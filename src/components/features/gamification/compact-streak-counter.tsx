import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { StreakIcon } from "@/components/icons/game-icons";

interface CompactStreakCounterProps {
  currentStreak: number;
  className?: string;
}

export function CompactStreakCounter({ currentStreak, className }: CompactStreakCounterProps) {
  const [timeUntilReset, setTimeUntilReset] = useState("");

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilReset(`${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, []);

  const getStreakLevel = () => {
    if (currentStreak >= 30) return { level: "Master", color: "bg-purple-100 text-purple-800" };
    if (currentStreak >= 14) return { level: "Pro", color: "bg-blue-100 text-blue-800" };
    if (currentStreak >= 7) return { level: "Advanced", color: "bg-green-100 text-green-800" };
    if (currentStreak >= 3) return { level: "Beginner", color: "bg-orange-100 text-orange-800" };
    return { level: "Newbie", color: "bg-gray-100 text-gray-800" };
  };

  const getNextMilestone = () => {
    const milestones = [3, 7, 14, 30, 100];
    return milestones.find(m => m > currentStreak) || null;
  };

  const streakLevel = getStreakLevel();
  const nextMilestone = getNextMilestone();

  return (
    <Card className={cn("bg-card/50 hover:bg-card transition-colors", className)}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <StreakIcon 
                size="sm" 
                animated={currentStreak > 0} 
                variant={currentStreak > 0 ? "glow" : "default"} 
                className={cn(currentStreak > 0 ? "text-orange-500" : "text-gray-400")}
              />
              {currentStreak > 0 && (
                <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                  {currentStreak > 99 ? "99+" : currentStreak}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Streak</p>
              <p className="text-xs text-muted-foreground">
                {currentStreak === 0 ? "Comece hoje!" : `Reset em ${timeUntilReset}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {nextMilestone && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Próxima:</p>
                <p className="text-xs font-medium text-foreground">{nextMilestone} dias</p>
              </div>
            )}
            <Badge className={cn("text-xs", streakLevel.color)}>
              {streakLevel.level}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}