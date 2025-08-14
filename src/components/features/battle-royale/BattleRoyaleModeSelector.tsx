import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/shared/ui/card';
import { 
  Users, 
  Sword, 
  Target
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ModeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  mode: 'solo' | 'squad' | 'chaos';
  onSelect: (mode: 'solo' | 'squad' | 'chaos') => void;
}

function ModeCard({ title, description, icon, mode, onSelect }: ModeCardProps) {
  return (
    <button
      onClick={() => onSelect(mode)}
      className="p-2 rounded-lg border-2 transition-all duration-300 casino-topic-card border-purple-500/30 bg-black/20 text-gray-300 casino-hover hover:border-purple-500/60 hover:bg-purple-500/10"
    >
      {icon}
      <div className="text-xs font-medium mt-1">{title}</div>
    </button>
  );
}

export function BattleRoyaleModeSelector() {
  const navigate = useNavigate();

  const handleModeSelect = (mode: 'solo' | 'squad' | 'chaos') => {
    // Navigate to arena with selected mode
    navigate(`/battle-royale/arena?mode=${mode}&topic=geral&difficulty=medio`);
  };

  const modes = [
    {
      title: 'Solo',
      description: 'Individual vs 99',
      icon: <Target className="h-3 w-3 mb-1 mx-auto" />,
      mode: 'solo' as const
    },
    {
      title: 'Squad',
      description: 'Times 2-4',
      icon: <Users className="h-3 w-3 mb-1 mx-auto" />,
      mode: 'squad' as const
    },
    {
      title: 'Chaos',
      description: 'Free-for-all',
      icon: <Sword className="h-3 w-3 mb-1 mx-auto" />,
      mode: 'chaos' as const
    }
  ];

  return (
    <Card className="casino-card bg-black/40 backdrop-blur-sm border-purple-500/30">
      <CardContent className="p-3">
        <h2 className="text-sm font-bold mb-3 text-white text-center">Escolha seu Modo</h2>
        <div className="grid grid-cols-3 gap-2">
          {modes.map((mode) => (
            <ModeCard
              key={mode.mode}
              title={mode.title}
              description={mode.description}
              icon={mode.icon}
              mode={mode.mode}
              onSelect={handleModeSelect}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}