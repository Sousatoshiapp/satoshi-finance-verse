import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BattleMatch {
  id: string;
  player1_id: string;
  player2_id: string;
  status: 'waiting' | 'active' | 'completed';
  winner_id?: string;
  bet_amount: number;
  created_at: string;
  completed_at?: string;
  player1: {
    nickname: string;
    level: number;
    avatar?: { image_url: string };
  };
  player2: {
    nickname: string;
    level: number;
    avatar?: { image_url: string };
  };
}

interface BattleRoyaleStats {
  activeMatches: number;
  totalPlayers: number;
  averageLevel: number;
  topPlayers: Array<{
    nickname: string;
    level: number;
    wins: number;
    avatar?: { image_url: string };
  }>;
}

export function useBattleRoyale() {
  const [matches, setMatches] = useState<BattleMatch[]>([]);
  const [stats, setStats] = useState<BattleRoyaleStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);

  const loadBattleData = async () => {
    try {
      setIsLoading(true);

      // Get recent casino duels as battle matches
      const { data: duelsData, error: duelsError } = await supabase
        .from('casino_duels')
        .select(`
          id,
          player1_id,
          player2_id,
          status,
          winner_id,
          bet_amount,
          created_at,
          completed_at
        `)
        .in('status', ['waiting', 'active', 'completed'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (duelsError) throw duelsError;

      // Get player profiles
      const playerIds = duelsData?.flatMap(d => [d.player1_id, d.player2_id]) || [];
      const uniquePlayerIds = [...new Set(playerIds)];

      if (uniquePlayerIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select(`
            id,
            nickname,
            level,
            current_avatar_id,
            avatars (
              image_url
            )
          `)
          .in('id', uniquePlayerIds);

        if (profilesError) throw profilesError;

        // Transform duels to battle matches
        const battleMatches: BattleMatch[] = duelsData?.map(duel => {
          const player1 = profiles?.find(p => p.id === duel.player1_id);
          const player2 = profiles?.find(p => p.id === duel.player2_id);

          if (!player1 || !player2) return null;

          return {
            id: duel.id,
            player1_id: duel.player1_id,
            player2_id: duel.player2_id,
            status: duel.status as BattleMatch['status'],
            winner_id: duel.winner_id,
            bet_amount: duel.bet_amount,
            created_at: duel.created_at,
            completed_at: duel.completed_at,
            player1: {
              nickname: player1.nickname || 'Player',
              level: player1.level || 1,
              avatar: player1.avatars ? { image_url: (player1.avatars as any).image_url } : undefined
            },
            player2: {
              nickname: player2.nickname || 'Player',
              level: player2.level || 1,
              avatar: player2.avatars ? { image_url: (player2.avatars as any).image_url } : undefined
            }
          };
        }).filter(Boolean) as BattleMatch[];

        setMatches(battleMatches);

        // Calculate stats
        const activeMatches = battleMatches.filter(m => m.status === 'active').length;
        const allPlayers = [...battleMatches.map(m => m.player1), ...battleMatches.map(m => m.player2)];
        const uniquePlayers = allPlayers.filter((player, index, arr) => 
          arr.findIndex(p => p.nickname === player.nickname) === index
        );
        
        const averageLevel = uniquePlayers.length > 0 
          ? Math.round(uniquePlayers.reduce((sum, p) => sum + p.level, 0) / uniquePlayers.length)
          : 0;

        // Calculate wins (simplified)
        const playerWins = new Map<string, number>();
        battleMatches.filter(m => m.status === 'completed' && m.winner_id).forEach(match => {
          const winnerNickname = match.winner_id === match.player1_id ? match.player1.nickname : match.player2.nickname;
          playerWins.set(winnerNickname, (playerWins.get(winnerNickname) || 0) + 1);
        });

        const topPlayers = uniquePlayers
          .map(player => ({
            ...player,
            wins: playerWins.get(player.nickname) || 0
          }))
          .sort((a, b) => b.wins - a.wins || b.level - a.level)
          .slice(0, 5);

        setStats({
          activeMatches,
          totalPlayers: uniquePlayers.length,
          averageLevel,
          topPlayers
        });
      } else {
        setMatches([]);
        setStats({
          activeMatches: 0,
          totalPlayers: 0,
          averageLevel: 0,
          topPlayers: []
        });
      }
    } catch (error) {
      console.error('Error loading battle royale data:', error);
      setMatches([]);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  const joinQueue = async (profileId: string, betAmount: number, topic: string) => {
    try {
      const { error } = await supabase
        .from('casino_duel_queue')
        .insert({
          user_id: profileId,
          bet_amount: betAmount,
          topic
        });

      if (error) throw error;

      // Get queue position
      const { data: queueData, error: queueError } = await supabase
        .from('casino_duel_queue')
        .select('id')
        .order('created_at', { ascending: true });

      if (queueError) throw queueError;

      const position = queueData?.findIndex(q => q.id === profileId) + 1;
      setQueuePosition(position || null);

      return { success: true };
    } catch (error: any) {
      console.error('Error joining queue:', error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    loadBattleData();
    const interval = setInterval(loadBattleData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return {
    matches,
    stats,
    queuePosition,
    isLoading,
    joinQueue,
    refetch: loadBattleData
  };
}