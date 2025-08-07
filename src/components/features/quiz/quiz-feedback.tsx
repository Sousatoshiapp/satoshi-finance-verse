import { Card, CardContent } from "@/components/shared/ui/card";
import { CheckCircle, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/shared/ui/button";

interface QuizFeedbackProps {
  isCorrect: boolean;
  explanation?: string;
  correctAnswer?: string;
  userAnswer?: string;
  show: boolean;
  onClose?: () => void;
}

export function QuizFeedback({ 
  isCorrect, 
  explanation, 
  correctAnswer, 
  userAnswer, 
  show,
  onClose
}: QuizFeedbackProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className={cn(
        "w-full max-w-md border-2 animate-scale-in shadow-2xl",
        isCorrect 
          ? "border-green-500 bg-green-50 dark:bg-green-950" 
          : "border-red-500 bg-red-50 dark:bg-red-950"
      )}>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            {/* Botão X no lado esquerdo */}
            {onClose && !isCorrect && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="flex-shrink-0 h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            
            <div className="flex-shrink-0 mt-0.5">
              {isCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            
            <div className="flex-1">
              <div className={cn(
                "font-semibold text-base mb-3",
                isCorrect ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
              )}>
                {isCorrect ? "✅ Correto!" : "❌ Incorreto"}
              </div>
              
              {!isCorrect && correctAnswer && (
                <div className="text-sm text-muted-foreground mb-3 p-3 bg-muted rounded-lg">
                  <span className="font-medium">Resposta correta:</span> {correctAnswer}
                </div>
              )}
              
              {explanation && (
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {explanation}
                  </p>
                </div>
              )}
              
              {/* Botão para continuar quando correto */}
              {isCorrect && onClose && (
                <Button 
                  onClick={onClose}
                  className="w-full mt-4"
                  variant="default"
                >
                  Continuar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
