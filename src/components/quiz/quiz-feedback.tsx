import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizFeedbackProps {
  isCorrect: boolean;
  explanation?: string;
  correctAnswer?: string;
  userAnswer?: string;
  show: boolean;
}

export function QuizFeedback({ 
  isCorrect, 
  explanation, 
  correctAnswer, 
  userAnswer, 
  show 
}: QuizFeedbackProps) {
  if (!show) return null;

  return (
    <Card className={cn(
      "mt-4 border-2 animate-fade-in",
      isCorrect 
        ? "border-green-500 bg-green-50 dark:bg-green-950" 
        : "border-red-500 bg-red-50 dark:bg-red-950"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {isCorrect ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <X className="h-5 w-5 text-red-600" />
            )}
          </div>
          
          <div className="flex-1">
            <div className={cn(
              "font-semibold text-sm mb-2",
              isCorrect ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
            )}>
              {isCorrect ? "✅ Correto!" : "❌ Incorreto"}
            </div>
            
            {!isCorrect && correctAnswer && (
              <div className="text-sm text-muted-foreground mb-2">
                <span className="font-medium">Resposta correta:</span> {correctAnswer}
              </div>
            )}
            
            {explanation && (
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground leading-relaxed">
                  {explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}