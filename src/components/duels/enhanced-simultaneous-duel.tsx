import { useReducer, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Progress } from "@/components/shared/ui/progress";
import { Trophy, Zap, ArrowRight, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { CircularTimer } from "./circular-timer";
import { EnhancedDuelInterface } from "./enhanced-duel-interface";
import { motion } from "framer-motion";
import { IconSystem } from "@/components/icons/icon-system";

interface EnhancedSimultaneousDuelProps {
  duel?: any;
  onDuelEnd?: (result: { 
    winner: boolean, 
    score: number, 
    opponentScore: number,
    playerAnswers?: any[],
    questions?: any[]
  }) => void;
}

// Consolidated state interface
interface DuelState {
  duel: any;
  loading: {
    duel: boolean;
    profiles: boolean;
  };
  game: {
    currentQuestion: number;
    selectedAnswer: string | null;
    answeredQuestions: Set<number>;
    answerResults: Map<number, { answerId: string; isCorrect: boolean }>;
    phase: 'playing' | 'finished';
    isTimerActive: boolean;
    showResult: boolean;
  };
  players: {
    current: any;
    player1: any;
    player2: any;
  };
  scores: {
    my: number;
    opponent: number;
    opponentProgress: number;
  };
}

// Action types for reducer
type DuelAction =
  | { type: 'SET_DUEL'; payload: any }
  | { type: 'SET_DUEL_LOADING'; payload: boolean }
  | { type: 'SET_PROFILES_LOADING'; payload: boolean }
  | { type: 'SET_CURRENT_QUESTION'; payload: number }
  | { type: 'SET_SELECTED_ANSWER'; payload: string | null }
  | { type: 'ADD_ANSWERED_QUESTION'; payload: number }
  | { type: 'SET_ANSWER_RESULT'; payload: { question: number; result: { answerId: string; isCorrect: boolean } } }
  | { type: 'SET_GAME_PHASE'; payload: 'playing' | 'finished' }
  | { type: 'SET_TIMER_ACTIVE'; payload: boolean }
  | { type: 'SET_SHOW_RESULT'; payload: boolean }
  | { type: 'SET_CURRENT_PROFILE'; payload: any }
  | { type: 'SET_PLAYER1_PROFILE'; payload: any }
  | { type: 'SET_PLAYER2_PROFILE'; payload: any }
  | { type: 'SET_MY_SCORE'; payload: number }
  | { type: 'SET_OPPONENT_SCORE'; payload: number }
  | { type: 'SET_OPPONENT_PROGRESS'; payload: number }
  | { type: 'RESET_QUESTION_STATE' };

// Initial state
const initialState: DuelState = {
  duel: null,
  loading: {
    duel: true,
    profiles: false,
  },
  game: {
    currentQuestion: 1,
    selectedAnswer: null,
    answeredQuestions: new Set(),
    answerResults: new Map(),
    phase: 'playing',
    isTimerActive: false,
    showResult: false,
  },
  players: {
    current: null,
    player1: null,
    player2: null,
  },
  scores: {
    my: 0,
    opponent: 0,
    opponentProgress: 0,
  },
};

// Reducer function
function duelReducer(state: DuelState, action: DuelAction): DuelState {
  switch (action.type) {
    case 'SET_DUEL':
      return {
        ...state,
        duel: action.payload,
        loading: { ...state.loading, duel: false },
      };
    case 'SET_DUEL_LOADING':
      return {
        ...state,
        loading: { ...state.loading, duel: action.payload },
      };
    case 'SET_PROFILES_LOADING':
      return {
        ...state,
        loading: { ...state.loading, profiles: action.payload },
      };
    case 'SET_CURRENT_QUESTION':
      return {
        ...state,
        game: { ...state.game, currentQuestion: action.payload },
      };
    case 'SET_SELECTED_ANSWER':
      return {
        ...state,
        game: { ...state.game, selectedAnswer: action.payload },
      };
    case 'ADD_ANSWERED_QUESTION':
      return {
        ...state,
        game: {
          ...state.game,
          answeredQuestions: new Set([...state.game.answeredQuestions, action.payload]),
        },
      };
    case 'SET_ANSWER_RESULT':
      return {
        ...state,
        game: {
          ...state.game,
          answerResults: new Map([...state.game.answerResults, [action.payload.question, action.payload.result]]),
        },
      };
    case 'SET_GAME_PHASE':
      return {
        ...state,
        game: { ...state.game, phase: action.payload },
      };
    case 'SET_TIMER_ACTIVE':
      return {
        ...state,
        game: { ...state.game, isTimerActive: action.payload },
      };
    case 'SET_SHOW_RESULT':
      return {
        ...state,
        game: { ...state.game, showResult: action.payload },
      };
    case 'SET_CURRENT_PROFILE':
      return {
        ...state,
        players: { ...state.players, current: action.payload },
      };
    case 'SET_PLAYER1_PROFILE':
      return {
        ...state,
        players: { ...state.players, player1: action.payload },
      };
    case 'SET_PLAYER2_PROFILE':
      return {
        ...state,
        players: { ...state.players, player2: action.payload },
      };
    case 'SET_MY_SCORE':
      return {
        ...state,
        scores: { ...state.scores, my: action.payload },
      };
    case 'SET_OPPONENT_SCORE':
      return {
        ...state,
        scores: { ...state.scores, opponent: action.payload },
      };
    case 'SET_OPPONENT_PROGRESS':
      return {
        ...state,
        scores: { ...state.scores, opponentProgress: action.payload },
      };
    case 'RESET_QUESTION_STATE':
      return {
        ...state,
        game: {
          ...state.game,
          selectedAnswer: null,
          isTimerActive: true,
        },
      };
    default:
      return state;
  }
}

const EnhancedSimultaneousDuel = memo(({ duel: propDuel, onDuelEnd }: EnhancedSimultaneousDuelProps) => {
  const { duelId: paramDuelId } = useParams();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(duelReducer, {
    ...initialState,
    duel: propDuel,
    loading: { ...initialState.loading, duel: !propDuel },
  });
  const subscriptionRef = useRef<any>(null);
  const playerAnswersRef = useRef<any[]>([]);
  const { toast } = useToast();

  // Memoized computed values
  const currentDuel = useMemo(() => state.duel, [state.duel]);
  const isLoading = useMemo(() => state.loading.duel || state.loading.profiles, [state.loading]);
  const isFinished = useMemo(() => state.game.phase === 'finished', [state.game.phase]);
  const currentQuestion = useMemo(() => state.game.currentQuestion, [state.game.currentQuestion]);
  const selectedAnswer = useMemo(() => state.game.selectedAnswer, [state.game.selectedAnswer]);
  const answeredQuestions = useMemo(() => state.game.answeredQuestions, [state.game.answeredQuestions]);
  const answerResults = useMemo(() => state.game.answerResults, [state.game.answerResults]);
  const isTimerActive = useMemo(() => state.game.isTimerActive, [state.game.isTimerActive]);
  const showResult = useMemo(() => state.game.showResult, [state.game.showResult]);
  const gamePhase = useMemo(() => state.game.phase, [state.game.phase]);
  const currentProfile = useMemo(() => state.players.current, [state.players.current]);
  const player1Profile = useMemo(() => state.players.player1, [state.players.player1]);
  const player2Profile = useMemo(() => state.players.player2, [state.players.player2]);
  const myScore = useMemo(() => state.scores.my, [state.scores.my]);
  const opponentScore = useMemo(() => state.scores.opponent, [state.scores.opponent]);
  const opponentProgress = useMemo(() => state.scores.opponentProgress, [state.scores.opponentProgress]);

  const loadDuelData = useCallback(async (duelId: string) => {
    try {
      const { data: duelData, error } = await supabase
        .from('duels')
        .select(`
          *,
          player1:profiles!duels_player1_id_fkey(
            id, nickname, level, xp,
            avatars(name, image_url)
          ),
          player2:profiles!duels_player2_id_fkey(
            id, nickname, level, xp,
            avatars(name, image_url)
          )
        `)
        .eq('id', duelId)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error loading duel data:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o duelo",
          variant: "destructive"
        });
        navigate('/duels');
        return;
      }

      if (duelData) {
        const formattedDuel = {
          ...duelData,
          questions: Array.isArray(duelData.questions) ? 
            duelData.questions : 
            JSON.parse(duelData.questions as string)
        };
        dispatch({ type: 'SET_DUEL', payload: formattedDuel });
      }
    } catch (error) {
      console.error('Error in loadDuelData:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do duelo",
        variant: "destructive"
      });
      navigate('/duels');
    }
  }, [toast, navigate]);

  const setupRealtimeSubscription = useCallback(() => {
    if (!currentDuel?.id) return;
    
    subscriptionRef.current = supabase
      .channel('duel-progress')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'duels',
          filter: `id=eq.${currentDuel.id}`
        },
        handleDuelUpdate
      )
      .subscribe();
  }, [currentDuel?.id]);

  const handleDuelUpdate = useCallback((payload: any) => {
    const updatedDuel = payload.new;
    
    if (updatedDuel.status === 'finished') {
      handleDuelFinished(updatedDuel);
    } else {
      updateOpponentProgress(updatedDuel);
    }
  }, []);

  const handleDuelFinished = useCallback((updatedDuel: any) => {
    dispatch({ type: 'SET_GAME_PHASE', payload: 'finished' });
    dispatch({ type: 'SET_TIMER_ACTIVE', payload: false });
    
    const isWinner = updatedDuel.winner_id === currentProfile?.id;
    const finalMyScore = currentProfile?.id === updatedDuel.player1_id ? 
      updatedDuel.player1_score : updatedDuel.player2_score;
    const finalOpponentScore = currentProfile?.id === updatedDuel.player1_id ? 
      updatedDuel.player2_score : updatedDuel.player1_score;
    
    dispatch({ type: 'SET_MY_SCORE', payload: finalMyScore || 0 });
    dispatch({ type: 'SET_OPPONENT_SCORE', payload: finalOpponentScore || 0 });
    dispatch({ type: 'SET_SHOW_RESULT', payload: true });
    
    // Show final result and navigate back
    setTimeout(() => {
      if (onDuelEnd) {
        onDuelEnd({
          winner: isWinner,
          score: finalMyScore || 0,
          opponentScore: finalOpponentScore || 0,
          playerAnswers: playerAnswersRef.current,
          questions: currentDuel?.questions || []
        });
      } else {
        navigate('/duels');
      }
    }, 3000);
  }, [currentProfile, currentDuel, onDuelEnd, navigate]);

  const updateOpponentProgress = useCallback((updatedDuel: any) => {
    if (!currentProfile) return;
    
    const isPlayer1 = currentProfile.id === updatedDuel.player1_id;
    const opponentCurrentQuestion = isPlayer1 ? 
      updatedDuel.player2_current_question : updatedDuel.player1_current_question;
    const opponentCurrentScore = isPlayer1 ? 
      updatedDuel.player2_score : updatedDuel.player1_score;
    
    dispatch({ type: 'SET_OPPONENT_PROGRESS', payload: opponentCurrentQuestion - 1 });
    dispatch({ type: 'SET_OPPONENT_SCORE', payload: opponentCurrentScore || 0 });
    
    // Update my score if it changed
    const myCurrentScore = isPlayer1 ? 
      updatedDuel.player1_score : updatedDuel.player2_score;
    dispatch({ type: 'SET_MY_SCORE', payload: myCurrentScore || 0 });
  }, [currentProfile]);

  const loadProfiles = useCallback(async () => {
    if (!currentDuel) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: player1 } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentDuel.player1_id)
        .single();

      const { data: player2 } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentDuel.player2_id)
        .single();

      dispatch({ type: 'SET_CURRENT_PROFILE', payload: currentUserProfile });
      dispatch({ type: 'SET_PLAYER1_PROFILE', payload: player1 });
      dispatch({ type: 'SET_PLAYER2_PROFILE', payload: player2 });
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  }, [currentDuel]);

  const handleAnswer = useCallback(async (optionId: string) => {
    if (answeredQuestions.has(currentQuestion) || gamePhase !== 'playing') return;
    
    dispatch({ type: 'SET_SELECTED_ANSWER', payload: optionId });
    dispatch({ type: 'SET_TIMER_ACTIVE', payload: false });
    
    try {
      const { data, error } = await supabase.rpc('process_duel_answer', {
        p_duel_id: currentDuel.id,
        p_player_id: currentProfile.id,
        p_question_number: currentQuestion,
        p_answer_id: optionId,
        p_is_timeout: false
      });

      if (error) throw error;

      const result = data as any;
      if (result.success) {
        // Store result for visual feedback
        dispatch({ 
          type: 'SET_ANSWER_RESULT', 
          payload: { 
            question: currentQuestion, 
            result: { answerId: optionId, isCorrect: result.isCorrect }
          }
        });
        
        dispatch({ type: 'ADD_ANSWERED_QUESTION', payload: currentQuestion });
        dispatch({ type: 'SET_MY_SCORE', payload: result.newScore });
        
        // Avançar imediatamente - sistema simultâneo
        setTimeout(() => {
          if (currentQuestion < currentDuel.questions.length) {
            dispatch({ type: 'SET_CURRENT_QUESTION', payload: currentQuestion + 1 });
            dispatch({ type: 'RESET_QUESTION_STATE' });
          } else {
            dispatch({ type: 'SET_GAME_PHASE', payload: 'finished' });
            dispatch({ type: 'SET_SHOW_RESULT', payload: true });
          }
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: "❌ Erro ao enviar resposta",
        description: "Tente novamente",
        variant: "destructive"
      });
    }
  }, [answeredQuestions, currentQuestion, gamePhase, currentDuel, currentProfile, toast]);

  const handleAnswerSelect = useCallback((answerId: string) => {
    if (answeredQuestions.has(currentQuestion) || isFinished) return;
    dispatch({ type: 'SET_SELECTED_ANSWER', payload: answerId });
  }, [answeredQuestions, currentQuestion, isFinished]);

  const handleAnswerSubmit = useCallback(() => {
    if (!selectedAnswer || answeredQuestions.has(currentQuestion)) return;
    handleAnswer(selectedAnswer);
  }, [selectedAnswer, answeredQuestions, currentQuestion, handleAnswer]);

  const handleSkipQuestion = useCallback(async () => {
    if (answeredQuestions.has(currentQuestion) || isFinished) return;
    
    try {
      const { data, error } = await supabase.rpc('process_duel_answer', {
        p_duel_id: currentDuel.id,
        p_player_id: currentProfile.id,
        p_question_number: currentQuestion,
        p_answer_id: null,
        p_is_timeout: true
      });

      if (error) throw error;

      const result = data as any;
      if (result.success) {
        dispatch({ type: 'ADD_ANSWERED_QUESTION', payload: currentQuestion });
        dispatch({ type: 'SET_MY_SCORE', payload: result.newScore });
        
        toast({
          title: "⏭️ Pergunta pulada",
          description: "Você pode pular até 2 perguntas por duelo",
          variant: "default"
        });
        
        // Auto advance after skip
        setTimeout(() => {
          if (currentQuestion < currentDuel.questions.length) {
            dispatch({ type: 'SET_CURRENT_QUESTION', payload: currentQuestion + 1 });
            dispatch({ type: 'RESET_QUESTION_STATE' });
          } else {
            dispatch({ type: 'SET_GAME_PHASE', payload: 'finished' });
            dispatch({ type: 'SET_SHOW_RESULT', payload: true });
          }
        }, 1000);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível pular a pergunta",
        variant: "destructive"
      });
    }
  }, [answeredQuestions, currentQuestion, isFinished, currentDuel, currentProfile, toast]);

  const handleTimeUp = useCallback(async () => {
    // Guard: Check if user is still on duel screen
    if (!window.location.pathname.includes('/duels') && !window.location.pathname.includes('/duel/')) {
      return;
    }
    
    if (answeredQuestions.has(currentQuestion)) return;
    
    try {
      const { data, error } = await supabase.rpc('process_duel_answer', {
        p_duel_id: currentDuel.id,
        p_player_id: currentProfile.id,
        p_question_number: currentQuestion,
        p_answer_id: null,
        p_is_timeout: true
      });

      if (error) throw error;

      const result = data as any;
      if (result.success) {
        dispatch({ type: 'ADD_ANSWERED_QUESTION', payload: currentQuestion });
        dispatch({ type: 'SET_MY_SCORE', payload: result.newScore });
        
        toast({
          title: "⏰ Tempo esgotado!",
          description: "Pergunta marcada como incorreta",
          variant: "destructive"
        });
        
        // Auto advance after timeout
        setTimeout(() => {
          if (currentQuestion < currentDuel.questions.length) {
            dispatch({ type: 'SET_CURRENT_QUESTION', payload: currentQuestion + 1 });
            dispatch({ type: 'SET_TIMER_ACTIVE', payload: true });
          } else {
            dispatch({ type: 'SET_GAME_PHASE', payload: 'finished' });
            dispatch({ type: 'SET_SHOW_RESULT', payload: true });
          }
        }, 1500);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível processar o timeout",
        variant: "destructive"
      });
    }
  }, [answeredQuestions, currentQuestion, currentDuel, currentProfile, toast]);

  const handleSurrender = useCallback(async () => {
    if (isFinished) return;
    
    try {
      const { data, error } = await supabase.rpc('process_duel_answer', {
        p_duel_id: currentDuel.id,
        p_player_id: currentProfile.id,
        p_question_number: currentQuestion,
        p_answer_id: null,
        p_is_timeout: true
      });

      if (error) throw error;

      toast({
        title: "🏳️ Duelo encerrado",
        description: "Você entregou os pontos ao oponente",
        variant: "destructive"
      });
      
      dispatch({ type: 'SET_GAME_PHASE', payload: 'finished' });
      dispatch({ type: 'SET_SHOW_RESULT', payload: true });
      dispatch({ type: 'SET_OPPONENT_SCORE', payload: currentDuel.questions.length * 100 });
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível processar a desistência",
        variant: "destructive"
      });
    }
  }, [isFinished, currentDuel, currentProfile, currentQuestion, toast]);

  useEffect(() => {
    if (!propDuel && paramDuelId) {
      loadDuelData(paramDuelId);
    }
  }, [paramDuelId, propDuel, loadDuelData]);

  useEffect(() => {
    if (currentDuel) {
      loadProfiles();
      setupRealtimeSubscription();
    }
    
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [currentDuel, loadProfiles, setupRealtimeSubscription]);

  useEffect(() => {
    // Start timer for current question if not answered
    if (!answeredQuestions.has(currentQuestion) && !isFinished) {
      dispatch({ type: 'SET_TIMER_ACTIVE', payload: true });
    } else {
      dispatch({ type: 'SET_TIMER_ACTIVE', payload: false });
    }
  }, [currentQuestion, answeredQuestions, isFinished]);

  if (isLoading || !currentDuel || !currentDuel.questions || !Array.isArray(currentDuel.questions) || currentDuel.questions.length === 0 || !currentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Carregando duelo...</p>
        </div>
      </div>
    );
  }

  // Show enhanced interface during gameplay
  if (gamePhase === 'playing' && currentDuel.questions && currentProfile) {
    return (
      <EnhancedDuelInterface
        questions={currentDuel.questions}
        currentQuestion={currentQuestion}
        onAnswer={handleAnswer}
        playerAvatar={currentProfile?.avatars}
        opponentAvatar={(currentProfile?.id === currentDuel.player1_id ? player2Profile : player1Profile)?.avatars}
        playerScore={myScore}
        opponentScore={opponentScore}
        playerNickname={currentProfile?.nickname || 'Você'}
        opponentNickname={(currentProfile?.id === currentDuel.player1_id ? player2Profile : player1Profile)?.nickname || 'Oponente'}
        isWaitingForOpponent={false}
      />
    );
  }

  const question = currentDuel?.questions?.[currentQuestion - 1];
  const progress = currentDuel?.questions?.length ? (currentQuestion / currentDuel.questions.length) * 100 : 0;
  const isQuestionAnswered = answeredQuestions.has(currentQuestion);
  const answerResult = answerResults.get(currentQuestion);

  if (!question || !question.options || !Array.isArray(question.options) || question.options.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Carregando pergunta...</p>
        </div>
      </div>
    );
  }
  
  const getAnswerButtonClass = (optionId: string) => {
    if (!isQuestionAnswered) {
      return selectedAnswer === optionId ? 
        "border-primary bg-primary/20 text-primary scale-105" : 
        "hover:bg-muted/50 hover:scale-102";
    }
    
    if (answerResult?.answerId === optionId) {
      return answerResult.isCorrect ? 
        "bg-green-500/20 text-green-400 border-green-500 scale-105" : 
        "bg-red-500/20 text-red-400 border-red-500 scale-105";
    }
    
    // Show correct answer
    const correctOption = question?.options?.find((opt: any) => opt.isCorrect);
    if (correctOption?.id === optionId) {
      return "bg-green-500/20 text-green-400 border-green-500";
    }
    
    return "opacity-50";
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 360 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <Trophy className="h-24 w-24 mx-auto text-primary mb-4" />
          </motion.div>
          
          <h1 className="text-4xl font-bold">
            <span className="flex items-center gap-2">
              {myScore > opponentScore ? (
                <>
                  <IconSystem emoji="🎉" size="lg" animated variant="glow" />
                  Vitória!
                </>
              ) : myScore < opponentScore ? (
                <>
                  <IconSystem emoji="😔" size="lg" />
                  Derrota
                </>
              ) : (
                "🤝 Empate!"
              )}
            </span>
          </h1>
          
          <div className="text-6xl font-bold">
            {myScore} x {opponentScore}
          </div>
          
          <p className="text-muted-foreground">
            Retornando à arena de duelos...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header com Jogadores */}
        <Card className="mb-4 sm:mb-6 border-primary/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Trophy className="h-6 w-6 text-primary" />
                <span>Duelo Simultâneo</span>
              </div>
              <Badge variant="secondary" className="animate-pulse">
                {currentQuestion} / {currentDuel?.questions?.length || 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4">
              {/* Meu Perfil */}
              <motion.div 
                className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20"
                whileHover={{ scale: 1.02 }}
              >
                <AvatarDisplayUniversal
                  avatarName={currentProfile?.avatar_name}
                  avatarUrl={currentProfile?.avatar_url}
                  profileImageUrl={currentProfile?.profile_image_url}
                  nickname={currentProfile?.nickname || "Você"}
                  size="sm"
                />
                <div className="flex-1">
                  <div className="font-semibold text-primary">
                    {currentProfile?.nickname || "Você"}
                  </div>
                  <motion.div 
                    key={myScore}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-xl sm:text-2xl font-bold text-primary"
                  >
                    {myScore}
                  </motion.div>
                  <div className="text-xs text-muted-foreground">
                    Pergunta {currentQuestion}
                  </div>
                </div>
              </motion.div>

              {/* Oponente */}
              <motion.div 
                className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-muted"
                whileHover={{ scale: 1.02 }}
              >
                <AvatarDisplayUniversal
                  avatarName={
                    (currentProfile?.id === currentDuel.player1_id ? player2Profile : player1Profile)?.avatar_name
                  }
                  avatarUrl={
                    (currentProfile?.id === currentDuel.player1_id ? player2Profile : player1Profile)?.avatar_url
                  }
                  profileImageUrl={
                    (currentProfile?.id === currentDuel.player1_id ? player2Profile : player1Profile)?.profile_image_url
                  }
                  nickname={
                    (currentProfile?.id === currentDuel.player1_id ? player2Profile : player1Profile)?.nickname || "Oponente"
                  }
                  size="sm"
                />
                <div className="flex-1">
                  <div className="font-semibold">
                    {(currentProfile?.id === currentDuel.player1_id ? player2Profile : player1Profile)?.nickname || "Oponente"}
                  </div>
                  <motion.div 
                    key={opponentScore}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-xl sm:text-2xl font-bold text-secondary"
                  >
                    {opponentScore}
                  </motion.div>
                  <div className="text-xs text-muted-foreground">
                    Pergunta {opponentProgress + 1}
                  </div>
                </div>
              </motion.div>
            </div>
            
            <Progress value={progress} className="mb-2" />
          </CardContent>
        </Card>

        {/* Timer Central */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <CircularTimer
            duration={30}
            isActive={isTimerActive}
            onTimeUp={handleTimeUp}
            enableCountdownSound={false}
            size={window.innerWidth < 640 ? 80 : 120}
            className="shadow-lg"
          />
        </div>

        {/* Pergunta */}
        <Card className="mb-4 sm:mb-6 border-primary/20 shadow-lg max-w-2xl mx-auto">
          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg text-center leading-relaxed">{question?.question}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid gap-2 mb-4">
              {question?.options?.map((option: any) => (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: isQuestionAnswered ? 1 : 1.02 }}
                  whileTap={{ scale: isQuestionAnswered ? 1 : 0.98 }}
                >
                  <Button
                    variant="outline"
                    className={`justify-start h-auto p-3 sm:p-3 text-left transition-all duration-300 w-full text-sm min-h-[48px] ${getAnswerButtonClass(option.id)}`}
                    onClick={() => handleAnswerSelect(option.id)}
                    disabled={isQuestionAnswered}
                  >
                    <span className="mr-2 font-mono text-xs">
                      {option.id.toUpperCase()}
                    </span>
                    <span className="flex-1">{option.text}</span>
                    {answerResult?.answerId === option.id && (
                      <span className="ml-2">
                        {answerResult.isCorrect ? "✓" : "✗"}
                      </span>
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
            
            {/* Botões de Ação */}
            {!isQuestionAnswered && !isFinished && (
              <div className="flex flex-col sm:flex-row gap-2 justify-center px-0 sm:px-0">
                <Button
                  onClick={handleAnswerSubmit}
                  disabled={!selectedAnswer}
                  className="flex-1 bg-primary hover:bg-primary/80 h-12 sm:h-auto"
                  size="sm"
                >
                  <Zap className="mr-2 h-3 w-3" />
                  Confirmar Resposta
                </Button>
                
                <Button
                  onClick={handleSurrender}
                  variant="destructive"
                  className="flex-1 sm:flex-none h-12 sm:h-auto px-6"
                  size="sm"
                >
                  <Flag className="mr-2 h-3 w-3" />
                  Entregar os pontos
                </Button>
                
                <Button
                  onClick={handleSkipQuestion}
                  variant="outline"
                  className="border-muted-foreground/30 hover:bg-muted/50 px-3 h-12 sm:h-auto"
                  size="sm"
                >
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            )}

            {isQuestionAnswered && (
              <div className="text-center text-muted-foreground">
                <Zap className="h-4 w-4 mx-auto mb-2 animate-pulse" />
                <p className="text-xs">Próxima pergunta em instantes...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export default EnhancedSimultaneousDuel;