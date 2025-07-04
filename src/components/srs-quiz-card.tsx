import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSRSSystem } from "@/hooks/use-srs-system";

interface SRSQuizCardProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onComplete?: (score: number, total: number) => void;
}

export function SRSQuizCard({ difficulty = 'easy', onComplete }: SRSQuizCardProps) {
  const { getDueQuestions, submitAnswer } = useSRSSystem();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, [difficulty]);

  const loadQuestions = async () => {
    setLoading(true);
    const dueQuestions = await getDueQuestions(difficulty, 10);
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
    
    // Submit to SRS system
    await submitAnswer(currentQuestion.id, isCorrect, responseTime);
    
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setStartTime(Date.now());
      } else {
        onComplete?.(score + (isCorrect ? 1 : 0), questions.length);
      }
    }, 2000);
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
        <Badge variant="outline">{currentQuestion.difficulty}</Badge>
        <div className="text-sm text-muted-foreground">
          {currentIndex + 1} / {questions.length}
        </div>
      </div>

      <div className="mb-4">
        <Badge variant="secondary" className="mb-2">
          {currentQuestion.category}
        </Badge>
        <h2 className="text-xl font-bold text-foreground leading-relaxed">
          {currentQuestion.question}
        </h2>
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

      {showResult && currentQuestion.explanation && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold">💡 Explicação:</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {currentQuestion.explanation}
          </p>
        </div>
      )}
    </Card>
  );
}