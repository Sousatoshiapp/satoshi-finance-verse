import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sword, Users, Zap } from 'lucide-react';
import { Button } from '@/components/shared/ui/button';
import { BattleRoyaleMode } from '@/components/features/battle-royale/BattleRoyaleMode';
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
            {!isMobile && 'Back'}
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

        {/* Battle Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <motion.div 
            className="text-center p-3 bg-muted/50 rounded-lg backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Zap className="w-5 h-5 text-warning mx-auto mb-1" />
            <div className="text-sm font-semibold">Solo</div>
            <div className="text-xs text-muted-foreground">1v1v1v1</div>
          </motion.div>
          
          <motion.div 
            className="text-center p-3 bg-muted/50 rounded-lg backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Users className="w-5 h-5 text-info mx-auto mb-1" />
            <div className="text-sm font-semibold">Squad</div>
            <div className="text-xs text-muted-foreground">2v2v2v2</div>
          </motion.div>
          
          <motion.div 
            className="text-center p-3 bg-muted/50 rounded-lg backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sword className="w-5 h-5 text-destructive mx-auto mb-1" />
            <div className="text-sm font-semibold">Chaos</div>
            <div className="text-xs text-muted-foreground">Free for all</div>
          </motion.div>
        </motion.div>

        {/* Description */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-center max-w-md mx-auto mb-8"
        >
          Last person standing wins! Answer questions correctly to eliminate opponents and survive the chaos.
        </motion.p>
      </motion.div>

      {/* Full-screen Battle Royale Component */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="px-4"
      >
        <BattleRoyaleMode />
      </motion.div>

      {/* Bottom Navigation */}
      <FloatingNavbar />
    </div>
  );
}