import { Timer, TrendingUp, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shared/ui/dialog";
import { Button } from "@/components/shared/ui/button";

interface BtcTutorialModalProps {
  open: boolean;
  onClose: () => void;
}

export function BtcTutorialModal({ open, onClose }: BtcTutorialModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md border-orange-500/20 bg-gradient-to-br from-background to-orange-500/5">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            Bem-vindo ao Duelo BTC!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-orange-500">
            <Timer className="h-5 w-5" />
            <span className="font-semibold">Como Funciona:</span>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-orange-500 font-bold min-w-[20px]">1.</span>
              <span>Escolha o valor da aposta (5-50 BTZ)</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-orange-500 font-bold min-w-[20px]">2.</span>
              <span>Sistema encontra um oponente com a mesma aposta</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-orange-500 font-bold min-w-[20px]">3.</span>
              <span>Ambos escolhem UP ou DOWN em 30 segundos</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-orange-500 font-bold min-w-[20px]">4.</span>
              <span>Aguardem 5 minutos para ver quem acertou</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-orange-500 font-bold min-w-[20px]">5.</span>
              <span>Vencedor leva tudo (menos taxa de 5%)</span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-border">
            <Button 
              onClick={onClose}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              Entendi, vamos começar!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}