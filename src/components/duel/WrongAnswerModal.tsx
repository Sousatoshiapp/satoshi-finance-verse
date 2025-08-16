import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/shared/ui/alert-dialog";
import { Button } from "@/components/shared/ui/button";
import { X, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

interface WrongAnswerModalProps {
  open: boolean;
  onClose: () => void;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
  onContinue: () => void;
}

export function WrongAnswerModal({
  open,
  onClose,
  question,
  userAnswer,
  correctAnswer,
  explanation,
  onContinue
}: WrongAnswerModalProps) {
  
  const handleContinue = () => {
    onContinue();
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-lg">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 text-red-600">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                ❌
              </motion.div>
              Resposta Incorreta
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-left">
                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="text-sm text-muted-foreground mb-2">Sua resposta:</div>
                  <div className="font-medium text-red-600 dark:text-red-400">{userAnswer}</div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-sm text-muted-foreground mb-2">Resposta correta:</div>
                  <div className="font-medium text-green-600 dark:text-green-400">{correctAnswer}</div>
                </div>
                
                {explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800"
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Lightbulb className="h-4 w-4" />
                      Explicação:
                    </div>
                    <div className="text-sm text-foreground">{explanation}</div>
                  </motion.div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button 
              onClick={handleContinue}
              className="w-full"
              size="lg"
            >
              Continuar
            </Button>
          </AlertDialogFooter>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  );
}