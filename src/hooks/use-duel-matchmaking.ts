import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MatchmakingResult {
  opponentId: string | null;
  opponentType: 'human' | 'bot' | 'waiting';
  matchFound: boolean;
}

export function useDuelMatchmaking() {
  const [isSearching, setIsSearching] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchmakingResult | null>(null);
  const { toast } = useToast();

  const startMatchmaking = async (topic: string = 'financas') => {
    try {
      setIsSearching(true);
      
      // Get current user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Call the automatic opponent finding function
      const { data: result, error } = await supabase.rpc('find_automatic_opponent', {
        p_user_id: profile.id,
        p_topic: topic
      });

      if (error) throw error;

      const matchData = result[0];
      
      if (matchData.match_found) {
        setMatchResult({
          opponentId: matchData.opponent_id,
          opponentType: matchData.opponent_type as 'human' | 'bot',
          matchFound: true
        });
        
        if (matchData.opponent_type === 'human') {
          toast({
            title: "Oponente encontrado!",
            description: "Preparando duelo contra outro jogador...",
          });
        } else {
          toast({
            title: "Oponente encontrado!",
            description: "Preparando duelo...",
          });
        }
      } else {
        setMatchResult({
          opponentId: null,
          opponentType: 'waiting',
          matchFound: false
        });
        
        toast({
          title: "Procurando oponente...",
          description: "Você foi adicionado à fila. Aguarde um momento.",
        });
        
        // Poll for matches every 3 seconds
        const pollInterval = setInterval(async () => {
          try {
            const { data: pollResult } = await supabase.rpc('find_automatic_opponent', {
              p_user_id: profile.id,
              p_topic: topic
            });
            
            const pollData = pollResult[0];
            if (pollData.match_found) {
              clearInterval(pollInterval);
              setMatchResult({
                opponentId: pollData.opponent_id,
                opponentType: pollData.opponent_type as 'human' | 'bot',
                matchFound: true
              });
              
              toast({
                title: "Oponente encontrado!",
                description: `Duelo iniciado!`,
              });
            }
          } catch (error) {
            console.error('Error polling for matches:', error);
          }
        }, 3000);
        
        // Stop polling after 30 seconds
        setTimeout(() => {
          clearInterval(pollInterval);
          if (isSearching) {
            setIsSearching(false);
            toast({
              title: "Tempo esgotado",
              description: "Nenhum oponente encontrado. Tente novamente.",
              variant: "destructive"
            });
          }
        }, 30000);
      }
    } catch (error) {
      console.error('Matchmaking error:', error);
      toast({
        title: "Erro no matchmaking",
        description: "Não foi possível encontrar oponente",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const cancelMatchmaking = async () => {
    try {
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
          .from('duel_queue')
          .delete()
          .eq('user_id', profile.id);
      }
    } catch (error) {
      console.error('Error canceling matchmaking:', error);
    }
    
    setIsSearching(false);
    setMatchResult(null);
  };

  const createDuel = async (opponentId: string, topic: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Generate random questions for the duel
      const questions = await generateDuelQuestions(topic);
      
      // Use RPC function to create duel with proper permissions
      const { data: duelId, error: duelError } = await supabase.rpc('create_duel_with_invite', {
        p_challenger_id: profile.id,
        p_challenged_id: opponentId,
        p_quiz_topic: topic,
        p_questions: questions
      });

      if (duelError) throw duelError;

      return { id: duelId };
    } catch (error) {
      console.error('Error creating duel:', error);
      throw error;
    }
  };

  return {
    isSearching,
    matchResult,
    startMatchmaking,
    cancelMatchmaking,
    createDuel
  };
}

async function generateDuelQuestions(topic: string) {
  const questions = [
    {
      id: '1',
      question: 'O que é diversificação de investimentos?',
      options: [
        { id: 'a', text: 'Investir apenas em ações', isCorrect: false },
        { id: 'b', text: 'Distribuir investimentos em diferentes ativos', isCorrect: true },
        { id: 'c', text: 'Investir apenas em renda fixa', isCorrect: false },
        { id: 'd', text: 'Comprar apenas um tipo de ação', isCorrect: false }
      ]
    },
    {
      id: '2',
      question: 'O que é o CDI?',
      options: [
        { id: 'a', text: 'Certificado de Depósito Interbancário', isCorrect: true },
        { id: 'b', text: 'Conta de Depósito Individual', isCorrect: false },
        { id: 'c', text: 'Central de Dados Internacionais', isCorrect: false },
        { id: 'd', text: 'Cadastro de Investidores', isCorrect: false }
      ]
    },
    {
      id: '3',
      question: 'Qual é a principal característica da renda fixa?',
      options: [
        { id: 'a', text: 'Alto risco', isCorrect: false },
        { id: 'b', text: 'Rentabilidade previsível', isCorrect: true },
        { id: 'c', text: 'Volatilidade alta', isCorrect: false },
        { id: 'd', text: 'Liquidez baixa', isCorrect: false }
      ]
    },
    {
      id: '4',
      question: 'O que são ações?',
      options: [
        { id: 'a', text: 'Títulos de dívida', isCorrect: false },
        { id: 'b', text: 'Participações no capital de empresas', isCorrect: true },
        { id: 'c', text: 'Investimentos imobiliários', isCorrect: false },
        { id: 'd', text: 'Reservas bancárias', isCorrect: false }
      ]
    },
    {
      id: '5',
      question: 'Qual é o objetivo da reserva de emergência?',
      options: [
        { id: 'a', text: 'Investir em ações', isCorrect: false },
        { id: 'b', text: 'Cobrir gastos imprevistos', isCorrect: true },
        { id: 'c', text: 'Pagar impostos', isCorrect: false },
        { id: 'd', text: 'Comprar bens de luxo', isCorrect: false }
      ]
    },
    {
      id: '6',
      question: 'O que é inflação?',
      options: [
        { id: 'a', text: 'Aumento geral dos preços', isCorrect: true },
        { id: 'b', text: 'Diminuição dos juros', isCorrect: false },
        { id: 'c', text: 'Valorização da moeda', isCorrect: false },
        { id: 'd', text: 'Crescimento econômico', isCorrect: false }
      ]
    },
    {
      id: '7',
      question: 'Qual a vantagem dos fundos de investimento?',
      options: [
        { id: 'a', text: 'Garantia de lucro', isCorrect: false },
        { id: 'b', text: 'Gestão profissional', isCorrect: true },
        { id: 'c', text: 'Isenção de impostos', isCorrect: false },
        { id: 'd', text: 'Liquidez zero', isCorrect: false }
      ]
    },
    {
      id: '8',
      question: 'O que é Tesouro Direto?',
      options: [
        { id: 'a', text: 'Ações do governo', isCorrect: false },
        { id: 'b', text: 'Títulos públicos federais', isCorrect: true },
        { id: 'c', text: 'Investimentos privados', isCorrect: false },
        { id: 'd', text: 'Moedas digitais', isCorrect: false }
      ]
    },
    {
      id: '9',
      question: 'Qual é o risco da renda variável?',
      options: [
        { id: 'a', text: 'Perda de capital', isCorrect: true },
        { id: 'b', text: 'Ganho garantido', isCorrect: false },
        { id: 'c', text: 'Juros baixos', isCorrect: false },
        { id: 'd', text: 'Liquidez alta', isCorrect: false }
      ]
    },
    {
      id: '10',
      question: 'O que significa IPO?',
      options: [
        { id: 'a', text: 'Investimento Pessoal Online', isCorrect: false },
        { id: 'b', text: 'Oferta Pública Inicial', isCorrect: true },
        { id: 'c', text: 'Índice de Preços Oficial', isCorrect: false },
        { id: 'd', text: 'Imposto sobre Operações', isCorrect: false }
      ]
    }
  ];

  return questions;
}