import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { 
  Zap, 
  Users, 
  Sword, 
  Crown,
  Target,
  Shield,
  Flame
} from 'lucide-react';
import { useI18n } from '@/hooks/use-i18n';
import { useIsMobile } from '@/hooks/use-mobile';

interface ModeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  mode: 'solo' | 'squad' | 'chaos';
  onSelect: (mode: 'solo' | 'squad' | 'chaos') => void;
}

function ModeCard({ title, description, icon, gradient, mode, onSelect }: ModeCardProps) {
  const isMobile = useIsMobile();
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <Card 
        className={`h-full cursor-pointer relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 group bg-gradient-to-br ${gradient}`}
        onClick={() => onSelect(mode)}
      >
        <CardContent className="p-6 relative z-10">
          <div className="text-center space-y-4">
            <motion.div
              className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
              whileHover={{ 
                rotate: [0, -10, 10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 0.6 }}
            >
              {icon}
            </motion.div>
            
            <div>
              <h3 className={`font-bold text-white mb-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                {title}
              </h3>
              <p className={`text-white/80 ${isMobile ? 'text-sm' : 'text-base'}`}>
                {description}
              </p>
            </div>
            
            <Button 
              variant="secondary" 
              className="w-full bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
            >
              <Flame className="w-4 h-4 mr-2" />
              Entrar na Arena
            </Button>
          </div>
        </CardContent>
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-destructive/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Card>
    </motion.div>
  );
}

export function BattleRoyaleModeSelector() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleModeSelect = (mode: 'solo' | 'squad' | 'chaos') => {
    // Navigate to arena with selected mode
    navigate(`/battle-royale/arena?mode=${mode}&topic=geral&difficulty=medio`);
  };

  const modes = [
    {
      title: 'Solo',
      description: 'Batalha individual contra até 99 outros jogadores',
      icon: <Target className="w-8 h-8 text-white" />,
      gradient: 'from-warning/80 to-warning-foreground/80',
      mode: 'solo' as const
    },
    {
      title: 'Squad',
      description: 'Times de 2-4 pessoas contra outros times',
      icon: <Users className="w-8 h-8 text-white" />,
      gradient: 'from-info/80 to-info-foreground/80',
      mode: 'squad' as const
    },
    {
      title: 'Chaos',
      description: 'Free-for-all com elementos aleatórios',
      icon: <Sword className="w-8 h-8 text-white" />,
      gradient: 'from-destructive/80 to-destructive-foreground/80',
      mode: 'chaos' as const
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header with animated crown */}
      <div className="text-center">
        <motion.div
          animate={{ 
            rotateY: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-4"
        >
          <Crown className="w-16 h-16 mx-auto text-warning" />
        </motion.div>
        
        <h2 className={`font-bold text-gradient mb-2 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
          Battle Royale de Conhecimento
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Escolha seu modo e entre numa arena com até 100 jogadores simultâneos!
        </p>
      </div>

      {/* Mode Cards */}
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
        {modes.map((mode) => (
          <ModeCard
            key={mode.mode}
            title={mode.title}
            description={mode.description}
            icon={mode.icon}
            gradient={mode.gradient}
            mode={mode.mode}
            onSelect={handleModeSelect}
          />
        ))}
      </div>

      {/* Battle Rules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-muted/30 p-6 rounded-lg backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Como Funciona</h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <div className="font-medium text-warning">⚡ Rodadas Rápidas</div>
            <div className="text-muted-foreground">Responda questões em 30 segundos</div>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-destructive">💀 Eliminação</div>
            <div className="text-muted-foreground">Jogadores são eliminados a cada rodada</div>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-success">🏆 Vitória</div>
            <div className="text-muted-foreground">Último sobrevivente ganha tudo</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}