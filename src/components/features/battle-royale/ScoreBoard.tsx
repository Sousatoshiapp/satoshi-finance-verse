import React from 'react';
import { Trophy } from 'lucide-react';
import { BattleRoyaleParticipant } from '@/hooks/useBattleRoyaleReal';

interface ScoreBoardProps {
  participants: BattleRoyaleParticipant[];
  myParticipantId?: string;
  isLive: boolean;
}

export function ScoreBoard({ participants, myParticipantId }: ScoreBoardProps) {
  const sortedParticipants = [...participants].sort((a, b) => b.total_score - a.total_score);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-warning" />
        <h3 className="font-semibold text-lg">Ranking</h3>
      </div>
      <div className="space-y-2">
        {sortedParticipants.slice(0, 10).map((participant, index) => (
          <div
            key={participant.id}
            className={`p-3 rounded-lg border ${
              participant.id === myParticipantId ? 'border-primary bg-primary/5' : 'border-muted'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold w-6">#{index + 1}</span>
                <span className="text-sm truncate">
                  {participant.profiles?.nickname || 'Jogador'}
                </span>
              </div>
              <span className="text-sm font-semibold text-primary">
                {participant.total_score}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}