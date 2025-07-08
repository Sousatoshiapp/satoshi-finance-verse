import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface DashboardSummaryProps {
  userStats: {
    streak: number;
    currentXP: number;
    level: number;
  };
  subscription: any;
}

export function DashboardSummary({ userStats, subscription }: DashboardSummaryProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-card to-muted/50 rounded-2xl p-4 mb-6 border border-border/50">
      <h3 className="text-sm font-semibold text-foreground mb-3">Resumo do Dia</h3>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Streak */}
        <div 
          className="text-center cursor-pointer hover:scale-105 transition-transform"
          onClick={() => navigate('/profile')}
        >
          <div className="text-lg">🔥</div>
          <div className="text-xs text-muted-foreground">Sequência</div>
          <div className="text-sm font-bold text-foreground">{userStats.streak}</div>
        </div>

        {/* Daily Rewards */}
        <div 
          className="text-center cursor-pointer hover:scale-105 transition-transform"
          onClick={() => navigate('/missions')}
        >
          <div className="text-lg">🎁</div>
          <div className="text-xs text-muted-foreground">Recompensas</div>
          <div className="text-sm font-bold text-foreground">3/5</div>
        </div>

        {/* Badges */}
        <div 
          className="text-center cursor-pointer hover:scale-105 transition-transform"
          onClick={() => navigate('/profile')}
        >
          <div className="text-lg">🏆</div>
          <div className="text-xs text-muted-foreground">Conquistas</div>
          <div className="text-sm font-bold text-foreground">12</div>
        </div>
      </div>

      {/* Duel Limit for Free Users */}
      {subscription.tier === 'free' && (
        <div className="bg-muted/30 border border-border rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium">Duelos Diários</span>
            <Badge variant="outline" className="text-xs">
              {subscription.dailyDuelsUsed}/{subscription.dailyDuelsLimit}
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-green-500 to-yellow-500 h-1.5 rounded-full transition-all"
              style={{ width: `${(subscription.dailyDuelsUsed / subscription.dailyDuelsLimit) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}