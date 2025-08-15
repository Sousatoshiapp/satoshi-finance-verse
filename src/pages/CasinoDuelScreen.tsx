import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCasinoDuels } from '@/hooks/use-casino-duels';
import { EnhancedDuelInterface } from '@/components/duels/enhanced-duel-interface';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/shared/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { QuizQuestion } from '@/types/quiz';

// Convert QuizQuestion to the format expected by EnhancedDuelInterface
const convertToInterfaceQuestion = (question: QuizQuestion) => {
  return {
    id: String(question.id),
    question: question.question,
    options: question.options
  };
};

export default function CasinoDuelScreen() {
  const { duelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use the actual hook interface from useCasinoDuels - no arguments
  const casinoDuels = useCasinoDuels();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);

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
    if (!casinoDuels.currentDuel || !questions[currentQuestionIndex - 1]) return;
    
    try {
      // For now, just simulate answer submission
      // This would need to be implemented in the actual hook
      console.log('Submitting answer:', optionId);
      
      // Update question index after answering
      if (currentQuestionIndex < questions.length) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar resposta. Tente novamente.",
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
      isWaitingForOpponent={isWaitingForOpponent}
    />
  );
}
