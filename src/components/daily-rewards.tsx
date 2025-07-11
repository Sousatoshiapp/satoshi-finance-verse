import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Calendar, Coins, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProgressionSystem } from "@/hooks/use-progression-system";
import confetti from "canvas-confetti";
import { GiftIcon } from "@/components/icons/game-icons";

interface DailyReward {
  day: number;
  type: 'beetz' | 'xp' | 'item';
  amount: number;
  item?: string;
  claimed: boolean;
}

const weeklyRewards: DailyReward[] = [
  { day: 1, type: 'beetz', amount: 50, claimed: false },
  { day: 2, type: 'xp', amount: 25, claimed: false },
  { day: 3, type: 'beetz', amount: 75, claimed: false },
  { day: 4, type: 'item', amount: 1, item: 'Streak Freeze', claimed: false },
  { day: 5, type: 'beetz', amount: 100, claimed: false },
  { day: 6, type: 'xp', amount: 50, claimed: false },
  { day: 7, type: 'beetz', amount: 200, claimed: false }
];

interface DailyRewardsProps {
  className?: string;
}

export function DailyRewards({ className }: DailyRewardsProps) {
  const [currentDay, setCurrentDay] = useState(1);
  const [rewards, setRewards] = useState<DailyReward[]>(weeklyRewards);
  const [canClaim, setCanClaim] = useState(false);
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null);
  const { toast } = useToast();
  const { awardXP } = useProgressionSystem();

  useEffect(() => {
    checkDailyRewardStatus();
  }, []);

  const checkDailyRewardStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const today = new Date().toDateString();
        const lastClaim = profile.updated_at ? new Date(profile.updated_at).toDateString() : null;
        
        setLastClaimDate(lastClaim);
        setCanClaim(lastClaim !== today);
        
        // Calculate current day based on streak or login history
        // For simplicity, using modulo 7 to cycle through the week
        const dayOfWeek = ((profile.streak || 0) % 7) + 1;
        setCurrentDay(dayOfWeek);
        
        // Update rewards status based on streak
        const updatedRewards = weeklyRewards.map((reward, index) => ({
          ...reward,
          claimed: index < (profile.streak || 0) % 7
        }));
        setRewards(updatedRewards);
      }
    } catch (error) {
      console.error('Error checking daily reward status:', error);
    }
  };

  const claimDailyReward = async () => {
    if (!canClaim) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const currentReward = rewards[currentDay - 1];
      
      // Update reward as claimed
      const updatedRewards = [...rewards];
      updatedRewards[currentDay - 1].claimed = true;
      setRewards(updatedRewards);
      
      // Award the reward
      let message = "";
      if (currentReward.type === 'beetz') {
        await supabase
          .from('profiles')
          .update({ points: (profile.points || 0) + currentReward.amount })
          .eq('id', profile.id);
        message = `+${currentReward.amount} Beetz!`;
      } else if (currentReward.type === 'xp') {
        await awardXP(currentReward.amount, 'daily_reward');
        message = `+${currentReward.amount} XP!`;
      } else if (currentReward.type === 'item') {
        // Here you would add the item to user inventory
        message = `${currentReward.item} adicionado ao inventário!`;
      }

      // Fire confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347']
      });

      toast({
        title: "Recompensa Diária!",
        description: message,
        duration: 3000,
      });

      setCanClaim(false);
      setLastClaimDate(new Date().toDateString());
      
    } catch (error) {
      console.error('Error claiming daily reward:', error);
      toast({
        title: "Erro",
        description: "Não foi possível reivindicar a recompensa. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'beetz': return Coins;
      case 'xp': return Zap;
      case 'item': return Gift;
      default: return Gift;
    }
  };

  const getRewardColor = (type: string) => {
    switch (type) {
      case 'beetz': return 'text-yellow-500';
      case 'xp': return 'text-blue-500';
      case 'item': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const timeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground">Recompensas Diárias</h3>
          </div>
          <Badge variant="outline" className="text-xs">
            Dia {currentDay}/7
          </Badge>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {rewards.map((reward, index) => {
            const IconComponent = getRewardIcon(reward.type);
            const isToday = index + 1 === currentDay;
            const isClaimed = reward.claimed;
            const isPastDay = index + 1 < currentDay;
            
            return (
              <div
                key={index}
                className={cn(
                  "relative p-2 rounded-lg border-2 text-center transition-all",
                  isToday && !isClaimed ? "border-primary bg-primary/10" : "border-muted",
                  isClaimed ? "opacity-50" : "",
                  isPastDay && !isClaimed ? "opacity-30" : ""
                )}
              >
                <div className="flex flex-col items-center gap-1">
                  <IconComponent className={cn("h-4 w-4", getRewardColor(reward.type))} />
                  <span className="text-xs font-medium">
                    {reward.type === 'item' ? reward.item : `${reward.amount}`}
                  </span>
                </div>
                
                {isClaimed && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-100 bg-opacity-80 rounded-lg">
                    <span className="text-green-600 text-xs font-bold">✓</span>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground mt-1">
                  {index + 1}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <Button 
            onClick={claimDailyReward}
            disabled={!canClaim}
            className="w-full"
            variant={canClaim ? "default" : "outline"}
          >
            {canClaim ? (
              <>
                <Gift className="h-4 w-4 mr-2" />
                Reivindicar Recompensa
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Próxima em {timeUntilReset()}
              </>
            )}
          </Button>
          
          {lastClaimDate && (
            <p className="text-xs text-muted-foreground text-center">
              Última coleta: {lastClaimDate === new Date().toDateString() ? 'Hoje' : lastClaimDate}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}