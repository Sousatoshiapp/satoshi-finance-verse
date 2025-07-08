import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface League {
  id: string;
  name: string;
  tier: number;
  min_points: number;
  max_points?: number;
  color_primary: string;
  color_secondary: string;
  icon?: string;
  rewards?: any;
}

interface LeaderboardEntry {
  id: string;
  user_id: string;
  week_start_date: string;
  xp_earned: number;
  quiz_score: number;
  duels_won: number;
  streak_days: number;
  total_score: number;
  rank_position?: number;
  league_id?: string;
  leagues?: League;
  profiles?: {
    nickname: string;
    avatar_id?: string;
    avatars?: {
      name: string;
      image_url: string;
    };
  };
}

interface UserStats {
  currentRank: number;
  totalScore: number;
  league: League | null;
  weeklyProgress: {
    xp_earned: number;
    quiz_score: number;
    duels_won: number;
  };
}

export function useLeaderboards() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadLeagues();
    loadLeaderboard();
    loadUserStats();
    
    // Refresh every 5 minutes
    const interval = setInterval(() => {
      loadLeaderboard();
      loadUserStats();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const loadLeagues = async () => {
    try {
      const { data, error } = await supabase
        .from('leagues')
        .select('*')
        .order('tier');

      if (error) throw error;
      setLeagues(data || []);
    } catch (error) {
      console.error('Error loading leagues:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      // Get current week start
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
      const weekStart = startOfWeek.toISOString().split('T')[0];
      setCurrentWeek(weekStart);

      const { data, error } = await supabase
        .from('weekly_leaderboards')
        .select(`
          *,
          leagues (*),
          profiles!weekly_leaderboards_user_id_fkey (
            nickname,
            avatar_id,
            avatars (
              name,
              image_url
            )
          )
        `)
        .eq('week_start_date', weekStart)
        .order('total_score', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Add rank positions
      const rankedData = (data || []).map((entry, index) => ({
        ...entry,
        rank_position: index + 1
      })) as unknown as LeaderboardEntry[];

      setLeaderboard(rankedData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Get current week start
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
      const weekStart = startOfWeek.toISOString().split('T')[0];

      const { data: userEntry, error } = await supabase
        .from('weekly_leaderboards')
        .select(`
          *,
          leagues (*)
        `)
        .eq('user_id', profile.id)
        .eq('week_start_date', weekStart)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" error

      if (userEntry) {
        // Get user's rank by counting users with higher scores
        const { count } = await supabase
          .from('weekly_leaderboards')
          .select('*', { count: 'exact', head: true })
          .eq('week_start_date', weekStart)
          .gt('total_score', userEntry.total_score);

        const rank = (count || 0) + 1;

        setUserStats({
          currentRank: rank,
          totalScore: userEntry.total_score,
          league: userEntry.leagues || null,
          weeklyProgress: {
            xp_earned: userEntry.xp_earned,
            quiz_score: userEntry.quiz_score,
            duels_won: userEntry.duels_won
          }
        });
      } else {
        // User hasn't earned any points this week yet
        setUserStats({
          currentRank: 0,
          totalScore: 0,
          league: leagues[0] || null, // Bronze league
          weeklyProgress: {
            xp_earned: 0,
            quiz_score: 0,
            duels_won: 0
          }
        });
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const updateUserScore = async (type: 'xp' | 'quiz' | 'duel', amount: number = 1) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const xpGained = type === 'xp' ? amount : 0;
      const quizPoints = type === 'quiz' ? amount : 0;
      const duelWin = type === 'duel';

      await supabase.rpc('update_weekly_leaderboard', {
        profile_id: profile.id,
        xp_gained: xpGained,
        quiz_points: quizPoints,
        duel_win: duelWin
      });

      // Reload stats after update
      setTimeout(() => {
        loadUserStats();
        loadLeaderboard();
      }, 1000);

    } catch (error) {
      console.error('Error updating user score:', error);
    }
  };

  const getLeagueByScore = (score: number): League | null => {
    for (let i = leagues.length - 1; i >= 0; i--) {
      const league = leagues[i];
      if (score >= league.min_points && (!league.max_points || score <= league.max_points)) {
        return league;
      }
    }
    return leagues[0] || null; // Default to first league (Bronze)
  };

  const getProgressToNextLeague = (): { current: League | null; next: League | null; progress: number } => {
    if (!userStats) return { current: null, next: null, progress: 0 };

    const currentLeague = userStats.league;
    if (!currentLeague) return { current: null, next: null, progress: 0 };

    const nextLeague = leagues.find(l => l.tier === currentLeague.tier + 1);
    if (!nextLeague) return { current: currentLeague, next: null, progress: 100 };

    const currentScore = userStats.totalScore;
    const pointsNeeded = nextLeague.min_points - currentScore;
    const pointsInCurrentRange = nextLeague.min_points - currentLeague.min_points;
    const pointsEarned = currentScore - currentLeague.min_points;
    const progress = Math.max(0, Math.min(100, (pointsEarned / pointsInCurrentRange) * 100));

    return { current: currentLeague, next: nextLeague, progress };
  };

  const getTimeUntilReset = () => {
    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + (7 - now.getDay() + 1) % 7 || 7);
    nextMonday.setHours(0, 0, 0, 0);
    
    const diff = nextMonday.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${position}`;
    }
  };

  const getRankColor = (position: number) => {
    switch (position) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-400';
      case 3: return 'text-amber-600';
      default: return 'text-muted-foreground';
    }
  };

  return {
    leaderboard,
    leagues,
    userStats,
    loading,
    currentWeek,
    updateUserScore,
    getLeagueByScore,
    getProgressToNextLeague: getProgressToNextLeague(),
    timeUntilReset: getTimeUntilReset(),
    getRankIcon,
    getRankColor,
    refreshLeaderboard: loadLeaderboard,
    refreshUserStats: loadUserStats
  };
}