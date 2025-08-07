import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";

import { CircularTimer } from "@/components/duels/circular-timer";
import { ArrowLeft, Trophy, Clock, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuizShuffle } from '@/hooks/use-quiz-shuffle';
import { useUnifiedSRS } from "@/hooks/use-unified-srs";
import { useQuizGamification } from "@/hooks/use-quiz-gamification";
import { useAdvancedQuizAudio } from "@/hooks/use-advanced-quiz-audio";
import { useCustomSounds } from "@/hooks/use-custom-sounds";
import { useI18n } from "@/hooks/use-i18n";
// BTZ Counter removido do Quiz Engine para simplificar UI
// import { LivesCounter } from "./lives-counter"; // Removido
import { BeetzAnimation } from "./beetz-animation";
import { StreakAnimation } from "./streak-animation";
// import { LifePurchaseBanner } from "./life-purchase-banner"; // Removido
import { QuizBTZCard } from "./quiz-btz-card";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/shared/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import victoryImage from "@/assets/victory-celebration.png";

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
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  // Estados de vida removidos para simplificar
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
    currentQuestion: currentQuestionText,
    currentCorrectAnswer,
    currentExplanation,
    earnedBTZ,
    handleCorrectAnswer,
    handleWrongAnswer,
    // handleUseLife removido
    hideBeetzAnimation,
    hideStreakAnimation,
    resetGamification,
    getQuizCompletion
  } = useQuizGamification();

  const { getDueQuestions, submitAnswer } = useUnifiedSRS();
  const { } = useAdvancedQuizAudio();
  const { shuffleQuestions } = useQuizShuffle();
  const { t } = useI18n();

  const handleContinue = () => {
    console.log('🔄 handleContinue called');
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setTimeLeft(30);
    } else {
      handleQuizComplete();
    }
  };

  // SIMPLIFIED - Just show timeout modal
  const handleTimeUp = async () => {
    const question = questions[currentIndex];
    if (!question) return;
    
    // SIMPLIFICADO - apenas marcar resposta como incorreta e mostrar modal
    setShowAnswer(true); // Para parar o timer
    setShowTimeoutModal(true);
    
    // Processar no background
    const answeredQuestion = {
      questionId: question.id,
      selectedAnswer: selectedAnswer || 'timeout',
      isCorrect: false,
      timeSpent: 30
    };
    
    setAnsweredQuestions(prev => [...prev, answeredQuestion]);
    await submitAnswer(question.id, false, 30);
    await handleWrongAnswer(question.question, question.correct_answer, question.explanation);
  };

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchQuestions();
    }
  }, [mode, questionsCount, user]);

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
          title: t('quizEngine.noQuestionsAvailable'),
          description: t('quizEngine.couldNotLoadQuestions'),
          variant: "destructive"
        });
        return;
      }
      
      // Embaralhar as opções de cada questão
      const shuffledQuestions = shuffleQuestions(fetchedQuestions);
      
      // Aplicar traduções usando o sistema i18n principal
      const translatedQuestions = shuffledQuestions.map(question => {
        const questionKey = question.semantic_key || question.id;
        const translatedQuestion = t(`quiz.questions.${questionKey}.question`, question.question);
        const translatedOptions = question.options.map((option, index) => 
          t(`quiz.questions.${questionKey}.options.${index}`, option)
        );
        const translatedCorrectAnswer = t(`quiz.questions.${questionKey}.correct`, question.correct_answer);
        const translatedExplanation = t(`quiz.questions.${questionKey}.explanation`, question.explanation);
        
        return {
          ...question,
          question: translatedQuestion,
          options: translatedOptions,
          correct_answer: translatedCorrectAnswer,
          explanation: translatedExplanation
        };
      });
      
      setQuestions(translatedQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: t('common.error'),
        description: t('quizEngine.couldNotLoadQuestions'),
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
    
    // Play victory sound
    const audio = new Audio('/audio/fireworks.mp3');
    audio.play().catch(console.error);
  };

  const handleOptionSelect = (option: string) => {
    if (showAnswer) return;
    setSelectedAnswer(option);
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || showAnswer) return;

    const question = questions[currentIndex];
    if (!question) return;

    const isCorrect = selectedAnswer === question.correct_answer;
    console.log("🎯 Quiz Submit:", { isCorrect, selectedAnswer, correctAnswer: question.correct_answer });
    
    // SIMPLIFICADO - sem vidas
    setShowAnswer(true); // Para parar o timer
    
    if (isCorrect) {
      console.log("✅ Resposta correta - chamando handleCorrectAnswer");
      setScore(prev => prev + 1);
      await handleCorrectAnswer();
      
      // Continuar automaticamente após delay mínimo
      setTimeout(() => {
        handleContinue();
      }, 1000);
    } else {
      // Para resposta errada, apenas processar e mostrar explicação
      await handleWrongAnswer(
        question.question,
        question.correct_answer,
        question.explanation
      );
    }

    const answeredQuestion = {
      questionId: question.id,
      selectedAnswer,
      isCorrect,
      timeSpent: 30 - timeLeft
    };

    setAnsweredQuestions(prev => [...prev, answeredQuestion]);
    await submitAnswer(question.id, isCorrect, 30 - timeLeft);
  };


  // handleLifeDecision removido - sem vidas

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

   const handleTimeoutContinue = () => {
    setShowTimeoutModal(false);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setTimeLeft(30);
    } else {
      handleQuizComplete();
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
    // Estados de vida removidos
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
      case 'duel': return t('quizEngine.duelQuiz');
      case 'tournament': return t('quizEngine.tournamentQuiz');
      case 'daily_mission': return t('quizEngine.dailyMission');
      case 'district': return t('quizEngine.districtQuiz');
      default: return t('quizEngine.soloQuiz');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('quizEngine.loadingQuestions')}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    const isSuccess = percentage >= 70;
    
    // Trigger confetti and sound for victory
    if (isSuccess) {
      fireConfetti();
    }
    
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
              src={isSuccess ? victoryImage : "/src/assets/failure-animation.png"}
              alt={isSuccess ? "Celebração" : "Falha"}
              className="h-32 w-32 mx-auto mb-4 object-contain rounded-full"
            />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">
            {isSuccess ? t('quizEngine.congratulations') : t('quizEngine.lost')}
          </h1>
          
          <div className="mb-6">
            <div className="text-4xl font-bold text-primary mb-2">
              {score}/{questions.length}
            </div>
            <p className="text-muted-foreground">
              {percentage}% {t('quizEngine.accuracy')}
            </p>
          </div>

          <div className="space-y-4">
            {isSuccess ? (
              <Button 
                onClick={getContinueAction()} 
                className="w-full" 
                size="lg"
              >
                {mode === 'solo' ? t('quizEngine.nextQuiz') : t('quizEngine.continue')}
              </Button>
            ) : (
              <Button onClick={resetQuiz} className="w-full" size="lg">
                {t('quizEngine.tryAgain')}
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => navigate(getBackRoute())} 
              className="w-full"
            >
              {t('quizEngine.back')}
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
      {/* Header com três colunas */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="grid grid-cols-3 items-center">
            {/* Esquerda: Botão Voltar */}
            <div className="flex justify-start">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(getBackRoute())}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('quizEngine.back')}
              </Button>
            </div>
            
            {/* Centro: Informações do Quiz */}
            <div className="text-center">
              <div className="text-sm sm:text-lg font-bold text-primary">
                {t('quizEngine.question', { current: currentIndex + 1, total: questions.length })}
              </div>
              <div className="text-sm sm:text-lg text-muted-foreground">
                {getModeTitle()}
              </div>
            </div>
            
            {/* Direita: Vazio para balanceamento */}
            <div></div>
          </div>
        </div>
      </div>

      {/* Main Quiz Content */}
      <div className="container mx-auto px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* BTZ Card e Timer */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              <QuizBTZCard />
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

          {/* Question Card */}
          <Card className="mb-6">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-primary font-semibold text-xl sm:text-2xl leading-relaxed mb-6">
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
                        "w-full p-3 sm:p-4 text-left transition-all duration-300 min-h-[45px] leading-relaxed group hover:shadow-lg",
                        "text-sm sm:text-base break-words hyphens-auto",
                        selectedAnswer === option
                          ? "bg-primary text-primary-foreground border-primary scale-105 shadow-lg"
                          : "bg-card border-border hover:scale-[1.02] hover:border-primary/50",
                        !selectedAnswer && !showAnswer ? "hover:bg-gradient-to-r hover:from-[#adff2f]/20 hover:to-[#adff2f]/10 hover:text-black hover:border-[#adff2f]" : "",
                        showAnswer && option === currentQuestion.correct_answer
                          ? "bg-green-500 text-white border-green-500 scale-105 shadow-green-200/50 shadow-lg"
                          : showAnswer && selectedAnswer === option && option !== currentQuestion.correct_answer
                          ? "bg-red-500 text-white border-red-500 scale-105 shadow-red-200/50 shadow-lg"
                          : ""
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="flex-1 pr-2 text-left overflow-wrap-anywhere">{option}</span>
                        {showAnswer && (
                          <span className="text-lg flex-shrink-0">
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
              className="w-full transition-all duration-300 hover:scale-[1.02] shadow-lg"
              size="lg"
            >
              {selectedAnswer ? t('quizEngine.confirmAnswer') : t('quizEngine.selectOption')}
            </Button>
          )}

          {/* Card de explicação removido - agora usa modal unificado */}
        </div>
      </div>

      {/* Gamification Overlays */}
      <BeetzAnimation
        isVisible={showBeetzAnimation}
        amount={earnedBTZ}
        onComplete={hideBeetzAnimation}
      />


      <StreakAnimation
        isVisible={showStreakAnimation}
        onComplete={hideStreakAnimation}
      />

      {/* LifePurchaseBanner removido - sem vidas */}

      {/* Modal Unificado - Apenas para Timeout e Resposta Incorreta */}
      <AlertDialog open={showTimeoutModal || (showAnswer && selectedAnswer !== currentQuestion?.correct_answer)} onOpenChange={(open) => {
        if (!open) {
          setShowTimeoutModal(false);
          if (showAnswer) {
            handleContinue();
          }
        }
      }}>
        <AlertDialogContent className="mx-auto max-w-xs sm:max-w-lg rounded-2xl sm:rounded-lg left-1/2 transform -translate-x-1/2">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-base sm:text-lg">
              {showTimeoutModal ? `⏰ ${t('quizEngine.timeUp')}` : 
               selectedAnswer === currentQuestion?.correct_answer ? `✅ ${t('quizEngine.correct')}` : `❌ ${t('quizEngine.incorrect')}`}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center space-y-2 sm:space-y-4">
              {(showTimeoutModal || (showAnswer && selectedAnswer !== currentQuestion?.correct_answer)) && (
                <div className="text-sm sm:text-lg font-semibold text-white">
                  {t('quizEngine.correctAnswer')}<span style={{color: '#adff2f'}}>{currentQuestion?.correct_answer}</span>
                </div>
              )}
              {currentQuestion?.explanation && (
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {currentQuestion.explanation}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={showTimeoutModal ? handleTimeoutContinue : handleContinue} className="w-full">
              {t('quizEngine.continue')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
