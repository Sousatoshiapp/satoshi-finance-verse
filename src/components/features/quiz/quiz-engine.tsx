import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

import { CircularTimer } from "@/components/duels/circular-timer";
import { ArrowLeft, Trophy, Clock, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdaptiveQuizEngine } from '@/hooks/use-adaptive-quiz-engine';
import { useQuizGamification } from "@/hooks/use-quiz-gamification";
import { useAdvancedQuizAudio } from "@/hooks/use-advanced-quiz-audio";
import { useCustomSounds } from "@/hooks/use-custom-sounds";
import { useI18n } from "@/hooks/use-i18n";
import { useQuizStreak } from "@/hooks/use-quiz-streak";
// BTZ Counter removido do Quiz Engine para simplificar UI
// import { LivesCounter } from "./lives-counter"; // Removido
import { BeetzAnimation } from "./beetz-animation";
import { StreakAnimation } from "./streak-animation";
import { QuizBTZCard } from "./quiz-btz-card";
import { AdaptiveQuizIndicator } from "@/components/quiz/adaptive-quiz-indicator";
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
  category?: string;
  difficulty?: 'facil' | 'medio' | 'dificil' | 'muito_dificil';
  topicId?: string;
  opponentId?: string;
  tournamentId?: string;
  missionId?: string;
  districtId?: string;
  onComplete?: (results: any) => void;
  questionsCount?: number;
  useBasicMode?: boolean; // MODO BÁSICO - bypassa SRS restritivo
}

// Agora usa o hook unificado

export function QuizEngine({
  mode = 'solo',
  category,
  difficulty,
  questionsCount = 10,
  opponentId,
  tournamentId,
  missionId,
  districtId,
  onComplete,
  useBasicMode = false
}: QuizEngineProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
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
  const isMobile = useIsMobile();

  // 🚀 NOVO SISTEMA ADAPTATIVO
  const adaptiveEngine = useAdaptiveQuizEngine({
    mode,
    category,
    difficulty,
    questionsCount,
    enableDifficultyAdjustment: !useBasicMode, // Adaptativo quando não for básico
    enableRandomization: true // Sempre randomizar
  });
  
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

  const { } = useAdvancedQuizAudio();
  const { t } = useI18n();
  const { updateStreakAfterQuiz } = useQuizStreak();

  // Aliases para compatibilidade com código existente
  const questions = adaptiveEngine.session?.questions || [];
  const currentIndex = adaptiveEngine.session?.currentIndex || 0;
  const loading = adaptiveEngine.loading;

  const handleContinue = () => {
    console.log('🔄 handleContinue called');
    const hasNext = adaptiveEngine.nextQuestion();
    
    if (hasNext) {
      setSelectedAnswer(null);
      setShowAnswer(false);
      setTimeLeft(30);
    } else {
      handleQuizComplete();
    }
  };

  const handleTimeUp = async () => {
    const question = adaptiveEngine.currentQuestion;
    if (!question) return;
    
    setShowAnswer(true);
    setShowTimeoutModal(true);
    
    const answeredQuestion = {
      questionId: question.id,
      selectedAnswer: selectedAnswer || 'timeout',
      isCorrect: false,
      timeSpent: 30
    };
    
    setAnsweredQuestions(prev => [...prev, answeredQuestion]);
    
    // Processar com sistema adaptativo
    await adaptiveEngine.processAnswer(selectedAnswer || 'timeout', 30);
    await handleWrongAnswer(question.question, question.correct_answer, question.explanation);
  };

  useEffect(() => {
    if (user) {
      initializeQuiz();
    }
  }, [mode, questionsCount, user]);

  const initializeQuiz = async () => {
    try {
      console.log('🚀 [QUIZ DEBUG] Inicializando quiz:', {
        mode,
        category,
        difficulty,
        questionsCount,
        useBasicMode
      });
      await adaptiveEngine.initializeQuizSession();
      console.log('✅ Quiz adaptativo inicializado');
      console.log('📊 [QUIZ DEBUG] Questões carregadas:', {
        totalQuestions: questions.length,
        firstQuestion: questions[0]?.category,
        allCategories: [...new Set(questions.map(q => q.category))]
      });
    } catch (error) {
      console.error('❌ Erro ao inicializar quiz:', error);
      toast({
        title: t('common.error'),
        description: t('quizEngine.couldNotLoadQuestions'),
        variant: "destructive"
      });
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

    const question = adaptiveEngine.currentQuestion;
    if (!question) return;

    const isCorrect = selectedAnswer === question.correct_answer;
    const responseTime = 30 - timeLeft;
    
    console.log("🎯 Quiz Submit:", { isCorrect, selectedAnswer, correctAnswer: question.correct_answer });
    
    setShowAnswer(true);
    
    // Processar com sistema adaptativo
    const result = await adaptiveEngine.processAnswer(selectedAnswer, responseTime * 1000);
    
    if (isCorrect) {
      console.log("✅ Resposta correta - chamando handleCorrectAnswer");
      setScore(prev => prev + 1);
      await handleCorrectAnswer();
      
      // Continuar automaticamente após delay
      setTimeout(() => {
        handleContinue();
      }, 1000);
    } else {
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
      timeSpent: responseTime
    };

    setAnsweredQuestions(prev => [...prev, answeredQuestion]);
    
    // Log de ajuste de dificuldade
    if (result?.adjustedDifficulty) {
      console.log('🎚️ Dificuldade ajustada automaticamente!', adaptiveEngine.sessionStats);
    }
  };


  // handleLifeDecision removido - sem vidas

  const handleQuizComplete = async () => {
    const results = await getQuizCompletion(score, questions.length);
    const percentage = Math.round((score / questions.length) * 100);
    const success = percentage >= 70;
    
    // Atualizar streak para modo solo
    if (mode === 'solo' && category) {
      console.log('🎯 Atualizando streak após quiz:', { category, success, score, total: questions.length });
      await updateStreakAfterQuiz(category, success, score, questions.length);
    }
    
    setShowResults(true);
    
    if (onComplete) {
      onComplete({
        score,
        totalQuestions: questions.length,
        percentage,
        mode,
        ...results
      });
    }
  };

  const handleTimeoutContinue = () => {
    setShowTimeoutModal(false);
    handleContinue();
  };

  const resetQuiz = () => {
    setScore(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setTimeLeft(30);
    setAnsweredQuestions([]);
    resetGamification();
    adaptiveEngine.resetEngine();
    initializeQuiz();
  };

  const startNewQuiz = () => {
    setScore(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setTimeLeft(30);
    setAnsweredQuestions([]);
    resetGamification();
    adaptiveEngine.resetEngine();
    initializeQuiz();
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
              {/* DEBUG: Mostrar categoria atual */}
              {category && (
                <div className="text-xs text-orange-500 font-medium mt-1">
                  📂 {category}
                </div>
              )}
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
              {/* Indicador Adaptativo */}
              {adaptiveEngine.metrics && (
                <div className="mb-4 flex justify-center">
                  <AdaptiveQuizIndicator metrics={adaptiveEngine.metrics} />
                </div>
              )}
              
              <h2 className="text-primary font-semibold text-xl sm:text-2xl leading-relaxed mb-6">
                {currentQuestion.question}
              </h2>
              
              {/* DEBUG: Mostrar categoria da questão atual */}
              <div className="text-xs text-muted-foreground mb-4 text-center">
                🏷️ Categoria: <span className="font-medium text-orange-500">{currentQuestion.category}</span>
              </div>
              
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
                        "w-full text-left transition-all duration-300 group hover:shadow-lg",
                        // Padding dinâmico responsivo
                        isMobile ? "px-3 py-4" : "px-4 py-3",
                        // Text wrapping avançado
                        "whitespace-normal word-break break-word hyphens-auto",
                        "text-wrap-balance overflow-wrap-anywhere",
                        // Typography responsiva
                        isMobile ? "text-sm leading-5" : "text-base leading-6",
                        // Estados visuais
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
                      <div className="flex items-start justify-between w-full gap-2">
                        <span className="flex-1 text-left min-w-0">
                          {option}
                        </span>
                        {showAnswer && (
                          <span className="text-lg flex-shrink-0 mt-0.5">
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
