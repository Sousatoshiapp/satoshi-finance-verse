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
            description: "Preparando duelo contra jogador real...",
          });
        } else {
          toast({
            title: "Bot encontrado!",
            description: "Preparando duelo contra IA...",
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
                description: `Duelo iniciado contra ${pollData.opponent_type === 'human' ? 'jogador real' : 'IA'}!`,
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
      
      // Create duel invite
      const { data: invite, error: inviteError } = await supabase
        .from('duel_invites')
        .insert({
          challenger_id: profile.id,
          challenged_id: opponentId,
          quiz_topic: topic,
          status: 'accepted'
        })
        .select()
        .single();

      if (inviteError) throw inviteError;

      // Create actual duel
      const { data: duel, error: duelError } = await supabase
        .from('duels')
        .insert({
          invite_id: invite.id,
          player1_id: profile.id,
          player2_id: opponentId,
          quiz_topic: topic,
          questions: questions,
          status: 'active',
          current_turn: profile.id,
          turn_started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (duelError) throw duelError;

      return duel;
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
  // This is a simplified version - in a real app you'd fetch from a questions database
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
    }
  ];

  return questions;
}