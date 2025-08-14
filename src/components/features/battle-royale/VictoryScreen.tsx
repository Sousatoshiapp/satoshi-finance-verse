import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown } from 'lucide-react';
import { BattleRoyaleParticipant } from '@/hooks/useBattleRoyaleReal';

interface VictoryScreenProps {
  finalRankings: BattleRoyaleParticipant[];
  myParticipant: BattleRoyaleParticipant | null;
  prizePool: number;
}

export function VictoryScreen({ finalRankings, myParticipant, prizePool }: VictoryScreenProps) {
  const winner = finalRankings[0];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <Crown className="w-24 h-24 mx-auto text-warning" />
      <h2 className="text-3xl font-bold">👑 Vitória!</h2>
      <p className="text-xl">🏆 {winner?.profiles?.nickname} é o campeão!</p>
      <div className="bg-muted/30 p-4 rounded-lg">
        <p className="text-lg">Prêmio: <span className="font-bold text-primary">{prizePool} BTZ</span></p>
        {myParticipant && (
          <p className="text-sm text-muted-foreground mt-2">
            Sua posição: #{myParticipant.position}
          </p>
        )}
      </div>
    </motion.div>
  );
}