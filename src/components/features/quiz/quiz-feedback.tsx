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
  // Só mostrar feedback para respostas INCORRETAS
  if (!show || isCorrect) return null;

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="w-full max-w-md border-2 border-destructive bg-card animate-scale-in shadow-2xl">
        <CardContent className="p-6">
          {/* Header com X destacado */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-destructive">
                Resposta Incorreta
              </h3>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Resposta correta */}
          {correctAnswer && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">Resposta correta:</p>
              <p className="font-medium text-foreground">{correctAnswer}</p>
            </div>
          )}
          
          {/* Explicação */}
          {explanation && (
            <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Explicação:</p>
              <p className="text-sm leading-relaxed text-foreground">
                {explanation}
              </p>
            </div>
          )}
          
          {/* Botão para fechar */}
          <Button 
            onClick={handleClose}
            className="w-full"
            size="lg"
          >
            Continuar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
