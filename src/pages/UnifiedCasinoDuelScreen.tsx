import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDuelAdaptiveEngine } from '@/hooks/use-duel-adaptive-engine';
import { UnifiedDuelInterface } from '@/components/duels/unified-duel-interface';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/shared/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { useSensoryFeedback } from '@/hooks/use-sensory-feedback';
import { useRewardAnimationSystem } from '@/hooks/use-reward-animation-system';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarDisplayUniversal } from '@/components/shared/avatar-display-universal';
import { resolveAvatarImage } from '@/lib/avatar-utils';
import { DuelVictoryModal } from '@/components/duels/DuelVictoryModal';

export default function UnifiedCasinoDuelScreen() {
  const { duelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Feedback systems
  const sensoryFeedback = useSensoryFeedback();
  const rewardSystem = useRewardAnimationSystem();
  
  // State management
  const [currentDuel, setCurrentDuel] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [responseStartTime, setResponseStartTime] = useState<number>(Date.now());
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [gameResult, setGameResult] = useState<{ playerWon: boolean; isDraw: boolean } | null>(null);

  // Check if this is a test duel ID
  const isTestDuel = duelId?.startsWith('test-') || duelId === 'test-123';

  // Mock data for test duels
  const createMockDuelData = () => ({
    id: duelId,
    status: 'active',
    topic: 'financas',
    bet_amount: 100,
    player1_score: 0,
    player2_score: 0,
    current_question: 0,
    created_at: new Date().toISOString(),
    questions: [],
    player1_id: 'test-player1-id',
    player2_id: 'test-player2-id',
    player1: {
      id: 'test-player1-id',
      nickname: 'Você',
      level: 5,
      profile_image_url: '/avatars/the-satoshi.jpg',
      current_avatar_id: null,
      avatars: null
    },
    player2: {
      id: 'test-player2-id', 
      nickname: 'Bot Teste',
      level: 3,
      profile_image_url: '/avatars/bitcoin-wizard.jpg',
      current_avatar_id: null,
      avatars: null
    }
  });

  // Load duel data
  const { data: duelData, isLoading: duelLoading } = useQuery({
    queryKey: ['casino-duel', duelId],
    queryFn: async () => {
      if (!duelId) return null;
      
      // Return mock data for test duels
      if (isTestDuel) {
        console.log('🧪 [UNIFIED DUEL] Using mock data for test duel:', duelId);
        return createMockDuelData();
      }
      
      // Fetch real data for actual duels
      const { data, error } = await supabase
        .from('casino_duels')
        .select(`
          *,
          player1:profiles!casino_duels_player1_id_fkey (
            id, nickname, level, profile_image_url, current_avatar_id,
            avatars:avatars!current_avatar_id (name, image_url)
          ),
          player2:profiles!casino_duels_player2_id_fkey (
            id, nickname, level, profile_image_url, current_avatar_id,
            avatars:avatars!current_avatar_id (name, image_url)
          )
        `)
        .eq('id', duelId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!duelId
  });

  // Initialize duel adaptive engine once we have duel data
  const duelEngine = useDuelAdaptiveEngine({
    topic: duelData?.topic || 'financas',
    questionsCount: 5,
    difficulty: 'medium'
  });

  // Load questions when duel data is available
  useEffect(() => {
    if (duelData && !duelEngine.session) {
      console.log('🚀 [UNIFIED DUEL] Inicializando engine com dados:', {
        topic: duelData.topic,
        questionsInDB: Array.isArray(duelData.questions) ? duelData.questions.length : 0
      });
      
      duelEngine.initializeDuelSession();
    }
  }, [duelData, duelEngine.session]);

  // Set current duel
  useEffect(() => {
    if (duelData) {
      setCurrentDuel(duelData);
      setPlayerScore(duelData.player1_score || 0);
      setOpponentScore(duelData.player2_score || 0);
    }
  }, [duelData]);

  // Reset response time when question changes
  useEffect(() => {
    setResponseStartTime(Date.now());
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para participar de duelos",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (!duelId) {
      toast({
        title: "Erro",
        description: "ID do duelo não encontrado",
        variant: "destructive"
      });
      navigate('/duels');
      return;
    }
  }, [user, duelId, navigate, toast]);

  const handleTimeUp = async () => {
    if (isSubmitting || showResult) return;
    
    // Time's up - submit empty answer (automatically incorrect)
    sensoryFeedback.triggerError();
    rewardSystem.showIncorrectAnswer('Tempo Esgotado!');
    
    await handleAnswer('');
  };

  const handleAnswer = async (selectedText: string) => {
    if (!currentDuel || !duelEngine.currentQuestion || isSubmitting) return;
    
    console.log('🔥 [UNIFIED DUEL] Processando resposta:', {
      selectedText,
      currentQuestion: duelEngine.currentQuestion,
      correctAnswer: duelEngine.currentQuestion.correct_answer
    });
    
    setIsSubmitting(true);
    setSelectedAnswer(selectedText);
    
    const responseTime = Date.now() - responseStartTime;
    
    try {
      // Trigger immediate feedback
      sensoryFeedback.triggerClick(document.body);
      
      // Process answer locally first (for immediate feedback)
      const result = duelEngine.processAnswer(selectedText, responseTime);
      const answerCorrect = result?.isCorrect || false;
      
      // For test duels, skip edge function and use local result
      if (isTestDuel) {
        console.log('🧪 [UNIFIED DUEL] Simulando resposta para duelo teste:', {
          selectedText,
          answerCorrect,
          localResult: result
        });
        
        // Store correctness for visual feedback
        setIsCorrect(answerCorrect);
        
        // Update local score for test
        if (answerCorrect) {
          setPlayerScore(prev => prev + 1);
        }
        
        // Trigger feedback based on correctness
        if (answerCorrect) {
          sensoryFeedback.triggerSuccess({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
          rewardSystem.showCorrectAnswer({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        } else {
          sensoryFeedback.triggerError();
          rewardSystem.showIncorrectAnswer('Resposta Incorreta');
        }
        
        setShowResult(true);
        
        // Wait a moment to show result, then move to next question
        setTimeout(() => {
          setShowResult(false);
          setSelectedAnswer(null);
          setResponseStartTime(Date.now());
          
          // Move to next question using the unified engine
          const hasMoreQuestions = duelEngine.nextQuestion();
          
          if (hasMoreQuestions) {
            setCurrentQuestionIndex(prev => prev + 1);
          } else {
            // Duel completed
            handleDuelComplete();
          }
          setIsSubmitting(false);
        }, 2000);
        
        return;
      }
      
      console.log('🔍 [UNIFIED DUEL] Submitting to edge function:', {
        duelId: currentDuel.id,
        userId: user?.id,
        questionIndex: currentQuestionIndex - 1,
        selectedAnswer: selectedText,
        responseTime
      });

      // Submit to edge function (simplified validation)
      const { data, error } = await supabase.functions.invoke('process-duel-answer', {
        body: {
          duelId: currentDuel.id,
          userId: user?.id,
          questionIndex: currentQuestionIndex - 1,
          selectedAnswer: selectedText,
          responseTime
        }
      });

      if (error) throw error;

      const serverCorrect = data?.isCorrect || false;
      const newScore = data?.newScore || 0;

      // Store correctness for visual feedback
      setIsCorrect(serverCorrect);

      // Update local score
      const isPlayer1 = currentDuel.player1?.id === user?.id;
      if (isPlayer1) {
        setPlayerScore(newScore);
      } else {
        setOpponentScore(newScore);
      }

      // Trigger feedback based on correctness
      if (serverCorrect) {
        sensoryFeedback.triggerSuccess({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        rewardSystem.showCorrectAnswer({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      } else {
        sensoryFeedback.triggerError();
        rewardSystem.showIncorrectAnswer('Resposta Incorreta');
      }

      setShowResult(true);
      
      // Wait a moment to show result, then move to next question
      setTimeout(() => {
        setShowResult(false);
        setSelectedAnswer(null);
        setResponseStartTime(Date.now());
        
        // Move to next question using the unified engine
        const hasMoreQuestions = duelEngine.nextQuestion();
        
        if (hasMoreQuestions) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          // Duel completed
          handleDuelComplete();
        }
        setIsSubmitting(false);
      }, 2000);
      
    } catch (error) {
      console.error('❌ [UNIFIED DUEL] Erro ao enviar resposta:', error);
      sensoryFeedback.triggerError();
      toast({
        title: "Erro",
        description: "Erro ao enviar resposta. Tente novamente.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleDuelComplete = async () => {
    try {
      console.log('🏁 [UNIFIED DUEL] Finalizando duelo:', { playerScore, opponentScore });
      
      // For test duels, skip edge function and simulate locally
      if (isTestDuel) {
        console.log('🧪 [UNIFIED DUEL] Simulando finalização de duelo teste');
        
        // Determine if player won
        const playerFinalScore = playerScore;
        const opponentFinalScore = opponentScore;
        const playerWon = playerFinalScore > opponentFinalScore;
        const isDraw = playerFinalScore === opponentFinalScore;
        
        // Set game result and show victory modal
        setGameResult({ playerWon, isDraw });
        setShowVictoryModal(true);
        
        // Trigger appropriate completion effects
        if (playerWon) {
          rewardSystem.showPerfectQuiz(playerFinalScore, 1);
          sensoryFeedback.triggerSuccess({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        }
        
        return;
      }
      
      const { error } = await supabase.functions.invoke('complete-casino-duel', {
        body: { duelId: currentDuel?.id }
      });

      if (error) throw error;

      // Determine if player won
      const isPlayer1 = currentDuel?.player1?.id === user?.id;
      const playerFinalScore = isPlayer1 ? playerScore : opponentScore;
      const opponentFinalScore = isPlayer1 ? opponentScore : playerScore;
      const playerWon = playerFinalScore > opponentFinalScore;
      const isDraw = playerFinalScore === opponentFinalScore;
      
      console.log('🏆 [UNIFIED DUEL] Resultado:', { playerWon, isDraw, playerFinalScore, opponentFinalScore });

      // Set game result and show victory modal
      setGameResult({ playerWon, isDraw });
      setShowVictoryModal(true);
      
      // Trigger appropriate completion effects
      if (playerWon) {
        rewardSystem.showPerfectQuiz(playerFinalScore, 1);
        sensoryFeedback.triggerSuccess({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      }
    } catch (error) {
      console.error('❌ [UNIFIED DUEL] Erro ao finalizar:', error);
      navigate('/dashboard');
    }
  };

  const handleQuitDuel = async () => {
    if (!currentDuel) return;
    
    try {
      // For test duels, skip edge function and simulate locally
      if (isTestDuel) {
        console.log('🧪 [UNIFIED DUEL] Simulando abandono de duelo teste');
        
        // Show feedback
        rewardSystem.showIncorrectAnswer("Duelo abandonado! (Teste)");
        sensoryFeedback.triggerError(document.body);
        
        toast({
          title: "Duelo Abandonado (Teste)",
          description: `Você abandonou o duelo de teste`,
          variant: "destructive"
        });
        
        setTimeout(() => navigate('/dashboard'), 1500);
        return;
      }
      
      // Call abandon duel function
      const { error } = await supabase.functions.invoke('abandon-casino-duel', {
        body: { duelId: currentDuel.id, userId: user?.id }
      });

      if (error) throw error;

      // Show feedback
      rewardSystem.showIncorrectAnswer("Duelo abandonado!");
      sensoryFeedback.triggerError(document.body);
      
      toast({
        title: "Duelo Abandonado",
        description: `Você abandonou o duelo e perdeu ${currentDuel.bet_amount} BTZ`,
        variant: "destructive"
      });
      
      setTimeout(() => navigate('/dashboard'), 1500);
      
    } catch (error) {
      console.error('❌ [UNIFIED DUEL] Erro ao abandonar:', error);
      toast({
        title: "Erro ao Abandonar",
        description: "Não foi possível abandonar o duelo. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Handle victory modal close
  const handleVictoryModalClose = () => {
    setShowVictoryModal(false);
    navigate('/dashboard');
  };

  // Resolve avatar URLs using the centralized avatar system
  const getAvatarUrl = (profile: any) => {
    if (!profile) return '/avatars/the-satoshi.jpg';
    
    const avatarData = {
      profile_image_url: profile?.profile_image_url || null,
      current_avatar_id: profile?.current_avatar_id || null,
      avatars: profile?.avatars || null
    };
    
    const resolved = resolveAvatarImage(avatarData, profile?.nickname || 'User');
    return resolved.imageUrl;
  };

  if (duelLoading || duelEngine.loading || !currentDuel || !duelEngine.session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">Carregando duelo unificado...</p>
        </div>
      </div>
    );
  }

  if (!duelEngine.currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold">Duelo finalizado!</h2>
          <p className="text-muted-foreground">Resultado será exibido em breve...</p>
        </div>
      </div>
    );
  }

  const isPlayer1 = currentDuel?.player1?.id === user?.id;
  const currentUserProfile = isPlayer1 ? currentDuel.player1 : currentDuel.player2;
  const opponentProfile = isPlayer1 ? currentDuel.player2 : currentDuel.player1;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <AnimatePresence mode="wait">
        <motion.div
          key="unified-duel-interface"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <UnifiedDuelInterface
            questions={duelEngine.session.questions}
            currentQuestion={currentQuestionIndex}
            onAnswer={handleAnswer}
            playerAvatar={getAvatarUrl(currentUserProfile)}
            opponentAvatar={getAvatarUrl(opponentProfile)}
            playerScore={isPlayer1 ? playerScore : opponentScore}
            opponentScore={isPlayer1 ? opponentScore : playerScore}
            playerNickname={currentUserProfile?.nickname || 'Você'}
            opponentNickname={opponentProfile?.nickname || 'Oponente'}
            isWaitingForOpponent={isWaitingForOpponent || isSubmitting}
            onQuitDuel={handleQuitDuel}
            betAmount={currentDuel.bet_amount}
            onTimeUp={handleTimeUp}
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Victory Modal */}
      {showVictoryModal && gameResult && (
        <DuelVictoryModal
          isOpen={showVictoryModal}
          onClose={handleVictoryModalClose}
          playerWon={gameResult.playerWon}
          isDraw={gameResult.isDraw}
          playerScore={playerScore}
          opponentScore={opponentScore}
          playerProfile={currentUserProfile}
          opponentProfile={opponentProfile}
          betAmount={currentDuel.bet_amount}
          isTestDuel={isTestDuel}
        />
      )}
      
      {/* Result overlay */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className={`p-8 rounded-2xl ${isCorrect ? 'bg-green-500' : 'bg-red-500'} text-white text-center shadow-2xl`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="text-4xl mb-4"
              >
                {isCorrect ? '✅' : '❌'}
              </motion.div>
              <h2 className="text-2xl font-bold">
                {isCorrect ? 'Correto!' : selectedAnswer === '' || selectedAnswer === null ? 'Tempo Esgotado!' : 'Incorreto!'}
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}