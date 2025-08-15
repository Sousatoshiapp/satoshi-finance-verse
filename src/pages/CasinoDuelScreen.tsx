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

// Convert QuizQuestion to the format expected by EnhancedDuelInterface
const convertToInterfaceQuestion = (question: any) => {
  let options;
  
  if (Array.isArray(question.options)) {
    // Handle array format - convert to options with proper IDs
    options = question.options.map((text: string, index: number) => ({
      id: ['a', 'b', 'c', 'd'][index] || String(index),
      text: text,
      isCorrect: text === question.correct_answer
    }));
  } else if (typeof question.options === 'object' && question.options !== null) {
    // Handle object format {a: "text", b: "text", ...}
    options = Object.entries(question.options).map(([key, text]) => ({
      id: key,
      text: text as string,
      isCorrect: key === question.correct_answer || (text as string) === question.correct_answer
    }));
  } else {
    // Fallback for unexpected formats
    console.warn('Unexpected options format for question:', question.id);
    options = [];
  }
  
  return {
    id: String(question.id),
    question: question.question,
    options: options
  };
};

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

  // Simplify profiles query - remove problematic avatar join
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['duel-profiles', casinoDuels.currentDuel?.player1_id, casinoDuels.currentDuel?.player2_id],
    queryFn: async () => {
      if (!casinoDuels.currentDuel) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nickname, level, xp')
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

  const handleAnswer = async (optionId: string) => {
    const questions = casinoDuels.currentDuel?.questions || [];
    const currentQuestion = questions[currentQuestionIndex - 1];
    
    if (!casinoDuels.currentDuel || !currentQuestion || isSubmitting) return;
    
    setIsSubmitting(true);
    setSelectedAnswer(optionId);
    
    const responseTime = Date.now() - responseStartTime;
    
    try {
      // Trigger immediate feedback
      sensoryFeedback.triggerClick(document.body);
      
      // Submit answer to edge function
      const { data, error } = await supabase.functions.invoke('process-duel-answer', {
        body: {
          duelId: casinoDuels.currentDuel.id,
          userId: user?.id,
          questionIndex: currentQuestionIndex - 1,
          selectedAnswer: optionId,
          responseTime
        }
      });

      if (error) throw error;

      const isCorrect = data?.is_correct || false;
      const newScore = data?.new_score || 0;

      // Update local score based on whether current user is player1 or player2
      const isPlayer1 = casinoDuels.currentDuel.player1_id === user?.id;
      
      if (isPlayer1) {
        setPlayerScore(newScore);
      } else {
        setOpponentScore(newScore);
      }

      // Trigger feedback based on correctness
      if (isCorrect) {
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
      const { error } = await supabase.functions.invoke('complete-casino-duel', {
        body: { duelId: casinoDuels.currentDuel?.id }
      });

      if (error) throw error;

      // Trigger completion effects
      rewardSystem.showPerfectQuiz(playerScore + opponentScore, 1);
      sensoryFeedback.triggerSuccess({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      
      toast({
        title: "Duelo Finalizado!",
        description: "Resultado calculado com sucesso.",
        variant: "default"
      });

      // Navigate back after a moment
      setTimeout(() => navigate('/duels'), 3000);
    } catch (error) {
      console.error('Error completing duel:', error);
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
        title: "Erro",
        description: "Erro ao abandonar o duelo.",
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

  const player1Profile = profiles.find(p => p.id === casinoDuels.currentDuel.player1_id);
  const player2Profile = profiles.find(p => p.id === casinoDuels.currentDuel.player2_id);

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
            questions={questions.map(convertToInterfaceQuestion)}
            currentQuestion={currentQuestionIndex}
            onAnswer={handleAnswer}
            playerAvatar={null}
            opponentAvatar={null}
            playerScore={playerScore}
            opponentScore={opponentScore}
            playerNickname={player1Profile?.nickname || 'Jogador 1'}
            opponentNickname={player2Profile?.nickname || 'Jogador 2'}
            timeLeft={timeLeft}
            isWaitingForOpponent={isWaitingForOpponent || isSubmitting}
            onQuitDuel={handleQuitDuel}
            betAmount={casinoDuels.currentDuel.bet_amount}
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
              className={`p-8 rounded-2xl ${selectedAnswer ? 'bg-green-500' : 'bg-red-500'} text-white text-center shadow-2xl`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="text-4xl mb-4"
              >
                {selectedAnswer ? '✅' : '❌'}
              </motion.div>
              <h2 className="text-2xl font-bold">
                {selectedAnswer ? 'Correto!' : 'Incorreto!'}
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
