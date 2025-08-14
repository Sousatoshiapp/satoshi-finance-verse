import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface BattleRoyaleStats {
  activeSessions: number;
  onlinePlayers: number;
  averageWaitTime: number;
}

export const useBattleRoyaleStats = () => {
  const [stats, setStats] = useState<BattleRoyaleStats>({
    activeSessions: 0,
    onlinePlayers: 0,
    averageWaitTime: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Get active sessions count
      const { count: activeSessions } = await supabase
        .from('battle_royale_sessions')
        .select('*', { count: 'exact', head: true })
        .in('status', ['waiting', 'active']);

      // Get current players in queue + active sessions
      const { count: queuePlayers } = await supabase
        .from('battle_royale_queue')
        .select('*', { count: 'exact', head: true });

      const { count: activeParticipants } = await supabase
        .from('battle_royale_participants')
        .select('session_id', { count: 'exact', head: true })
        .eq('is_alive', true);

      const onlinePlayers = (queuePlayers || 0) + (activeParticipants || 0);

      // Estimate average wait time based on queue and recent session creation
      const { data: recentSessions } = await supabase
        .from('battle_royale_sessions')
        .select('created_at, started_at')
        .not('started_at', 'is', null)
        .gte('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()) // Last 30 minutes
        .limit(10);

      let averageWaitTime = 45; // Default 45 seconds
      if (recentSessions && recentSessions.length > 0) {
        const waitTimes = recentSessions
          .map(session => {
            const created = new Date(session.created_at).getTime();
            const started = new Date(session.started_at!).getTime();
            return (started - created) / 1000; // Convert to seconds
          })
          .filter(time => time > 0 && time < 300); // Filter realistic wait times (0-5 minutes)

        if (waitTimes.length > 0) {
          averageWaitTime = Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length);
        }
      }

      setStats({
        activeSessions: activeSessions || 0,
        onlinePlayers,
        averageWaitTime
      });
    } catch (error) {
      console.error('Error fetching battle royale stats:', error);
      // Keep default values on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return { stats, isLoading, refetch: fetchStats };
};
