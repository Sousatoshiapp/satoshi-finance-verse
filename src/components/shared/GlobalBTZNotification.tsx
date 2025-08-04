import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { CheckCircle, X, Sparkles } from "lucide-react";
import { useI18n } from '@/hooks/use-i18n';
import { useP2PNotifications } from '@/hooks/use-p2p-notifications';

export function GlobalBTZNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const [latestTransfer, setLatestTransfer] = useState<{amount: number, senderNickname: string} | null>(null);
  const { t } = useI18n();

  useP2PNotifications((amount, senderNickname) => {
    console.log('GlobalBTZNotification: Received transfer notification', { amount, senderNickname });
    
    setLatestTransfer({ amount, senderNickname });
    setShowNotification(true);
    
    // Auto hide after 6 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 6000);
  });

  const closeNotification = () => {
    setShowNotification(false);
  };

  return (
    <AnimatePresence>
      {showNotification && latestTransfer && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
          }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            duration: 0.6, 
            bounce: 0.3 
          }}
          className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] w-auto max-w-sm"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotateY: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 shadow-2xl backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </motion.div>
                    <motion.div
                      className="absolute -top-1 -right-1"
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [1, 0.5, 1]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                    </motion.div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <motion.h3 
                      className="text-xl font-bold text-green-800 mb-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {t('p2p.notifications.received.title', { amount: latestTransfer.amount })}
                    </motion.h3>
                    
                    <motion.div 
                      className="text-2xl font-extrabold text-green-700 flex items-center gap-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
                    >
                      <span className="animate-pulse">🎉</span>
                      <span>{latestTransfer.amount} BTZ</span>
                      <span className="animate-pulse">💰</span>
                    </motion.div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeNotification}
                    className="text-green-600 hover:text-green-800 hover:bg-green-100 flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}