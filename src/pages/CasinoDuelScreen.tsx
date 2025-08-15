// SISTEMA ANTIGO COMENTADO - JANEIRO 2025
// Este arquivo foi desabilitado durante a migração para o novo sistema de duelo unificado
// Agora apenas o UnifiedCasinoDuelScreen está ativo para /casino-duel/:duelId
// Mantido para referência durante a migração

/*
CÓDIGO ORIGINAL DO CASINODUELSSCREEN COMENTADO PARA MIGRAÇÃO

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCasinoDuels } from '@/hooks/use-casino-duels';
import { EnhancedDuelInterface } from '@/components/duels/enhanced-duel-interface';
import { DuelResultScreenProps } from './DuelResultScreen';
import { Loading } from '@/components/ui/loading';
import { Duel } from '@/types/duel';
import { User } from '@/types/user';
import { useUser } from '@/hooks/use-user';
import { PageTitle } from '@/components/shared/page-title';
import { GenericError } from '@/components/shared/generic-error';
import { DuelTimeoutModal } from '@/components/duels/duel-timeout-modal';
import { DuelAbortedModal } from '@/components/duels/duel-aborted-modal';
import { DuelCompletedModal } from '@/components/duels/duel-completed-modal';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/routes/routes';

interface RouteParams {
  duelId: string;
}

export default function CasinoDuelScreen() {
  const { duelId } = useParams<RouteParams>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const { currentDuel, loading, error, submitAnswer, completeDuel, abandonDuel, loadDuelById } = useCasinoDuels();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isTimeoutModalOpen, setIsTimeoutModalOpen] = useState(false);
  const [isAbortedModalOpen, setIsAbortedModalOpen] = useState(false);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [completedDuelData, setCompletedDuelData] = useState<DuelResultScreenProps | null>(null);
  const duelTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (duelId) {
      loadDuelById(duelId);
    }
  }, [duelId, loadDuelById]);

  useEffect(() => {
    if (currentDuel && currentDuel.expires_at) {
      const timeLeft = new Date(currentDuel.expires_at).getTime() - Date.now();

      if (timeLeft <= 0) {
        handleDuelTimeout();
        return;
      }

      duelTimeout.current = setTimeout(() => {
        handleDuelTimeout();
      }, timeLeft);
    }

    return () => {
      if (duelTimeout.current) {
        clearTimeout(duelTimeout.current);
      }
    };
  }, [currentDuel]);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !currentDuel) return;

    const answerResult = await submitAnswer(currentDuel.id, selectedAnswer);

    if (answerResult?.error) {
      toast({
        title: 'Erro ao enviar resposta',
        description: 'Ocorreu um erro ao enviar sua resposta. Por favor, tente novamente.',
        variant: 'destructive'
      });
      return;
    }

    setSelectedAnswer(null);
  };

  const handleDuelTimeout = () => {
    setIsTimeoutModalOpen(true);
  };

  const handleDuelAborted = () => {
    setIsAbortedModalOpen(true);
  };

  const handleDuelComplete = async () => {
    if (!currentDuel) return;

    const result = await completeDuel(currentDuel.id);

    if (result?.error) {
      toast({
        title: 'Erro ao completar duelo',
        description: 'Ocorreu um erro ao completar o duelo. Por favor, tente novamente.',
        variant: 'destructive'
      });
      return;
    }

    setCompletedDuelData({
      duel: currentDuel,
      isWinner: result?.data?.is_winner || false,
      opponent: currentDuel.opponent as User,
      prize: currentDuel.prize || 0
    });
    setIsCompletedModalOpen(true);
  };

  const handleModalClose = () => {
    setIsTimeoutModalOpen(false);
    setIsAbortedModalOpen(false);
    setIsCompletedModalOpen(false);
    navigate(ROUTES.HOME);
  };

  const handleAbandonDuel = async () => {
    if (!currentDuel) return;

    const result = await abandonDuel(currentDuel.id);

    if (result?.error) {
      toast({
        title: 'Erro ao abandonar duelo',
        description: 'Ocorreu um erro ao abandonar o duelo. Por favor, tente novamente.',
        variant: 'destructive'
      });
      return;
    }

    navigate(ROUTES.HOME);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <GenericError message={error.message} />;
  }

  if (!currentDuel) {
    return <GenericError message="Duelo não encontrado" />;
  }

  if (!currentDuel.quiz) {
    return <GenericError message="Quiz não encontrado" />;
  }

  return (
    <div className="container h-full">
      <PageTitle title="Casino Duel" />

      <div className="flex flex-col items-center justify-center h-full">
        <EnhancedDuelInterface
          duel={currentDuel as Duel}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={handleAnswerSelect}
          onSubmitAnswer={handleSubmitAnswer}
          onDuelTimeout={handleDuelTimeout}
          onDuelAborted={handleDuelAborted}
          onDuelComplete={handleDuelComplete}
        />

        <Button variant="destructive" onClick={handleAbandonDuel} className="mt-4">
          Abandonar Duelo
        </Button>
      </div>

      <DuelTimeoutModal isOpen={isTimeoutModalOpen} onClose={handleModalClose} />
      <DuelAbortedModal isOpen={isAbortedModalOpen} onClose={handleModalClose} />
      <DuelCompletedModal isOpen={isCompletedModalOpen} onClose={handleModalClose} duelResult={completedDuelData} />
    </div>
  );
}

*/

// Component vazio para não quebrar importações existentes
export default function CasinoDuelScreen() {
  console.warn('⚠️ CasinoDuelScreen is LEGACY - use UnifiedCasinoDuelScreen');
  return null;
}
