import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Button } from "@/components/shared/ui/button";
import { Progress } from "@/components/shared/ui/progress";
import { Trophy, Medal, Star, Crown, ArrowLeft, Filter } from "lucide-react";
import { useGamification } from "@/hooks/use-gamification";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Achievements() {
  const navigate = useNavigate();
  const { achievements, loading, getRarityColor } = useGamification();
  const [filter, setFilter] = useState<'all' | 'earned' | 'available'>('all');
  const isMobile = useIsMobile();

  const filteredAchievements = achievements.filter(achievement => {
    switch (filter) {
      case 'earned': return achievement.earned_at;
      case 'available': return !achievement.earned_at;
      default: return true;
    }
  });

  const getRarityIcon = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return Crown;
      case 'epic': return Star;
      case 'rare': return Medal;
      default: return Trophy;
    }
  };

  const getRarityBackground = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-indigo-500';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-background ${isMobile ? 'p-6 pb-24' : 'p-4 pb-20'}`} 
           style={isMobile ? { paddingTop: 'env(safe-area-inset-top, 20px)' } : {}}>
        <div className={`mx-auto ${isMobile ? 'max-w-sm' : 'max-w-4xl'}`}>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-muted/30 rounded-lg p-6">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-2 bg-muted rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background to-muted/20 ${isMobile ? 'pb-24' : 'pb-20'}`} 
         style={isMobile ? { paddingTop: 'env(safe-area-inset-top, 20px)' } : {}}>
      <div className={`${isMobile ? 'p-6 pt-18' : 'p-4'}`}>
        <div className={`mx-auto ${isMobile ? 'max-w-sm' : 'max-w-4xl'}`}>
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/profile')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                🏆 Conquistas
              </h1>
              <p className="text-muted-foreground">
                {achievements.filter(a => a.earned_at).length} de {achievements.length} conquistas desbloqueadas
              </p>
            </div>
          </div>

          {/* Stats Card */}
          <Card className="mb-6 border-primary/20 bg-gradient-to-br from-background to-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Progresso de Conquistas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Conquistas Desbloqueadas</span>
                  <span className="font-medium">
                    {Math.round((achievements.filter(a => a.earned_at).length / Math.max(achievements.length, 1)) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(achievements.filter(a => a.earned_at).length / Math.max(achievements.length, 1)) * 100} 
                  className="h-3" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              <Filter className="w-4 h-4 mr-2" />
              Todas ({achievements.length})
            </Button>
            <Button
              variant={filter === 'earned' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('earned')}
            >
              Desbloqueadas ({achievements.filter(a => a.earned_at).length})
            </Button>
            <Button
              variant={filter === 'available' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('available')}
            >
              Disponíveis ({achievements.filter(a => !a.earned_at).length})
            </Button>
          </div>

          {/* Achievements List */}
          <div className="grid gap-4">
            {filteredAchievements.map((achievement) => {
              const IconComponent = getRarityIcon(achievement.achievements.rarity);
              const isEarned = !!achievement.earned_at;
              
              return (
                <Card key={achievement.id} className={cn(
                  "overflow-hidden transition-all hover:shadow-lg",
                  isEarned ? "border-primary/30 bg-gradient-to-r from-background to-primary/5" : "opacity-75"
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-3 rounded-lg text-white shadow-lg",
                          getRarityBackground(achievement.achievements.rarity)
                        )}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{achievement.achievements.name}</CardTitle>
                            <Badge 
                              variant="outline" 
                              className={cn("capitalize", getRarityColor(achievement.achievements.rarity))}
                            >
                              {achievement.achievements.rarity}
                            </Badge>
                          </div>
                          <CardDescription className="text-sm">
                            {achievement.achievements.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {isEarned ? (
                          <Badge variant="default" className="bg-green-500">
                            ✓ Conquistada
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Em Progresso
                          </Badge>
                        )}
                        {isEarned && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(achievement.earned_at).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Progress bar could be added here based on progress_data */}
                    {achievement.achievements.reward_data && (
                      <div className="flex items-center gap-4 text-sm mt-3 pt-3 border-t">
                        <div className="flex items-center gap-1 text-blue-500">
                          <span>🎁</span>
                          Recompensa: {JSON.stringify(achievement.achievements.reward_data)}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {filteredAchievements.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Nenhuma conquista encontrada</p>
              <p className="text-sm">
                {filter === 'earned' 
                  ? 'Complete atividades para desbloquear conquistas!'
                  : 'Continue jogando para descobrir novas conquistas!'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
