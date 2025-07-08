import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useEnhancedQuiz } from "@/hooks/use-enhanced-quiz";
import { useDailyMissions } from "@/hooks/use-daily-missions";
import { Clock, Zap, Target, Star, Gift } from "lucide-react";
import confetti from "canvas-confetti";

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface EnhancedQuizCardProps {
  questions: any[];
  onComplete?: (results: any) => void;
  className?: string;
}

export function EnhancedQuizCard({ questions, onComplete, className }: EnhancedQuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showPowerUps, setShowPowerUps] = useState(false);

  const {
    quizState,
    userPowerUps,
    isQuizActive,
    startQuiz,
    usePowerUp,
    submitAnswer,
    nextQuestion,
    finishQuiz
  } = useEnhancedQuiz(questions);

  const { completeQuizMission } = useDailyMissions();

  const currentQuestion = questions[quizState.currentQuestion];

  useEffect(() => {
    if (quizState.timeLeft === 0 && isQuizActive && !showResult) {
      handleAnswer(selectedAnswer || "");
    }
  }, [quizState.timeLeft, isQuizActive, showResult, selectedAnswer]);

  // Combo effects
  useEffect(() => {
    if (quizState.combo > 0 && quizState.combo % 5 === 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f5ff', '#ff0080', '#ffff00']
      });
    }
  }, [quizState.combo]);

  const handleAnswer = async (answer: string) => {
    if (showResult || !isQuizActive) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const result = await submitAnswer(answer);
    
    // Update daily missions progress
    completeQuizMission(result?.isCorrect || false);
    
    if (result?.isCorrect && result.newCombo > 1) {
      // Show combo effect
      const comboElement = document.querySelector('.combo-counter');
      if (comboElement) {
        comboElement.classList.add('animate-pulse');
        setTimeout(() => comboElement.classList.remove('animate-pulse'), 1000);
      }
    }

    setTimeout(() => {
      if (quizState.currentQuestion < questions.length - 1) {
        nextQuestion();
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        finishQuiz();
        onComplete?.(quizState);
      }
    }, 2000);
  };

  const handlePowerUpUse = async (powerUpId: string, type: string) => {
    const success = await usePowerUp(powerUpId, type);
    if (success) {
      setShowPowerUps(false);
    }
  };

  if (!isQuizActive && quizState.currentQuestion === 0) {
    return (
      <Card className={cn("max-w-4xl mx-auto cyber-card", className)}>
        <CardHeader className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            🎮 CYBER QUIZ INICIANDO...
          </h2>
          <p className="text-muted-foreground">
            Prepare-se para hackear conhecimento no metaverso financeiro!
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-500/30">
                <Target className="h-8 w-8 mx-auto mb-2 text-cyan-400" />
                <p className="font-semibold">Power-ups Disponíveis</p>
                <p className="text-sm text-muted-foreground">{userPowerUps.length} itens</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <Gift className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                <p className="font-semibold">Loot Possível</p>
                <p className="text-sm text-muted-foreground">Data Shards, Artifacts</p>
              </div>
            </div>
            
            <Button 
              onClick={startQuiz}
              className="w-full text-lg py-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold"
            >
              🚀 INICIAR HACK SEQUENCE
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) return null;

  const timePercentage = (quizState.timeLeft / 30) * 100;
  const progressPercentage = ((quizState.currentQuestion + 1) / questions.length) * 100;

  return (
    <Card className={cn("max-w-4xl mx-auto cyber-card relative overflow-hidden", className)}>
      {/* Cyber Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500"></div>
      </div>

      <CardHeader className="relative">
        {/* HUD Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-cyan-500 text-cyan-400">
              NODE {quizState.currentQuestion + 1}/{questions.length}
            </Badge>
            <div className={cn("combo-counter flex items-center gap-2", 
              quizState.combo > 0 && "text-yellow-400"
            )}>
              <Star className="h-4 w-4" />
              <span className="font-bold">COMBO: {quizState.combo}</span>
              {quizState.combo > 1 && <span className="text-xs">x{Math.floor(quizState.combo / 2) + 1}</span>}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={cn("flex items-center gap-2", 
              quizState.timeLeft <= 10 && "text-red-400 animate-pulse"
            )}>
              <Clock className="h-4 w-4" />
              <span className="font-mono font-bold">{quizState.timeLeft}s</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPowerUps(!showPowerUps)}
              className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
            >
              <Zap className="h-4 w-4 mr-1" />
              POWER-UPS ({userPowerUps.filter(p => p.quantity > 0).length})
            </Button>
          </div>
        </div>

        {/* Progress and Time Bars */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>PROGRESS</span>
            <span>NEURAL SYNC</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <Progress 
            value={timePercentage} 
            className={cn("h-1", timePercentage <= 33 && "bg-red-500/20")}
          />
        </div>

        {/* Power-ups Panel */}
        {showPowerUps && (
          <div className="absolute top-full left-0 right-0 z-10 bg-background/95 backdrop-blur border-x border-b rounded-b-lg p-4">
            <h3 className="font-bold mb-3 text-cyan-400">🔋 NANO BOOSTERS AVAILABLE</h3>
            <div className="grid grid-cols-2 gap-2">
              {userPowerUps.filter(p => p.quantity > 0).map((powerUp) => (
                <Button
                  key={powerUp.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePowerUpUse(powerUp.power_up.id, powerUp.power_up.type)}
                  className="text-left justify-start border-purple-500/50 hover:bg-purple-500/20"
                >
                  <span className="mr-2">{powerUp.quantity}x</span>
                  <div>
                    <div className="font-semibold text-xs">{powerUp.power_up.name}</div>
                    <div className="text-xs opacity-70">{powerUp.power_up.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Score Display */}
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            HACK SCORE: {quizState.score.toLocaleString()}
          </div>
          {quizState.maxCombo > 1 && (
            <div className="text-sm text-yellow-400">
              MAX COMBO: {quizState.maxCombo} 🔥
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Question */}
        <div className="mb-6">
          <Badge variant="secondary" className="mb-3">
            {currentQuestion.category} • {currentQuestion.difficulty}
          </Badge>
          <h2 className="text-xl font-bold leading-relaxed">
            🎯 {currentQuestion.question}
          </h2>
        </div>
        
        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options?.map((option: string, index: number) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQuestion.correct_answer;
            const isEliminated = quizState.eliminatedOptions.includes(option);
            
            if (isEliminated) {
              return (
                <div key={index} className="opacity-30 line-through">
                  <Button
                    variant="outline"
                    disabled
                    className="w-full text-left justify-start min-h-[48px] text-wrap whitespace-normal p-4 border-red-500/30"
                  >
                    ❌ {option}
                  </Button>
                </div>
              );
            }

            let buttonClass = "";
            if (showResult && isSelected) {
              buttonClass = isCorrect 
                ? "bg-green-500 border-green-500 text-white animate-pulse" 
                : "bg-red-500 border-red-500 text-white";
            } else if (showResult && isCorrect) {
              buttonClass = "bg-green-500 border-green-500 text-white";
            }
            
            return (
              <Button
                key={index}
                variant="outline"
                className={cn(
                  "w-full text-left justify-start min-h-[48px] text-wrap whitespace-normal p-4 transition-all duration-300 hover:scale-105",
                  "border-cyan-500/30 hover:border-cyan-500 hover:bg-cyan-500/10",
                  buttonClass
                )}
                onClick={() => handleAnswer(option)}
                disabled={showResult}
              >
                <span className="mr-3 font-mono">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </Button>
            );
          })}
        </div>

        {/* Explanation */}
        {showResult && currentQuestion.explanation && (
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-400">💡 INTEL BRIEFING:</span>
            </div>
            <p className="text-sm">{currentQuestion.explanation}</p>
          </div>
        )}

        {/* Loot Notification */}
        {showResult && quizState.lootEarned.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 animate-bounce">
            <div className="text-center">
              <Gift className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
              <p className="font-bold text-yellow-400">🎁 LOOT ACQUIRED!</p>
              <p className="text-sm">{quizState.lootEarned[quizState.lootEarned.length - 1]?.name}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}