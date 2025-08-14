import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/ui/tabs';
import { ArrowLeft, Trophy, Star, Zap, Crown, Medal, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AvatarDisplayUniversal } from '@/components/shared/avatar-display-universal';
import { resolveAvatarImage } from '@/lib/avatar-utils';

interface RankingUser {
  id: string;
  nickname: string;
  level: number;
  xp: number;
  points: number;
  streak: number;
  profile_image_url?: string;
  current_avatar_id?: string;
  avatar?: {
    name: string;
    image_url: string;
  };
  subscription_tier: string;
  rank: number;
}

interface WeeklyStats {
  weekStartDate: string;
  weekEndDate: string;
  topStreakUser: RankingUser | null;
  topXpUser: RankingUser | null;
  topQuizUser: RankingUser | null;
}

export default function HallOfFame() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weekly');
  
  // Rankings
  const [weeklyTop, setWeeklyTop] = useState<RankingUser[]>([]);
  const [monthlyTop, setMonthlyTop] = useState<RankingUser[]>([]);
  const [allTimeTop, setAllTimeTop] = useState<RankingUser[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);

  useEffect(() => {
    loadHallOfFame();
  }, []);

  const loadHallOfFame = async () => {
    try {
      setLoading(true);
      
      // Calcular datas
      const now = new Date();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Top semanal (baseado em XP ganho na última semana)
      const { data: weeklyData } = await supabase
        .from('profiles')
        .select(`
          id, nickname, level, xp, points, streak, profile_image_url, 
          current_avatar_id, subscription_tier,
          avatars:avatars!current_avatar_id (name, image_url)
        `)
        .eq('is_bot', false)
        .order('xp', { ascending: false })
        .limit(10);

      // Top mensal (últimos 30 dias de atividade)
      const { data: monthlyData } = await supabase
        .from('profiles')
        .select(`
          id, nickname, level, xp, points, streak, profile_image_url,
          current_avatar_id, subscription_tier,
          avatars:avatars!current_avatar_id (name, image_url)
        `)
        .eq('is_bot', false)
        .order('level', { ascending: false })
        .order('xp', { ascending: false })
        .limit(10);

      // Top de todos os tempos
      const { data: allTimeData } = await supabase
        .from('profiles')
        .select(`
          id, nickname, level, xp, points, streak, profile_image_url,
          current_avatar_id, subscription_tier,
          avatars:avatars!current_avatar_id (name, image_url)
        `)
        .eq('is_bot', false)
        .order('xp', { ascending: false })
        .limit(20);

      // Usuário com maior streak da semana
      const { data: topStreakData } = await supabase
        .from('profiles')
        .select(`
          id, nickname, level, xp, points, streak, profile_image_url,
          current_avatar_id, subscription_tier,
          avatars:avatars!current_avatar_id (name, image_url)
        `)
        .eq('is_bot', false)
        .order('streak', { ascending: false })
        .limit(1);

      // Adicionar ranking
      const addRankingToUsers = (users: any[]) => 
        users.map((user, index) => ({ ...user, rank: index + 1 }));

      setWeeklyTop(addRankingToUsers(weeklyData || []));
      setMonthlyTop(addRankingToUsers(monthlyData || []));
      setAllTimeTop(addRankingToUsers(allTimeData || []));

      // Estatísticas especiais da semana
      setWeeklyStats({
        weekStartDate: weekStart.toLocaleDateString(),
        weekEndDate: now.toLocaleDateString(),
        topStreakUser: topStreakData?.[0] ? { ...topStreakData[0], rank: 1 } : null,
        topXpUser: weeklyData?.[0] ? { ...weeklyData[0], rank: 1 } : null,
        topQuizUser: weeklyData?.[0] ? { ...weeklyData[0], rank: 1 } : null, // TODO: implementar lógica específica para quiz
      });

    } catch (error) {
      console.error('Error loading hall of fame:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'pro': return 'text-blue-600';
      case 'elite': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'pro': return <Star className="h-3 w-3" />;
      case 'elite': return <Crown className="h-3 w-3" />;
      default: return null;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-orange-600" />;
      default: return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const UserCard = ({ user, showPoints = false }: { user: RankingUser; showPoints?: boolean }) => {
    const avatarData = {
      profile_image_url: user.profile_image_url,
      current_avatar_id: user.current_avatar_id,
      avatars: user.avatar
    };
    
    const resolvedAvatar = resolveAvatarImage(avatarData, user.nickname);

    return (
      <Card className={`transition-all hover:scale-105 ${
        user.rank <= 3 ? 'border-primary/50 bg-gradient-to-r from-primary/5 to-transparent' : ''
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {getRankIcon(user.rank)}
              </div>
              <AvatarDisplayUniversal
                avatarData={avatarData}
                nickname={user.nickname}
                size="sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{user.nickname}</span>
                  {user.subscription_tier !== 'free' && (
                    <Badge variant="secondary" className={`text-xs ${getTierColor(user.subscription_tier)}`}>
                      {getTierIcon(user.subscription_tier)}
                      {user.subscription_tier.toUpperCase()}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Level {user.level}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-primary">{user.xp.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">XP</div>
            </div>
            {showPoints ? (
              <div>
                <div className="text-lg font-bold text-green-600">{user.points.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">BTZ</div>
              </div>
            ) : (
              <div>
                <div className="text-lg font-bold text-orange-600">{user.streak}</div>
                <div className="text-xs text-muted-foreground">Streak</div>
              </div>
            )}
            <div>
              <div className="text-lg font-bold text-blue-600">{user.level}</div>
              <div className="text-xs text-muted-foreground">Level</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando Hall da Fama...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Trophy className="h-8 w-8 text-yellow-500" />
                Hall da Fama
              </h1>
              <p className="text-muted-foreground">Os maiores destaques da plataforma</p>
            </div>
          </div>
        </div>

        {/* Estatísticas Especiais da Semana */}
        {weeklyStats && (
          <Card className="mb-8 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Destaques da Semana
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {weeklyStats.weekStartDate} - {weeklyStats.weekEndDate}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {weeklyStats.topStreakUser && (
                  <div className="text-center p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg">
                    <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                    <p className="text-sm font-medium mb-1">🔥 Maior Streak</p>
                    <p className="font-bold">{weeklyStats.topStreakUser.nickname}</p>
                    <p className="text-2xl font-bold text-orange-600">{weeklyStats.topStreakUser.streak} dias</p>
                  </div>
                )}
                
                {weeklyStats.topXpUser && (
                  <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
                    <Zap className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-sm font-medium mb-1">⚡ Mais XP</p>
                    <p className="font-bold">{weeklyStats.topXpUser.nickname}</p>
                    <p className="text-2xl font-bold text-blue-600">{weeklyStats.topXpUser.xp.toLocaleString()}</p>
                  </div>
                )}

                {weeklyStats.topQuizUser && (
                  <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg">
                    <Crown className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm font-medium mb-1">🧠 Quiz Master</p>
                    <p className="font-bold">{weeklyStats.topQuizUser.nickname}</p>
                    <p className="text-2xl font-bold text-green-600">Level {weeklyStats.topQuizUser.level}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rankings por Período */}
        <Card>
          <CardHeader>
            <CardTitle>Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="weekly">Semanal</TabsTrigger>
                <TabsTrigger value="monthly">Mensal</TabsTrigger>
                <TabsTrigger value="alltime">Todos os Tempos</TabsTrigger>
              </TabsList>

              <TabsContent value="weekly" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {weeklyTop.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="monthly" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {monthlyTop.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="alltime" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allTimeTop.map((user) => (
                    <UserCard key={user.id} user={user} showPoints />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Categorias Especiais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-200">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <h3 className="font-medium mb-1">Campeões</h3>
              <p className="text-xs text-muted-foreground">
                Top 3 de todos os tempos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-200">
            <CardContent className="p-4 text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-medium mb-1">Meteoros</h3>
              <p className="text-xs text-muted-foreground">
                Maior crescimento semanal
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200">
            <CardContent className="p-4 text-center">
              <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <h3 className="font-medium mb-1">Consistentes</h3>
              <p className="text-xs text-muted-foreground">
                Maiores streaks ativos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200">
            <CardContent className="p-4 text-center">
              <Crown className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-medium mb-1">Mestres</h3>
              <p className="text-xs text-muted-foreground">
                Maiores níveis alcançados
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}