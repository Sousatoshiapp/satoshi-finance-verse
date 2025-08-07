import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { CircularTimer } from "@/components/duels/circular-timer";
import { ArrowLeft, Trophy, Target, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuizShuffle } from '@/hooks/use-quiz-shuffle';
import { useThemedSRS } from "@/hooks/use-themed-srs";
import { useQuizGamification } from "@/hooks/use-quiz-gamification";
import { useAdvancedQuizAudio } from "@/hooks/use-advanced-quiz-audio";
import { useCustomSounds } from "@/hooks/use-custom-sounds";
import { useResponsiveFeedback } from "@/hooks/use-responsive-feedback";
import { useI18n } from "@/hooks/use-i18n";
import { BeetzAnimation } from "./beetz-animation";
import { StreakAnimation } from "./streak-animation";
import { QuizBTZCard } from "./quiz-btz-card";
import { QuizFeedback } from "./quiz-feedback";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/shared/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
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
  theme: string;
}

interface ThemedQuizEngineProps {
  theme: string;
  questionsCount?: number;
  onComplete?: (results: any) => void;
}

const THEME_NAMES: { [key: string]: string } = {
  trading: "Trading & Análise Técnica",
  cryptocurrency: "Criptomoedas & DeFi",
  portfolio: "Gestão de Portfolio",
  basic_investments: "Investimentos Básicos",
  financial_education: "Educação Financeira",
  budgeting: "Orçamento & Planejamento",
  economics: "Economia & Macroeconomia"
};

export function ThemedQuizEngine({
  theme,
  questionsCount = 10,
  onComplete
}: ThemedQuizEngineProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showFeedback, setShowFeedback] = useState(false);
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
    hideBeetzAnimation,
    hideStreakAnimation,
    resetGamification,
    getQuizCompletion
  } = useQuizGamification();

  const { getThemedQuestions, submitThemedAnswer, themeProgress } = useThemedSRS();
  const { playCorrectSound, playWrongSound } = useAdvancedQuizAudio();
  const { triggerHaptic } = useResponsiveFeedback();
  const { shuffleQuestions } = useQuizShuffle();
  const { t } = useI18n();

  const handleContinue = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setShowFeedback(false);
      setTimeLeft(30);
    } else {
      handleQuizComplete();
    }
  };

  const handleTimeUp = async () => {
    const question = questions[currentIndex];
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
    await submitThemedAnswer(question.id, false, 30, theme);
    await handleWrongAnswer(question.question, question.correct_answer, question.explanation);
  };

  useEffect(() => {
    if (user && theme) {
      fetchQuestions();
    }
  }, [theme, questionsCount, user]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      
      const fetchedQuestions = await getThemedQuestions(
        theme,
        questionsCount,
        answeredQuestions.map(q => q.questionId)
      );
      
      if (fetchedQuestions.length === 0) {
        toast({
          title: "Questões não disponíveis",
          description: `Não foi possível carregar questões para o tema ${THEME_NAMES[theme] || theme}`,
          variant: "destructive"
        });
        navigate('/game-mode');
        return;
      }
      
      const shuffledQuestions = shuffleQuestions(fetchedQuestions) as QuizQuestion[];
      setQuestions(shuffledQuestions);
    } catch (error) {
      console.error('Error fetching themed questions:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as questões",
        variant: "destructive"
      });
      navigate('/game-mode');
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
    
    setShowAnswer(true);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      playCorrectSound();
      triggerHaptic('light');
      await handleCorrectAnswer();
      // Para respostas corretas, não mostrar feedback, apenas animações
      setTimeout(() => {
        handleContinue();
      }, 1500); // Tempo para ver as animações
    } else {
      setShowFeedback(true); // Só mostrar feedback para incorretas
      playWrongSound();
      triggerHaptic('heavy');
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
    await submitThemedAnswer(question.id, isCorrect, 30 - timeLeft, theme);
  };

  const handleQuizComplete = async () => {
    const results = await getQuizCompletion(score, questions.length);
    setShowResults(true);
    
    if (onComplete) {
      onComplete({
        score,
        totalQuestions: questions.length,
        percentage: Math.round((score / questions.length) * 100),
        theme,
        themeProgress,
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
    setShowFeedback(false);
    setTimeLeft(30);
    setAnsweredQuestions([]);
    resetGamification();
    fetchQuestions();
  };

  const startNewQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setShowFeedback(false);
    setTimeLeft(30);
    setAnsweredQuestions([]);
    resetGamification();
    fetchQuestions();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando questões do tema...</p>
            <p className="text-sm text-muted-foreground mt-2">{THEME_NAMES[theme] || theme}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    const isSuccess = percentage >= 70;
    
    if (isSuccess) {
      fireConfetti();
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-lg p-8 text-center">
          <div className="mb-6">
            <img 
              src={isSuccess ? victoryImage : "/src/assets/failure-animation.png"}
              alt={isSuccess ? "Celebração" : "Falha"}
              className="h-32 w-32 mx-auto mb-4 object-contain rounded-full"
            />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">
            {isSuccess ? "Parabéns!" : "Continue Praticando!"}
          </h1>
          
          <div className="mb-6">
            <div className="text-4xl font-bold text-primary mb-2">
              {score}/{questions.length}
            </div>
            <p className="text-muted-foreground">
              {percentage}% de acerto
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Tema: {THEME_NAMES[theme] || theme}
            </p>
          </div>

          {/* Progresso do Tema */}
          {themeProgress && (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Progresso no Tema</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total respondidas:</span>
                  <span className="ml-2 font-semibold">{themeProgress.questions_answered}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Taxa de acerto:</span>
                  <span className="ml-2 font-semibold">
                    {themeProgress.questions_answered > 0 
                      ? Math.round((themeProgress.questions_correct / themeProgress.questions_answered) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Button onClick={startNewQuiz} className="w-full" size="lg">
              Continuar no Tema
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/game-mode')} 
              className="w-full"
            >
              Escolher Outro Tema
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
            Não conseguimos carregar questões para este tema no momento.
          </p>
          <Button onClick={() => navigate('/game-mode')}>
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
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="grid grid-cols-3 items-center">
            <div className="flex justify-start">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/game-mode')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-bold text-primary">
                Questão {currentIndex + 1} de {questions.length}
              </div>
              <div className="text-xs text-muted-foreground">
                {THEME_NAMES[theme] || theme}
              </div>
            </div>
            
            <div className="flex justify-end">
              <div className="text-sm text-muted-foreground">
                {themeProgress && (
                  <span>{Math.round((themeProgress.questions_correct / Math.max(themeProgress.questions_answered, 1)) * 100)}% acerto</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="w-full bg-muted h-2">
        <div 
          className="h-full bg-gradient-to-r from-primary to-primary-foreground transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Timer e BTZ Card */}
        <div className="flex justify-between items-center mb-6">
        <CircularTimer
          duration={30}
          isActive={!showAnswer}
          onTimeUp={handleTimeUp}
          onTick={(newTimeLeft) => setTimeLeft(newTimeLeft)}
          size={80}
        />
        <QuizBTZCard />
        </div>

        {/* Pergunta */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-2">
                  {currentQuestion.category} • {currentQuestion.difficulty}
                </div>
                <h2 className="text-lg font-semibold leading-tight">
                  {currentQuestion.question}
                </h2>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opções */}
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQuestion.correct_answer;
            const isWrong = showAnswer && isSelected && !isCorrect;
            const shouldHighlight = showAnswer && isCorrect;

            return (
              <Button
                key={index}
                variant="outline"
                className={cn(
                  "w-full p-4 h-auto text-left justify-start transition-all duration-200",
                  "hover:bg-muted hover:border-primary/50",
                  isSelected && !showAnswer && "border-primary bg-primary/5",
                  shouldHighlight && "border-green-500 bg-green-50 text-green-700",
                  isWrong && "border-red-500 bg-red-50 text-red-700"
                )}
                onClick={() => handleOptionSelect(option)}
                disabled={showAnswer}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium",
                    isSelected && !showAnswer && "border-primary bg-primary text-primary-foreground",
                    shouldHighlight && "border-green-500 bg-green-500 text-white",
                    isWrong && "border-red-500 bg-red-500 text-white",
                    !isSelected && !showAnswer && "border-muted-foreground/30"
                  )}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1">{option}</span>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Botão Submit */}
        {!showAnswer && (
          <Button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className="w-full"
            size="lg"
          >
            Confirmar Resposta
          </Button>
        )}

        {/* Feedback apenas para respostas incorretas */}
        <QuizFeedback
          isCorrect={selectedAnswer === currentQuestion.correct_answer}
          explanation={currentQuestion.explanation}
          correctAnswer={currentQuestion.correct_answer}
          userAnswer={selectedAnswer}
          show={showFeedback}
          onClose={() => {
            setShowFeedback(false);
            handleContinue();
          }}
        />
      </div>

      {/* Animações */}
      {showBeetzAnimation && (
        <BeetzAnimation
          isVisible={showBeetzAnimation}
          amount={earnedBTZ}
          onComplete={hideBeetzAnimation}
        />
      )}

      {showStreakAnimation && (
        <StreakAnimation
          isVisible={showStreakAnimation}
          onComplete={hideStreakAnimation}
        />
      )}

      {/* Modal de Timeout */}
      <AlertDialog open={showTimeoutModal} onOpenChange={setShowTimeoutModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tempo Esgotado!</AlertDialogTitle>
            <AlertDialogDescription>
              O tempo para responder esta pergunta acabou.
              {currentQuestion?.explanation && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Resposta correta:</strong> {currentQuestion.correct_answer}
                  </p>
                  {currentQuestion.explanation && (
                    <p className="text-sm mt-2">
                      <strong>Explicação:</strong> {currentQuestion.explanation}
                    </p>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleTimeoutContinue}>
              {currentIndex < questions.length - 1 ? "Próxima Pergunta" : "Ver Resultados"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}