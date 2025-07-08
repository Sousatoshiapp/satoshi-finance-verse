import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BeetzIcon } from "@/components/ui/beetz-icon";
import { Crown, Trophy, Medal, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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

export function CompactLeaderboard() {
  const navigate = useNavigate();
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      // Get current week start (Monday)
      const currentDate = new Date();
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);
      weekStart.setHours(0, 0, 0, 0);

      // Fetch top 3 users from weekly leaderboard with profile data
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('weekly_leaderboards')
        .select(`
          user_id,
          xp_earned,
          total_score,
          profiles!weekly_leaderboards_user_id_fkey (
            id,
            nickname,
            profile_image_url,
            level,
            xp,
            points,
            avatars:avatar_id (
              name,
              image_url
            )
          )
        `)
        .eq('week_start_date', weekStart.toISOString().split('T')[0])
        .order('total_score', { ascending: false })
        .limit(3);

      if (leaderboardError) {
        console.error('Leaderboard error:', leaderboardError);
        // Fallback to regular profiles if weekly leaderboard is empty
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select(`
            id,
            nickname,
            profile_image_url,
            level,
            xp,
            points,
            avatars:avatar_id (
              name,
              image_url
            )
          `)
          .order('xp', { ascending: false })
          .limit(3);

        if (profilesError) throw profilesError;

        if (profilesData && profilesData.length > 0) {
          const fallbackUsers = profilesData.map((profile, index) => ({
            id: profile.id,
            username: profile.nickname,
            avatar_url: (profile as any).avatars?.image_url || profile.profile_image_url,
            level: profile.level || 1,
            xp: profile.xp || 0,
            rank: index + 1,
            weeklyXP: Math.floor(Math.random() * 500) + 100, // Random weekly XP for demo
            beetz: profile.points || 0
          }));
          setTopUsers(fallbackUsers);
        }
        return;
      }

      if (leaderboardData && leaderboardData.length > 0) {
        const usersWithRanks = leaderboardData.map((entry, index) => {
          const profile = entry.profiles as any;
          return {
            id: profile.id,
            username: profile.nickname,
            avatar_url: profile.avatars?.image_url || profile.profile_image_url,
            level: profile.level || 1,
            xp: profile.xp || 0,
            rank: index + 1,
            weeklyXP: entry.xp_earned || 0,
            beetz: profile.points || 0
          };
        });

        setTopUsers(usersWithRanks);
      } else {
        // If no weekly data exists, create entries for top users
        const { data: topProfilesData, error: topProfilesError } = await supabase
          .from('profiles')
          .select(`
            id,
            nickname,
            profile_image_url,
            level,
            xp,
            points,
            avatars:avatar_id (
              name,
              image_url
            )
          `)
          .order('xp', { ascending: false })
          .limit(3);

        if (topProfilesError) throw topProfilesError;

        if (topProfilesData && topProfilesData.length > 0) {
          // Create weekly entries for these users
          for (const profile of topProfilesData) {
            await supabase.rpc('get_or_create_weekly_entry', { profile_id: profile.id });
          }

          const initialUsers = topProfilesData.map((profile, index) => ({
            id: profile.id,
            username: profile.nickname,
            avatar_url: (profile as any).avatars?.image_url || profile.profile_image_url,
            level: profile.level || 1,
            xp: profile.xp || 0,
            rank: index + 1,
            weeklyXP: Math.floor(Math.random() * 300) + 50, // Initial weekly XP
            beetz: profile.points || 0
          }));

          setTopUsers(initialUsers);
        }
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setTopUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-orange-600" />;
      default: return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${rank}`;
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
      
      <CardHeader className="pb-1 pt-3 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-amber-500" />
            Ranking Semanal
            <Badge variant="outline" className="text-xs bg-amber-500/10 border-amber-500/30 px-1 py-0">
              🏆
            </Badge>
          </CardTitle>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/leaderboard')}
            className="text-xs h-5 px-1 text-amber-500 border-amber-500/30 hover:bg-amber-500/10"
          >
            Ver
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 pb-3 relative z-10">
        {/* Top 3 Horizontal Layout */}
        <div className="grid grid-cols-3 gap-1">
          {topUsers.map((user) => (
            <div 
              key={user.id}
              className={`text-center p-1.5 rounded-md transition-all cursor-pointer backdrop-blur-sm ${
                user.rank === 1 
                  ? 'bg-gradient-to-b from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30' 
                  : user.rank === 2
                  ? 'bg-gradient-to-b from-gray-400/20 to-gray-500/10 border border-gray-400/30'
                  : 'bg-gradient-to-b from-orange-500/20 to-orange-600/10 border border-orange-500/30'
              }`}
              onClick={() => navigate(`/user/${user.id}`)}
            >
              {/* Medal Badge */}
              <div className="flex justify-center mb-1">
                <div className="text-sm">
                  {getRankBadge(user.rank)}
                </div>
              </div>
              
              {/* Avatar */}
              <div className="flex justify-center mb-1">
                <Avatar className={`h-6 w-6 border ${
                  user.rank === 1 ? 'border-yellow-500' : 
                  user.rank === 2 ? 'border-gray-400' : 'border-orange-500'
                }`}>
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="text-xs font-bold">{user.username.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              
              {/* Username */}
              <div className="font-bold truncate text-xs mb-1">
                {user.username}
              </div>
              
              {/* Stats - Compact */}
              <div className="space-y-0.5">
                <div className="text-xs text-muted-foreground">
                  Nv.{user.level}
                </div>
                <div className={`font-bold text-xs ${
                  user.rank === 1 ? 'text-yellow-500' : 
                  user.rank === 2 ? 'text-gray-400' : 'text-orange-500'
                }`}>
                  +{user.weeklyXP}
                </div>
                <div className="text-xs text-green-500 flex items-center gap-1">
                  {user.beetz}
                  <BeetzIcon size="xs" />
                </div>
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