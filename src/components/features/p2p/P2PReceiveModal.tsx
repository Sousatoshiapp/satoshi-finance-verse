import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/shared/ui/dialog";
import { Button } from "@/components/shared/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Sparkles, Zap } from "lucide-react";
import confetti from 'canvas-confetti';

interface P2PReceiveModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  senderNickname: string;
}

export function P2PReceiveModal({ open, onClose, amount, senderNickname }: P2PReceiveModalProps) {
  const [animatedAmount, setAnimatedAmount] = useState(0);
  
  const messages = [
    "Ebaaa! Chegaram os BTZ! 🤑",
    "Dindin na conta, meu rei! 💰", 
    "Parabéns, você recebeu BTZ! 🎉",
    "Opa! Seus BTZ chegaram! 🚀",
    "Show! Mais BTZ para você! ⭐"
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  
  useEffect(() => {
    if (open) {
      console.log('🎉 P2P Modal: Showing receive modal for', amount, 'BTZ from', senderNickname);
      
      // Trigger confetti with lime green colors
      const colors = ['#adff2f', '#c7ff5f', '#8acc00', '#90EE90', '#98FB98'];
      
      confetti({
        particleCount: 400,
        spread: 80,
        origin: { y: 0.6 },
        colors: colors,
        scalar: 0.6,
        gravity: 0.8
      });

      // Animate counter
      setAnimatedAmount(0);
      const duration = 1500;
      const start = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        setAnimatedAmount(Math.floor(amount * eased));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [open, amount, senderNickname]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-card via-card/95 to-background border border-border/50 backdrop-blur-xl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="text-center space-y-6 p-2"
        >
          {/* Ícone central com glow effect */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 150, delay: 0.2 }}
            className="relative mx-auto w-20 h-20"
          >
            <div 
              className="absolute inset-0 rounded-full animate-pulse" 
              style={{ backgroundColor: 'rgba(173, 255, 47, 0.2)' }}
            />
            <div 
              className="relative rounded-full p-5 border-2" 
              style={{ 
                backgroundColor: 'rgba(173, 255, 47, 0.1)',
                borderColor: 'rgba(173, 255, 47, 0.4)'
              }}
            >
              <Coins 
                className="w-10 h-10" 
                style={{ color: '#adff2f' }}
              />
            </div>
            
            {/* Sparkles animados */}
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity }
              }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-4 h-4" style={{ color: '#adff2f' }} />
            </motion.div>
            
            <motion.div
              animate={{ 
                rotate: -360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 1.5, repeat: Infinity, delay: 0.5 }
              }}
              className="absolute -bottom-1 -left-1"
            >
              <Sparkles className="w-3 h-3" style={{ color: '#c7ff5f' }} />
            </motion.div>
          </motion.div>

          {/* Título */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <h2 className="text-xl font-bold text-foreground">
              {randomMessage}
            </h2>
          </motion.div>

          {/* Valor animado */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            className="space-y-2"
          >
            <div 
              className="text-4xl font-bold"
              style={{ color: '#adff2f' }}
            >
              +{animatedAmount} BTZ
            </div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-muted-foreground text-sm"
            >
              Recebido de <span className="font-semibold" style={{ color: '#adff2f' }}>{senderNickname}</span>
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xs text-muted-foreground/80"
            >
              Sua carteira foi atualizada com sucesso! 🎯
            </motion.p>
          </motion.div>

          {/* Botão moderno */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="pt-2"
          >
            <Button
              onClick={onClose}
              className="w-full font-semibold shadow-lg transition-all duration-300 hover:shadow-xl"
              style={{
                background: `linear-gradient(135deg, #adff2f, #8acc00)`,
                color: '#000',
                border: 'none'
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Massa! Valeu! 🚀</span>
                <Zap className="w-4 h-4" />
              </div>
            </Button>
          </motion.div>

          {/* Dica divertida */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-xs text-muted-foreground/60 italic"
          >
            💡 Agora é só usar nos quizzes e apostas!
          </motion.p>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}