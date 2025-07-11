import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { CircularTimer } from "@/components/duels/circular-timer";
import { ArrowLeft, Trophy, Clock, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnifiedSRS } from "@/hooks/use-unified-srs";
import { useQuizGamification } from "@/hooks/use-quiz-gamification";
import { useAdvancedQuizAudio } from "@/hooks/use-advanced-quiz-audio";
import { useCustomSounds } from "@/hooks/use-custom-sounds";
import { BTZCounter } from "./btz-counter";
import { LivesCounter } from "./lives-counter";
import { BeetzAnimation } from "./beetz-animation";
import { StreakAnimation } from "./streak-animation";
import { LifePurchaseBanner } from "./life-purchase-banner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  category: string;
  difficulty: string;
}

interface QuizEngineProps {
  mode: 'solo' | 'duel' | 'tournament' | 'daily_mission' | 'district';
  topicId?: string;
  opponentId?: string;
  tournamentId?: string;
  missionId?: string;
  districtId?: string;
  onComplete?: (results: any) => void;
  questionsCount?: number;
}

// Agora usa o hook unificado

export function QuizEngine({
  mode = 'solo',
  questionsCount = 7,
  opponentId,
  tournamentId,
  missionId,
  districtId,
  onComplete
}: QuizEngineProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showLifeBanner, setShowLifeBanner] = useState(false);
  const [pendingWrongAnswer, setPendingWrongAnswer] = useState<{
    question: string;
    correctAnswer: string;
    explanation?: string;
  } | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Array<{
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
  }>>([]);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { playCountdownSound } = useCustomSounds();
  
  const {
    streak,
    totalBTZ,
    currentMultiplier,
    showBeetzAnimation,
    showStreakAnimation,
    showVideoExplanation,
    currentVideoUrl,
    currentQuestion: currentQuestionText,
    currentCorrectAnswer,
    currentExplanation,
    handleCorrectAnswer,
    handleWrongAnswer,
    handleUseLife,
    hideBeetzAnimation,
    hideStreakAnimation,
    hideVideoExplanation,
    resetGamification,
    getQuizCompletion
  } = useQuizGamification();

  const { getDueQuestions, submitAnswer } = useUnifiedSRS();
  const { } = useAdvancedQuizAudio();

  const handleContinue = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setTimeLeft(30);
    } else {
      handleQuizComplete();
    }
  };

  // Controle do timer via CircularTimer apenas
  const handleTimeUp = async () => {
    if (showAnswer || !questions[currentIndex]) return;
    
    const question = questions[currentIndex];
    
    // Marcar como respondida incorretamente por timeout
    const answeredQuestion = {
      questionId: question.id,
      selectedAnswer: selectedAnswer || 'timeout',
      isCorrect: false,
      timeSpent: 30
    };
    
    setAnsweredQuestions(prev => [...prev, answeredQuestion]);
    await submitAnswer(question.id, false, 30);
    
    // Processar resposta errada
    await handleWrongAnswer(question.question, question.correct_answer, question.explanation);
    
    setShowAnswer(true);
    
    // Mostrar resultado e aguardar ação do usuário
    setTimeout(() => {
      // Auto-advance apenas se não há banner de vida
      if (!showLifeBanner) {
        handleContinue();
      }
    }, 2000);
  };

  useEffect(() => {
    fetchUserProfile();
    fetchQuestions();
  }, [mode, questionsCount]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    setUserProfile(profile);
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      
      let difficulty = 'easy';
      if (userProfile?.level >= 10) difficulty = 'medium';
      if (userProfile?.level >= 20) difficulty = 'hard';

      const fetchedQuestions = await getDueQuestions(
        difficulty,
        questionsCount,
        answeredQuestions.map(q => q.questionId)
      );
      
      if (fetchedQuestions.length === 0) {
        toast({
          title: "Sem questões disponíveis",
          description: "Não encontramos questões para este modo.",
          variant: "destructive"
        });
        return;
      }
      
      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Erro ao carregar questões",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleOptionSelect = (option: string) => {
    if (showAnswer) return;
    setSelectedAnswer(option);
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || showAnswer) return;

    const question = questions[currentIndex];
    if (!question) return;

    setShowAnswer(true);

    const isCorrect = selectedAnswer === question.correct_answer;
    
    // Update score
    if (isCorrect) {
      setScore(prev => prev + 1);
      await handleCorrectAnswer();
    } else {
      const wrongResult = await handleWrongAnswer(
        question.question,
        question.correct_answer,
        question.explanation
      );

      // Se pode usar vida, mostrar opção
      if (wrongResult?.canUseLife) {
        setPendingWrongAnswer({
          question: question.question,
          correctAnswer: question.correct_answer,
          explanation: question.explanation
        });
        setShowLifeBanner(true);
        return; // Não avança ainda
      }
    }

    const answeredQuestion = {
      questionId: question.id,
      selectedAnswer,
      isCorrect,
      timeSpent: 30 - timeLeft
    };

    setAnsweredQuestions(prev => [...prev, answeredQuestion]);

    // Submit to SRS system
    await submitAnswer(question.id, isCorrect, 30 - timeLeft);
  };


  const handleLifeDecision = async (useLife: boolean) => {
    setShowLifeBanner(false);
    
    if (useLife && pendingWrongAnswer) {
      const success = await handleUseLife();
      if (success) {
        // Continuar como se fosse correto
        const answeredQuestion = {
          questionId: questions[currentIndex].id,
          selectedAnswer: selectedAnswer!,
          isCorrect: true, // Tratado como correto devido à vida
          timeSpent: 30 - timeLeft
        };
        setAnsweredQuestions(prev => [...prev, answeredQuestion]);
        await submitAnswer(questions[currentIndex].id, true, 30 - timeLeft);
      }
    } else if (pendingWrongAnswer) {
      // Processar como erro normal
      const answeredQuestion = {
        questionId: questions[currentIndex].id,
        selectedAnswer: selectedAnswer!,
        isCorrect: false,
        timeSpent: 30 - timeLeft
      };
      setAnsweredQuestions(prev => [...prev, answeredQuestion]);
      await submitAnswer(questions[currentIndex].id, false, 30 - timeLeft);
    }

    setPendingWrongAnswer(null);
    
    // Continuar para próxima pergunta usando handleContinue
    setTimeout(() => {
      handleContinue();
    }, 1500);
  };

  const handleQuizComplete = async () => {
    const results = await getQuizCompletion(score, questions.length);
    setShowResults(true);
    
    if (onComplete) {
      onComplete({
        score,
        totalQuestions: questions.length,
        percentage: Math.round((score / questions.length) * 100),
        mode,
        ...results
      });
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setTimeLeft(30);
    setAnsweredQuestions([]);
    resetGamification();
    fetchQuestions();
  };

  const startNewQuiz = () => {
    // Reset all state for a completely new quiz
    setCurrentIndex(0);
    setScore(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setTimeLeft(30);
    setAnsweredQuestions([]);
    setShowLifeBanner(false);
    setPendingWrongAnswer(null);
    resetGamification();
    
    // Fetch new questions
    fetchQuestions();
  };

  const getBackRoute = () => {
    switch (mode) {
      case 'duel': return '/duels';
      case 'tournament': return `/tournament/${tournamentId}`;
      case 'daily_mission': return '/missions';
      case 'district': return `/satoshi-city/district/${districtId}`;
      default: return '/dashboard';
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'duel': return 'Duelo Quiz';
      case 'tournament': return 'Torneio Quiz';
      case 'daily_mission': return 'Missão Diária';
      case 'district': return 'Quiz do Distrito';
      default: return 'Quiz Solo';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando questões...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    const isSuccess = percentage >= 60;
    
    const getContinueAction = () => {
      // Para modo solo, sempre iniciar novo quiz
      if (mode === 'solo') {
        return startNewQuiz;
      }
      
      // Para outros modos, navegar para a página apropriada
      switch (mode) {
        case 'daily_mission':
          return () => navigate('/missions');
        case 'district':
          return () => navigate(`/satoshi-city/district/${districtId}`);
        case 'tournament':
          return () => navigate(`/tournament/${tournamentId}`);
        default:
          return startNewQuiz;
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-lg p-8 text-center">
          {/* Success or Failure Animation */}
          <div className="mb-6">
            <img 
              src={isSuccess ? "/src/assets/success-animation.png" : "/src/assets/failure-animation.png"}
              alt={isSuccess ? "Celebração" : "Falha"}
              className="h-32 w-32 mx-auto mb-4 object-contain"
            />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">
            {isSuccess ? "Parabéns!" : "Perdeu!"}
          </h1>
          
          <div className="mb-6">
            <div className="text-4xl font-bold text-primary mb-2">
              {score}/{questions.length}
            </div>
            <p className="text-muted-foreground">
              {percentage}% de acertos
            </p>
          </div>

          <div className="space-y-4">
            {isSuccess ? (
              <Button 
                onClick={getContinueAction()} 
                className="w-full" 
                size="lg"
              >
                {mode === 'solo' ? 'Próximo Quiz' : 'Continuar'}
              </Button>
            ) : (
              <Button onClick={resetQuiz} className="w-full" size="lg">
                Tentar Novamente
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => navigate(getBackRoute())} 
              className="w-full"
            >
              Voltar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Sem questões disponíveis</h1>
          <p className="text-muted-foreground mb-6">
            Não conseguimos carregar questões no momento.
          </p>
          <Button onClick={() => navigate(getBackRoute())}>
            Voltar
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
      {/* Header reorganizado */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col gap-3">
            {/* Primeira linha: Botão voltar */}
            <div className="flex justify-start">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(getBackRoute())}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>
            
            {/* Segunda linha: BTZ centralizado */}
            <div className="flex justify-center">
              <BTZCounter />
            </div>
            
            {/* Terceira linha: Vidas centralizadas */}
            <div className="flex justify-center">
              <LivesCounter />
            </div>
          </div>
        </div>
      </div>

      {/* Main Quiz Content */}
      <div className="container mx-auto px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Header com informações e timer */}
          <div className="mb-4 sm:mb-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="text-lg sm:text-2xl font-bold text-primary mb-2">
                Pergunta {currentIndex + 1} de {questions.length}
              </div>
              <div className="text-sm sm:text-lg text-muted-foreground mb-2 hidden sm:block">
                {getModeTitle()}
              </div>
              {/* Timer circular com som de countdown */}
              <div className="flex justify-center">
                <CircularTimer
                  duration={30}
                  isActive={!showAnswer && !loading}
                  onTimeUp={handleTimeUp}
                  onTick={(newTimeLeft) => setTimeLeft(newTimeLeft)}
                  onCountdown={playCountdownSound}
                  enableCountdownSound={true}
                  size={96}
                  className="shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* Question Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6 leading-relaxed">
                {currentQuestion.question}
              </h2>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentQuestion.correct_answer;
                  const isWrong = showAnswer && isSelected && !isCorrect;
                  const shouldShowCorrect = showAnswer && isCorrect;
                  
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleOptionSelect(option)}
                      disabled={showAnswer}
                      className={cn(
                        "w-full p-4 text-left transition-all duration-200",
                        selectedAnswer === option
                          ? "bg-primary text-primary-foreground border-primary scale-105"
                          : "bg-card border-border hover:scale-102",
                        !selectedAnswer && !showAnswer ? "hover:bg-[#adff2f] hover:text-black" : "",
                        showAnswer && option === currentQuestion.correct_answer
                          ? "bg-green-500 text-white border-green-500 scale-105"
                          : showAnswer && selectedAnswer === option && option !== currentQuestion.correct_answer
                          ? "bg-red-500 text-white border-red-500 scale-105"
                          : ""
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {showAnswer && (
                          <span className="text-lg">
                            {isCorrect ? '✅' : isSelected ? '❌' : ''}
                          </span>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          {!showAnswer && (
            <Button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className="w-full"
              size="lg"
            >
              {selectedAnswer ? 'Confirmar Resposta' : 'Selecione uma opção'}
            </Button>
          )}

          {/* Answer Result and Continue Button */}
          {showAnswer && (
            <Card className="mt-4">
              <CardContent className="p-4 text-center">
                <div className={`mb-4 ${selectedAnswer === currentQuestion.correct_answer ? 'text-green-600' : 'text-red-600'}`}>
                  <h3 className="text-xl font-bold mb-2">
                    {selectedAnswer === currentQuestion.correct_answer ? '✅ Correto!' : '❌ Incorreto!'}
                  </h3>
                  {selectedAnswer !== currentQuestion.correct_answer && (
                    <p className="text-gray-700 mb-2">
                      Resposta correta: <strong>{currentQuestion.correct_answer}</strong>
                    </p>
                  )}
                </div>
                
                {currentQuestion.explanation && (
                  <div className="mb-4 p-3 bg-muted rounded text-left">
                    <h4 className="font-semibold mb-2">Explicação:</h4>
                    <p className="text-muted-foreground">{currentQuestion.explanation}</p>
                  </div>
                )}
                
                {!showLifeBanner && (
                  <Button 
                    onClick={handleContinue}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                    size="lg"
                  >
                    Continuar
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Gamification Overlays */}
      <BeetzAnimation
        isVisible={showBeetzAnimation}
        amount={currentMultiplier}
        onComplete={hideBeetzAnimation}
      />

      {showVideoExplanation && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardContent className="p-6">
              <h3 className="font-bold mb-2">💡 Explicação</h3>
              <p className="mb-4">{currentQuestionText}</p>
              <div className="mb-4">
                <strong>Resposta correta:</strong> {currentCorrectAnswer}
              </div>
              {currentExplanation && (
                <div className="mb-4">
                  <strong>Por quê:</strong> {currentExplanation}
                </div>
              )}
              <Button onClick={hideVideoExplanation} className="w-full">
                Continuar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <StreakAnimation
        isVisible={showStreakAnimation}
        onComplete={hideStreakAnimation}
      />

      <LifePurchaseBanner
        isVisible={showLifeBanner}
        onClose={() => handleLifeDecision(false)}
        onPurchase={() => handleLifeDecision(true)}
        onViewStore={() => {
          setShowLifeBanner(false);
          // Redirect to store - implementar navegação
        }}
      />
    </div>
  );
}