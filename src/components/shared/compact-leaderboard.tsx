import { memo, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { BeetzIcon } from "@/components/shared/ui/beetz-icon";
import { TrendingUp } from "@/components/icons/optimized-icons";
import { useNavigate } from "react-router-dom";
import { useLeaderboardData } from "@/hooks/use-leaderboard-data";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { useI18n } from "@/hooks/use-i18n";

const CompactLeaderboard = memo(function CompactLeaderboard() {
  const navigate = useNavigate();
  const { data: topUsers = [], isLoading } = useLeaderboardData();
  const { t } = useI18n();


  // Memoize callback functions
  const handleViewAll = useCallback(() => {
    navigate('/leaderboard');
  }, [navigate]);

  const handleUserClick = useCallback((userId: string) => {
    navigate(`/user/${userId}`);
  }, [navigate]);

  // Memoize rank badge calculation
  const getRankBadge = useCallback((rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${rank}`;
    }
  }, []);

  // Memoize loading skeleton
  const loadingSkeleton = useMemo(() => (
    <Card className="border-amber-500/20 bg-gradient-to-br from-background to-amber-500/5 relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop')"
        }}
      />
      
      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-amber-500" />
          Ranking Semanal
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 relative z-10">
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-muted/30 rounded p-2 animate-pulse">
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  ), []);

  if (isLoading) {
    return loadingSkeleton;
  }

  return (
    <Card className="border-amber-500/20 bg-gradient-to-br from-background to-amber-500/5 relative overflow-hidden h-20">
      {/* Cyberpunk 3D Background */}
      <div 
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop')"
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5" />
      
      <CardHeader className="pb-0 pt-2 px-3 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-amber-500" />
            {t('dashboard.rankingBeetz')}
          </CardTitle>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleViewAll}
            className="text-xs h-5 px-2 text-amber-500 hover:bg-amber-500/10"
          >
            {t('common.viewAll')}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-1 pb-2 px-3 relative z-10">
        {/* Top 3 Horizontal Layout - Compact */}
        <div className="grid grid-cols-3 gap-2">
          {(topUsers || []).map((user) => (
            <div 
              key={user.id}
              className={`text-center p-1 rounded-full transition-all cursor-pointer backdrop-blur-sm ${
                user.rank === 1 
                  ? 'bg-gradient-to-b from-yellow-500/15 to-yellow-600/5 border border-yellow-500/20' 
                  : user.rank === 2
                  ? 'bg-gradient-to-b from-gray-400/15 to-gray-500/5 border border-gray-400/20'
                  : 'bg-gradient-to-b from-orange-500/15 to-orange-600/5 border border-orange-500/20'
              }`}
              onClick={() => handleUserClick(user.id)}
            >
              <div className="flex items-center justify-center gap-1">
                {/* Medal Badge */}
                <div className="text-xs">
                  {getRankBadge(user.rank)}
                </div>
                
                {/* Avatar */}
                <AvatarDisplayUniversal
                  avatarData={{
                    profile_image_url: user.profileImageUrl,
                    current_avatar_id: user.current_avatar_id,
                    avatars: user.avatar_url ? { name: user.avatarName || '', image_url: user.avatar_url } : null
                  }}
                  nickname={user.username}
                  size="sm"
                />
                
                {/* Username & Beetz */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate text-xs leading-tight">
                    {user.username}
                  </div>
                  <div className="text-xs text-green-500 flex items-center justify-center gap-0.5">
                    {user.beetz}
                    <BeetzIcon size="xs" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

export { CompactLeaderboard };
