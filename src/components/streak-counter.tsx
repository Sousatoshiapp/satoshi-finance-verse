import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Calendar, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StreakCounterProps {
  currentStreak: number;
  className?: string;
  showActions?: boolean;
}

export function StreakCounter({ currentStreak, className, showActions = false }: StreakCounterProps) {
  const [timeUntilReset, setTimeUntilReset] = useState("");
  const [hasStreakFreeze, setHasStreakFreeze] = useState(false);
  const { toast } = useToast();

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
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getStreakLevel = () => {
    if (currentStreak >= 100) return { level: "Legendary", color: "text-purple-500", bg: "bg-purple-100" };
    if (currentStreak >= 30) return { level: "Master", color: "text-yellow-500", bg: "bg-yellow-100" };
    if (currentStreak >= 14) return { level: "Pro", color: "text-blue-500", bg: "bg-blue-100" };
    if (currentStreak >= 7) return { level: "Advanced", color: "text-green-500", bg: "bg-green-100" };
    if (currentStreak >= 3) return { level: "Beginner", color: "text-orange-500", bg: "bg-orange-100" };
    return { level: "Newbie", color: "text-gray-500", bg: "bg-gray-100" };
  };

  const getNextMilestone = () => {
    const milestones = [3, 7, 14, 30, 100];
    return milestones.find(m => m > currentStreak) || null;
  };

  const getMilestoneProgress = () => {
    const nextMilestone = getNextMilestone();
    if (!nextMilestone) return 100;
    
    const prevMilestone = [0, 3, 7, 14, 30].find((m, i, arr) => arr[i + 1] === nextMilestone) || 0;
    return ((currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100;
  };

  const useStreakFreeze = async () => {
    try {
      // Here you would check if user has streak freeze items and use one
      toast({
        title: "🧊 Streak Freeze Usado!",
        description: "Seu streak está protegido por 24 horas!",
        duration: 3000,
      });
      setHasStreakFreeze(false);
    } catch (error) {
      console.error('Error using streak freeze:', error);
    }
  };

  const streakLevel = getStreakLevel();
  const nextMilestone = getNextMilestone();

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <Flame className={cn("h-8 w-8", currentStreak > 0 ? "text-orange-500" : "text-gray-400")} />
            {currentStreak > 0 && (
              <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {currentStreak > 99 ? "99+" : currentStreak}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-foreground">Streak de Estudos</h3>
              <Badge className={cn("text-xs", streakLevel.bg, streakLevel.color)}>
                {streakLevel.level}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentStreak === 0 ? "Comece sua sequência hoje!" : `${currentStreak} dias consecutivos`}
            </p>
          </div>
        </div>

        {currentStreak > 0 && (
          <>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Calendar className="h-3 w-3" />
              <span>Reset em: {timeUntilReset}</span>
            </div>

            {nextMilestone && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Próxima conquista:</span>
                  <span>{nextMilestone} dias</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getMilestoneProgress()}%` }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {showActions && currentStreak > 0 && (
          <div className="flex gap-2 mt-3">
            {hasStreakFreeze && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={useStreakFreeze}
                className="flex-1"
              >
                <Zap className="h-3 w-3 mr-1" />
                Usar Freeze
              </Button>
            )}
          </div>
        )}

        {/* Streak Milestones */}
        {currentStreak >= 3 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {[3, 7, 14, 30, 100].map((milestone) => (
              <Badge 
                key={milestone}
                variant={currentStreak >= milestone ? "default" : "outline"}
                className="text-xs"
              >
                {milestone}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}