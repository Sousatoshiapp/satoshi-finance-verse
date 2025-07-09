import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLeagues } from "@/hooks/use-leagues";
import { Trophy, TrendingUp, Users, Calendar, Target, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export function LeaguePanel() {
  const { 
    currentSeason, 
    userLeague, 
    rankings, 
    loading, 
    getTierInfo, 
    getTierRequirements 
  } = useLeagues();

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentSeason || !userLeague) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Sistema de Ligas</h3>
            <p className="text-muted-foreground">
              Nenhuma temporada ativa no momento.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tierInfo = getTierInfo(userLeague.current_tier);
  const currentTierRequirement = getTierRequirements(userLeague.current_tier);
  const nextTierRequirement = getTierRequirements(getNextTier(userLeague.current_tier));
  const progressToNextTier = nextTierRequirement > 0 ? 
    Math.min(100, ((userLeague.tier_points - currentTierRequirement) / (nextTierRequirement - currentTierRequirement)) * 100) : 100;

  const userRanking = rankings.find(r => r.user_id === userLeague.user_id);
  const seasonEndDate = new Date(currentSeason.end_date);
  const daysRemaining = Math.ceil((seasonEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      {/* Informações da Liga Atual */}
      <Card className={cn("border-2", tierInfo.bg, "bg-gradient-to-r from-white to-" + tierInfo.bg)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{tierInfo.icon}</div>
              <div>
                <CardTitle className={cn("text-2xl", tierInfo.color)}>
                  {tierInfo.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {userLeague.tier_points} pontos
                </p>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              #{userRanking?.rank_position || '?'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progresso para próxima liga */}
          {userLeague.current_tier !== 'grandmaster' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso para {getTierInfo(getNextTier(userLeague.current_tier)).name}</span>
                <span className="font-medium">
                  {userLeague.tier_points}/{nextTierRequirement}
                </span>
              </div>
              <Progress value={progressToNextTier} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {nextTierRequirement - userLeague.tier_points} pontos para a próxima liga
              </p>
            </div>
          )}

          {/* Estatísticas da Temporada */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {userLeague.promotions_count}
              </div>
              <div className="text-xs text-muted-foreground">Promoções</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {userLeague.demotions_count}
              </div>
              <div className="text-xs text-muted-foreground">Rebaixamentos</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {getTierInfo(userLeague.peak_tier).name}
              </div>
              <div className="text-xs text-muted-foreground">Liga Máxima</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações da Temporada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {currentSeason.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-primary">
                {daysRemaining}
              </div>
              <div className="text-sm text-muted-foreground">
                dias restantes
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Target className="h-4 w-4 mr-2" />
              Ver Recompensas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ranking */}
      <Tabs defaultValue="global" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="global">Ranking Global</TabsTrigger>
          <TabsTrigger value="tier">Minha Liga</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Top Jogadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rankings.slice(0, 10).map((player) => (
                  <div key={player.user_id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg w-8">
                          #{player.rank_position}
                        </span>
                        {player.rank_position <= 3 && (
                          <Crown className={cn(
                            "h-4 w-4",
                            player.rank_position === 1 && "text-yellow-500",
                            player.rank_position === 2 && "text-gray-400",
                            player.rank_position === 3 && "text-amber-600"
                          )} />
                        )}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={player.profile_image_url} />
                        <AvatarFallback>{player.nickname[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{player.nickname}</div>
                        <div className="text-sm text-muted-foreground">
                          {getTierInfo(player.current_tier).name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{player.tier_points}</div>
                      <div className="text-sm text-muted-foreground">pontos</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tier" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="text-2xl">{tierInfo.icon}</div>
                Liga {tierInfo.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rankings
                  .filter(player => player.current_tier === userLeague.current_tier)
                  .slice(0, 20)
                  .map((player) => (
                    <div 
                      key={player.user_id} 
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg",
                        player.user_id === userLeague.user_id 
                          ? "bg-primary/10 border-primary border" 
                          : "bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg w-8">
                          #{player.rank_position}
                        </span>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={player.profile_image_url} />
                          <AvatarFallback>{player.nickname[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{player.nickname}</div>
                          {player.user_id === userLeague.user_id && (
                            <div className="text-sm text-primary">Você</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{player.tier_points}</div>
                        <div className="text-sm text-muted-foreground">pontos</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getNextTier(currentTier: string): string {
  const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster'];
  const currentIndex = tiers.indexOf(currentTier);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : currentTier;
}