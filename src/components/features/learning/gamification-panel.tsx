import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGamification } from "@/hooks/use-gamification";
import { AchievementCard } from "./achievement-card";
import { StreakDisplay } from "./streak-display";
import { Trophy, Medal, Flame, Star } from "lucide-react";

interface GamificationPanelProps {
  className?: string;
}

export function GamificationPanel({ className }: GamificationPanelProps) {
  const {
    achievements,
    streaks,
    badges,
    loading,
    getCurrentStreak,
    getLongestStreak,
    getTotalBadges,
    getBadgesByType,
    getRecentAchievements
  } = useGamification();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const currentStreak = getCurrentStreak();
  const longestStreak = getLongestStreak();
  const totalBadges = getTotalBadges();
  const recentAchievements = getRecentAchievements();

  return (
    <div className={className}>
      {/* Visão Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conquistas</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{achievements.length}</div>
            <p className="text-xs text-muted-foreground">
              conquistas desbloqueadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emblemas</CardTitle>
            <Medal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBadges}</div>
            <p className="text-xs text-muted-foreground">
              emblemas coletados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sequência</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak}</div>
            <p className="text-xs text-muted-foreground">
              dias consecutivos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Painel Principal */}
      <Tabs defaultValue="achievements" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Conquistas
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Medal className="h-4 w-4" />
            Emblemas
          </TabsTrigger>
          <TabsTrigger value="streaks" className="flex items-center gap-2">
            <Flame className="h-4 w-4" />
            Sequências
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Ranking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conquistas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentAchievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={{
                        id: achievement.achievement_id,
                        name: achievement.achievements.name,
                        description: achievement.achievements.description,
                        type: achievement.achievements.type,
                        rarity: achievement.achievements.rarity,
                        badge_icon: achievement.achievements.badge_icon,
                        earned_at: achievement.earned_at,
                        progress_data: achievement.progress_data
                      }}
                      isEarned={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma conquista ainda. Continue estudando para desbloquear!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Coleção de Emblemas</CardTitle>
            </CardHeader>
            <CardContent>
              {badges.length > 0 ? (
                <div className="space-y-4">
                  {['streak', 'achievement', 'performance'].map((type) => {
                    const typeBadges = getBadgesByType(type);
                    if (typeBadges.length === 0) return null;
                    
                    return (
                      <div key={type} className="space-y-2">
                        <h4 className="font-medium capitalize">{type} Badges</h4>
                        <div className="flex flex-wrap gap-2">
                          {typeBadges.map((badge) => (
                            <Badge 
                              key={badge.id} 
                              variant="outline" 
                              className="flex items-center gap-1 p-2"
                              title={badge.badge_description}
                            >
                              <Medal className="h-3 w-3" />
                              {badge.badge_name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Medal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum emblema coletado ainda. Continue progredindo!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="streaks" className="space-y-4">
          <StreakDisplay
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            lastActivity={streaks[0]?.last_activity}
          />
          
          {streaks.filter(s => s.module_id).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sequências por Módulo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {streaks.filter(s => s.module_id).map((streak) => (
                    <div key={streak.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Módulo {streak.module_id}</div>
                        <div className="text-sm text-muted-foreground">
                          Atual: {streak.current_streak} dias
                        </div>
                      </div>
                      <Badge variant="outline">
                        Recorde: {streak.longest_streak}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sistema Avançado de Gamificação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">🚀 Fase 3 Implementada!</h3>
                <p className="mb-4">Sistema completo de gamificação avançada está pronto!</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <span>🏆 Sistema de Ligas</span>
                    <span>•</span>
                    <span>⚡ Power-ups Avançados</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span>🎯 Eventos & Torneios</span>
                    <span>•</span>
                    <span>🎁 Caixas de Loot Temáticas</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span>🎖️ Combos Avançados</span>
                    <span>•</span>
                    <span>📊 Analytics Gamificados</span>
                  </div>
                </div>
                <Button className="mt-4" variant="outline">
                  Execute a migração SQL para ativar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}