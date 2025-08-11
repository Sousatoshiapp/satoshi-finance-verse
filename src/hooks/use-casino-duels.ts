import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/use-profile';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
  questions: any[];
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

export interface DuelQuestion {
  id: string;
  question: string;
  district_id?: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correct_answer: 'a' | 'b' | 'c' | 'd';
  explanation?: string;
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

          // Generate questions for the duel
          const questions = await generateDuelQuestions(topic);

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
    if (!profile?.id) return;

    try {
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
      }
    } catch (error) {
      console.error('❌ Error in submitAnswer:', error);
    }
  };

  const completeDuel = async (duelId: string) => {
    try {
      const { error } = await supabase
        .from('casino_duels')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', duelId);

      if (error) {
        console.error('❌ Error completing duel:', error);
      }
    } catch (error) {
      console.error('❌ Error in completeDuel:', error);
    }
  };

  // Load existing duel by ID
  const loadDuelById = async (duelId: string) => {
    if (!duelId) {
      console.log('💥 CRITICAL loadDuelById: No duelId provided');
      return null;
    }

    setLoading(true);
    console.log('🚨 CRITICAL useCasinoDuels: Loading duel by ID:', duelId);
    
    try {
      console.log('🚨 CRITICAL useCasinoDuels: Fetching duel directly from casino_duels table...');
      
      // Try direct table access first to see the raw data
      const { data: duelData, error } = await supabase
        .from('casino_duels')
        .select('*')
        .eq('id', duelId)
        .single();

      if (error) {
        console.error('💥 CRITICAL useCasinoDuels: Error loading duel:', error);
        toast.error('Erro ao carregar duelo');
        return null;
      }

      if (!duelData) {
        console.error('💥 CRITICAL useCasinoDuels: No duel data found');
        return null;
      }

      console.log('🚨 CRITICAL useCasinoDuels: Raw duel data loaded:', JSON.stringify(duelData, null, 2));
      console.log('🚨 CRITICAL useCasinoDuels: Raw questions field:', JSON.stringify(duelData.questions, null, 2));

      // Parse questions more safely
      let questions = [];
      try {
        if (Array.isArray(duelData.questions)) {
          questions = duelData.questions;
          console.log('🚨 CRITICAL useCasinoDuels: Questions already array, count:', questions.length);
        } else if (typeof duelData.questions === 'string') {
          questions = JSON.parse(duelData.questions);
          console.log('🚨 CRITICAL useCasinoDuels: Questions parsed from string, count:', questions.length);
        } else if (duelData.questions) {
          questions = [duelData.questions];
          console.log('🚨 CRITICAL useCasinoDuels: Questions converted to array, count:', questions.length);
        }
        console.log('🚨 CRITICAL useCasinoDuels: Final parsed questions:', JSON.stringify(questions, null, 2));
        console.log('🚨 CRITICAL useCasinoDuels: First question preview:', JSON.stringify(questions[0], null, 2));
      } catch (parseError) {
        console.error('💥 CRITICAL useCasinoDuels: Error parsing questions:', parseError);
        questions = [];
      }

      // Format the duel data with minimal processing for now
      const formattedDuel: CasinoDuel = {
        ...duelData,
        status: duelData.status as 'waiting' | 'in_progress' | 'completed' | 'cancelled',
        questions,
        player1_profile: undefined, // Simplified for now to focus on questions
        player2_profile: undefined
      };

      console.log('🚨 CRITICAL useCasinoDuels: Final formatted duel questions count:', formattedDuel.questions?.length);
      console.log('🚨 CRITICAL useCasinoDuels: Setting currentDuel...');

      setCurrentDuel(formattedDuel);
      return formattedDuel;

    } catch (error: any) {
      console.error('💥 CRITICAL useCasinoDuels: Failed to load duel:', error);
      toast.error(error.message || 'Erro ao carregar duelo');
      return null;
    } finally {
      setLoading(false);
      console.log('🚨 CRITICAL useCasinoDuels: loadDuelById finished');
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

// Generate questions for a specific topic using the existing quiz_questions table
async function generateDuelQuestions(topic: string): Promise<DuelQuestion[]> {
  try {
    // Map topic to district_id if needed
    const topicDistrictMap: Record<string, string> = {
      'financas': 'financas',
      'cripto': 'cripto', 
      'investimentos': 'investimentos',
      'economia': 'economia'
    };

    const districtKey = topicDistrictMap[topic] || topic;

    // Fetch questions from quiz_questions table
    const { data: questions, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .or(`district_id.eq.${districtKey},topic.ilike.%${topic}%`)
      .order('RANDOM()')
      .limit(5); // 5 questions per duel

    if (error) {
      console.error('Erro ao buscar perguntas:', error);
      return getFallbackQuestions();
    }

    if (!questions || questions.length === 0) {
      console.log('Nenhuma pergunta encontrada, usando fallback');
      return getFallbackQuestions();
    }

    // Transform questions to DuelQuestion format
    const duelQuestions: DuelQuestion[] = questions.map((q: any) => {
      // Parse options from the options array or create fallback structure
      const optionsArray = q.options || [];
      return {
        id: q.id,
        question: q.question,
        district_id: q.district_id,
        options: {
          a: optionsArray[0] || '',
          b: optionsArray[1] || '',
          c: optionsArray[2] || '',
          d: optionsArray[3] || ''
        },
        correct_answer: q.correct_answer as 'a' | 'b' | 'c' | 'd',
        explanation: q.explanation
      };
    });

    return duelQuestions;
  } catch (error) {
    console.error('Erro ao gerar perguntas:', error);
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