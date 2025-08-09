import { useState, useEffect } from "react";
import { Card } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, TrendingUp, Flame, Crown, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOptimizedLeaderboardFast, FastLeaderboardUser } from "@/hooks/use-optimized-leaderboard-fast";

// Using FastLeaderboardUser from the hook

const leaderboardTypes = [
  { key: 'xp', title: 'XP', icon: TrendingUp, color: 'text-orange-500' },
  { key: 'streak', title: 'Streak', icon: Flame, color: 'text-red-500' },
  { key: 'level', title: 'Nível', icon: Trophy, color: 'text-purple-500' },
  { key: 'points', title: 'Beetz', icon: Crown, color: 'text-yellow-500' }
];

export default function Leaderboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'xp' | 'streak' | 'level' | 'points'>('xp');
  const [displayLimit, setDisplayLimit] = useState(50);
  const navigate = useNavigate();

  // Use optimized hook with progressive loading
  const { leaderboards, isLoading, loadMore, hasData } = useOptimizedLeaderboardFast(displayLimit);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select(`
            id, nickname, level, xp, streak, points, 
            profile_image_url, current_avatar_id, user_id,
            avatars:avatars!current_avatar_id (
              name,
              image_url
            )
          `)
          .eq('user_id', authUser.id)
          .single();
          
        if (profile) {
          setCurrentUser(profile);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const getCurrentUserRank = () => {
    if (!currentUser || !leaderboards[activeTab]) return 0;
    const userEntry = leaderboards[activeTab].find(user => user.id === currentUser.id);
    return userEntry ? userEntry.rank : 0;
  };

  const getTopUsers = () => {
    return leaderboards[activeTab]?.slice(0, 3) || [];
  };

  const getAllUsers = () => {
    return leaderboards[activeTab] || [];
  };

  const handleLoadMore = async () => {
    const newLimit = displayLimit + 50;
    setDisplayLimit(newLimit);
    try {
      await loadMore(newLimit);
    } catch (error) {
      console.error('Error loading more data:', error);
    }
  };

  const getRankIcon = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈'; 
    if (position === 3) return '🥉';
    return `#${position}`;
  };

  return (
    <div className="min-h-screen bg-background pb-24" 
         style={{ paddingTop: 'env(safe-area-inset-top, 20px)' }}>
      {/* Header - Enhanced mobile spacing */}
      <div className="px-6 py-4 pt-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                ← Dashboard
              </Button>
              <h1 className="text-xl font-bold text-foreground">Ranking</h1>
              {isLoading && hasData && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-4">
        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            {leaderboardTypes.map(type => {
              const IconComponent = type.icon;
              return (
                <TabsTrigger 
                  key={type.key} 
                  value={type.key}
                  className="flex items-center gap-2"
                >
                  <IconComponent className={cn("h-4 w-4", type.color)} />
                  {type.title}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {leaderboardTypes.map(type => (
            <TabsContent key={type.key} value={type.key} className="mt-6">
              {isLoading && !hasData ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="p-6 animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-muted rounded-full" />
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded w-32 mb-2" />
                          <div className="h-3 bg-muted rounded w-24" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  {/* Your Position */}
                  {currentUser && getCurrentUserRank() > 0 && (
                    <Card 
                      className="p-6 mb-8 border-primary cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => navigate(`/user/${currentUser.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-primary">#{getCurrentUserRank()}</div>
                        <AvatarDisplayUniversal
                          avatarData={{
                            profile_image_url: currentUser.profile_image_url,
                            current_avatar_id: currentUser.current_avatar_id,
                            avatars: currentUser.avatars
                          }}
                          nickname={currentUser.nickname}
                          size="md"
                        />
                          <div>
                            <h3 className="font-bold text-foreground">{currentUser.nickname} (Você)</h3>
                            <p className="text-sm text-muted-foreground">
                              Nível {currentUser.level} • {currentUser.xp} XP
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={cn("text-2xl font-bold", type.color)}>
                            {activeTab === 'xp' && currentUser.xp}
                            {activeTab === 'streak' && currentUser.streak}
                            {activeTab === 'level' && currentUser.level}
                            {activeTab === 'points' && currentUser.points}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {type.title}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Top 3 Podium - Mobile Optimized */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
                    {getTopUsers().map((user, index) => (
                      <Card 
                        key={user.id} 
                        className={`p-3 sm:p-6 text-center cursor-pointer hover:shadow-lg transition-shadow ${
                          index === 0 ? 'border-yellow-500 bg-yellow-500/5' :
                          index === 1 ? 'border-gray-400 bg-gray-400/5' :
                          'border-orange-500 bg-orange-500/5'
                        }`}
                        onClick={() => navigate(`/user/${user.id}`)}
                      >
                        <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">{getRankIcon(index + 1)}</div>
                        <AvatarDisplayUniversal
                          avatarData={{
                            profile_image_url: user.profile_image_url,
                            current_avatar_id: user.current_avatar_id,
                            avatars: user.avatars
                          }}
                          nickname={user.nickname}
                          size="sm"
                          className="mx-auto mb-2 sm:mb-3 w-8 h-8 sm:w-12 sm:h-12"
                        />
                        <h3 className="font-bold text-foreground mb-1 text-xs sm:text-base truncate">{user.nickname}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2 hidden sm:block">
                          Nível {user.level}
                        </p>
                        <div className={cn("text-xs sm:text-lg font-bold", type.color)}>
                          {activeTab === 'xp' && `${user.xp}`}
                          {activeTab === 'streak' && `${user.streak}d`}
                          {activeTab === 'level' && `N${user.level}`}
                          {activeTab === 'points' && `${user.points}`}
                        </div>
                        <Badge variant="outline" className="mt-1 sm:mt-2 text-xs hidden sm:inline-flex">
                          🔥 {user.streak}
                        </Badge>
                      </Card>
                    ))}
                  </div>

                  {/* Full Leaderboard */}
                  <Card className="p-6">
                    <h3 className="font-bold text-foreground mb-6">Ranking Completo - {type.title}</h3>
                    <div className="space-y-4">
                      {getAllUsers().map((user) => (
                        <div
                          key={user.id}
                          className={`flex items-center gap-4 p-4 rounded-lg transition-all cursor-pointer ${
                            user.id === currentUser?.id 
                              ? 'bg-primary/10 border border-primary hover:bg-primary/20' 
                              : 'bg-muted/20 hover:bg-muted/40'
                          }`}
                          onClick={() => navigate(`/user/${user.id}`)}
                        >
                          <div className="w-8 text-center font-bold text-foreground">
                            {getRankIcon(user.rank)}
                          </div>
                          
                          <AvatarDisplayUniversal
                            avatarData={{
                              profile_image_url: user.profile_image_url,
                              current_avatar_id: user.current_avatar_id,
                              avatars: user.avatars
                            }}
                            nickname={user.nickname}
                            size="sm"
                          />
                          
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">
                              {user.nickname}
                              {user.id === currentUser?.id && <span className="text-primary ml-2">(Você)</span>}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Nível {user.level} • {user.xp} XP
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <div className={cn("font-bold text-lg", type.color)}>
                              {activeTab === 'xp' && user.xp}
                              {activeTab === 'streak' && user.streak}
                              {activeTab === 'level' && user.level}
                              {activeTab === 'points' && user.points}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {type.title}
                            </div>
                          </div>
                        </div>
                      ))}
                     </div>
                     
                      {/* Load More Button */}
                      {getAllUsers().length >= displayLimit && (
                        <div className="mt-6 text-center">
                          <Button 
                            variant="outline" 
                            onClick={handleLoadMore}
                            className="px-8"
                            disabled={isLoading}
                          >
                            {isLoading ? 'Carregando...' : 'Carregar mais 50 usuários'}
                          </Button>
                        </div>
                      )}
                  </Card>
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      <FloatingNavbar />
    </div>
  );
}
