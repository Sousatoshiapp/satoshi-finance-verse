import { memo, useCallback } from 'react';
import { VirtualList } from '@/components/ui/virtual-list';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BeetzIcon } from '@/components/ui/beetz-icon';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { useNavigate } from 'react-router-dom';
import { useRenderPerformance } from '@/hooks/use-performance-monitor';

interface LeaderboardUser {
  id: string;
  username: string;
  avatar_url?: string;
  level: number;
  xp: number;
  rank: number;
  weeklyXP: number;
  beetz: number;
}

interface OptimizedLeaderboardListProps {
  users: LeaderboardUser[];
  height?: number;
}

const LeaderboardItem = memo(({ user, rank }: { user: LeaderboardUser; rank: number }) => {
  const navigate = useNavigate();
  
  const handleUserClick = useCallback(() => {
    navigate(`/user/${user.id}`);
  }, [navigate, user.id]);

  const getRankBadge = useCallback((rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${rank}`;
    }
  }, []);

  return (
    <div 
      className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors rounded-lg"
      onClick={handleUserClick}
    >
      {/* Rank Badge */}
      <div className="w-8 text-center font-bold text-sm">
        {getRankBadge(rank)}
      </div>
      
      {/* Avatar */}
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.avatar_url} alt={user.username} />
        <AvatarFallback className="text-sm font-bold">
          {user.username.charAt(0)}
        </AvatarFallback>
      </Avatar>
      
      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">{user.username}</div>
        <div className="text-xs text-muted-foreground">Nível {user.level}</div>
      </div>
      
      {/* Stats */}
      <div className="text-right">
        <div className="flex items-center gap-1 text-sm font-semibold text-green-500">
          {user.beetz}
          <BeetzIcon size="xs" />
        </div>
        <div className="text-xs text-muted-foreground">
          {user.weeklyXP} XP
        </div>
      </div>
    </div>
  );
});

LeaderboardItem.displayName = 'LeaderboardItem';

export const OptimizedLeaderboardList = memo(({ 
  users, 
  height = 400 
}: OptimizedLeaderboardListProps) => {
  useRenderPerformance('OptimizedLeaderboardList');

  const renderItem = useCallback((user: LeaderboardUser, index: number) => (
    <LeaderboardItem user={user} rank={index + 1} />
  ), []);

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        Nenhum usuário encontrado
      </div>
    );
  }

  return (
    <VirtualList
      items={users}
      itemHeight={70}
      height={height}
      renderItem={renderItem}
      className="border rounded-lg"
      overscan={3}
    />
  );
});

OptimizedLeaderboardList.displayName = 'OptimizedLeaderboardList';