import { Dialog, DialogContent } from "@/components/shared/ui/dialog";
import { Button } from "@/components/shared/ui/button";
import { Avatar, AvatarFallback } from "@/components/shared/ui/avatar";
import { formatBTZDisplay } from "@/utils/btz-formatter";
import { Gift, X } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import confetti from "canvas-confetti";

interface P2PReceiveModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  senderNickname: string;
}

export function P2PReceiveModal({ open, onClose, amount, senderNickname }: P2PReceiveModalProps) {
  useEffect(() => {
    if (open) {
      // Enhanced confetti effect when modal opens
      const colors = ['#adff2f', '#32cd32', '#00ff00', '#90EE90', '#98FB98'];
      
      // Multiple confetti bursts
      const triggerConfetti = () => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: colors,
          scalar: 0.8
        });
        
        setTimeout(() => {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: colors,
            scalar: 0.6
          });
        }, 200);
      };
      
      triggerConfetti();
      
      // Vibration for mobile
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto bg-background/95 backdrop-blur-sm border-border">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-2 -right-2 h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="text-center space-y-4 pt-2">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="flex justify-center"
            >
              <div className="p-3 rounded-full bg-success/20">
                <Gift className="h-8 w-8 text-success" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-foreground">
                BTZ Recebido!
              </h3>
            </motion.div>

            {/* Amount */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="space-y-2"
            >
              <div className="text-3xl font-bold text-success">
                +{formatBTZDisplay(amount)}
              </div>
              <div className="text-sm text-muted-foreground">
                Transferido por
              </div>
            </motion.div>

            {/* Sender Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center space-x-3 p-3 rounded-lg bg-muted/50"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {senderNickname.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-foreground">
                  {senderNickname}
                </div>
                <div className="text-xs text-muted-foreground">
                  Enviou BTZ para você
                </div>
              </div>
            </motion.div>

            {/* Close Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                onClick={onClose}
                className="w-full bg-success hover:bg-success/90"
              >
                Obrigado!
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}