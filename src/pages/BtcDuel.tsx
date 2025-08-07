import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { useNavigate } from "react-router-dom";
import { BtcBetSelector } from "@/components/features/duels/btc/BtcBetSelector";
import { BtcMatchmaking } from "@/components/features/duels/btc/BtcMatchmaking";
import { BtcDuelInterface } from "@/components/features/duels/btc/BtcDuelInterface";
import { useBtcDuel } from "@/hooks/use-btc-duel";
import { useDashboardData } from "@/hooks/use-dashboard-data";

type DuelPhase = 'betting' | 'matchmaking' | 'dueling' | 'completed';

export default function BtcDuel() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<DuelPhase>('betting');
  const [betAmount, setBetAmount] = useState<number>(0);
  const [opponentId, setOpponentId] = useState<string>('');
  const [duelId, setDuelId] = useState<string>('');
  
  const { createDuel } = useBtcDuel();
  const { data: dashboardData } = useDashboardData();

  const userPoints = dashboardData?.profile?.points || 0;

  const handleBetSelected = (amount: number) => {
    setBetAmount(amount);
    setPhase('matchmaking');
  };

  const handleOpponentFound = async (foundOpponentId: string) => {
    setOpponentId(foundOpponentId);
    
    try {
      // Create the duel
      const duel = await createDuel(betAmount, foundOpponentId);
      setDuelId(duel.id);
      setPhase('dueling');
    } catch (error) {
      console.error('Error creating duel:', error);
      // Return to betting phase on error
      setPhase('betting');
    }
  };

  const handleMatchmakingCancel = () => {
    setPhase('betting');
    setBetAmount(0);
  };

  const handleDuelComplete = (result: any) => {
    setPhase('completed');
    // Handle duel completion (show results, redirect, etc.)
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  const handleGoBack = () => {
    if (phase === 'betting') {
      navigate('/dashboard');
    } else {
      // For other phases, we might want to show a confirmation
      navigate('/dashboard');
    }
  };

  const renderPhase = () => {
    switch (phase) {
      case 'betting':
        return (
          <BtcBetSelector
            onBetSelected={handleBetSelected}
            userPoints={userPoints}
          />
        );
      
      case 'matchmaking':
        return (
          <BtcMatchmaking
            betAmount={betAmount}
            onOpponentFound={handleOpponentFound}
            onCancel={handleMatchmakingCancel}
          />
        );
      
      case 'dueling':
        return (
          <BtcDuelInterface
            duelId={duelId}
            opponentId={opponentId}
            betAmount={betAmount}
            onDuelComplete={handleDuelComplete}
          />
        );
      
      case 'completed':
        return (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Duelo Finalizado!</h2>
            <p className="text-muted-foreground">Redirecionando para o dashboard...</p>
          </div>
        );
      
      default:
        return <div>Carregando...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {renderPhase()}
      </div>
    </div>
  );
}