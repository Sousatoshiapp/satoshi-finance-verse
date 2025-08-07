import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Progress } from "@/components/shared/ui/progress";
import { BeetzIcon } from "@/components/shared/ui/beetz-icon";
import { 
  Zap, 
  Flame, 
  Calendar, 
  Gift, 
  Crown,
  Star,
  Trophy,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface StreakReward {
  day: number;
  reward_type: 'xp' | 'beetz' | 'loot_box' | 'power_up' | 'badge';
  reward_value: number;
  reward_name: string;
  icon: string | React.ReactElement;
  claimed: boolean;
  special: boolean;
}

export function StreakRewards() {
  const [currentStreak, setCurrentStreak] = useState(7);
  const [longestStreak, setLongestStreak] = useState(15);
  const [streakRewards, setStreakRewards] = useState<StreakReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRewardsClaimed, setTotalRewardsClaimed] = useState(0);

  useEffect(() => {
    loadStreakData();
  }, []);

  const loadStreakData = async () => {
    try {
      // Mock streak rewards data - in real app would come from database
      const mockRewards: StreakReward[] = [
        { day: 1, reward_type: 'xp', reward_value: 50, reward_name: '50 XP', icon: '⚡', claimed: true, special: false },
        { day: 2, reward_type: 'beetz', reward_value: 100, reward_name: '100 Beetz', icon: <BeetzIcon size="sm" />, claimed: true, special: false },
        { day: 3, reward_type: 'xp', reward_value: 75, reward_name: '75 XP', icon: '⚡', claimed: true, special: true },
        { day: 4, reward_type: 'power_up', reward_value: 1, reward_name: 'Time Boost', icon: '⏰', claimed: true, special: false },
        { day: 5, reward_type: 'beetz', reward_value: 200, reward_name: '200 Beetz', icon: <BeetzIcon size="sm" />, claimed: true, special: true },
        { day: 6, reward_type: 'loot_box', reward_value: 1, reward_name: 'Rare Loot Box', icon: '📦', claimed: true, special: false },
        { day: 7, reward_type: 'badge', reward_value: 1, reward_name: 'Week Warrior', icon: '🏆', claimed: true, special: true },
        { day: 8, reward_type: 'xp', reward_value: 150, reward_name: '150 XP', icon: '⚡', claimed: false, special: false },
        { day: 9, reward_type: 'power_up', reward_value: 2, reward_name: '2x Hint Power-up', icon: '💡', claimed: false, special: false },
        { day: 10, reward_type: 'beetz', reward_value: 500, reward_name: '500 Beetz', icon: <BeetzIcon size="sm" />, claimed: false, special: true },
        { day: 14, reward_type: 'loot_box', reward_value: 1, reward_name: 'Epic Loot Box', icon: '🎁', claimed: false, special: true },
        { day: 21, reward_type: 'badge', reward_value: 1, reward_name: 'Streak Master', icon: '👑', claimed: false, special: true },
        { day: 30, reward_type: 'badge', reward_value: 1, reward_name: 'Dedication Legend', icon: '🌟', claimed: false, special: true }
      ];

      setStreakRewards(mockRewards);
      setTotalRewardsClaimed(mockRewards.filter(r => r.claimed).length);
    } catch (error) {
      console.error('Error loading streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (reward: StreakReward) => {
    if (reward.claimed || currentStreak < reward.day) return;
    
    // In real app, would make API call to claim reward
    console.log('Claiming reward:', reward.reward_name);
    
    // Update local state
    setStreakRewards(prev => 
      prev.map(r => 
        r.day === reward.day ? { ...r, claimed: true } : r
      )
    );
    setTotalRewardsClaimed(prev => prev + 1);
  };

  const getRewardTypeColor = (type: string, special: boolean) => {
    if (special) return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
    
    switch (type) {
      case 'xp': return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
      case 'beetz': return 'text-orange-500 border-orange-500/30 bg-orange-500/10';
      case 'loot_box': return 'text-purple-500 border-purple-500/30 bg-purple-500/10';
      case 'power_up': return 'text-green-500 border-green-500/30 bg-green-500/10';
      case 'badge': return 'text-red-500 border-red-500/30 bg-red-500/10';
      default: return 'text-muted-foreground';
    }
  };

  const getNextMilestone = () => {
    const nextReward = streakRewards.find(r => !r.claimed && r.day > currentStreak);
    return nextReward || streakRewards[streakRewards.length - 1];
  };

  const nextMilestone = getNextMilestone();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Recompensas de Sequência
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

  return (
    <Card className="border-red-500/20 bg-gradient-to-br from-background to-red-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-red-500" />
            Recompensas de Sequência
          </CardTitle>
          
          <Badge variant="outline" className="text-red-500 border-red-500/30">
            🔥 {currentStreak} dias
          </Badge>
        </div>
        
        {/* Streak Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-red-500">{currentStreak}</div>
            <div className="text-xs text-muted-foreground">Atual</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-orange-500">{longestStreak}</div>
            <div className="text-xs text-muted-foreground">Recorde</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-yellow-500">{totalRewardsClaimed}</div>
            <div className="text-xs text-muted-foreground">Recompensas</div>
          </div>
        </div>
        
        {/* Next Milestone */}
        {nextMilestone && (
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Próxima Meta:</span>
              </div>
              <div className="text-sm font-bold">
                Dia {nextMilestone.day} - {nextMilestone.reward_name}
              </div>
            </div>
            <div className="mt-2">
              <Progress 
                value={(currentStreak / nextMilestone.day) * 100} 
                className="h-2"
              />
              <div className="flex justify-between text-xs mt-1">
                <span>Progresso</span>
                <span>{currentStreak}/{nextMilestone.day} dias</span>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Available Rewards */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">🎁 Recompensas Disponíveis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {streakRewards.filter(r => r.day <= currentStreak + 3).map((reward) => (
              <div 
                key={reward.day}
                className={cn(
                  "border rounded-lg p-3 transition-all",
                  reward.claimed 
                    ? "bg-green-500/10 border-green-500/30 opacity-60" 
                    : currentStreak >= reward.day
                    ? "bg-card border-border hover:border-red-500/30 cursor-pointer"
                    : "bg-muted/30 border-muted opacity-40"
                )}
                onClick={() => claimReward(reward)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{reward.icon}</div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">Dia {reward.day}</span>
                      {reward.special && (
                        <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/30">
                          ⭐ Especial
                        </Badge>
                      )}
                      {reward.claimed && (
                        <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">
                          ✓ Coletado
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm font-medium">{reward.reward_name}</div>
                    
                    <div className="text-xs text-muted-foreground">
                      {currentStreak >= reward.day 
                        ? reward.claimed 
                          ? 'Recompensa coletada!' 
                          : 'Clique para coletar!'
                        : `Desbloqueado no dia ${reward.day}`
                      }
                    </div>
                  </div>
                  
                  {currentStreak >= reward.day && !reward.claimed && (
                    <div className="animate-pulse">
                      <Gift className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Milestone Preview */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">🏆 Marcos Futuros</h3>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            {[14, 21, 30].map(day => {
              const milestoneReward = streakRewards.find(r => r.day === day);
              return (
                <div 
                  key={day}
                  className={cn(
                    "border rounded-lg p-2",
                    currentStreak >= day 
                      ? "border-yellow-500/30 bg-yellow-500/10"
                      : "border-muted bg-muted/30"
                  )}
                >
                  <div className="text-lg">{milestoneReward?.icon}</div>
                  <div className="text-xs font-medium">Dia {day}</div>
                  <div className="text-xs text-muted-foreground">
                    {milestoneReward?.reward_name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {streakRewards.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Flame className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Mantenha sua sequência para desbloquear recompensas!</p>
            <p className="text-sm">Continue estudando todos os dias!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
