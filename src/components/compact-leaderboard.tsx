import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown, Trophy, Medal, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LeaderboardUser {
  id: string;
  username: string;
  avatar_url?: string;
  level: number;
  xp: number;
  rank: number;
  weeklyXP: number;
}

export function CompactLeaderboard() {
  const navigate = useNavigate();
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      // Mock data - replace with actual API call
      const mockUsers: LeaderboardUser[] = [
        {
          id: '1',
          username: 'CryptoMaster',
          avatar_url: '/placeholder-avatar.jpg',
          level: 15,
          xp: 12450,
          rank: 1,
          weeklyXP: 2340
        },
        {
          id: '2',
          username: 'BlockchainPro',
          avatar_url: '/placeholder-avatar.jpg',
          level: 14,
          xp: 11280,
          rank: 2,
          weeklyXP: 1890
        },
        {
          id: '3',
          username: 'TradingNinja',
          avatar_url: '/placeholder-avatar.jpg',
          level: 13,
          xp: 10150,
          rank: 3,
          weeklyXP: 1560
        }
      ];

      setTopUsers(mockUsers);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-4 w-4 text-yellow-500" />;
      case 2: return <Trophy className="h-4 w-4 text-gray-400" />;
      case 3: return <Medal className="h-4 w-4 text-orange-600" />;
      default: return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  if (loading) {
    return (
      <Card className="border-amber-500/20 bg-gradient-to-br from-background to-amber-500/5 relative overflow-hidden">
        {/* Cyberpunk Background */}
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
    );
  }

  return (
    <Card className="border-amber-500/20 bg-gradient-to-br from-background to-amber-500/5 relative overflow-hidden">
      {/* Cyberpunk 3D Background */}
      <div 
        className="absolute inset-0 opacity-15 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop')"
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/5" />
      
      <CardHeader className="pb-2 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            Ranking Semanal
            <Badge variant="outline" className="text-xs bg-amber-500/10 border-amber-500/30">
              🏆 Top 3
            </Badge>
          </CardTitle>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/leaderboard')}
            className="text-xs h-6 px-2 text-amber-500 border-amber-500/30 hover:bg-amber-500/10"
          >
            Ver Tudo
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 relative z-10">
        <div className="space-y-2">
          {topUsers.map((user) => (
            <div 
              key={user.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-500/10 transition-colors cursor-pointer backdrop-blur-sm bg-background/30"
              onClick={() => navigate(`/user/${user.id}`)}
            >
              <div className="flex items-center justify-center w-6">
                {getRankIcon(user.rank)}
              </div>
              
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="text-xs">{user.username.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{user.username}</div>
                <div className="text-xs text-muted-foreground">Nível {user.level}</div>
              </div>
              
              <div className="text-right">
                <div className="text-xs font-bold text-amber-500">
                  +{user.weeklyXP}
                </div>
                <div className="text-xs text-muted-foreground">XP</div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Cyberpunk glow effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      </CardContent>
    </Card>
  );
}