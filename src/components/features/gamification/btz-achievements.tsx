import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Progress } from "@/components/shared/ui/progress";
import { useBTZEconomics } from "@/hooks/use-btz-economics";
import { Trophy, Shield, TrendingUp, Award, Star, Target } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  requirement: number;
  reward: string;
  category: 'yield' | 'streak' | 'protection' | 'total';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export function BTZAchievements() {
  const { analytics } = useBTZEconomics();

  if (!analytics) return null;

  const achievements: Achievement[] = [
    // Yield Achievements
    {
      id: 'first_yield',
      name: 'Primeiro Rendimento',
      description: 'Ganhe seu primeiro BTZ de rendimento diário',
      icon: <TrendingUp className="w-5 h-5 text-[#adff2f]" />,
      requirement: 1,
      reward: '50 BTZ Bonus',
      category: 'yield',
      rarity: 'common',
      unlocked: analytics.historical.total_yield_earned >= 1,
      progress: Math.min(analytics.historical.total_yield_earned, 1),
      maxProgress: 1
    },
    {
      id: 'yield_1k',
      name: 'Investidor Iniciante',
      description: 'Acumule 1.000 BTZ em rendimentos',
      icon: <Trophy className="w-5 h-5 text-yellow-500" />,
      requirement: 1000,
      reward: '200 BTZ Bonus',
      category: 'yield',
      rarity: 'rare',
      unlocked: analytics.historical.total_yield_earned >= 1000,
      progress: Math.min(analytics.historical.total_yield_earned, 1000),
      maxProgress: 1000
    },
    {
      id: 'yield_10k',
      name: 'Trader Experiente',
      description: 'Acumule 10.000 BTZ em rendimentos',
      icon: <Star className="w-5 h-5 text-purple-500" />,
      requirement: 10000,
      reward: '500 BTZ Bonus',
      category: 'yield',
      rarity: 'epic',
      unlocked: analytics.historical.total_yield_earned >= 10000,
      progress: Math.min(analytics.historical.total_yield_earned, 10000),
      maxProgress: 10000
    },
    {
      id: 'yield_100k',
      name: 'Magnata Digital',
      description: 'Acumule 100.000 BTZ em rendimentos',
      icon: <Award className="w-5 h-5 text-orange-500" />,
      requirement: 100000,
      reward: '2000 BTZ Bonus',
      category: 'yield',
      rarity: 'legendary',
      unlocked: analytics.historical.total_yield_earned >= 100000,
      progress: Math.min(analytics.historical.total_yield_earned, 100000),
      maxProgress: 100000
    },

    // Streak Achievements
    {
      id: 'streak_7',
      name: 'Dedicação Semanal',
      description: 'Mantenha um streak de 7 dias',
      icon: <Target className="w-5 h-5 text-orange-500" />,
      requirement: 7,
      reward: 'Boost de 24h (+1% yield)',
      category: 'streak',
      rarity: 'common',
      unlocked: analytics.current.consecutive_login_days >= 7,
      progress: Math.min(analytics.current.consecutive_login_days, 7),
      maxProgress: 7
    },
    {
      id: 'streak_30',
      name: 'Persistência Mensal',
      description: 'Mantenha um streak de 30 dias',
      icon: <Trophy className="w-5 h-5 text-blue-500" />,
      requirement: 30,
      reward: 'Proteção Extra (+5% BTZ protegido)',
      category: 'streak',
      rarity: 'rare',
      unlocked: analytics.current.consecutive_login_days >= 30,
      progress: Math.min(analytics.current.consecutive_login_days, 30),
      maxProgress: 30
    },
    {
      id: 'streak_100',
      name: 'Lenda da Consistência',
      description: 'Mantenha um streak de 100 dias',
      icon: <Star className="w-5 h-5 text-purple-500" />,
      requirement: 100,
      reward: 'Yield Permanente (+0.5%)',
      category: 'streak',
      rarity: 'legendary',
      unlocked: analytics.current.consecutive_login_days >= 100,
      progress: Math.min(analytics.current.consecutive_login_days, 100),
      maxProgress: 100
    },

    // Protection Achievements
    {
      id: 'protection_10k',
      name: 'Cofre Forte',
      description: 'Tenha 10.000 BTZ protegido',
      icon: <Shield className="w-5 h-5 text-blue-400" />,
      requirement: 10000,
      reward: 'Escudo Temporal (3 dias sem penalty)',
      category: 'protection',
      rarity: 'rare',
      unlocked: analytics.current.protected_btz >= 10000,
      progress: Math.min(analytics.current.protected_btz, 10000),
      maxProgress: 10000
    },
    {
      id: 'protection_100k',
      name: 'Fortaleza Digital',
      description: 'Tenha 100.000 BTZ protegido',
      icon: <Shield className="w-5 h-5 text-cyan-400" />,
      requirement: 100000,
      reward: 'Proteção Elite (+10% BTZ protegido)',
      category: 'protection',
      rarity: 'epic',
      unlocked: analytics.current.protected_btz >= 100000,
      progress: Math.min(analytics.current.protected_btz, 100000),
      maxProgress: 100000
    },

    // Total BTZ Achievements
    {
      id: 'total_50k',
      name: 'Primeiro Milestone',
      description: 'Alcance 50.000 BTZ total',
      icon: <TrendingUp className="w-5 h-5 text-[#adff2f]" />,
      requirement: 50000,
      reward: '1000 BTZ Bonus',
      category: 'total',
      rarity: 'rare',
      unlocked: analytics.current.total_btz >= 50000,
      progress: Math.min(analytics.current.total_btz, 50000),
      maxProgress: 50000
    },
    {
      id: 'total_500k',
      name: 'Meio Milhão',
      description: 'Alcance 500.000 BTZ total',
      icon: <Star className="w-5 h-5 text-purple-500" />,
      requirement: 500000,
      reward: '5000 BTZ Bonus',
      category: 'total',
      rarity: 'epic',
      unlocked: analytics.current.total_btz >= 500000,
      progress: Math.min(analytics.current.total_btz, 500000),
      maxProgress: 500000
    },
    {
      id: 'total_1m',
      name: 'Milionário BTZ',
      description: 'Alcance 1.000.000 BTZ total',
      icon: <Award className="w-5 h-5 text-orange-500" />,
      requirement: 1000000,
      reward: 'Título Exclusivo + 10.000 BTZ',
      category: 'total',
      rarity: 'legendary',
      unlocked: analytics.current.total_btz >= 1000000,
      progress: Math.min(analytics.current.total_btz, 1000000),
      maxProgress: 1000000
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'rare': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'epic': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'legendary': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="text-2xl font-bold">🏆 {unlockedAchievements.length}/{achievements.length}</div>
        <div className="text-sm text-muted-foreground">
          Conquistas desbloqueadas
        </div>
      </div>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-[#adff2f]">✓ Desbloqueadas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unlockedAchievements.map((achievement) => (
              <Card key={achievement.id} className="bg-[#adff2f]/5 border-[#adff2f]/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#adff2f]/20">
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{achievement.name}</h4>
                        <Badge className={getRarityColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      <div className="text-xs text-[#adff2f] font-medium">
                        Recompensa: {achievement.reward}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-muted-foreground">🔒 Em Progresso</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lockedAchievements.map((achievement) => (
              <Card key={achievement.id} className="bg-muted/30 border-muted">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-muted-foreground">{achievement.name}</h4>
                        <Badge className={getRarityColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      <div className="space-y-2">
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            {achievement.progress.toLocaleString()}/{achievement.maxProgress.toLocaleString()}
                          </span>
                          <span className="text-yellow-500 font-medium">
                            {achievement.reward}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
