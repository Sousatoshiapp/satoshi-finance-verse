import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from './use-profile';

export interface BattleRoyaleSession {
  id: string;
  session_code: string;
  mode: 'solo' | 'squad' | 'chaos';
  max_players: number;
  current_players: number;
  status: 'waiting' | 'starting' | 'active' | 'finished';
  current_round: number;
  total_rounds: number;
  topic: string;
  difficulty: string;
  entry_fee: number;
  prize_pool: number;
  started_at?: string;
  finished_at?: string;
  questions?: any[];
}

export interface BattleRoyaleParticipant {
  id: string;
  session_id: string;
  user_id: string;
  team_id?: string;
  position?: number;
  is_alive: boolean;
  eliminated_at?: string;
  eliminated_by_round?: number;
  total_score: number;
  correct_answers: number;
  response_time_avg: number;
  power_ups_used: any[];
  joined_at: string;
  profiles?: {
    nickname: string;
    current_avatar_id?: string;
  };
}

export interface BattleRoyaleQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  category: string;
  difficulty: string;
}

export interface BattleRoyaleState {
  session: BattleRoyaleSession | null;
  participants: BattleRoyaleParticipant[];
  currentQuestion: BattleRoyaleQuestion | null;
  myParticipant: BattleRoyaleParticipant | null;
  isLoading: boolean;
  error: string | null;
  gamePhase: 'lobby' | 'countdown' | 'question' | 'results' | 'elimination' | 'finished';
  timeRemaining: number;
  lastAnswerResult: {
    is_correct: boolean;
    points_earned: number;
    correct_answer: string;
  } | null;
}

export function useBattleRoyaleReal() {
  const { toast } = useToast();
  const { profile } = useProfile();
  
  const [state, setState] = useState<BattleRoyaleState>({
    session: null,
    participants: [],
    currentQuestion: null,
    myParticipant: null,
    isLoading: false,
    error: null,
    gamePhase: 'lobby',
    timeRemaining: 0,
    lastAnswerResult: null
  });

  // Create new Battle Royale session
  const createSession = useCallback(async (options: {
    mode: 'solo' | 'squad' | 'chaos';
    topic: string;
    difficulty: string;
    entry_fee: number;
    max_players: number;
  }) => {
    if (!profile) return null;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.functions.invoke('battle-royale-manager', {
        body: {
          action: 'create_session',
          ...options
        }
      });

      if (error) throw error;

      setState(prev => ({ 
        ...prev, 
        session: data.session,
        isLoading: false
      }));

      toast({
        title: "Sessão Criada!",
        description: `Código da sessão: ${data.session.session_code}`,
      });

      return data.session;
    } catch (error: any) {
      console.error('Error creating session:', error);
      setState(prev => ({ 
        ...prev, 
        error: error.message,
        isLoading: false 
      }));
      
      toast({
        title: "Erro",
        description: "Falha ao criar sessão de Battle Royale",
        variant: "destructive"
      });
      
      return null;
    }
  }, [profile, toast]);

  // Join existing session
  const joinSession = useCallback(async (sessionId: string, teamName?: string) => {
    if (!profile) return false;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.functions.invoke('battle-royale-manager', {
        body: {
          action: 'join_session',
          session_id: sessionId,
          user_id: profile.id,
          team_name: teamName
        }
      });

      if (error) throw error;

      setState(prev => ({ 
        ...prev, 
        myParticipant: data.participant,
        isLoading: false
      }));

      toast({
        title: "Entrou na Batalha!",
        description: "Aguardando outros jogadores...",
      });

      // Subscribe to session updates
      subscribeToSession(sessionId);

      return true;
    } catch (error: any) {
      console.error('Error joining session:', error);
      setState(prev => ({ 
        ...prev, 
        error: error.message,
        isLoading: false 
      }));
      
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
      
      return false;
    }
  }, [profile, toast]);

  // Submit answer for current question
  const submitAnswer = useCallback(async (selectedAnswer: string, responseTime: number) => {
    if (!state.session || !state.myParticipant || !state.currentQuestion) return;

    try {
      const { data, error } = await supabase.functions.invoke('battle-royale-manager', {
        body: {
          action: 'submit_answer',
          session_id: state.session.id,
          participant_id: state.myParticipant.id,
          round_number: state.session.current_round,
          question_id: state.currentQuestion.id,
          selected_answer: selectedAnswer,
          response_time_ms: responseTime
        }
      });

      if (error) throw error;

      setState(prev => ({ 
        ...prev, 
        lastAnswerResult: data,
        gamePhase: 'results'
      }));

      // Update my participant score locally
      if (data.is_correct && state.myParticipant) {
        setState(prev => ({
          ...prev,
          myParticipant: prev.myParticipant ? {
            ...prev.myParticipant,
            total_score: prev.myParticipant.total_score + data.points_earned,
            correct_answers: prev.myParticipant.correct_answers + 1
          } : null
        }));
      }

      return data;
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      toast({
        title: "Erro",
        description: "Falha ao enviar resposta",
        variant: "destructive"
      });
    }
  }, [state.session, state.myParticipant, state.currentQuestion, toast]);

  // Subscribe to real-time session updates
  const subscribeToSession = useCallback((sessionId: string) => {
    console.log('Subscribing to session:', sessionId);

    // Subscribe to session updates
    const sessionChannel = supabase
      .channel(`battle_session_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'battle_royale_sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          console.log('Session update:', payload);
          if (payload.new) {
            setState(prev => ({ 
              ...prev, 
              session: payload.new as BattleRoyaleSession 
            }));
            
            // Handle phase changes
            const newSession = payload.new as BattleRoyaleSession;
            if (newSession.status === 'active' && state.gamePhase === 'lobby') {
              setState(prev => ({ ...prev, gamePhase: 'countdown' }));
              
              // Show first question after countdown
              setTimeout(() => {
                if (newSession.questions && newSession.questions.length > 0) {
                  setState(prev => ({ 
                    ...prev, 
                    currentQuestion: newSession.questions![0],
                    gamePhase: 'question',
                    timeRemaining: 30
                  }));
                }
              }, 3000);
            }
          }
        }
      )
      .subscribe();

    // Subscribe to participants updates
    const participantsChannel = supabase
      .channel(`battle_participants_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'battle_royale_participants',
          filter: `session_id=eq.${sessionId}`
        },
        async (payload) => {
          console.log('Participants update:', payload);
          // Refresh participants list
          await loadParticipants(sessionId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [state.gamePhase]);

  // Load current participants
  const loadParticipants = useCallback(async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('battle_royale_participants')
        .select(`
          *,
          profiles:user_id (
            nickname,
            current_avatar_id
          )
        `)
        .eq('session_id', sessionId)
        .order('total_score', { ascending: false });

      if (error) throw error;

      setState(prev => ({ 
        ...prev, 
        participants: data as BattleRoyaleParticipant[]
      }));
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  }, []);

  // Load available sessions
  const loadAvailableSessions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('battle_royale_sessions')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as BattleRoyaleSession[];
    } catch (error) {
      console.error('Error loading sessions:', error);
      return [];
    }
  }, []);

  // Timer effect for question countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.gamePhase === 'question' && state.timeRemaining > 0) {
      interval = setInterval(() => {
        setState(prev => {
          const newTime = prev.timeRemaining - 1;
          
          // Auto-submit when time runs out
          if (newTime <= 0 && prev.currentQuestion && prev.myParticipant) {
            submitAnswer('', 30000); // Submit empty answer with max time
            return { ...prev, timeRemaining: 0, gamePhase: 'results' };
          }
          
          return { ...prev, timeRemaining: newTime };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.gamePhase, state.timeRemaining, submitAnswer]);

  return {
    ...state,
    createSession,
    joinSession,
    submitAnswer,
    loadAvailableSessions,
    loadParticipants
  };
}