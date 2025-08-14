import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface QueueStats {
  queue_count: number;
  estimated_wait_time: number;
  active_sessions: number;
}

interface MatchResult {
  success: boolean;
  action?: string;
  session_id?: string;
  session_code?: string;
  current_players?: number;
  max_players?: number;
  error?: string;
}

interface MatchmakingState {
  isSearching: boolean;
  foundSession: boolean;
  sessionId: string | null;
  sessionCode: string | null;
  searchTime: number;
  queuePosition: number;
  estimatedWaitTime: number;
  activeSessions: number;
  currentPlayers: number;
  maxPlayers: number;
  error: string | null;
}

export const useBattleRoyaleMatchmaking = () => {
  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_user_profile');
      return data?.[0];
    },
  });
  const [state, setState] = useState<MatchmakingState>({
    isSearching: false,
    foundSession: false,
    sessionId: null,
    sessionCode: null,
    searchTime: 0,
    queuePosition: 0,
    estimatedWaitTime: 30,
    activeSessions: 0,
    currentPlayers: 0,
    maxPlayers: 100,
    error: null,
  });

  const [searchInterval, setSearchInterval] = useState<NodeJS.Timeout | null>(null);
  const [timeInterval, setTimeInterval] = useState<NodeJS.Timeout | null>(null);

  // Start matchmaking
  const startMatchmaking = useCallback(async (
    mode: string = 'solo',
    topic: string = 'general',
    difficulty: string = 'medium'
  ): Promise<string | undefined> => {
    if (!profile?.id) {
      setState(prev => ({ ...prev, error: 'User profile not found' }));
      return;
    }

    setState(prev => ({
      ...prev,
      isSearching: true,
      foundSession: false,
      sessionId: null,
      sessionCode: null,
      searchTime: 0,
      error: null,
    }));

    try {
      // Get initial queue stats
      const { data: stats } = await supabase.rpc('get_battle_royale_queue_stats', {
        p_mode: mode,
        p_topic: topic,
      });

      if (stats) {
        const queueStats = stats as unknown as QueueStats;
        setState(prev => ({
          ...prev,
          queuePosition: queueStats.queue_count + 1,
          estimatedWaitTime: queueStats.estimated_wait_time,
          activeSessions: queueStats.active_sessions,
        }));
      }

      // Add to queue first
      await supabase.from('battle_royale_queue').insert({
        user_id: profile.id,
        mode,
        topic,
        difficulty,
      });

      // Try immediate matchmaking
      const { data: matchResult } = await supabase.rpc('find_battle_royale_match', {
        p_user_id: profile.id,
        p_mode: mode,
        p_topic: topic,
        p_difficulty: difficulty,
      });

      if (matchResult) {
        const result = matchResult as unknown as MatchResult;
        if (result.success && result.session_id) {
          setState(prev => ({
            ...prev,
            foundSession: true,
            sessionId: result.session_id,
            sessionCode: result.session_code || '',
            currentPlayers: result.current_players || 1,
            maxPlayers: result.max_players || 100,
            isSearching: false,
          }));
          return result.session_id;
        }
      }

      // Start polling for matches
      const pollInterval = setInterval(async () => {
        try {
          const { data: pollResult } = await supabase.rpc('find_battle_royale_match', {
            p_user_id: profile.id,
            p_mode: mode,
            p_topic: topic,
            p_difficulty: difficulty,
          });

          if (pollResult) {
            const result = pollResult as unknown as MatchResult;
            if (result.success && result.session_id) {
              setState(prev => ({
                ...prev,
                foundSession: true,
                sessionId: result.session_id,
                sessionCode: result.session_code || '',
                currentPlayers: result.current_players || 1,
                maxPlayers: result.max_players || 100,
                isSearching: false,
              }));
              clearInterval(pollInterval);
              setSearchInterval(null);
            }
          }

          // Update queue stats
          const { data: updatedStats } = await supabase.rpc('get_battle_royale_queue_stats', {
            p_mode: mode,
            p_topic: topic,
          });

          if (updatedStats) {
            const queueStats = updatedStats as unknown as QueueStats;
            setState(prev => ({
              ...prev,
              queuePosition: Math.max(1, queueStats.queue_count),
              activeSessions: queueStats.active_sessions,
            }));
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 3000);

      setSearchInterval(pollInterval);

      // Start timer
      const timer = setInterval(() => {
        setState(prev => ({ ...prev, searchTime: prev.searchTime + 1 }));
      }, 1000);
      setTimeInterval(timer);

      // Timeout after 5 minutes
      setTimeout(() => {
        if (state.isSearching) {
          cancelMatchmaking();
          setState(prev => ({ ...prev, error: 'Search timeout. Please try again.' }));
        }
      }, 300000);

    } catch (error) {
      console.error('Matchmaking error:', error);
      setState(prev => ({
        ...prev,
        isSearching: false,
        error: 'Failed to start matchmaking',
      }));
    }
  }, [profile?.id, state.isSearching]);

  // Cancel matchmaking
  const cancelMatchmaking = useCallback(async () => {
    if (!profile?.id) return;

    try {
      // Remove from queue
      await supabase
        .from('battle_royale_queue')
        .delete()
        .eq('user_id', profile.id);

      setState(prev => ({
        ...prev,
        isSearching: false,
        foundSession: false,
        sessionId: null,
        sessionCode: null,
        searchTime: 0,
        error: null,
      }));

      if (searchInterval) {
        clearInterval(searchInterval);
        setSearchInterval(null);
      }

      if (timeInterval) {
        clearInterval(timeInterval);
        setTimeInterval(null);
      }
    } catch (error) {
      console.error('Cancel error:', error);
    }
  }, [profile?.id, searchInterval, timeInterval]);

  // Reset matchmaking
  const resetMatchmaking = useCallback(() => {
    setState({
      isSearching: false,
      foundSession: false,
      sessionId: null,
      sessionCode: null,
      searchTime: 0,
      queuePosition: 0,
      estimatedWaitTime: 30,
      activeSessions: 0,
      currentPlayers: 0,
      maxPlayers: 100,
      error: null,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchInterval) clearInterval(searchInterval);
      if (timeInterval) clearInterval(timeInterval);
    };
  }, [searchInterval, timeInterval]);

  return {
    ...state,
    startMatchmaking,
    cancelMatchmaking,
    resetMatchmaking,
  };
};