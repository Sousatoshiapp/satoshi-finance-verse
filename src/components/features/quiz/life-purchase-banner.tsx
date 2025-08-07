import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";

interface LifePurchaseBannerProps {
  isVisible: boolean;
  onClose: () => Promise<void>;
  onPurchase: () => Promise<void>;
  onViewStore: () => void;
  currentStreak?: number;
  currentMultiplier?: number;
  livesCount?: number;
}

export function LifePurchaseBanner({
  isVisible,
  onClose,
  onPurchase,
  onViewStore,
  currentStreak = 7,
  currentMultiplier = 2,
  livesCount = 3
}: LifePurchaseBannerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUseLife = async () => {
    setIsLoading(true);
    await onPurchase();
    setIsLoading(false);
  };

  const handleDecline = async () => {
    setIsLoading(true);
    await onClose();
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md"
          >
            <Card className="bg-gradient-to-br from-red-900/90 to-pink-900/90 border-red-500/30 backdrop-blur-sm">
              <CardContent className="p-6 text-center relative">
                {/* Close button */}
                <button
                  onClick={handleDecline}
                  className="absolute top-4 right-4 text-white/60 hover:text-white"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Heart animation */}
                <div className="flex justify-center mb-4">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, -10, 10, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Heart className="w-16 h-16 text-red-400 fill-red-400" />
                  </motion.div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  💔 Ops! Resposta errada
                </h2>
                
                <p className="text-red-100 mb-4">
                  Você tem um streak incrível de <span className="font-bold text-yellow-300">{currentStreak}</span> respostas consecutivas
                  e multiplicador <span className="font-bold text-blue-300">{currentMultiplier}x</span>!
                </p>

                <div className="bg-black/20 rounded-lg p-4 mb-6">
                  <p className="text-white text-sm mb-2">
                    <Heart className="w-4 h-4 inline text-red-400 fill-red-400 mr-1" />
                    Você tem <span className="font-bold">{livesCount} vidas</span> disponíveis
                  </p>
                  <p className="text-red-200 text-sm">
                    Use uma vida para manter seu streak e multiplicador!
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleUseLife}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <Heart className="w-5 h-5 mr-2 fill-white" />
                        Usar 1 Vida (Manter Streak {currentStreak})
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleDecline}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full border-red-400/50 text-red-200 hover:bg-red-500/20"
                  >
                    Perder Streak (Continuar sem vida)
                  </Button>
                </div>

                <p className="text-xs text-red-300 mt-4 opacity-75">
                  💡 Vidas regeneram automaticamente a cada 8 horas
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
