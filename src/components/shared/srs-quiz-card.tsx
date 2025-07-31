import { useState, useEffect } from "react";
import { Button } from "@/components/shared/ui/button";
import { Card } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { cn } from "@/lib/utils";
import { useEnhancedSRS } from "@/hooks/use-enhanced-srs";
import { X, Brain, Clock, Target } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/shared/ui/alert-dialog";

interface SRSQuizCardProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  moduleId?: string;
  conceptFocus?: string[];
  onComplete?: (score: number, total: number, conceptsImproved: number) => void;
  onExit?: () => void;
}

export function SRSQuizCard({ 
  difficulty = 'easy', 
  moduleId, 
  conceptFocus, 
  onComplete, 
  onExit 
}: SRSQuizCardProps) {
  const { getDueQuestions, submitEnhancedAnswer } = useEnhancedSRS();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [conceptsImproved, setConceptsImproved] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, [difficulty]);

  const loadQuestions = async () => {
    setLoading(true);
    const dueQuestions = await getDueQuestions(difficulty, moduleId, 10, conceptFocus);
    setQuestions(dueQuestions);
    setLoading(false);
    setStartTime(Date.now());
  };

  const handleAnswer = async (optionText: string) => {
    if (showResult) return;
    
    setSelectedAnswer(optionText);
    setShowResult(true);
    
    const currentQuestion = questions[currentIndex];
    const isCorrect = optionText === currentQuestion.correct_answer;
    const responseTime = (Date.now() - startTime) / 1000;
    
    if (isCorrect) setScore(score + 1);
    
    // Submit to enhanced SRS system
    const conceptUpdate = await submitEnhancedAnswer(
      currentQuestion.id, 
      isCorrect, 
      responseTime, 
      optionText
    );
    
    if (conceptUpdate && typeof conceptUpdate === 'object' && 'concepts_improved' in conceptUpdate) {
      setConceptsImproved(prev => prev + (conceptUpdate as any).concepts_improved);
    }
    
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setStartTime(Date.now());
      } else {
        onComplete?.(score + (isCorrect ? 1 : 0), questions.length, conceptsImproved);
      }
    }, 2500); // Slightly longer to show feedback
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">Carregando questões...</div>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Parabéns! 🎉</h3>
          <p className="text-muted-foreground">Você revisou todas as questões disponíveis para hoje!</p>
        </div>
      </Card>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{currentQuestion.difficulty}</Badge>
          {currentQuestion.difficulty_level && (
            <Badge variant="secondary" className="text-xs">
              Nível {currentQuestion.difficulty_level}
            </Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span>{currentIndex + 1} / {questions.length}</span>
          {currentQuestion.estimated_time_seconds && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {currentQuestion.estimated_time_seconds}s
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary">
            {currentQuestion.category}
          </Badge>
          {currentQuestion.cognitive_level && (
            <Badge variant="outline" className="text-xs">
              {currentQuestion.cognitive_level}
            </Badge>
          )}
          {currentQuestion.concepts && currentQuestion.concepts.length > 0 && (
            <div className="flex items-center gap-1">
              <Brain className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {currentQuestion.concepts.length} conceito(s)
              </span>
            </div>
          )}
        </div>
        <h2 className="text-xl font-bold text-foreground leading-relaxed">
          {currentQuestion.question}
        </h2>
        
        {/* Learning Objectives */}
        {currentQuestion.learning_objectives && currentQuestion.learning_objectives.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-1 mb-1">
              <Target className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Objetivos:</span>
            </div>
            <ul className="text-xs text-blue-600 space-y-1">
              {currentQuestion.learning_objectives.map((objective: string, index: number) => (
                <li key={index} className="flex items-start gap-1">
                  <span>•</span>
                  {objective}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="space-y-3 mb-6">
        {currentQuestion.options?.map((option: string, index: number) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === currentQuestion.correct_answer;
          
          let buttonClass = "";
          if (showResult && isSelected) {
            buttonClass = isCorrect 
              ? "bg-success border-success text-success-foreground" 
              : "bg-destructive border-destructive text-destructive-foreground";
          } else if (showResult && isCorrect) {
            buttonClass = "bg-success border-success text-success-foreground";
          }
          
          return (
            <Button
              key={index}
              variant="outline"
              className={cn(
                "w-full text-left justify-start min-h-[48px] text-wrap whitespace-normal p-4",
                buttonClass
              )}
              onClick={() => handleAnswer(option)}
              disabled={showResult}
            >
              {option}
            </Button>
          );
        })}
      </div>

      {showResult && (
        <div className="mt-4 space-y-3">
          {/* Main Explanation */}
          {currentQuestion.explanation && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold">💡 Explicação:</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
          
          {/* Specific Feedback for Wrong Answer */}
          {!selectedAnswer?.includes(currentQuestion.correct_answer) && 
           currentQuestion.feedback_wrong_answers?.[selectedAnswer || ''] && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-yellow-700">🤔 Por que esta resposta está incorreta:</span>
              </div>
              <p className="text-sm text-yellow-700">
                {currentQuestion.feedback_wrong_answers[selectedAnswer || '']}
              </p>
            </div>
          )}
          
          {/* Concepts Mastered */}
          {currentQuestion.concepts && currentQuestion.concepts.length > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">Conceitos Trabalhados:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {currentQuestion.concepts.map((concept: any, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs text-green-700 border-green-300">
                    {concept.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {onExit && (
        <div className="mt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Encerrar Quiz
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Encerrar Quiz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja encerrar o quiz? Seu progresso será perdido.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onExit}>
                  Encerrar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </Card>
  );
}
