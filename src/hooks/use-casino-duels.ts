import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/use-profile';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { generateDuelQuestions as importedGenerateDuelQuestions } from '@/utils/duel-questions';
import { QuizQuestion, DuelQuestion } from '@/types/quiz';

export interface CasinoDuel {
  id: string;
  player1_id: string;
  player2_id: string;
  topic: string;
  bet_amount: number;
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  winner_id?: string;
  player1_score: number;
  player2_score: number;
  questions: QuizQuestion[];
  current_question: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  player1_profile?: {
    nickname: string;
    level: number;
    avatar_url?: string;
  };
  player2_profile?: {
    nickname: string;
    level: number;
    avatar_url?: string;
  };
}

export function useCasinoDuels() {
  const [currentDuel, setCurrentDuel] = useState<CasinoDuel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile, loadProfile } = useProfile();

  const submitAnswer = async (duelId: string, questionIndex: number, selectedAnswer: string, responseTime: number) => {
    if (!profile?.id) return null;

    try {
      // First insert the answer
      const { error } = await supabase
        .from('casino_duel_answers')
        .insert({
          duel_id: duelId,
          user_id: profile.id,
          question_index: questionIndex,
          selected_answer: selectedAnswer,
          response_time_ms: responseTime,
          is_correct: false // Will be calculated server-side
        });

      if (error) {
        console.error('❌ Error submitting answer:', error);
        toast.error('Erro ao enviar resposta');
        return null;
      }

      // Process the answer and update scores
      const { data: result, error: processError } = await supabase.functions.invoke('process-duel-answer', {
        body: {
          duelId,
          userId: profile.id,
          questionIndex,
          selectedAnswer
        }
      });

      if (processError) {
        console.error('❌ Error processing answer:', processError);
        return null;
      }

      // Reload the duel to get updated scores
      await loadDuelById(duelId);

      return result;
    } catch (error) {
      console.error('❌ Error in submitAnswer:', error);
      return null;
    }
  };

  const completeDuel = async (duelId: string) => {
    try {
      // Call the edge function to complete the duel and handle BTZ transfers
      const { data: result, error } = await supabase.functions.invoke('complete-casino-duel', {
        body: { duelId }
      });

      if (error) {
        console.error('❌ Error completing duel:', error);
        return null;
      }

      console.log('✅ Duel completed:', result);
      
      // Reload profile to update BTZ balance
      await loadProfile();
      
      return result;
    } catch (error) {
      console.error('❌ Error in completeDuel:', error);
      return null;
    }
  };

  const abandonDuel = async (duelId: string) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('abandon-casino-duel', {
        body: { 
          duelId,
          userId: profile?.id
        }
      });

      if (error) {
        console.error('❌ Error abandoning duel:', error);
        return null;
      }

      console.log('✅ Duel abandoned:', result);
      
      // Clear current duel and reload profile
      setCurrentDuel(null);
      await loadProfile();
      
      return result;
    } catch (error) {
      console.error('❌ Error in abandonDuel:', error);
      return null;
    }
  };

  const loadDuelById = async (duelId: string) => {
    console.log('🚨🚨🚨 ULTRA CRITICAL loadDuelById: Starting to load duel:', duelId);
    setLoading(true);
    
    try {
      const { data: duel, error } = await supabase
        .from('casino_duels')
        .select(`
          *,
          player1:profiles!casino_duels_player1_id_fkey(id, nickname, current_avatar_id),
          player2:profiles!casino_duels_player2_id_fkey(id, nickname, current_avatar_id)
        `)
        .eq('id', duelId)
        .single();

      console.log('🚨🚨🚨 ULTRA CRITICAL loadDuelById: Query response error:', error);
      console.log('🚨🚨🚨 ULTRA CRITICAL loadDuelById: Query response data:', !!duel);
      
      if (error) {
        console.error('💥💥💥 ULTRA CRITICAL loadDuelById: Database error:', error);
        toast.error('Erro ao carregar duelo');
        return null;
      }

      if (!duel) {
        console.error('💥💥💥 ULTRA CRITICAL loadDuelById: Duel not found');
        toast.error('Duelo não encontrado');
        return null;
      }

      // Parse questions safely
      let questions = [];
      try {
        if (Array.isArray(duel.questions)) {
          questions = duel.questions;
        } else if (typeof duel.questions === 'string') {
          questions = JSON.parse(duel.questions);
        } else if (duel.questions) {
          questions = [duel.questions];
        }
      } catch (parseError) {
        console.error('Error parsing questions:', parseError);
        questions = [];
      }

      console.log('🚨🚨🚨 ULTRA CRITICAL loadDuelById: Parsed questions count:', questions.length);
      console.log('🚨🚨🚨 ULTRA CRITICAL loadDuelById: Full duel data:', JSON.stringify(duel, null, 2));

      // Format the duel with proper typing
      const formattedDuel: CasinoDuel = {
        id: duel.id,
        player1_id: duel.player1_id,
        player2_id: duel.player2_id,
        topic: duel.topic,
        bet_amount: duel.bet_amount,
        status: duel.status as 'waiting' | 'in_progress' | 'completed' | 'cancelled',
        winner_id: duel.winner_id,
        player1_score: duel.player1_score,
        player2_score: duel.player2_score,
        questions,
        current_question: duel.current_question,
        created_at: duel.created_at,
        started_at: duel.started_at,
        completed_at: duel.completed_at,
        player1_profile: duel.player1 ? {
          nickname: duel.player1.nickname,
          level: 1,
          avatar_url: undefined
        } : undefined,
        player2_profile: duel.player2 ? {
          nickname: duel.player2.nickname,
          level: 1,
          avatar_url: undefined
        } : undefined
      };

      console.log('🚨🚨🚨 ULTRA CRITICAL loadDuelById: Setting currentDuel');
      setCurrentDuel(formattedDuel);
      return formattedDuel;
      
    } catch (error) {
      console.error('💥💥💥 ULTRA CRITICAL loadDuelById: Unexpected error:', error);
      toast.error('Erro inesperado ao carregar duelo');
      return null;
    } finally {
      console.log('🚨🚨🚨 ULTRA CRITICAL loadDuelById: Setting loading to false');
      setLoading(false);
    }
  };

  return {
    currentDuel,
    loading,
    error,
    submitAnswer,
    completeDuel,
    abandonDuel,
    setCurrentDuel,
    loadDuelById,
    loadProfile,
    findOpponent: async (topic?: string, betAmount?: number, difficulty?: string) => null,
    isSearching: false
  };
}