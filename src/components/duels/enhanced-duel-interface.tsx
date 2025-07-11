import { useState, useEffect } from "react";
import { CircularTimer } from "./circular-timer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AvatarDisplayUniversal } from "@/components/avatar-display-universal";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useCustomSounds } from "@/hooks/use-custom-sounds";

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
  onAnswer: (optionId: string) => void;
  playerAvatar: any;
  opponentAvatar: any;
  playerScore: number;
  opponentScore: number;
  playerNickname: string;
  opponentNickname: string;
  timeLeft: number;
  isWaitingForOpponent?: boolean;
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
  timeLeft,
  isWaitingForOpponent = false
}: EnhancedDuelInterfaceProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const { playCountdownSound } = useCustomSounds();

  const question = questions[currentQuestion - 1];
  const progress = ((currentQuestion - 1) / questions.length) * 100;

  useEffect(() => {
    // Reset state when question changes
    setSelectedAnswer(null);
    setShowResult(false);
    setHasAnswered(false);
  }, [currentQuestion]);

  const handleAnswer = (optionId: string) => {
    if (hasAnswered) return;
    
    setSelectedAnswer(optionId);
    setHasAnswered(true);
    
    const selectedOption = question.options.find(opt => opt.id === optionId);
    const correct = selectedOption?.isCorrect || false;
    setIsCorrect(correct);
    setShowResult(true);
    
    // Submit answer after brief delay to show result
    setTimeout(() => {
      onAnswer(optionId);
    }, 1500);
  };

  const handleTimeUp = () => {
    if (!hasAnswered) {
      setHasAnswered(true);
      setShowResult(true);
      setIsCorrect(false);
      setTimeout(() => {
        onAnswer(''); // Submit empty answer for timeout
      }, 1000);
    }
  };

  if (!question) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Player vs Opponent */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <AvatarDisplayUniversal
              avatarName={playerAvatar?.name}
              avatarUrl={playerAvatar?.image_url}
              nickname={playerNickname}
              size="md"
              className="border-2 border-primary"
            />
            <div>
              <p className="font-semibold text-foreground">{playerNickname}</p>
              <p className="text-2xl font-bold text-primary">{playerScore}</p>
            </div>
          </div>

          <div className="text-center">
            <CircularTimer
              duration={30}
              isActive={!hasAnswered && !isWaitingForOpponent}
              onTimeUp={handleTimeUp}
              onCountdown={playCountdownSound}
              size={80}
              className="mx-auto mb-2"
            />
            <p className="text-sm text-muted-foreground">
              {currentQuestion}/{questions.length}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-semibold text-foreground">{opponentNickname}</p>
              <p className="text-2xl font-bold text-secondary">{opponentScore}</p>
            </div>
            <AvatarDisplayUniversal
              avatarName={opponentAvatar?.name}
              avatarUrl={opponentAvatar?.image_url}
              nickname={opponentNickname}
              size="md"
              className="border-2 border-secondary"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-8">
          <motion.div
            className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Question Card */}
        <Card className="mb-6 bg-card/80 backdrop-blur-sm border-2">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-center mb-8 text-foreground">
              {question.question}
            </h2>

            {isWaitingForOpponent ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-spin" />
                <p className="text-lg text-muted-foreground">
                  Aguardando oponente responder...
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {question.options.map((option) => (
                  <motion.div
                    key={option.id}
                    whileHover={!hasAnswered ? { scale: 1.02 } : {}}
                    whileTap={!hasAnswered ? { scale: 0.98 } : {}}
                  >
                    <Button
                      onClick={() => handleAnswer(option.id)}
                      disabled={hasAnswered}
                      variant={
                        showResult && selectedAnswer === option.id
                          ? option.isCorrect ? "default" : "destructive"
                          : showResult && option.isCorrect
                          ? "default"
                          : "outline"
                      }
                      className={`w-full p-6 text-left h-auto justify-start relative transition-all duration-300 ${
                        showResult && selectedAnswer === option.id
                          ? option.isCorrect
                            ? "bg-green-500/20 border-green-500 text-green-700 dark:text-green-300"
                            : "bg-red-500/20 border-red-500 text-red-700 dark:text-red-300"
                          : showResult && option.isCorrect
                          ? "bg-green-500/20 border-green-500 text-green-700 dark:text-green-300"
                          : ""
                      }`}
                    >
                      <span className="text-lg font-medium mr-4">
                        {option.id.toUpperCase()})
                      </span>
                      <span className="text-lg">{option.text}</span>
                      
                      {showResult && (
                        <AnimatePresence>
                          {selectedAnswer === option.id ? (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2"
                            >
                              {option.isCorrect ? (
                                <CheckCircle className="h-6 w-6 text-green-500" />
                              ) : (
                                <XCircle className="h-6 w-6 text-red-500" />
                              )}
                            </motion.div>
                          ) : option.isCorrect ? (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2"
                            >
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      )}
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* VS Indicator */}
        <div className="text-center">
          <div className="inline-flex items-center gap-4 bg-card/50 backdrop-blur-sm rounded-full px-6 py-3 border">
            <span className="text-primary font-bold">{playerNickname}</span>
            <span className="text-xl font-bold text-muted-foreground">VS</span>
            <span className="text-secondary font-bold">{opponentNickname}</span>
          </div>
        </div>
      </div>
    </div>
  );
}