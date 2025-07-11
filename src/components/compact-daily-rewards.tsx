import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProgressionSystem } from "@/hooks/use-progression-system";
import confetti from "canvas-confetti";

interface CompactDailyRewardsProps {
  className?: string;
}

export function CompactDailyRewards({ className }: CompactDailyRewardsProps) {
  const [canClaim, setCanClaim] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState("");
  const [currentDay, setCurrentDay] = useState(1);
  const { toast } = useToast();
  const { awardXP } = useProgressionSystem();

  useEffect(() => {
    checkDailyRewardStatus();
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, []);

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
        
        setCanClaim(lastClaim !== today);
        setCurrentDay(((profile.streak || 0) % 7) + 1);
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

      // Award reward based on day
      const rewards = [50, 25, 75, 100, 100, 50, 200]; // Beetz amounts for each day
      const rewardAmount = rewards[currentDay - 1] || 50;

      await supabase
        .from('profiles')
        .update({ points: (profile.points || 0) + rewardAmount })
        .eq('id', profile.id);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#FFD700', '#FFA500']
      });

      toast({
        title: "Recompensa Coletada! 🎁",
        description: `+${rewardAmount} Beetz`,
        duration: 3000,
      });

      setCanClaim(false);
    } catch (error) {
      console.error('Error claiming daily reward:', error);
    }
  };

  return (
    <Card className={cn("bg-card/50 hover:bg-card transition-colors", className)}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-foreground">Recompensa Diária</p>
              <p className="text-xs text-muted-foreground">
                {canClaim ? "Disponível agora!" : `Próxima em ${timeUntilReset}`}
              </p>
            </div>
          </div>
          
          <Button 
            size="sm" 
            variant={canClaim ? "default" : "outline"}
            onClick={claimDailyReward}
            disabled={!canClaim}
            className="h-8 px-3"
          >
            {canClaim ? (
              <Gift className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}