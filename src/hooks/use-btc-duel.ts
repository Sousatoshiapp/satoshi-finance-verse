import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBtcPrice } from './use-btc-price';

interface BtcDuel {
  id: string;
  player1_id: string;
  player2_id: string;
  bet_amount: number;
  initial_btc_price: number;
  final_btc_price?: number;
  player1_prediction: 'up' | 'down';
  player2_prediction: 'up' | 'down';
  winner_id?: string;
  status: 'waiting_predictions' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  started_at?: string;
  expires_at: string;
  completed_at?: string;
}

interface BtcDuelState {
  currentDuel: BtcDuel | null;
  isLoading: boolean;
  timeLeft: number;
  phase: 'betting' | 'predicting' | 'active' | 'completed';
  myPrediction: 'up' | 'down' | null;
  opponentPrediction: 'up' | 'down' | null;
}

export function useBtcDuel() {
  const [state, setState] = useState<BtcDuelState>({
    currentDuel: null,
    isLoading: false,
    timeLeft: 0,
    phase: 'betting',
    myPrediction: null,
    opponentPrediction: null
  });

  const { toast } = useToast();
  const { getCurrentPrice } = useBtcPrice();

  // Create a new BTC duel
  const createDuel = useCallback(async (betAmount: number, opponentId: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
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
        throw new Error('Insufficient BTZ for this bet');
      }

      // Get current BTC price
      const currentPrice = await getCurrentPrice();

      // Deduct bet from both players
      const { error: deductError } = await supabase
        .from('profiles')
        .update({ points: profile.points - betAmount })
        .eq('id', profile.id);

      if (deductError) throw deductError;

      // Create the duel
      const { data: duel, error: duelError } = await supabase
        .from('btc_prediction_duels')
        .insert({
          player1_id: profile.id,
          player2_id: opponentId,
          bet_amount: betAmount,
          initial_btc_price: currentPrice,
          player1_prediction: 'up', // Temporary, will be updated
          player2_prediction: 'up'  // Temporary, will be updated
        })
        .select()
        .single();

      if (duelError) throw duelError;

      setState(prev => ({
        ...prev,
        currentDuel: duel as BtcDuel,
        phase: 'predicting',
        timeLeft: 30,
        isLoading: false
      }));

      toast({
        title: "Duelo Criado!",
        description: `Duelo BTC de ${betAmount} BTZ iniciado. Faça sua predição!`
      });

      return duel;

    } catch (error: any) {
      console.error('Error creating BTC duel:', error);
      toast({
        title: "Erro ao criar duelo",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [getCurrentPrice, toast]);

  // Make prediction
  const makePrediction = useCallback(async (prediction: 'up' | 'down') => {
    if (!state.currentDuel) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const isPlayer1 = state.currentDuel.player1_id === profile.id;
      const updateField = isPlayer1 ? 'player1_prediction' : 'player2_prediction';

      const { error } = await supabase
        .from('btc_prediction_duels')
        .update({ [updateField]: prediction })
        .eq('id', state.currentDuel.id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        myPrediction: prediction,
        currentDuel: prev.currentDuel ? {
          ...prev.currentDuel,
          [updateField]: prediction
        } : null
      }));

      toast({
        title: "Predição registrada!",
        description: `Você apostou que o BTC vai ${prediction === 'up' ? 'subir' : 'descer'}`
      });

    } catch (error: any) {
      console.error('Error making prediction:', error);
      toast({
        title: "Erro na predição",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    }
  }, [state.currentDuel, toast]);

  // Start duel monitoring (after predictions are made)
  const startDuelMonitoring = useCallback(async () => {
    if (!state.currentDuel) return;

    try {
      const { error } = await supabase
        .from('btc_prediction_duels')
        .update({ 
          status: 'active',
          started_at: new Date().toISOString()
        })
        .eq('id', state.currentDuel.id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        phase: 'active',
        timeLeft: 300 // 5 minutes
      }));

    } catch (error: any) {
      console.error('Error starting duel monitoring:', error);
      toast({
        title: "Erro ao iniciar duelo",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    }
  }, [state.currentDuel, toast]);

  // Complete duel
  const completeDuel = useCallback(async () => {
    if (!state.currentDuel) return;

    try {
      const finalPrice = await getCurrentPrice();

      const { data, error } = await supabase
        .rpc('complete_btc_duel', {
          p_duel_id: state.currentDuel.id,
          p_final_price: finalPrice
        });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        phase: 'completed',
        timeLeft: 0
      }));

      // Show result
      const [result] = data || [];
      if (result?.winner_profile_id) {
        toast({
          title: "Duelo Finalizado!",
          description: `Vencedor ganhou ${result.prize_amount} BTZ!`
        });
      } else {
        toast({
          title: "Duelo Empatado!",
          description: "As apostas foram devolvidas para ambos os jogadores."
        });
      }

    } catch (error: any) {
      console.error('Error completing duel:', error);
      toast({
        title: "Erro ao finalizar duelo",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    }
  }, [state.currentDuel, getCurrentPrice, toast]);

  // Timer effect
  useEffect(() => {
    if (state.timeLeft <= 0) return;

    const timer = setInterval(() => {
      setState(prev => {
        const newTimeLeft = prev.timeLeft - 1;
        
        if (newTimeLeft <= 0) {
          // Handle timeout based on phase
          if (prev.phase === 'predicting') {
            startDuelMonitoring();
          } else if (prev.phase === 'active') {
            completeDuel();
          }
          return { ...prev, timeLeft: 0 };
        }
        
        return { ...prev, timeLeft: newTimeLeft };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.timeLeft, state.phase, startDuelMonitoring, completeDuel]);

  // Real-time subscription for duel updates
  useEffect(() => {
    if (!state.currentDuel) return;

    const subscription = supabase
      .channel(`btc_duel_${state.currentDuel.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'btc_prediction_duels',
          filter: `id=eq.${state.currentDuel.id}`
        },
        (payload) => {
          const updatedDuel = payload.new as BtcDuel;
          
          // Get current user ID to determine opponent prediction
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
              supabase
                .from('profiles')
                .select('id')
                .eq('user_id', user.id)
                .single()
                .then(({ data: profile }) => {
                  if (profile) {
                    const isPlayer1 = updatedDuel.player1_id === profile.id;
                    const opponentPrediction = isPlayer1 
                      ? updatedDuel.player2_prediction 
                      : updatedDuel.player1_prediction;
                    
                    setState(prev => ({
                      ...prev,
                      currentDuel: updatedDuel,
                      opponentPrediction: opponentPrediction as 'up' | 'down'
                    }));
                  }
                });
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [state.currentDuel?.id]);

  return {
    ...state,
    createDuel,
    makePrediction,
    startDuelMonitoring,
    completeDuel
  };
}