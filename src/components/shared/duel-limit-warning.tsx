import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/shared/ui/alert-dialog";
import { Button } from "@/components/shared/ui/button";
import { Star, Crown, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DuelLimitWarningProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duelsUsed: number;
  duelsLimit: number;
}

export function DuelLimitWarning({ open, onOpenChange, duelsUsed, duelsLimit }: DuelLimitWarningProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/subscription-plans');
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md mx-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center text-xl">
            🚫 Limite de Duelos Atingido
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-4">
            <div className="text-lg">
              Você já usou <span className="font-bold text-orange-500">{duelsUsed}/{duelsLimit}</span> duelos hoje.
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Faça upgrade para desbloquear:
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Duelos ilimitados</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span>XP Multiplicado (2x ou 3x)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-purple-500" />
                  <span>Avatares exclusivos</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Seus duelos serão resetados amanhã às 00:00
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-col sm:flex-col gap-2">
          <AlertDialogAction asChild>
            <Button 
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
            >
              <Star className="w-4 h-4 mr-2" />
              Ver Planos Premium
            </Button>
          </AlertDialogAction>
          
          <AlertDialogCancel asChild>
            <Button variant="outline" className="w-full">
              Entendi
            </Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
