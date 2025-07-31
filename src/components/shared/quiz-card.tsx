import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EnhancedQuizCard } from "./quiz/enhanced-quiz-card";

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizCardProps {
  question: string;
  options: QuizOption[];
  onAnswer: (isCorrect: boolean) => void;
  className?: string;
  enhanced?: boolean;
}

// Legacy component - use EnhancedQuizCard for new implementations
export function QuizCard({ question, options, onAnswer, className, enhanced = false }: QuizCardProps) {
  // If enhanced mode is requested, use the new component
  if (enhanced) {
    const enhancedQuestions = [{
      id: '1',
      question,
      options: options.map(opt => opt.text),
      correct_answer: options.find(opt => opt.isCorrect)?.text || '',
      category: 'General',
      difficulty: 'medium'
    }];
    
    return (
      <EnhancedQuizCard 
        questions={enhancedQuestions}
        onComplete={(results) => onAnswer(results.score > 0)}
        className={className}
      />
    );
  }
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (optionId: string) => {
    if (showResult) return;
    
    setSelectedAnswer(optionId);
    setShowResult(true);
    
    const selectedOption = options.find(opt => opt.id === optionId);
    const isCorrect = selectedOption?.isCorrect || false;
    
    setTimeout(() => {
      onAnswer(isCorrect);
      setSelectedAnswer(null);
      setShowResult(false);
    }, 1500);
  };

  return (
    <Card className={cn("p-6 max-w-2xl mx-auto", className)}>
      <h2 className="text-xl font-bold text-foreground mb-6 leading-relaxed">
        {question}
      </h2>
      
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedAnswer === option.id;
          const isCorrect = option.isCorrect;
          
          let buttonVariant: "default" | "outline" | "destructive" | "secondary" = "outline";
          let buttonClass = "";
          
          if (showResult && isSelected) {
            if (isCorrect) {
              buttonVariant = "default";
              buttonClass = "bg-success border-success text-success-foreground";
            } else {
              buttonVariant = "destructive";
              buttonClass = "animate-shake";
            }
          } else if (showResult && isCorrect) {
            buttonVariant = "default";
            buttonClass = "bg-success border-success text-success-foreground";
          }
          
          return (
            <Button
              key={option.id}
              variant={buttonVariant}
              className={cn(
                "w-full text-left justify-start min-h-[48px] text-wrap whitespace-normal p-4",
                buttonClass
              )}
              onClick={() => handleAnswer(option.id)}
              disabled={showResult}
            >
              {option.text}
            </Button>
          );
        })}
      </div>
      
      {showResult && (
        <div className="mt-6 text-center">
          {selectedAnswer && options.find(opt => opt.id === selectedAnswer)?.isCorrect ? (
            <div className="flex items-center justify-center gap-2 text-success">
              <span className="text-2xl">🎉</span>
              <span className="font-semibold">Correto!</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-destructive">
              <span className="text-2xl">💪</span>
              <span className="font-semibold">Tente novamente!</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}