import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, TrendingUp, Users, Heart, MessageSquare, Award, Crown, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardUser {
  id: string;
  nickname: string;
  profile_image_url?: string;
  level?: number;
  xp?: number;
  points?: number;
  streak?: number;
  metric_value: number;
  rank: number;
  avatars?: {
    name: string;
    image_url: string;
  };
}

const leaderboardTypes = [
  {
    key: 'xp',
    title: 'XP Total',
    icon: TrendingUp,
    description: 'Usuários com mais experiência',
    color: 'text-orange-500'
  },
  {
    key: 'streak',
    title: 'Maior Streak',
    icon: Trophy,
    description: 'Dias consecutivos ativos',
    color: 'text-red-500'
  },
  {
    key: 'posts',
    title: 'Posts Criados',
    icon: MessageSquare,
    description: 'Usuários mais ativos socialmente',
    color: 'text-blue-500'
  },
  {
    key: 'likes',
    title: 'Curtidas Recebidas',
    icon: Heart,
    description: 'Conteúdo mais popular',
    color: 'text-pink-500'
  },
  {
    key: 'followers',
    title: 'Seguidores',
    icon: Users,
    description: 'Usuários mais influentes',
    color: 'text-purple-500'
  }
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  }
};

const getRankBadgeColor = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
    case 2:
      return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
    case 3:
      return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function SocialLeaderboard() {
  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardUser[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('xp');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentUser();
    loadLeaderboards();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setCurrentUserId(profile.id);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadLeaderboards = async () => {
    try {
      const results: Record<string, LeaderboardUser[]> = {};

      // XP Leaderboard
      const { data: xpData } = await supabase
        .from('profiles')
        .select(`
          id,
          nickname,
          profile_image_url,
          level,
          xp,
          points,
          streak,
          avatars:avatar_id (
            name,
            image_url
          )
        `)
        .order('xp', { ascending: false })
        .limit(50);

      if (xpData) {
        results.xp = xpData.map((user, index) => ({
          ...user,
          metric_value: user.xp || 0,
          rank: index + 1
        }));
      }

      // Streak Leaderboard
      const { data: streakData } = await supabase
        .from('profiles')
        .select(`
          id,
          nickname,
          profile_image_url,
          level,
          xp,
          points,
          streak,
          avatars:avatar_id (
            name,
            image_url
          )
        `)
        .order('streak', { ascending: false })
        .limit(50);

      if (streakData) {
        results.streak = streakData.map((user, index) => ({
          ...user,
          metric_value: user.streak || 0,
          rank: index + 1
        }));
      }

      // Posts Leaderboard
      const { data: postsData } = await supabase
        .from('profiles')
        .select(`
          id,
          nickname,
          profile_image_url,
          level,
          xp,
          points,
          streak,
          avatars:avatar_id (
            name,
            image_url
          )
        `)
        .limit(50)
        .limit(50);

      // For now, using mock data for posts count
      // In production, you'd use a proper query with COUNT
      if (postsData) {
        results.posts = postsData.slice(0, 20).map((user, index) => ({
          ...user,
          metric_value: Math.floor(Math.random() * 50) + 1,
          rank: index + 1
        })).sort((a, b) => b.metric_value - a.metric_value);
      }

      // Likes Leaderboard (mock data for now)
      if (xpData) {
        results.likes = xpData.slice(0, 20).map((user, index) => ({
          ...user,
          metric_value: Math.floor(Math.random() * 200) + 10,
          rank: index + 1
        })).sort((a, b) => b.metric_value - a.metric_value);
      }

      // Followers Leaderboard (mock data for now)
      if (xpData) {
        results.followers = xpData.slice(0, 20).map((user, index) => ({
          ...user,
          metric_value: Math.floor(Math.random() * 100) + 5,
          rank: index + 1
        })).sort((a, b) => b.metric_value - a.metric_value);
      }

      setLeaderboards(results);
    } catch (error) {
      console.error('Error loading leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserRank = (type: string) => {
    if (!currentUserId || !leaderboards[type]) return null;
    
    const userEntry = leaderboards[type].find(user => user.id === currentUserId);
    return userEntry ? userEntry.rank : null;
  };

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
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-32 mb-1" />
                  <div className="h-3 bg-muted rounded w-24" />
                </div>
                <div className="h-6 w-12 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Rankings da Comunidade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 mb-6">
            {leaderboardTypes.map(type => {
              const IconComponent = type.icon;
              return (
                <TabsTrigger 
                  key={type.key} 
                  value={type.key}
                  className="flex items-center gap-1 text-xs"
                >
                  <IconComponent className={cn("h-3 w-3", type.color)} />
                  <span className="hidden sm:inline">{type.title}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {leaderboardTypes.map(type => (
            <TabsContent key={type.key} value={type.key} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{type.title}</h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
                {getCurrentUserRank(type.key) && (
                  <Badge variant="outline">
                    Sua posição: #{getCurrentUserRank(type.key)}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                {leaderboards[type.key]?.slice(0, 10).map((user) => (
                  <div
                    key={user.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-colors",
                      user.id === currentUserId 
                        ? "bg-primary/10 border border-primary/20" 
                        : "hover:bg-muted/50",
                      user.rank <= 3 && "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20"
                    )}
                  >
                    <div className="flex items-center justify-center w-8">
                      {getRankIcon(user.rank)}
                    </div>

                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatars?.image_url || user.profile_image_url} />
                      <AvatarFallback>
                        {user.nickname.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{user.nickname}</h4>
                        {user.rank <= 3 && (
                          <Badge className={getRankBadgeColor(user.rank)}>
                            Top {user.rank}
                          </Badge>
                        )}
                        {user.id === currentUserId && (
                          <Badge variant="secondary">Você</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Nível {user.level || 1}</span>
                        {user.xp && <span>{user.xp} XP</span>}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={cn("font-bold text-lg", type.color)}>
                        {user.metric_value.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {type.key === 'xp' && 'XP'}
                        {type.key === 'streak' && 'dias'}
                        {type.key === 'posts' && 'posts'}
                        {type.key === 'likes' && 'curtidas'}
                        {type.key === 'followers' && 'seguidores'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {leaderboards[type.key]?.length === 0 && (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-semibold mb-2">Ainda não há dados</h3>
                  <p className="text-muted-foreground text-sm">
                    Seja o primeiro a aparecer neste ranking!
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}