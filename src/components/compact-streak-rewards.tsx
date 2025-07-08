import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, Gift, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CompactStreakRewards() {
  const navigate = useNavigate();
  const [currentStreak, setCurrentStreak] = useState(7);
  const [nextRewardDay, setNextRewardDay] = useState(10);
  const [loading, setLoading] = useState(false);

  const progressPercentage = (currentStreak / nextRewardDay) * 100;

  return (
    <Card className="border-orange-500/20 bg-gradient-to-br from-background to-orange-500/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Recompensas de Sequência
          </CardTitle>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/streak-rewards')}
            className="text-xs h-6 px-2 text-orange-500 border-orange-500/30 hover:bg-orange-500/10"
          >
            Ver Recompensas
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Current Streak */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">Sequência Atual</span>
          </div>
          <Badge variant="outline" className="text-orange-500 border-orange-500/30">
            {currentStreak} dias
          </Badge>
        </div>

        {/* Progress to Next Reward */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Próxima recompensa em</span>
            <span className="font-medium">{nextRewardDay - currentStreak} dias</span>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="h-2"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{currentStreak}/{nextRewardDay} dias</span>
            <div className="flex items-center gap-1">
              <Gift className="h-3 w-3" />
              <span>Loot Box Épica</span>
            </div>
          </div>
        </div>

        {/* Next Milestone */}
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-orange-500" />
              <span className="font-medium">Próximo Marco: {nextRewardDay} dias</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              🎁 Mega Recompensa
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}