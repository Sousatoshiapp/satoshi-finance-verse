import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLeaderboards } from "@/hooks/use-leaderboards";
import { Trophy, Medal, Crown, TrendingUp, Clock, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";
import { AvatarDisplayUniversal } from "@/components/avatar-display-universal";

export function Leaderboards() {
  const { 
    leaderboard, 
    userStats, 
    loading, 
    getProgressToNextLeague,
    timeUntilReset,
    getRankIcon,
    getRankColor
  } = useLeaderboards();
  const [activeTab, setActiveTab] = useState<'global' | 'league'>('global');
  const { t } = useI18n();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-1/3 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressData = getProgressToNextLeague;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {t('leaderboard.weeklyRankings')}
          </CardTitle>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Reset em</div>
            <div className="text-sm font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeUntilReset}
            </div>
          </div>
        </div>

        {/* User Stats Card */}
        {userStats && (
          <div className="bg-gradient-to-r from-muted/30 to-primary/10 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Sua Posição</div>
                <div className={cn("text-2xl font-bold", getRankColor(userStats.currentRank))}>
                  {userStats.currentRank > 0 ? getRankIcon(userStats.currentRank) : 'Sem rank'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Pontuação Total</div>
                <div className="text-2xl font-bold text-primary">
                  {userStats.totalScore.toLocaleString()}
                </div>
              </div>
            </div>

            {/* League Progress */}
            {progressData.current && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{progressData.current.icon}</span>
                    <span className="font-medium">{progressData.current.name}</span>
                  </div>
                  {progressData.next && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>Próxima:</span>
                      <span>{progressData.next.icon}</span>
                      <span>{progressData.next.name}</span>
                    </div>
                  )}
                </div>
                
                {progressData.next && (
                  <div className="space-y-1">
                    <Progress value={progressData.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{progressData.current.min_points} pts</span>
                      <span>{progressData.next.min_points} pts</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Weekly Progress */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border/50">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-500">
                  {userStats.weeklyProgress.xp_earned}
                </div>
                <div className="text-xs text-muted-foreground">XP</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-500">
                  {userStats.weeklyProgress.quiz_score}
                </div>
                <div className="text-xs text-muted-foreground">Quiz</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-500">
                  {userStats.weeklyProgress.duels_won}
                </div>
                <div className="text-xs text-muted-foreground">Duelos</div>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Tabs */}
        <div className="flex space-x-1 bg-muted/30 rounded-lg p-1 mb-4">
          <Button
            variant={activeTab === 'global' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('global')}
            className="flex-1"
          >
            <Trophy className="h-4 w-4 mr-1" />
            Global
          </Button>
          <Button
            variant={activeTab === 'league' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('league')}
            className="flex-1"
          >
            <Crown className="h-4 w-4 mr-1" />
            Liga
          </Button>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-2">
          {leaderboard.slice(0, 10).map((entry, index) => (
            <div
              key={entry.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-muted/50",
                index === 0 && "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20",
                index === 1 && "bg-gradient-to-r from-gray-400/10 to-gray-500/10 border border-gray-400/20",
                index === 2 && "bg-gradient-to-r from-amber-600/10 to-amber-700/10 border border-amber-600/20",
                index > 2 && "bg-muted/20"
              )}
            >
              {/* Rank */}
              <div className={cn("text-lg font-bold min-w-[3rem] text-center", getRankColor(index + 1))}>
                {getRankIcon(index + 1)}
              </div>

              {/* Avatar */}
              <AvatarDisplayUniversal
                avatarName={(entry.profiles as any)?.avatars?.name}
                avatarUrl={(entry.profiles as any)?.avatars?.image_url}
                profileImageUrl={(entry.profiles as any)?.profile_image_url}
                nickname={(entry.profiles as any)?.nickname || 'User'}
                size="md"
              />

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {(entry.profiles as any)?.nickname || 'Usuário Anônimo'}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {entry.xp_earned} XP
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {entry.quiz_score} Quiz
                  </span>
                  <span className="flex items-center gap-1">
                    <Medal className="h-3 w-3" />
                    {entry.duels_won} Duelos
                  </span>
                </div>
              </div>

              {/* League Badge */}
              {entry.leagues && (
                <Badge variant="outline" className="text-xs">
                  {entry.leagues.icon} {entry.leagues.name}
                </Badge>
              )}

              {/* Score */}
              <div className="text-right">
                <div className="font-bold text-primary">
                  {entry.total_score.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Beetz</div>
              </div>
            </div>
          ))}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">Nenhum ranking disponível</p>
            <p className="text-sm">Seja o primeiro a aparecer no ranking semanal!</p>
          </div>
        )}

        {/* Call to Action */}
        {leaderboard.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium mb-1">Suba no Ranking!</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Complete quizzes, vença duelos e ganhe XP para subir de posição
            </p>
            <div className="flex justify-center gap-2">
              <Badge variant="outline" className="text-xs">
                +1 pt por XP
              </Badge>
              <Badge variant="outline" className="text-xs">
                +1 pt por Quiz
              </Badge>
              <Badge variant="outline" className="text-xs">
                +100 pts por Duelo
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}