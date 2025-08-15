import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSensoryFeedback } from '@/hooks/use-sensory-feedback';
import { useRewardAnimationSystem } from '@/hooks/use-reward-animation-system';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/shared/ui/dialog';
import { Button } from '@/components/shared/ui/button';
import { X, AlertTriangle } from 'lucide-react';
import { CircularTimer } from './circular-timer';

interface Question {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

interface EnhancedDuelInterfaceProps {
  questions: Question[];
  currentQuestion: number;
  onAnswer: (selectedText: string) => void;
  playerAvatar: string | null;
  opponentAvatar: string | null;
  playerScore: number;
  opponentScore: number;
  playerNickname: string;
  opponentNickname: string;
  isWaitingForOpponent?: boolean;
  onQuitDuel?: () => void;
  betAmount?: number;
  onTimeUp?: () => void;
}

export function EnhancedDuelInterface({
  questions,
  currentQuestion,
  onAnswer,
  playerAvatar,
  opponentAvatar,
  playerScore,
  opponentScore,
  playerNickname,
  opponentNickname,
  isWaitingForOpponent = false,
  onQuitDuel,
  betAmount = 0,
  onTimeUp,
}: EnhancedDuelInterfaceProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const sensoryFeedback = useSensoryFeedback();
  const rewardSystem = useRewardAnimationSystem();
  const [showQuitModal, setShowQuitModal] = useState(false);

  const handleQuitClick = () => {
    sensoryFeedback.triggerClick(document.body);
    setShowQuitModal(true);
  };

  const handleConfirmQuit = () => {
    sensoryFeedback.triggerError(document.body);
    onQuitDuel?.();
    setShowQuitModal(false);
  };

  const currentQ = questions[currentQuestion - 1];
  if (!currentQ) return null;

  const handleAnswer = (optionId: string) => {
    if (selectedAnswer || isWaitingForOpponent) return;
    
    // Trigger click feedback
    sensoryFeedback.triggerClick(document.body);
    
    setSelectedAnswer(optionId);
    onAnswer(optionId);
  };

  // Timer is handled entirely by CircularTimer component

  // Reset when question changes
  useEffect(() => {
    setSelectedAnswer(null);
  }, [currentQuestion]);

  // Sound effects are handled by CircularTimer component

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-2 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header responsivo com avatares e scores */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center mb-4 sm:mb-8">
          {/* Player 1 */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg overflow-hidden"
            >
              {playerAvatar ? (
                <img 
                  src={playerAvatar} 
                  alt={playerNickname}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-primary-foreground font-bold text-sm sm:text-xl">
                  {playerNickname.charAt(0).toUpperCase()}
                </span>
              )}
            </motion.div>
            <div className="text-center sm:text-left">
              <p className="font-semibold text-xs sm:text-base text-foreground truncate max-w-20 sm:max-w-none">
                {playerNickname}
              </p>
              <motion.p 
                key={playerScore}
                initial={{ scale: 1.2, color: "hsl(var(--primary))" }}
                animate={{ scale: 1, color: "hsl(var(--foreground))" }}
                className="text-lg sm:text-2xl font-bold"
              >
                {playerScore}
              </motion.p>
            </div>
          </div>

          {/* VS e Info Central */}
          <div className="text-center relative">
            {/* Quit Button - Melhor posicionamento mobile */}
            <Dialog open={showQuitModal} onOpenChange={setShowQuitModal}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-110 w-10 h-10 sm:w-8 sm:h-8 z-50"
                  onClick={handleQuitClick}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-3">
                  <DialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Abandonar Duelo
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    Tem certeza que deseja abandonar o duelo? 
                     <div className="mt-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                       <p className="font-semibold text-destructive">
                         ⚠️ Você perderá seus {betAmount > 0 ? betAmount : 'seus'} BTZ apostados!
                       </p>
                       <p className="text-sm mt-1 text-muted-foreground">
                         Seu oponente receberá automaticamente o prêmio do duelo.
                       </p>
                     </div>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    onClick={() => setShowQuitModal(false)}
                    className="flex-1"
                  >
                    Continuar Jogando
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleConfirmQuit}
                    className="flex-1"
                  >
                    Desistir e Perder Aposta
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
            >
              VS
            </motion.div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {currentQuestion}/{questions.length}
            </div>
          </div>

          {/* Player 2 */}
          <div className="flex flex-col sm:flex-row-reverse items-center space-y-2 sm:space-y-0 sm:space-x-reverse sm:space-x-4">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-destructive to-destructive/80 flex items-center justify-center shadow-lg overflow-hidden"
            >
              {opponentAvatar ? (
                <img 
                  src={opponentAvatar} 
                  alt={opponentNickname}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-destructive-foreground font-bold text-sm sm:text-xl">
                  {opponentNickname.charAt(0).toUpperCase()}
                </span>
              )}
            </motion.div>
            <div className="text-center sm:text-right">
              <p className="font-semibold text-xs sm:text-base text-foreground truncate max-w-20 sm:max-w-none">
                {opponentNickname}
              </p>
              <motion.p 
                key={opponentScore}
                initial={{ scale: 1.2, color: "hsl(var(--destructive))" }}
                animate={{ scale: 1, color: "hsl(var(--foreground))" }}
                className="text-lg sm:text-2xl font-bold"
              >
                {opponentScore}
              </motion.p>
            </div>
          </div>
        </div>

        {/* Timer Responsivo - CircularTimer */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <CircularTimer
            key={`timer-${currentQuestion}`} // Force reset on question change
            duration={30}
            isActive={!selectedAnswer && !isWaitingForOpponent}
            onTimeUp={onTimeUp || (() => {})}
            onTick={() => {}}
            onCountdown={() => sensoryFeedback.triggerTension(5)}
            enableCountdownSound={true}
            size={80}
            className="transition-transform hover:scale-105"
          />
        </div>

        {/* Progress Bar Responsivo */}
        <div className="mb-4 sm:mb-8 px-2 sm:px-0">
          <div className="w-full bg-muted rounded-full h-2 sm:h-3 overflow-hidden shadow-inner">
            <motion.div 
              className="bg-gradient-to-r from-primary via-accent to-primary h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentQuestion / questions.length) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs sm:text-sm text-muted-foreground">
            <span>Progresso</span>
            <span>{Math.round((currentQuestion / questions.length) * 100)}%</span>
          </div>
        </div>

        {/* Question Card Responsivo */}
        <motion.div 
          key={currentQuestion}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="bg-card/80 backdrop-blur-md rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-8 shadow-2xl border border-border/20"
        >
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl font-bold text-card-foreground mb-6 sm:mb-8 text-center leading-relaxed px-2"
          >
            {currentQ.question}
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {currentQ.options.map((option, index) => {
              const isSelected = selectedAnswer === option.id;
              
              return (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                  whileHover={{ scale: selectedAnswer === null && !isWaitingForOpponent ? 1.02 : 1 }}
                  whileTap={{ scale: selectedAnswer === null && !isWaitingForOpponent ? 0.98 : 1 }}
                  onClick={() => handleAnswer(option.id)}
                  disabled={selectedAnswer !== null || isWaitingForOpponent}
                  className={`
                    p-4 sm:p-6 rounded-xl text-left transition-all duration-300 font-medium
                    shadow-lg border-2 relative overflow-hidden
                    ${selectedAnswer === null && !isWaitingForOpponent
                      ? 'bg-secondary/60 hover:bg-secondary/80 text-secondary-foreground border-border hover:border-primary/50 hover:shadow-primary/20'
                      : selectedAnswer === option.id
                      ? 'bg-primary text-primary-foreground border-primary shadow-primary/30'
                      : 'bg-muted/50 text-muted-foreground border-border opacity-60'
                    }
                    ${isWaitingForOpponent ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center space-x-3 relative z-10">
                    <motion.span 
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-background/20 flex items-center justify-center text-xs sm:text-sm font-bold"
                      animate={{
                        backgroundColor: isSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--background) / 0.2)',
                        color: isSelected ? 'hsl(var(--primary))' : 'inherit'
                      }}
                    >
                      {option.id.toUpperCase()}
                    </motion.span>
                    <span className="flex-1 text-sm sm:text-base leading-relaxed">{option.text}</span>
                  </div>
                  
                  {/* Loading effect for selected answer */}
                  {isSelected && isWaitingForOpponent && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Waiting Indicator */}
        <AnimatePresence>
          {isWaitingForOpponent && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="inline-flex items-center space-x-3 bg-card/80 backdrop-blur-md rounded-lg px-4 sm:px-6 py-3 border border-border/20 shadow-lg">
                <div className="flex space-x-1">
                  <motion.div 
                    className="w-2 h-2 bg-primary rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div 
                    className="w-2 h-2 bg-primary rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div 
                    className="w-2 h-2 bg-primary rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
                <span className="text-card-foreground font-medium text-sm sm:text-base">
                  {selectedAnswer ? 'Processando resposta...' : 'Aguardando oponente...'}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}