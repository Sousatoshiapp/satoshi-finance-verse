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
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const { profile } = useProfile();
  const navigate = useNavigate();

  // Find opponent function
  const findOpponent = async (topic: string, betAmount: number, targetOpponentId?: string) => {
    if (!profile?.id) {
      toast.error('Você precisa estar logado para participar de duelos');
      return null;
    }

    console.log('🎯 findOpponent: Starting search', { topic, betAmount, targetOpponentId });
    setIsSearching(true);

    try {
      // Check if user has enough balance
      if (betAmount > (profile.points || 0)) {
        toast.error('BTZ insuficiente para este duelo');
        return null;
      }

      // Deduct bet amount first
      const { error: deductError } = await supabase
        .from('profiles')
        .update({ points: profile.points - betAmount })
        .eq('id', profile.id);

      if (deductError) {
        console.error('❌ Error deducting bet amount:', deductError);
        toast.error('Erro ao processar aposta');
        return null;
      }

      let duelId: string;

      if (targetOpponentId) {
        // Create a duel invitation for specific opponent
        console.log('📩 Creating duel invite for target opponent');
        
        const { data: inviteData, error: inviteError } = await supabase
          .from('duel_invites')
          .insert({
            challenger_id: profile.id,
            challenged_id: targetOpponentId,
            quiz_topic: topic,
            bet_amount: betAmount,
            status: 'pending',
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
          })
          .select()
          .single();

        if (inviteError) {
          console.error('❌ Error creating invite:', inviteError);
          toast.error('Erro ao criar convite de duelo');
          
          // Refund bet amount
          await supabase
            .from('profiles')
            .update({ points: profile.points })
            .eq('id', profile.id);
          
          return null;
        }

        console.log('✅ Duel invite created:', inviteData.id);
        toast.success('Convite de duelo enviado!');
        navigate('/dashboard');
        return null;
      } else {
        // Look for existing opponent in queue or create new duel
        console.log('🔍 Looking for opponent in queue');
        
        const { data: queuedUsers, error: queueError } = await supabase
          .from('casino_duel_queue')
          .select('*')
          .eq('topic', topic)
          .eq('bet_amount', betAmount)
          .neq('user_id', profile.id)
          .gte('expires_at', new Date().toISOString())
          .limit(1);

        if (queueError) {
          console.error('❌ Error checking queue:', queueError);
          toast.error('Erro ao buscar oponente');
          
          // Refund bet amount
          await supabase
            .from('profiles')
            .update({ points: profile.points })
            .eq('id', profile.id);
          
          return null;
        }

        if (queuedUsers && queuedUsers.length > 0) {
          // Found opponent, create duel
          const opponent = queuedUsers[0];
          console.log('🎯 Found opponent:', opponent.user_id);

          // Generate questions for the duel using standardized system
          const questions = await generateDuelQuestionsForCasino(topic, profile?.level, 1);

          // Create the duel
          const { data: duelData, error: duelError } = await supabase
            .from('casino_duels')
            .insert({
              player1_id: profile.id,
              player2_id: opponent.user_id,
              topic,
              bet_amount: betAmount,
              questions: JSON.stringify(questions),
              status: 'waiting'
            })
            .select()
            .single();

          if (duelError) {
            console.error('❌ Error creating duel:', duelError);
            toast.error('Erro ao criar duelo');
            
            // Refund bet amount
            await supabase
              .from('profiles')
              .update({ points: profile.points })
              .eq('id', profile.id);
            
            return null;
          }

          // Remove opponent from queue
          await supabase
            .from('casino_duel_queue')
            .delete()
            .eq('id', opponent.id);

          console.log('✅ Duel created:', duelData.id);
          duelId = duelData.id;
        } else {
          // No opponent found, add to queue
          console.log('⏳ No opponent found, adding to queue');
          
          const { data: queueData, error: queueAddError } = await supabase
            .from('casino_duel_queue')
            .insert({
              user_id: profile.id,
              topic,
              bet_amount: betAmount,
              expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
            })
            .select()
            .single();

          if (queueAddError) {
            console.error('❌ Error adding to queue:', queueAddError);
            toast.error('Erro ao entrar na fila');
            
            // Refund bet amount
            await supabase
              .from('profiles')
              .update({ points: profile.points })
              .eq('id', profile.id);
            
            return null;
          }

          toast.success('Procurando oponente...');
          
          // Wait for opponent or timeout
          const waitForOpponent = new Promise<string | null>((resolve) => {
            const subscription = supabase
              .channel('casino_duels')
              .on(
                'postgres_changes',
                {
                  event: 'INSERT',
                  schema: 'public',
                  table: 'casino_duels',
                  filter: `player2_id=eq.${profile.id}`
                },
                (payload) => {
                  console.log('🎯 Duel created with me as player2:', payload.new);
                  resolve(payload.new.id);
                  subscription.unsubscribe();
                }
              )
              .subscribe();

            // Timeout after 5 minutes
            setTimeout(() => {
              subscription.unsubscribe();
              resolve(null);
            }, 5 * 60 * 1000);
          });

          duelId = await waitForOpponent;
          
          if (!duelId) {
            console.log('⏰ Search timeout, removing from queue');
            await supabase
              .from('casino_duel_queue')
              .delete()
              .eq('id', queueData.id);
            
            // Refund bet amount
            await supabase
              .from('profiles')
              .update({ points: profile.points })
              .eq('id', profile.id);
            
            toast.error('Tempo limite excedido. Tente novamente.');
            return null;
          }
        }
      }

      console.log('🎮 Redirecting to duel:', duelId);
      toast.success('Duelo criado! Redirecionando...');
      navigate(`/duel/${duelId}`);
      return duelId;

    } catch (error) {
      console.error('❌ Error in findOpponent:', error);
      toast.error('Erro inesperado ao buscar oponente');
      
      // Try to refund bet amount
      if (profile?.id) {
        await supabase
          .from('profiles')
          .update({ points: profile.points })
          .eq('id', profile.id);
      }
      
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  const cancelSearch = async () => {
    if (!profile?.id) return;

    try {
      // Remove from queue and refund
      const { error } = await supabase
        .from('casino_duel_queue')
        .delete()
        .eq('user_id', profile.id);

      if (error) {
        console.error('❌ Error canceling search:', error);
      }

      setIsSearching(false);
      toast.info('Busca cancelada');
    } catch (error) {
      console.error('❌ Error in cancelSearch:', error);
    }
  };

  const addToQueue = async (topic: string, betAmount: number) => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase
        .from('casino_duel_queue')
        .insert({
          user_id: profile.id,
          topic,
          bet_amount: betAmount,
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        });

      if (error) {
        console.error('❌ Error adding to queue:', error);
        toast.error('Erro ao entrar na fila');
      } else {
        toast.success('Adicionado à fila de duelos');
      }
    } catch (error) {
      console.error('❌ Error in addToQueue:', error);
    }
  };

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
      return result;
    } catch (error) {
      console.error('❌ Error in completeDuel:', error);
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
    isSearching,
    loading,
    findOpponent,
    cancelSearch,
    addToQueue,
    submitAnswer,
    completeDuel,
    setCurrentDuel,
    loadDuelById
  };
}

// Generate questions for a specific topic using the standardized system
async function generateDuelQuestionsForCasino(topic: string, playerLevel1?: number, playerLevel2?: number): Promise<DuelQuestion[]> {
  try {
    // Use the imported standardized function
    const standardQuestions = await importedGenerateDuelQuestions(topic, playerLevel1, playerLevel2);
    
    // Convert to the format expected by casino duels
    return standardQuestions.map((q, index) => ({
      id: q.id.toString(),
      question: q.question,
      options: {
        a: q.options[0]?.text || '',
        b: q.options[1]?.text || '',
        c: q.options[2]?.text || '',
        d: q.options[3]?.text || ''
      },
      correct_answer: (['a', 'b', 'c', 'd'][q.options.findIndex(opt => opt.isCorrect)] || 'a') as 'a' | 'b' | 'c' | 'd',
      explanation: q.explanation
    }));
  } catch (error) {
    console.error('Error generating duel questions:', error);
    // Return fallback questions
    return getFallbackQuestions();
  }
}

// Fallback questions if database fetch fails
function getFallbackQuestions(): DuelQuestion[] {
  return [
    {
      id: 'fallback-1',
      question: 'O que é diversificação de investimentos?',
      options: {
        a: 'Investir apenas em ações',
        b: 'Distribuir investimentos em diferentes ativos',
        c: 'Investir apenas em renda fixa',
        d: 'Comprar apenas um tipo de ação'
      },
      correct_answer: 'b',
      explanation: 'Diversificação é uma estratégia que reduz riscos distribuindo investimentos em diferentes tipos de ativos.'
    },
    {
      id: 'fallback-2',
      question: 'O que é inflação?',
      options: {
        a: 'Diminuição dos preços',
        b: 'Aumento geral dos preços',
        c: 'Estabilidade de preços',
        d: 'Deflação dos produtos'
      },
      correct_answer: 'b',
      explanation: 'Inflação é o aumento generalizado e contínuo dos preços na economia.'
    },
    {
      id: 'fallback-3',
      question: 'Para que serve a taxa Selic?',
      options: {
        a: 'Controlar a inflação',
        b: 'Apenas para bancos',
        c: 'Definir câmbio',
        d: 'Cobrar impostos'
      },
      correct_answer: 'a',
      explanation: 'A taxa Selic é usada pelo Banco Central para controlar a inflação e influenciar a economia.'
    },
    {
      id: 'fallback-4',
      question: 'O que é liquidez de um investimento?',
      options: {
        a: 'Quanto rende',
        b: 'Facilidade para resgatar',
        c: 'Nível de risco',
        d: 'Valor mínimo'
      },
      correct_answer: 'b',
      explanation: 'Liquidez é a facilidade e rapidez para converter um investimento em dinheiro.'
    },
    {
      id: 'fallback-5',
      question: 'Qual é a principal função de uma reserva de emergência?',
      options: {
        a: 'Investir em ações',
        b: 'Proteger contra imprevistos',
        c: 'Comprar supérfluos',
        d: 'Pagar impostos'
      },
      correct_answer: 'b',
      explanation: 'A reserva de emergência serve para proteger contra gastos inesperados sem comprometer o orçamento.'
    }
  ];
}