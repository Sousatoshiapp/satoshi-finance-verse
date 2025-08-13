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

      // Handle the result properly - it should be an object or array
      const matchData = Array.isArray(result) ? result[0] : result;
      
      if (matchData && typeof matchData === 'object' && matchData.match_found) {
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
            
            const pollData = Array.isArray(pollResult) ? pollResult[0] : pollResult;
            if (pollData && typeof pollData === 'object' && pollData.match_found) {
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
        
        // Stop polling after 60 seconds
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
        }, 60000);
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
      
      // This hook appears to be using an old pattern - let's redirect to casino duels
      // For now, we'll disable this function as it conflicts with the new system
      throw new Error('Este sistema de duelos foi atualizado. Use o sistema de casino duels.');
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

// Standalone function to generate duel questions - ATUALIZADO para usar nova API padronizada
export async function generateDuelQuestions(topic: string, playerLevel1?: number, playerLevel2?: number): Promise<any[]> {
  // Importar e usar a nova função padronizada
  const { generateDuelQuestions: getQuestions } = await import('../utils/duel-questions');
  return await getQuestions(topic, playerLevel1, playerLevel2);
}
