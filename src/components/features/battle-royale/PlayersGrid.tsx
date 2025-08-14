import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/shared/ui/avatar';
import { Badge } from '@/components/shared/ui/badge';
import { BattleRoyaleParticipant } from '@/hooks/useBattleRoyaleReal';

interface PlayersGridProps {
  participants: BattleRoyaleParticipant[];
  myParticipantId?: string;
  mode: string;
}

export function PlayersGrid({ participants, myParticipantId }: PlayersGridProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Jogadores ({participants.length})</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {participants.map((participant) => (
          <motion.div
            key={participant.id}
            className={`p-3 rounded-lg border ${
              participant.id === myParticipantId ? 'border-primary bg-primary/5' : 'border-muted'
            } ${!participant.is_alive ? 'opacity-50' : ''}`}
            layout
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback>
                  {participant.profiles?.nickname?.[0] || 'P'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {participant.profiles?.nickname || 'Jogador'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {participant.total_score} pts
                </p>
              </div>
              {!participant.is_alive && (
                <Badge variant="destructive" className="text-xs">
                  Eliminado
                </Badge>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}