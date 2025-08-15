import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCasinoDuels } from '@/hooks/use-casino-duels';
import { EnhancedDuelInterface } from '@/components/duels/enhanced-duel-interface';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/shared/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { QuizQuestion } from '@/types/quiz';
import { useSensoryFeedback } from '@/hooks/use-sensory-feedback';
import { useRewardAnimationSystem } from '@/hooks/use-reward-animation-system';
import { motion, AnimatePresence } from 'framer-motion';
import { formatQuizQuestion, convertToInterfaceQuestion } from '@/utils/quiz-formatting';

// Process questions through formatting utilities to ensure consistency

export default function CasinoDuelScreen() {
  const { duelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Feedback systems
  const sensoryFeedback = useSensoryFeedback();
  const rewardSystem = useRewardAnimationSystem();
  
  // Use the actual hook interface from useCasinoDuels - no arguments
  const casinoDuels = useCasinoDuels();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [responseStartTime, setResponseStartTime] = useState<number>(Date.now());
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // Enhanced profiles query with avatar data
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['duel-profiles', casinoDuels.currentDuel?.player1_id, casinoDuels.currentDuel?.player2_id],
    queryFn: async () => {
      if (!casinoDuels.currentDuel) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, nickname, level, xp, profile_image_url, current_avatar_id,
          avatars:avatars!current_avatar_id (
            name, image_url
          )
        `)
        .in('id', [casinoDuels.currentDuel.player1_id, casinoDuels.currentDuel.player2_id]);

      if (error) throw error;
      return data;
    },
    enabled: !!casinoDuels.currentDuel
  });

  // Load duel when component mounts
  useEffect(() => {
    if (duelId && casinoDuels.loadDuelById) {
      casinoDuels.loadDuelById(duelId);
    }
  }, [duelId]);

  // Timer is now handled by CircularTimer component - no local timer needed

  // Reset response time when question changes
  useEffect(() => {
    setResponseStartTime(Date.now());
  }, [currentQuestionIndex]);

  // Timer sound effects are now handled by CircularTimer component

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
    
    // Pass empty string for timeout
    await handleAnswer('');
  };

  const handleAnswer = async (selectedText: string) => {
    const questions = casinoDuels.currentDuel?.questions || [];
    const currentQuestion = questions[currentQuestionIndex - 1];
    
    if (!casinoDuels.currentDuel || !currentQuestion || isSubmitting) return;
    
    console.log('🔥 CasinoDuelScreen.handleAnswer - DEFINITIVO:', {
      selectedText,
      originalQuestion: currentQuestion,
      formattedQuestion: formatQuizQuestion(currentQuestion)
    });
    
    setIsSubmitting(true);
    setSelectedAnswer(selectedText);
    
    const responseTime = Date.now() - responseStartTime;
    
    try {
      // Trigger immediate feedback
      sensoryFeedback.triggerClick(document.body);
      
      console.log('🔍 Submitting answer - DEFINITIVO:', {
        duelId: casinoDuels.currentDuel.id,
        questionIndex: currentQuestionIndex - 1,
        selectedAnswer: selectedText, // Já é o texto correto
        responseTime
      });

      // Submit answer to edge function
      const { data, error } = await supabase.functions.invoke('process-duel-answer', {
        body: {
          duelId: casinoDuels.currentDuel.id,
          userId: user?.id,
          questionIndex: currentQuestionIndex - 1,
          selectedAnswer: selectedText, // Texto puro, sem conversões
          responseTime
        }
      });

      if (error) throw error;

      const answerCorrect = data?.is_correct || false;
      const newScore = data?.new_score || 0;

      // Store correctness for visual feedback
      setIsCorrect(answerCorrect);

      // Update local score based on whether current user is player1 or player2
      console.log('📊 Score update logic:', {
        currentUserId: user?.id,
        player1Id: casinoDuels.currentDuel.player1_id,
        player2Id: casinoDuels.currentDuel.player2_id,
        isPlayer1,
        answerCorrect,
        newScore
      });
      
      if (isPlayer1) {
        setPlayerScore(newScore);
        console.log('📊 Updated player1 score to:', newScore);
      } else {
        setOpponentScore(newScore);  
        console.log('📊 Updated player2 score to:', newScore);
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
        
        if (currentQuestionIndex < questions.length) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          // Duel completed - trigger completion
          handleDuelComplete();
        }
        setIsSubmitting(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting answer:', error);
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
      console.log('🏁 Completing duel with scores - Player:', playerScore, 'Opponent:', opponentScore);
      
      const { error } = await supabase.functions.invoke('complete-casino-duel', {
        body: { duelId: casinoDuels.currentDuel?.id }
      });

      if (error) throw error;

      // Determine if player won
      const isPlayer1 = casinoDuels.currentDuel?.player1_id === user?.id;
      const playerFinalScore = isPlayer1 ? playerScore : opponentScore;
      const opponentFinalScore = isPlayer1 ? opponentScore : playerScore;
      const playerWon = playerFinalScore > opponentFinalScore;
      const isDraw = playerFinalScore === opponentFinalScore;
      
      console.log('🏆 Duel result - Player won:', playerWon, 'Draw:', isDraw);

      // Trigger appropriate completion effects
      if (playerWon) {
        rewardSystem.showPerfectQuiz(playerFinalScore, 1);
        sensoryFeedback.triggerSuccess({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        
        toast({
          title: "🎉 Vitória!",
          description: `Você venceu ${playerFinalScore} x ${opponentFinalScore}!`,
          variant: "default"
        });
      } else if (isDraw) {
        toast({
          title: "🤝 Empate!",
          description: `Resultado: ${playerFinalScore} x ${opponentFinalScore}`,
          variant: "default"
        });
      } else {
        toast({
          title: "😔 Derrota",
          description: `Você perdeu ${playerFinalScore} x ${opponentFinalScore}`,
          variant: "destructive"
        });
      }

      // Navigate back to dashboard after a moment
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (error) {
      console.error('Error completing duel:', error);
      navigate('/dashboard');
    }
  };

  const handleQuitDuel = async () => {
    if (!casinoDuels.currentDuel) return;
    
    try {
      const result = await casinoDuels.abandonDuel(casinoDuels.currentDuel.id);
      
      if (result) {
        // Show abandonment feedback
        rewardSystem.showIncorrectAnswer("Duelo abandonado!");
        sensoryFeedback.triggerError(document.body);
        
        toast({
          title: "Duelo Abandonado",
          description: `Você abandonou o duelo e perdeu ${casinoDuels.currentDuel.bet_amount} BTZ`,
          variant: "destructive"
        });
        
        // Navigate back to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        toast({
          title: "Erro",
          description: "Erro ao abandonar o duelo. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error quitting duel:', error);
      toast({
        title: "Erro ao Abandonar",
        description: "Não foi possível abandonar o duelo. Verifique sua conexão.",
        variant: "destructive"
      });
    }
  };

  const questions = casinoDuels.currentDuel?.questions || [];
  
  if (casinoDuels.loading || profilesLoading || !casinoDuels.currentDuel || !profiles) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Carregando questões...</h2>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex - 1];
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold">Duelo finalizado!</h2>
          <p className="text-muted-foreground">Resultado será exibido em breve...</p>
        </div>
      </div>
    );
  }

  const player1Profile = profiles?.find(p => p.id === casinoDuels.currentDuel.player1_id);
  const player2Profile = profiles?.find(p => p.id === casinoDuels.currentDuel.player2_id);

  // Resolve avatar URLs with proper fallback
  const getAvatarUrl = (profile: any) => {
    console.log('🖼️ Avatar Debug - Profile:', JSON.stringify(profile, null, 2));
    
    if (profile?.profile_image_url) {
      console.log('🖼️ Avatar: Using profile_image_url:', profile.profile_image_url);
      return profile.profile_image_url;
    }
    
    // Check if avatars is an array and get the first one
    if (Array.isArray(profile?.avatars) && profile.avatars.length > 0) {
      console.log('🖼️ Avatar: Using avatars array:', profile.avatars[0].image_url);
      return profile.avatars[0].image_url;
    }
    
    // Check if avatars is a single object
    if (profile?.avatars?.image_url) {
      console.log('🖼️ Avatar: Using avatars object:', profile.avatars.image_url);
      return profile.avatars.image_url;
    }
    
    console.log('🖼️ Avatar: Using default fallback');
    return '/avatars/the-satoshi.jpg'; // Default fallback
  };

  const isPlayer1 = casinoDuels.currentDuel?.player1_id === user?.id;
  const currentUserProfile = isPlayer1 ? player1Profile : player2Profile;
  const opponentProfile = isPlayer1 ? player2Profile : player1Profile;
  
  console.log('🎯 Player identification:', {
    isPlayer1,
    currentUserId: user?.id,
    player1Id: casinoDuels.currentDuel?.player1_id,
    player2Id: casinoDuels.currentDuel?.player2_id
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <AnimatePresence mode="wait">
        <motion.div
          key="duel-interface"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <EnhancedDuelInterface
            questions={questions.map(q => convertToInterfaceQuestion(formatQuizQuestion(q)))}
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
            betAmount={casinoDuels.currentDuel.bet_amount}
            onTimeUp={handleTimeUp}
          />
        </motion.div>
      </AnimatePresence>
      
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
