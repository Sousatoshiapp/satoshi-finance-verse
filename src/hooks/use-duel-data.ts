import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DuelData {
  id: string;
  status: string;
  bet_amount: number;
  created_at: string;
  player1_id: string;
  player2_id: string;
  player1_profile?: {
    nickname: string;
    profile_image_url?: string;
  };
  player2_profile?: {
    nickname: string;
    profile_image_url?: string;
  };
}

export function useDuelData(duelId: string | undefined) {
  const [duel, setDuel] = useState<DuelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!duelId) {
      setError('ID do duelo não fornecido');
      setLoading(false);
      return;
    }

    // Only load once - prevent re-initialization on every change
    if (!initialized) {
      console.log('🔍 [PHASE 1] Loading duel data ONCE:', duelId);
      loadDuelData();
    }
  }, [duelId, initialized]);

  const loadDuelData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados básicos do duelo
      const { data: duelData, error: duelError } = await supabase
        .from('casino_duels')
        .select(`
          id,
          status,
          bet_amount,
          created_at,
          player1_id,
          player2_id,
          player1_profile:profiles!casino_duels_player1_id_fkey(
            nickname,
            profile_image_url
          ),
          player2_profile:profiles!casino_duels_player2_id_fkey(
            nickname,
            profile_image_url
          )
        `)
        .eq('id', duelId)
        .single();

      if (duelError) {
        console.error('❌ Erro ao carregar duelo:', duelError);
        setError(`Erro ao carregar duelo: ${duelError.message}`);
        return;
      }

      if (!duelData) {
        console.error('❌ Duelo não encontrado:', duelId);
        setError('Duelo não encontrado');
        return;
      }

      console.log('✅ [PHASE 1] Initial duel data loaded:', duelData);
      setDuel(duelData);
      setInitialized(true); // Mark as initialized to prevent re-loading
    } catch (err) {
      console.error('❌ Erro inesperado ao carregar duelo:', err);
      setError('Erro inesperado ao carregar duelo');
    } finally {
      setLoading(false);
    }
  };

  return {
    duel,
    loading,
    error,
    reload: loadDuelData
  };
}