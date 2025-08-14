import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sword, Users, Zap } from 'lucide-react';
import { Button } from '@/components/shared/ui/button';
import { BattleRoyaleModeSelector } from '@/components/features/battle-royale/BattleRoyaleModeSelector';
import { FloatingNavbar } from '@/components/shared/floating-navbar';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/hooks/use-i18n';
import { useIsMobile } from '@/hooks/use-mobile';

export default function BattleRoyalePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isMobile ? 'px-4 pt-16 pb-6' : 'px-6 pt-8 pb-6'}`}
      >
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {!isMobile && 'Voltar'}
          </Button>
          
          <motion.div 
            className="flex items-center gap-3"
            animate={{ 
              rotateY: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sword className="w-6 h-6 text-destructive" />
            <h1 className={`font-bold text-gradient ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              Battle Royale
            </h1>
          </motion.div>
          
          <div className="w-16" /> {/* Spacer */}
        </div>

        {/* Description */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-center max-w-md mx-auto mb-8"
        >
          Último sobrevivente ganha tudo! Responda questões corretamente para eliminar oponentes e sobreviver ao caos.
        </motion.p>
      </motion.div>

      {/* Battle Royale Mode Selector */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="px-4"
      >
        <BattleRoyaleModeSelector />
      </motion.div>

      {/* Bottom Navigation */}
      <FloatingNavbar />
    </div>
  );
}