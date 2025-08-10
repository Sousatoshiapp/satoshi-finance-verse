import { Dialog, DialogContent } from "@/components/shared/ui/dialog";
import { Button } from "@/components/shared/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Coins, ShoppingCart, Zap } from "lucide-react";

interface InsufficientBTZModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBTZ: number;
  requiredBTZ: number;
}

export function InsufficientBTZModal({ isOpen, onClose, currentBTZ, requiredBTZ }: InsufficientBTZModalProps) {
  const navigate = useNavigate();

  const handleBuyBTZ = () => {
    onClose();
    navigate("/store?tab=beetz");
  };

  const messages = [
    "Eita! Seus BTZ acabaram! 😭",
    "Opa, tá sem grana, meu rei? 💸",
    "Cadê os BTZ, parça? 🤔",
    "Saldo zerado, amigão! 😅",
    "Ih rapaz, precisa de mais BTZ! 💰"
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-card via-card/95 to-background border border-border/50 backdrop-blur-xl">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="text-center space-y-6 p-2"
        >
          {/* Icon with glow effect */}
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="relative mx-auto w-16 h-16"
          >
            <div className="absolute inset-0 bg-destructive/20 rounded-full animate-pulse" />
            <div className="relative bg-destructive/10 rounded-full p-4 border border-destructive/30">
              <Coins className="w-8 h-8 text-destructive" />
            </div>
          </motion.div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">
              {randomMessage}
            </h2>
            <p className="text-muted-foreground text-sm">
              Você tem <span className="text-primary font-semibold">{currentBTZ.toFixed(2)} BTZ</span> mas precisa de{" "}
              <span className="text-destructive font-semibold">{requiredBTZ} BTZ</span> para apostar
            </p>
          </div>

          {/* Call to action */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Bora recarregar e voltar pro jogo! 🚀
            </p>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-border/50 hover:bg-background/50"
              >
                Cancelar
              </Button>
              
              <Button
                onClick={handleBuyBTZ}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold shadow-lg hover:shadow-primary/25 transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Comprar BTZ
                  <Zap className="w-4 h-4 animate-pulse" />
                </div>
              </Button>
            </div>
          </div>

          {/* Fun fact */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-muted-foreground/70 italic"
          >
            💡 Dica: Pacotes maiores têm desconto!
          </motion.p>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}