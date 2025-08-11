import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Crown, Trophy, Users, TrendingDown, RotateCcw, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCasinoDuels } from "@/hooks/use-casino-duels";
import { useProfile } from "@/hooks/use-profile";
import { useUnifiedRewards } from "@/hooks/use-unified-rewards";
import { BeetzAnimation } from "@/components/features/quiz/beetz-animation";
import { LossAnimation } from "@/components/features/duels/LossAnimation";
import { formatBTZDisplay } from "@/utils/btz-formatter";

interface DuelResult {
  winnerId?: string;
  player1Score: number;
  player2Score: number;
  player1BtzChange: number;
  player2BtzChange: number;
  betAmount: number;
}

export default function DuelResultScreen() {
  const { duelId } = useParams<{ duelId: string }>();
  const navigate = useNavigate();
  const { currentDuel, loadDuelById } = useCasinoDuels();
  const { profile } = useProfile();
  const { showRewardAnimation } = useUnifiedRewards();
  
  const [result, setResult] = useState<DuelResult | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showLossAnimation, setShowLossAnimation] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!duelId) {
      navigate('/dashboard');
      return;
    }

    const loadResult = async () => {
      // Load duel if not already loaded
      if (!currentDuel || currentDuel.id !== duelId) {
        await loadDuelById(duelId);
      }
      
      // For now, we'll calculate the result based on the current duel data
      // In a real implementation, this would come from the complete-casino-duel edge function
      if (currentDuel) {
        const player1Score = currentDuel.player1_score;
        const player2Score = currentDuel.player2_score;
        let winnerId = undefined;
        
        if (player1Score > player2Score) {
          winnerId = currentDuel.player1_id;
        } else if (player2Score > player1Score) {
          winnerId = currentDuel.player2_id;
        }

        // Calculate BTZ changes
        const betAmount = currentDuel.bet_amount;
        let player1BtzChange = 0;
        let player2BtzChange = 0;

        if (winnerId === currentDuel.player1_id) {
          player1BtzChange = betAmount;
          player2BtzChange = -betAmount;
        } else if (winnerId === currentDuel.player2_id) {
          player1BtzChange = -betAmount;
          player2BtzChange = betAmount;
        }

        setResult({
          winnerId,
          player1Score,
          player2Score,
          player1BtzChange,
          player2BtzChange,
          betAmount
        });

        // Show animation after a delay
        setTimeout(() => {
          const playerBtzChange = profile.id === currentDuel.player1_id ? player1BtzChange : player2BtzChange;
          if (playerBtzChange > 0) {
            setShowAnimation(true);
          } else if (playerBtzChange < 0) {
            setShowLossAnimation(true);
          }
        }, 1000);
      }
      
      setLoading(false);
    };

    loadResult();
  }, [duelId, currentDuel, loadDuelById, navigate]);

  if (loading || !currentDuel || !result || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center">
        <Card className="border-white/10 bg-black/20 backdrop-blur-md p-8">
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-white">Processando resultado...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPlayer1 = profile.id === currentDuel.player1_id;
  const isWinner = result.winnerId === profile.id;
  const isTie = !result.winnerId;
  const playerBtzChange = isPlayer1 ? result.player1BtzChange : result.player2BtzChange;
  const playerScore = isPlayer1 ? result.player1Score : result.player2Score;
  const opponentScore = isPlayer1 ? result.player2Score : result.player1Score;
  const opponentName = isPlayer1 ? currentDuel.player2_profile?.nickname : currentDuel.player1_profile?.nickname;

  const resultTitle = isTie ? "Empate!" : isWinner ? "Vitória!" : "Derrota";
  const resultIcon = isTie ? Trophy : isWinner ? Crown : TrendingDown;
  const resultColor = isTie ? "text-amber-400" : isWinner ? "text-green-400" : "text-red-400";
  const bgGradient = isTie 
    ? "from-amber-500/20 to-orange-500/20" 
    : isWinner 
    ? "from-green-500/20 to-emerald-500/20" 
    : "from-red-500/20 to-pink-500/20";

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br ${bgGradient} rounded-full blur-3xl animate-pulse`} />
          <div className={`absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br ${bgGradient} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 container mx-auto px-6 py-8 space-y-8">
          {/* Header */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center"
          >
            <motion.div
              className={`inline-block p-4 bg-gradient-to-br ${bgGradient} rounded-full mb-4`}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {React.createElement(resultIcon, { className: `h-12 w-12 ${resultColor}` })}
            </motion.div>
            <h1 className={`text-4xl font-bold ${resultColor} mb-2`}>{resultTitle}</h1>
            <p className="text-muted-foreground">Duelo Finalizado</p>
          </motion.div>

          {/* Score Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-white/10 bg-black/20 backdrop-blur-md">
              <CardContent className="p-8">
                <div className="grid grid-cols-3 gap-6 items-center">
                  {/* Player */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="font-bold text-white">Você</span>
                    </div>
                    <div className={`text-4xl font-bold ${isWinner ? 'text-green-400' : isTie ? 'text-amber-400' : 'text-red-400'}`}>
                      {playerScore}
                    </div>
                  </div>

                  {/* VS */}
                  <div className="text-center">
                    <div className={`p-4 bg-gradient-to-br ${bgGradient} rounded-full inline-block`}>
                      <Trophy className={`h-8 w-8 ${resultColor}`} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">FINAL</p>
                  </div>

                  {/* Opponent */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-amber-400" />
                      <span className="font-bold text-white">{opponentName || 'Oponente'}</span>
                    </div>
                    <div className={`text-4xl font-bold ${!isWinner && !isTie ? 'text-green-400' : isTie ? 'text-amber-400' : 'text-red-400'}`}>
                      {opponentScore}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* BTZ Result */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-white/10 bg-black/20 backdrop-blur-md">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-4">Resultado Financeiro</h3>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    Aposta: {formatBTZDisplay(result.betAmount)}
                  </p>
                  {playerBtzChange > 0 ? (
                    <p className="text-2xl font-bold text-green-400">
                      +{formatBTZDisplay(Math.abs(playerBtzChange))}
                    </p>
                  ) : playerBtzChange < 0 ? (
                    <p className="text-2xl font-bold text-red-400">
                      -{formatBTZDisplay(Math.abs(playerBtzChange))}
                    </p>
                  ) : (
                    <p className="text-2xl font-bold text-amber-400">
                      Empate - Sem mudanças
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex gap-4 justify-center"
          >
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="border-white/20 bg-black/20 backdrop-blur-sm hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              onClick={() => navigate('/select-opponent')}
              className="bg-primary hover:bg-primary/80"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Jogar Novamente
            </Button>
          </motion.div>
        </div>
      </div>

      {/* BTZ Gain Animation */}
      {showAnimation && playerBtzChange > 0 && (
        <BeetzAnimation
          isVisible={true}
          amount={Math.abs(playerBtzChange)}
          onComplete={() => {
            setShowAnimation(false);
            showRewardAnimation('btz', Math.abs(playerBtzChange));
          }}
        />
      )}

      {/* BTZ Loss Animation */}
      {showLossAnimation && playerBtzChange < 0 && (
        <LossAnimation
          isVisible={true}
          amount={Math.abs(playerBtzChange)}
          onComplete={() => {
            setShowLossAnimation(false);
          }}
        />
      )}
    </>
  );
}