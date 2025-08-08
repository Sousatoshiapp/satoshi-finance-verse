import { memo, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { TrendingUp, Award } from "@/components/icons/optimized-icons";
import { useNavigate } from "react-router-dom";
import { useBTZRanking } from "@/hooks/use-btz-ranking";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { useI18n } from "@/hooks/use-i18n";

const CompactLeaderboard = memo(function CompactLeaderboard() {
  const navigate = useNavigate();
  const { data: topUsers = [], isLoading } = useBTZRanking();
  const { t } = useI18n();


  // Memoize callback functions
  const handleViewAll = useCallback(() => {
    navigate('/leaderboard');
  }, [navigate]);

  const handleUserClick = useCallback((userId: string) => {
    navigate(`/user/${userId}`);
  }, [navigate]);

  // Memoize rank styles for each position
  const getRankStyles = useCallback((rank: number) => {
    switch (rank) {
      case 1: 
        return {
          medal: "🥇",
          borderClass: "border-2 border-yellow-400 shadow-lg shadow-yellow-400/50",
          bgClass: "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/10"
        };
      case 2:
        return {
          medal: "🥈", 
          borderClass: "border-2 border-gray-300 shadow-lg shadow-gray-300/50",
          bgClass: "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/10"
        };
      case 3:
        return {
          medal: "🥉",
          borderClass: "border-2 border-amber-600 shadow-lg shadow-amber-600/50", 
          bgClass: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10"
        };
      default:
        return {
          medal: `#${rank}`,
          borderClass: "border border-muted",
          bgClass: "bg-card"
        };
    }
  }, []);

  // Memoize loading skeleton
  const loadingSkeleton = useMemo(() => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium">Ranking BTZ</span>
        </div>
        <Button variant="ghost" size="sm" className="text-xs h-6 px-2 text-amber-500">
          Ver Todos
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="aspect-square p-3 animate-pulse">
            <div className="h-full flex flex-col">
              <div className="h-4 bg-muted rounded w-2/3 mb-2" />
              <div className="flex-1 flex items-center justify-center">
                <div className="w-16 h-16 bg-muted rounded-full" />
              </div>
              <div className="h-3 bg-muted rounded w-3/4 mx-auto" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  ), []);

  if (isLoading) {
    return loadingSkeleton;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium">Ranking BTZ</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleViewAll}
          className="text-xs h-6 px-2 text-amber-500 hover:bg-amber-500/10"
        >
          Ver Todos
        </Button>
      </div>
      
      {/* Top 3 Cards Grid */}
      <div className="grid grid-cols-3 gap-3">
        {(topUsers || []).slice(0, 3).map((user) => {
          const rankStyles = getRankStyles(user.rank);
          
          return (
            <Card 
              key={user.id}
              className={`
                aspect-square p-3 cursor-pointer transition-all duration-300 hover:scale-105
                ${rankStyles.borderClass} ${rankStyles.bgClass}
              `}
              onClick={() => handleUserClick(user.id)}
            >
              <div className="h-full flex flex-col">
                {/* Header with medal and @nickname */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">{rankStyles.medal}</span>
                  <div className="text-xs font-medium text-muted-foreground truncate">
                    @{user.username}
                  </div>
                </div>
                
                {/* Avatar - Center */}
                <div className="flex-1 flex items-center justify-center">
                  <AvatarDisplayUniversal
                    avatarData={{
                      profile_image_url: user.profileImageUrl,
                      current_avatar_id: user.current_avatar_id,
                      avatars: user.avatar_url ? { 
                        name: user.avatarName || '', 
                        image_url: user.avatar_url 
                      } : null
                    }}
                    nickname={user.username}
                    size="lg"
                    className="ring-2 ring-current ring-opacity-20"
                  />
                </div>
                
                {/* BTZ Amount */}
                <div className="text-center mt-2">
                  <div className="text-xs font-bold">
                    {user.beetz.toLocaleString()} BTZ
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
});

export { CompactLeaderboard };
