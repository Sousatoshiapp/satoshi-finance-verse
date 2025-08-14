import React from 'react';
import { motion } from 'framer-motion';

interface RoundProgressProps {
  currentRound: number;
  totalRounds: number;
}

export function RoundProgress({ currentRound, totalRounds }: RoundProgressProps) {
  const progress = (currentRound / totalRounds) * 100;
  
  return (
    <div className="text-center space-y-2">
      <div className="text-sm text-muted-foreground">
        Rodada {currentRound} de {totalRounds}
      </div>
      <div className="w-32 h-2 bg-muted/50 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-destructive"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}