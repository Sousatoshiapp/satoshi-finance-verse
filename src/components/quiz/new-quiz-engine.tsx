import React, { useState, useEffect } from 'react';
import { Button } from '@/components/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Progress } from '@/components/shared/ui/progress';
import { Badge } from '@/components/shared/ui/badge';
import { CheckCircle, XCircle, Clock, Brain } from 'lucide-react';
import { useQuestionSelector, Question } from '@/hooks/use-question-selector';
import { useFSRS } from '@/hooks/use-fsrs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface QuizEngineProps {
  topic?: string; // Agora aceita: "Finanças do Dia a Dia", "ABC das Finanças", "Cripto"
  difficulty?: 'facil' | 'medio' | 'dificil' | 'muito_dificil'; // Novo sistema de dificuldades
  questionsCount?: number;
  mode?: 'practice' | 'study' | 'adaptive'; // Adaptive é o padrão para SRS/FSRS
  onComplete?: (results: QuizResults) => void;
}

interface QuizResults {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number;
  score: number;
  questionsData: Array<{
    question: Question;
    userAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
  }>;
}

export function NewQuizEngine({
  topic,
  difficulty,
  questionsCount = 10,
  mode = 'adaptive', // Padrão mudou para adaptive (SRS/FSRS)
  onComplete
}: QuizEngineProps) {
  const { user } = useAuth();
  const { selectQuestions, selectAdaptiveQuestions, loading } = useQuestionSelector();
  const { updateProgress } = useFSRS();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [results, setResults] = useState<QuizResults['questionsData']>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  useEffect(() => {
    loadQuestions();
  }, [topic, difficulty, questionsCount, mode]);

  const loadQuestions = async () => {
    try {
      let fetchedQuestions: Question[] = [];
      
      if (mode === 'adaptive' && user) {
        // Modo adaptativo: SRS/FSRS seleciona questões baseado no progresso
        fetchedQuestions = await selectAdaptiveQuestions(user.id, questionsCount);
      } else {
        // Modo normal: usar categoria e dificuldade especificadas
        fetchedQuestions = await selectQuestions({
          category: topic, // Aceita as novas categorias
          difficulty: mapDifficultyToOld(difficulty), // Mapear dificuldades do novo sistema
          limit: questionsCount
        });
      }

      if (fetchedQuestions.length === 0) {
        toast.error('Nenhuma questão encontrada para os critérios selecionados. O sistema está sendo preparado com novas questões.');
        return;
      }

      setQuestions(fetchedQuestions);
      setStartTime(Date.now());
      setQuestionStartTime(Date.now());
    } catch (error) {
      console.error('Erro ao carregar questões:', error);
      toast.error('Erro ao carregar questões');
    }
  };

  // Mapear dificuldades do novo sistema para o antigo (temporariamente)
  const mapDifficultyToOld = (newDifficulty?: string) => {
    const mapping: Record<string, 'basic' | 'intermediate' | 'advanced'> = {
      'facil': 'basic',
      'medio': 'intermediate', 
      'dificil': 'advanced',
      'muito_dificil': 'advanced'
    };
    return newDifficulty ? mapping[newDifficulty] || 'basic' : undefined;
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || isAnswered) return;

    const timeSpent = Date.now() - questionStartTime;
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    
    setIsAnswered(true);
    setShowExplanation(true);

    // Registrar resultado
    const questionResult = {
      question: currentQuestion,
      userAnswer: selectedAnswer,
      isCorrect,
      timeSpent
    };

    setResults(prev => [...prev, questionResult]);

    // Atualizar progresso FSRS se o usuário estiver logado (adaptive ou study mode)
    if (user && (mode === 'adaptive' || mode === 'study')) {
      try {
        await updateProgress(user.id, currentQuestion.id, isCorrect, timeSpent);
      } catch (error) {
        console.error('Erro ao atualizar progresso FSRS:', error);
      }
    }

    // Feedback visual
    if (isCorrect) {
      toast.success('Resposta correta!');
    } else {
      toast.error('Resposta incorreta');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 >= questions.length) {
      completeQuiz();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowExplanation(false);
      setIsAnswered(false);
      setQuestionStartTime(Date.now());
    }
  };

  const completeQuiz = () => {
    const totalTimeSpent = Date.now() - startTime;
    const correctAnswers = results.filter(r => r.isCorrect).length;
    const score = Math.round((correctAnswers / questions.length) * 100);

    const finalResults: QuizResults = {
      totalQuestions: questions.length,
      correctAnswers,
      incorrectAnswers: questions.length - correctAnswers,
      timeSpent: totalTimeSpent,
      score,
      questionsData: results
    };

    setQuizCompleted(true);
    onComplete?.(finalResults);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Carregando questões...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma questão encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Não foi possível encontrar questões para os critérios selecionados. O sistema está sendo atualizado com novas questões nas categorias: Finanças do Dia a Dia, ABC das Finanças e Cripto.
            </p>
            <Button onClick={() => window.history.back()}>
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizCompleted) {
    const correctAnswers = results.filter(r => r.isCorrect).length;
    const score = Math.round((correctAnswers / questions.length) * 100);

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">Quiz Concluído!</CardTitle>
            <div className="flex justify-center">
              {score >= 70 ? (
                <CheckCircle className="w-16 h-16 text-green-500" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{score}%</div>
              <p className="text-lg text-muted-foreground">
                {correctAnswers} de {questions.length} questões corretas
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">{correctAnswers}</div>
                <div className="text-sm text-green-600">Corretas</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-700">{questions.length - correctAnswers}</div>
                <div className="text-sm text-red-600">Incorretas</div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button 
                onClick={() => window.location.reload()} 
                className="flex-1"
              >
                Refazer Quiz
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="flex-1"
              >
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {currentQuestionIndex + 1} de {questions.length}
              </Badge>
              {mode === 'adaptive' && (
                <Badge variant="outline">
                  <Brain className="w-3 h-3 mr-1" />
                  Adaptativo
                </Badge>
              )}
              <Badge variant="outline" className="capitalize">
                {currentQuestion.difficulty}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {topic && <span>{topic}</span>}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const letter = String.fromCharCode(65 + index);
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuestion.correct_answer;
              const isWrong = isAnswered && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isAnswered}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    isAnswered
                      ? isCorrect
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : isWrong
                        ? 'border-red-500 bg-red-50 text-red-800'
                        : 'border-gray-200 bg-gray-50'
                      : isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isAnswered
                        ? isCorrect
                          ? 'bg-green-500 text-white'
                          : isWrong
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                        : isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {letter}
                    </div>
                    <span className="flex-1">{option}</span>
                    {isAnswered && isCorrect && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {isAnswered && isWrong && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Explanation */}
        {showExplanation && currentQuestion.explanation && (
          <Card className="mb-6 border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">Explicação:</h4>
              <p className="text-muted-foreground">{currentQuestion.explanation}</p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-center">
          {!isAnswered ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              size="lg"
              className="min-w-40"
            >
              Confirmar Resposta
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              size="lg"
              className="min-w-40"
            >
              {currentQuestionIndex + 1 >= questions.length ? 'Finalizar Quiz' : 'Próxima Questão'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}