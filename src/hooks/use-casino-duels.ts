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

  // Find opponent and create duel
  const findOpponent = async (topic: string, betAmount: number) => {
    if (!profile?.id) {
      toast.error("Perfil não encontrado");
      return;
    }

    if (profile.points < betAmount) {
      toast.error("BTZ insuficiente para esta aposta");
      return;
    }

    setIsSearching(true);
    setLoading(true);

    try {
      // First, try to find an existing opponent in the casino duel queue
      const { data: queuedOpponent, error: queueError } = await (supabase as any)
        .from('casino_duel_queue')
        .select('user_id, topic, bet_amount')
        .eq('topic', topic)
        .eq('bet_amount', betAmount)
        .neq('user_id', profile.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      let opponentId: string;
      let isBot = false;

      if (queuedOpponent && !queueError) {
        // Found a human opponent
        opponentId = queuedOpponent.user_id;
        
        // Remove opponent from queue
        await (supabase as any)
          .from('casino_duel_queue')
          .delete()
          .eq('user_id', opponentId);
      } else {
        // No human opponent found, find a bot
        const { data: botOpponent, error: botError } = await supabase
          .from('profiles')
          .select('id, nickname, level')
          .eq('is_bot', true)
          .order('RANDOM()')
          .limit(1)
          .single();

        if (botError || !botOpponent) {
          throw new Error('Nenhum oponente disponível');
        }

        opponentId = botOpponent.id;
        isBot = true;
      }

      // Generate questions for this topic
      const questions = await generateDuelQuestions(topic);
      
      if (questions.length === 0) {
        throw new Error('Não foi possível gerar perguntas para este tópico');
      }

      // Create the duel
      const { data: duelData, error: duelError } = await (supabase as any)
        .from('casino_duels')
        .insert({
          player1_id: profile.id,
          player2_id: opponentId,
          topic,
          bet_amount: betAmount,
          questions: questions,
          status: 'waiting'
        })
        .select(`
          *,
          player1:profiles!casino_duels_player1_id_fkey(nickname, level, profile_image_url),
          player2:profiles!casino_duels_player2_id_fkey(nickname, level, profile_image_url)
        `)
        .single();

      if (duelError) throw duelError;

      // Deduct bet amount from user's points
      const { error: pointsError } = await supabase
        .from('profiles')
        .update({ points: profile.points - betAmount })
        .eq('id', profile.id);

      if (pointsError) throw pointsError;

      // Deduct bet amount from opponent's points (if human)
      if (!isBot) {
        await supabase
          .from('profiles')
          .update({ points: (supabase as any).sql`points - ${betAmount}` })
          .eq('id', opponentId);
      }

      setCurrentDuel(duelData);
      toast.success(`Oponente encontrado! Duelo iniciado.`);
      
      // Navigate to duel screen
      navigate(`/casino-duel/${duelData.id}`);

    } catch (error: any) {
      console.error('Erro ao encontrar oponente:', error);
      toast.error(error.message || 'Erro ao iniciar duelo');
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  // Cancel search
  const cancelSearch = async () => {
    if (!profile?.id) return;

    try {
      // Remove from queue if exists
      await (supabase as any)
        .from('casino_duel_queue')
        .delete()
        .eq('user_id', profile.id);

      setIsSearching(false);
      toast.info("Busca cancelada");
    } catch (error) {
      console.error('Erro ao cancelar busca:', error);
    }
  };

  // Add to queue (for future matchmaking improvements)
  const addToQueue = async (topic: string, betAmount: number) => {
    if (!profile?.id) return;

    try {
      await (supabase as any)
        .from('casino_duel_queue')
        .upsert({
          user_id: profile.id,
          topic,
          bet_amount: betAmount,
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
        });
    } catch (error) {
      console.error('Erro ao adicionar à fila:', error);
    }
  };

  // Submit answer during duel
  const submitAnswer = async (duelId: string, questionIndex: number, selectedAnswer: string, responseTime: number) => {
    if (!profile?.id) return null;

    try {
      const { data, error } = await (supabase as any)
        .from('casino_duel_answers')
        .insert({
          duel_id: duelId,
          user_id: profile.id,
          question_index: questionIndex,
          selected_answer: selectedAnswer,
          response_time_ms: responseTime,
          is_correct: false // Will be calculated on server
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      return null;
    }
  };

  // Complete duel
  const completeDuel = async (duelId: string) => {
    try {
      const { data, error } = await supabase.rpc('complete_casino_duel', {
        p_duel_id: duelId
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao finalizar duelo:', error);
      return null;
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
    setCurrentDuel
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
    const duelQuestions: DuelQuestion[] = questions.map(q => ({
      id: q.id,
      question: q.question,
      district_id: q.district_id,
      options: {
        a: q.option_a || '',
        b: q.option_b || '',
        c: q.option_c || '',
        d: q.option_d || ''
      },
      correct_answer: q.correct_answer as 'a' | 'b' | 'c' | 'd',
      explanation: q.explanation
    }));

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
      question: 'O que significa "liquidez" em investimentos?',
      options: {
        a: 'Alto risco de perda',
        b: 'Baixa rentabilidade',
        c: 'Facilidade de converter em dinheiro',
        d: 'Investimento de longo prazo'
      },
      correct_answer: 'c',
      explanation: 'Liquidez refere-se à facilidade e rapidez com que um ativo pode ser convertido em dinheiro.'
    },
    {
      id: 'fallback-3',
      question: 'Qual é o principal objetivo da reserva de emergência?',
      options: {
        a: 'Maximizar lucros',
        b: 'Cobrir gastos imprevistos',
        c: 'Investir em ações',
        d: 'Pagar impostos'
      },
      correct_answer: 'b',
      explanation: 'A reserva de emergência serve para cobrir gastos inesperados sem comprometer outras finanças.'
    },
    {
      id: 'fallback-4',
      question: 'O que caracteriza a renda fixa?',
      options: {
        a: 'Alta volatilidade',
        b: 'Rentabilidade previsível',
        c: 'Alto risco',
        d: 'Sem garantias'
      },
      correct_answer: 'b',
      explanation: 'Renda fixa oferece rentabilidade mais previsível e geralmente menor risco que renda variável.'
    },
    {
      id: 'fallback-5',
      question: 'O que são ações?',
      options: {
        a: 'Títulos de dívida',
        b: 'Participações no capital de empresas',
        c: 'Contratos de seguro',
        d: 'Empréstimos bancários'
      },
      correct_answer: 'b',
      explanation: 'Ações representam participações no capital social de empresas de capital aberto.'
    }
  ];
}