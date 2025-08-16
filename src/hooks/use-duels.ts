import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/use-profile';
import { useI18n } from '@/hooks/use-i18n';

export interface Duel {
  id: string;
  challenger_id: string;
  challenged_id: string;
  status: 'pending' | 'accepted' | 'counter_offered' | 'in_progress' | 'completed' | 'rejected';
  initial_bet_amount: number;
  final_bet_amount: number;
  counter_offer_amount?: number;
  questions: any[];
  challenger_score: number;
  challenged_score: number;
  challenger_time_taken: number;
  challenged_time_taken: number;
  winner_id?: string;
  reason?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  challenger_profile?: { nickname: string; avatar_url?: string };
  challenged_profile?: { nickname: string; avatar_url?: string };
}

export function useDuels() {
  const [duels, setDuels] = useState<Duel[]>([]);
  const [currentDuel, setCurrentDuel] = useState<Duel | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { profile } = useProfile();
  const { t } = useI18n();

  // Create a new duel challenge
  const createDuelChallenge = async (challengedId: string, betAmount: number = 0) => {
    if (!profile?.id) return { success: false, error: 'Profile not found' };

    setLoading(true);
    try {
      // First create a duel invite
      const { data: inviteData, error: inviteError } = await supabase
        .from('duel_invites')
        .insert({
          challenger_id: profile.id,
          challenged_id: challengedId,
          quiz_topic: 'general',
          bet_amount: betAmount
        })
        .select()
        .single();

      if (inviteError) throw inviteError;
      
      toast({
        title: t('duel.challenge.sent'),
        description: t('duel.challenge.sentDesc', { amount: betAmount }),
      });

      return { success: true, invite_id: inviteData.id };
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Respond to a duel (accept, counter, reject)
  const respondToDuel = async (inviteId: string, action: 'accept' | 'counter' | 'reject', counterAmount?: number) => {
    if (!profile?.id) return { success: false, error: 'Profile not found' };
    
    setLoading(true);
    try {
      if (action === 'accept') {
        // Use the create_duel_with_invite function for consistency
        const { data: result, error: rpcError } = await supabase.rpc('create_duel_with_invite', {
          p_invite_id: inviteId,
          p_challenger_id: profile.id
        });

        if (rpcError) throw rpcError;

        // Parse result - the RPC returns a jsonb object
        const resultData = result;
        let duelId: string;
        
        if (typeof resultData === 'string') {
          duelId = resultData;
        } else if (resultData && typeof resultData === 'object' && (resultData as any).duel_id) {
          duelId = (resultData as any).duel_id;
        } else {
          throw new Error('Formato de resposta inválido da RPC');
        }
        
        if (!duelId) {
          throw new Error('ID do duelo não encontrado na resposta');
        }

        toast({
          title: t('duel.challenge.accepted'),
          description: t('duel.challenge.acceptedDesc'),
        });

        return { success: true, duel_id: duelId };
      } else if (action === 'reject') {
        const { error } = await supabase
          .from('duel_invites')
          .update({ status: 'rejected' })
          .eq('id', inviteId);

        if (error) throw error;

        toast({
          title: t('duel.challenge.rejected'),
          description: t('duel.challenge.rejectedDesc'),
        });
      }

      return { success: true };
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Submit an answer during a duel
  const submitAnswer = async (duelId: string, questionId: number, answer: string, responseTime: number) => {
    if (!profile?.id) return;

    try {
      // Temporarily disabled - requires duel_answers table
      console.log('Submit answer: duel_answers table not available');
      
      // Mock correct/incorrect for demo
      const isCorrect = Math.random() > 0.3; // 70% chance of correct
      return { success: true, isCorrect };
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      return { success: false, error: error.message };
    }
  };

  // Complete a duel and determine winner
  const completeDuel = async (duelId: string) => {
    try {
      // Temporarily disabled - requires complete_duel function
      console.log('Complete duel: function not available');
      
      // Mock result for demo
      const mockResult = {
        winner_id: profile?.id,
        prize_amount: 100,
        reason: 'score'
      };

      toast({
        title: t('duel.victory.title'),
        description: t('duel.victory.desc', { 
          prize: mockResult.prize_amount,
          reason: t('duel.victory.byScore')
        }),
        duration: 5000,
      });

      return mockResult;
    } catch (error: any) {
      console.error('Error completing duel:', error);
      return { success: false, error: error.message };
    }
  };

  // Load user's duels
  const loadDuels = async () => {
    if (!profile?.id) return;

    try {
      // Use casino_duels table which is the current standard
      const { data, error } = await supabase
        .from('casino_duels')
        .select(`
          *,
          player1:profiles!casino_duels_player1_id_fkey(nickname, current_avatar_id, avatars(name, image_url)),
          player2:profiles!casino_duels_player2_id_fkey(nickname, current_avatar_id, avatars(name, image_url))
        `)
        .or(`player1_id.eq.${profile.id},player2_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match Duel interface (simplified for now)
      setDuels([]);
    } catch (error) {
      console.error('Error loading duels:', error);
      setDuels([]);
    }
  };

  // Get duel answers for a specific duel
  const getDuelAnswers = async (duelId: string) => {
    try {
      // Temporarily disabled - requires duel_answers table
      console.log('Get duel answers: duel_answers table not available');
      return [];
    } catch (error) {
      console.error('Error loading duel answers:', error);
      return [];
    }
  };

  // Subscribe to real-time duel updates
  useEffect(() => {
    if (!profile?.id) return;

    const subscription = supabase
      .channel('duel_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'casino_duels',
          filter: `or(player1_id.eq.${profile.id},player2_id.eq.${profile.id})`
        },
        () => {
          loadDuels();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'casino_duel_answers'
        },
        () => {
          if (currentDuel) {
            // Reload current duel data
            loadDuels();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [profile?.id, currentDuel]);

  // Load duels on mount
  useEffect(() => {
    if (profile?.id) {
      loadDuels();
    }
  }, [profile?.id]);

  return {
    duels,
    currentDuel,
    setCurrentDuel,
    loading,
    createDuelChallenge,
    respondToDuel,
    submitAnswer,
    completeDuel,
    loadDuels,
    getDuelAnswers
  };
}