import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ArrowLeft, Trophy, Clock, Target, Zap } from "lucide-react";
import { BTZCounter } from "./btz-counter";
import { useQuizGamification } from "@/hooks/use-quiz-gamification";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUnifiedSRS } from "@/hooks/use-unified-srs";
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
  mode, 
  topicId, 
  opponentId, 
  tournamentId, 
  missionId, 
  districtId,
  onComplete,
  questionsCount = 7
}: QuizEngineProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const srs = useUnifiedSRS();
  const gamification = useQuizGamification();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchQuestions();
    }
  }, [user]);

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
    setLoading(true);
    try {
      let difficulty = 'easy';
      
      // Determinar dificuldade baseado no modo e perfil do usuário
      if (userProfile) {
        if (userProfile.level >= 10) difficulty = 'medium';
        if (userProfile.level >= 20) difficulty = 'hard';
      }

      const fetchedQuestions = await srs.getDueQuestions(
        difficulty, 
        questionsCount, 
        answeredQuestions
      );
      
      if (fetchedQuestions.length > 0) {
        setQuestions(fetchedQuestions);
      } else {
        toast({
          title: "Sem questões disponíveis",
          description: "Não encontramos questões para este modo. Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Erro ao carregar questões",
        description: "Houve um problema ao carregar as questões. Tente novamente.",
        variant: "destructive",
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
    if (selectedAnswer || showAnswer) return;
    setSelectedAnswer(option);
  };

  const handleSubmit = async () => {
    if (!selectedAnswer) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    
    setShowAnswer(true);
    
    // Atualizar SRS
    await srs.submitAnswer(currentQuestion.id, isCorrect, 10); // tempo fixo por agora
    
    if (isCorrect) {
      setScore(score + 1);
      await gamification.handleCorrectAnswer();
      setTimeout(() => fireConfetti(), 500);
    } else {
      await gamification.handleWrongAnswer(
        currentQuestion.question,
        currentQuestion.correct_answer,
        currentQuestion.explanation
      );
    }

    // Adicionar questão respondida à lista
    setAnsweredQuestions(prev => [...prev, currentQuestion.id]);

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowAnswer(false);
      } else {
        handleQuizComplete();
      }
    }, 2000);
  };

  const handleQuizComplete = () => {
    const results = {
      score,
      totalQuestions: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      mode,
      gamificationState: {
        streak: gamification.streak,
        totalBTZ: gamification.totalBTZ,
        currentMultiplier: gamification.currentMultiplier
      }
    };

    if (onComplete) {
      onComplete(results);
    }

    setShowResults(true);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setAnsweredQuestions([]);
    gamification.resetGamification();
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-lg p-8 text-center">
          <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
          <h1 className="text-3xl font-bold mb-2">{getModeTitle()} Finalizado!</h1>
          <div className="text-6xl mb-4">
            {score === questions.length ? "🏆" : score >= questions.length * 0.7 ? "🥉" : "📚"}
          </div>
          
          <div className="mb-6">
            <div className="text-4xl font-bold text-primary mb-2">
              {score}/{questions.length}
            </div>
            <p className="text-muted-foreground">
              {Math.round((score / questions.length) * 100)}% de acertos
            </p>
          </div>

          <div className="space-y-4">
            <Button onClick={resetQuiz} className="w-full" size="lg">
              Jogar Novamente
            </Button>
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
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
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

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header com BTZ Counter */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(getBackRoute())}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {getModeTitle()}
              </div>
              <BTZCounter />
            </div>
          </div>
        </div>
      </div>

      {/* Main Quiz Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Questão {currentQuestionIndex + 1} de {questions.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <ProgressBar value={progress} className="h-2" />
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
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(option)}
                      disabled={showAnswer}
                      className={`w-full p-4 text-left rounded-lg border transition-all duration-200 ${
                        isSelected && !showAnswer
                          ? 'border-primary bg-primary/10'
                          : shouldShowCorrect
                          ? 'border-green-500 bg-green-500/10'
                          : isWrong
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {showAnswer && (
                          <span className="text-lg">
                            {isCorrect ? '✅' : isSelected ? '❌' : ''}
                          </span>
                        )}
                      </div>
                    </button>
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

          {/* Explanation */}
          {showAnswer && currentQuestion.explanation && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Explicação:</h3>
                <p className="text-muted-foreground">{currentQuestion.explanation}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Gamification Overlays */}
      {gamification.showBeetzAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="animate-bounce text-6xl">+{gamification.totalBTZ} BTZ! 🎉</div>
        </div>
      )}

      {gamification.showStreakAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="animate-pulse text-4xl">🔥 Streak de {gamification.streak}! 🔥</div>
        </div>
      )}

      {gamification.showVideoExplanation && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardContent className="p-6">
              <h3 className="font-bold mb-2">💡 Explicação</h3>
              <p className="mb-4">{gamification.currentQuestion}</p>
              <div className="mb-4">
                <strong>Resposta correta:</strong> {gamification.currentCorrectAnswer}
              </div>
              {gamification.currentExplanation && (
                <div className="mb-4">
                  <strong>Por quê:</strong> {gamification.currentExplanation}
                </div>
              )}
              <Button onClick={gamification.hideVideoExplanation} className="w-full">
                Continuar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}