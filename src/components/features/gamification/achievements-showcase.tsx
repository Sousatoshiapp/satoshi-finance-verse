import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Crown, Zap, Target, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Achievement {
  id: string;
  name: string;
  description: string;
  rarity: string;
  badge_icon: string;
  unlocked: boolean;
  progress?: number;
  total?: number;
}

export function AchievementsShowcase() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockedCount, setUnlockedCount] = useState(0);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load all achievements
      const { data: allAchievements } = await supabase
        .from('achievements')
        .select('*')
        .order('rarity', { ascending: false });

      // Load user's unlocked achievements
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id);

      const unlockedIds = userAchievements?.map(ua => ua.achievement_id) || [];
      
      const achievementsWithStatus = allAchievements?.map(achievement => ({
        ...achievement,
        unlocked: unlockedIds.includes(achievement.id),
        progress: Math.floor(Math.random() * 100), // Placeholder progress
        total: 100
      })) || [];

      setAchievements(achievementsWithStatus);
      setUnlockedCount(unlockedIds.length);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-500 bg-yellow-500/10 text-yellow-400';
      case 'epic': return 'border-purple-500 bg-purple-500/10 text-purple-400';
      case 'rare': return 'border-blue-500 bg-blue-500/10 text-blue-400';
      default: return 'border-gray-500 bg-gray-500/10 text-gray-400';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return <Crown className="h-4 w-4" />;
      case 'epic': return <Star className="h-4 w-4" />;
      case 'rare': return <Shield className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Conquistas
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
    <Card className="border-yellow-500/20 bg-gradient-to-br from-background to-yellow-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Conquistas
            <Badge variant="secondary" className="ml-2">
              {unlockedCount}/{achievements.length}
            </Badge>
          </CardTitle>
        </div>
        
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso Total</span>
            <span className="font-medium">{Math.round((unlockedCount / achievements.length) * 100)}%</span>
          </div>
          <Progress value={(unlockedCount / achievements.length) * 100} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {achievements.slice(0, 6).map((achievement) => (
            <div
              key={achievement.id}
              className={cn(
                "border rounded-lg p-3 transition-all duration-200",
                achievement.unlocked 
                  ? getRarityColor(achievement.rarity)
                  : "bg-muted/30 border-muted opacity-60"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">
                  {achievement.unlocked ? (
                    <Trophy className="h-6 w-6 text-yellow-500" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-muted bg-muted/30"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={cn(
                      "font-medium text-sm",
                      achievement.unlocked ? "" : "text-muted-foreground"
                    )}>
                      {achievement.name}
                    </h3>
                    
                    <div className="flex items-center gap-1">
                      {getRarityIcon(achievement.rarity)}
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {achievement.description}
                  </p>
                  
                  {!achievement.unlocked && achievement.progress !== undefined && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progresso</span>
                        <span>{achievement.progress}/{achievement.total}</span>
                      </div>
                      <Progress 
                        value={(achievement.progress / (achievement.total || 100)) * 100} 
                        className="h-1"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {achievements.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma conquista disponível</p>
            <p className="text-sm">Continue jogando para desbloquear conquistas!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}