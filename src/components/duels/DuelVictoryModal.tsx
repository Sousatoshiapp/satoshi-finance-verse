import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Star, Coins, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/shared/ui/dialog';
import { Button } from '@/components/shared/ui/button';
import { AvatarDisplayUniversal } from '@/components/shared/avatar-display-universal';
import { useAdvancedQuizAudio } from '@/hooks/use-advanced-quiz-audio';
import confetti from 'canvas-confetti';

interface DuelVictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerWon: boolean;
  isDraw: boolean;
  playerScore: number;
  opponentScore: number;
  playerProfile: any;
  opponentProfile: any;
  betAmount: number;
  isTestDuel?: boolean;
}

export function DuelVictoryModal({
  isOpen,
  onClose,
  playerWon,
  isDraw,
  playerScore,
  opponentScore,
  playerProfile,
  opponentProfile,
  betAmount,
  isTestDuel = false
}: DuelVictoryModalProps) {
  const { playCorrectSound, playWrongSound, playCashRegisterSound } = useAdvancedQuizAudio();

  useEffect(() => {
    if (isOpen) {
      // Play appropriate sound based on result
      if (playerWon) {
        playCorrectSound(2); // Higher intensity for victory
        playCashRegisterSound(); // Money sound for BTZ gain
        
        // Victory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        // Additional confetti burst after delay
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 250);
      } else if (!isDraw) {
        playWrongSound(); // Defeat sound
      }
    }
  }, [isOpen, playerWon, isDraw, playCorrectSound, playWrongSound, playCashRegisterSound]);
  const getResultTitle = () => {
    if (isDraw) return '🤝 Empate!';
    return playerWon ? '🎉 Vitória!' : '😔 Derrota';
  };

  const getResultColor = () => {
    if (isDraw) return 'text-warning';
    return playerWon ? 'text-success' : 'text-destructive';
  };

  const getResultDescription = () => {
    if (isDraw) return 'Uma batalha equilibrada!';
    return playerWon ? 'Excelente performance!' : 'Que tal tentar novamente?';
  };

  const getBtzResult = () => {
    if (isDraw) return 0;
    return playerWon ? betAmount : -betAmount;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-center space-y-6 p-6"
        >
          {/* Resultado Principal */}
          <div className="space-y-3">
            {playerWon && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <Crown className="w-16 h-16 mx-auto text-warning animate-pulse" />
              </motion.div>
            )}
            
            {isDraw && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <Star className="w-16 h-16 mx-auto text-warning" />
              </motion.div>
            )}
            
            {!playerWon && !isDraw && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <Trophy className="w-16 h-16 mx-auto text-muted-foreground" />
              </motion.div>
            )}

            <motion.h2 
              className={`text-3xl font-bold ${getResultColor()}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {getResultTitle()}
              {isTestDuel && ' (Teste)'}
            </motion.h2>
            
            <motion.p 
              className="text-lg text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {getResultDescription()}
            </motion.p>
          </div>

          {/* Placar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-muted/30 rounded-xl p-6 space-y-4"
          >
            <h3 className="text-xl font-semibold mb-4">Resultado Final</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AvatarDisplayUniversal
                  nickname={playerProfile?.nickname || 'Você'}
                  avatarData={playerProfile}
                  size="md"
                />
                <div>
                  <p className="font-medium">{playerProfile?.nickname || 'Você'}</p>
                  <p className="text-sm text-muted-foreground">
                    {playerScore} {playerScore === 1 ? 'acerto' : 'acertos'}
                  </p>
                </div>
              </div>
              
              <div className={`text-2xl font-bold ${
                playerScore > opponentScore ? 'text-duel-winner' : 
                playerScore < opponentScore ? 'text-duel-loser' : 
                'text-foreground'
              }`}>
                {playerScore}
              </div>
            </div>

            <div className="border-t border-muted/50 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AvatarDisplayUniversal
                    nickname={opponentProfile?.nickname || 'Oponente'}
                    avatarData={opponentProfile}
                    size="md"
                  />
                  <div>
                    <p className="font-medium">{opponentProfile?.nickname || 'Oponente'}</p>
                    <p className="text-sm text-muted-foreground">
                      {opponentScore} {opponentScore === 1 ? 'acerto' : 'acertos'}
                    </p>
                  </div>
                </div>
                
                <div className={`text-2xl font-bold ${
                  opponentScore > playerScore ? 'text-duel-winner' : 
                  opponentScore < playerScore ? 'text-duel-loser' : 
                  'text-foreground'
                }`}>
                  {opponentScore}
                </div>
              </div>
            </div>
          </motion.div>

          {/* BTZ Result */}
          {!isTestDuel && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className={`flex items-center justify-center space-x-2 p-4 rounded-lg ${
                getBtzResult() > 0 
                  ? 'bg-success/10 text-success' 
                  : getBtzResult() < 0 
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-muted/30'
              }`}
            >
              <Coins className="w-5 h-5" />
              <span className="text-lg font-semibold">
                {getBtzResult() > 0 ? '+' : ''}{getBtzResult()} BTZ
              </span>
              {getBtzResult() !== 0 && (
                <TrendingUp className={`w-4 h-4 ${getBtzResult() > 0 ? 'rotate-0' : 'rotate-180'}`} />
              )}
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-3"
          >
            <Button 
              onClick={onClose}
              className="w-full"
              variant="default"
            >
              Voltar ao Dashboard
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}