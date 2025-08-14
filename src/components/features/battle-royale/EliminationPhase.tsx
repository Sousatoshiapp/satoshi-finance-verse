import React from 'react';
import { motion } from 'framer-motion';
import { Skull } from 'lucide-react';

interface EliminationPhaseProps {
  eliminatedParticipants: any[];
  survivingCount: number;
  onContinue: () => void;
}

export function EliminationPhase({ eliminatedParticipants, survivingCount }: EliminationPhaseProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center space-y-6"
    >
      <Skull className="w-24 h-24 mx-auto text-destructive" />
      <h2 className="text-2xl font-bold">Eliminação!</h2>
      <p className="text-lg">{eliminatedParticipants.length} jogadores eliminados</p>
      <p className="text-muted-foreground">{survivingCount} sobreviventes restantes</p>
    </motion.div>
  );
}