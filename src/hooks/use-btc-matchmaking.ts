import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MatchmakingState {
  isSearching: boolean;
  foundOpponent: boolean;
  opponentId: string | null;
  searchTime: number;
  queuePosition: number;
  estimatedWaitTime: number;
  activeDuels: number;
  isBot: boolean;
}

export function useBtcMatchmaking() {
  const [state, setState] = useState<MatchmakingState>({
    isSearching: false,
    foundOpponent: false,
    opponentId: null,
    searchTime: 0,
    queuePosition: 0,
    estimatedWaitTime: 0,
    activeDuels: 0,
    isBot: false
  });

  const { toast } = useToast();

  // Start matchmaking
  const startMatchmaking = useCallback(async (betAmount: number) => {
    setState(prev => ({ ...prev, isSearching: true, searchTime: 0 }));

    try {
      // Get current user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, points')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');
      if (profile.points < betAmount) {
        throw new Error('Insufficient BTZ for this bet amount');
      }

      // Call matchmaking function
      const { data, error } = await supabase
        .rpc('find_btc_duel_opponent', {
          p_user_id: profile.id,
          p_bet_amount: betAmount
        });

      if (error) throw error;

      const [result] = data || [];
      
      if (result?.opponent_id) {
        // Found opponent immediately
        setState(prev => ({
          ...prev,
          foundOpponent: true,
          opponentId: result.opponent_id,
          isSearching: false,
          isBot: result.is_bot || false
        }));

        const opponentType = result.is_bot ? "Bot" : "Jogador";
        toast({
          title: `🎯 ${opponentType} Encontrado!`,
          description: "Preparando duelo BTC..."
        });

        return result.opponent_id;
      } else {
        // Added to queue, start polling
        toast({
          title: "🔍 Procurando Oponente...",
          description: `Apostando ${betAmount} BTZ - aguarde`
        });

        // Start polling for opponent
        pollForOpponent(profile.id, betAmount);
      }

    } catch (error: any) {
      console.error('Error starting matchmaking:', error);
      toast({
        title: "Erro no matchmaking",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
      setState(prev => ({ ...prev, isSearching: false }));
    }
  }, [toast]);

  // Poll for opponent with improved stats
  const pollForOpponent = useCallback(async (userId: string, betAmount: number) => {
    const maxPollTime = 300; // 5 minutes maximum (increased)
    let pollCount = 0;

    const pollInterval = setInterval(async () => {
      pollCount++;
      
      if (pollCount > maxPollTime) {
        clearInterval(pollInterval);
        cancelMatchmaking();
        toast({
          title: "⏰ Tempo Esgotado",
          description: "Nenhum oponente encontrado. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      try {
        // Get queue stats first
        const { data: statsData, error: statsError } = await supabase
          .rpc('get_btc_queue_stats', {
            p_bet_amount: betAmount
          });

        if (!statsError && statsData?.[0]) {
          const stats = statsData[0];
          setState(prev => ({
            ...prev,
            queuePosition: stats.queue_count,
            estimatedWaitTime: stats.estimated_wait_time,
            activeDuels: stats.active_duels
          }));
        }

        // Check if opponent was found
        const { data, error } = await supabase
          .rpc('find_btc_duel_opponent', {
            p_user_id: userId,
            p_bet_amount: betAmount
          });

        if (error) throw error;

        const [result] = data || [];
        
        if (result?.opponent_id) {
          clearInterval(pollInterval);
          setState(prev => ({
            ...prev,
            foundOpponent: true,
            opponentId: result.opponent_id,
            isSearching: false,
            isBot: result.is_bot || false
          }));

          const opponentType = result.is_bot ? "Bot" : "Jogador";
          toast({
            title: `🎯 ${opponentType} Encontrado!`,
            description: result.is_bot ? "Você foi pareado com um bot!" : "Iniciando duelo BTC..."
          });
        } else {
          // Update search time
          setState(prev => ({
            ...prev,
            searchTime: pollCount
          }));
        }

      } catch (error: any) {
        console.error('Error polling for opponent:', error);
        clearInterval(pollInterval);
        cancelMatchmaking();
      }
    }, 3000); // Poll every 3 seconds (reduced frequency)

    // Store interval reference for cleanup
    setState(prev => ({ ...prev, searchTime: 0 }));
  }, [toast]);

  // Cancel matchmaking
  const cancelMatchmaking = useCallback(async () => {
    try {
      // Get current user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        // Remove from queue
        await supabase
          .from('btc_duel_queue')
          .delete()
          .eq('user_id', profile.id);
      }

      setState({
        isSearching: false,
        foundOpponent: false,
        opponentId: null,
        searchTime: 0,
        queuePosition: 0,
        estimatedWaitTime: 0,
        activeDuels: 0,
        isBot: false
      });

      toast({
        title: "Busca Cancelada",
        description: "Voltando ao menu principal..."
      });

    } catch (error: any) {
      console.error('Error canceling matchmaking:', error);
    }
  }, [toast]);

  // Get queue status
  const getQueueStatus = useCallback(async (betAmount: number) => {
    try {
      const { data, error } = await supabase
        .from('btc_duel_queue')
        .select('id')
        .eq('bet_amount', betAmount)
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;

      return data?.length || 0;
    } catch (error) {
      console.error('Error getting queue status:', error);
      return 0;
    }
  }, []);

  // Reset state
  const resetMatchmaking = useCallback(() => {
    setState({
      isSearching: false,
      foundOpponent: false,
      opponentId: null,
      searchTime: 0,
      queuePosition: 0,
      estimatedWaitTime: 0,
      activeDuels: 0,
      isBot: false
    });
  }, []);

  return {
    ...state,
    startMatchmaking,
    cancelMatchmaking,
    getQueueStatus,
    resetMatchmaking
  };
}