import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/shared/ui/button';
import { Crown, Users, Zap, Target, Coins } from 'lucide-react';
import { BattleRoyaleMatchmaking } from './BattleRoyaleMatchmaking';
import { useRealtimePoints } from '@/hooks/use-realtime-points';
import { Card } from '@/components/shared/ui/card';

interface BattleRoyaleQuickStartProps {
  onSessionJoined: (sessionId: string, sessionCode: string) => void;
}

export const BattleRoyaleQuickStart: React.FC<BattleRoyaleQuickStartProps> = ({
  onSessionJoined,
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState('general');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const { points: userBTZ, isLoading: btzLoading } = useRealtimePoints();

  const ENTRY_FEE = 10; // 10 BTZ entry fee
  const hasEnoughBTZ = userBTZ >= ENTRY_FEE;

  const handleQuickStart = (mode: string) => {
    if (!hasEnoughBTZ && !btzLoading) {
      return; // Prevent action if insufficient BTZ
    }
    setSelectedMode(mode);
    setIsSearching(true);
  };

  const handleSessionFound = (sessionId: string, sessionCode: string) => {
    setIsSearching(false);
    setSelectedMode(null);
    onSessionJoined(sessionId, sessionCode);
  };

  const handleCancel = () => {
    setIsSearching(false);
    setSelectedMode(null);
  };

  if (isSearching && selectedMode) {
    return (
      <BattleRoyaleMatchmaking
        mode={selectedMode}
        topic={selectedTopic}
        difficulty={selectedDifficulty}
        onSessionFound={handleSessionFound}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-casino-gold mb-4"
        >
          <Crown className="w-12 h-12 mx-auto" />
        </motion.div>
        <h2 className="text-2xl font-bold text-casino-gold mb-2">
          Battle Royale Arena
        </h2>
        <p className="text-muted-foreground">
          Escolha seu modo e entre na batalha!
        </p>
      </div>

      {/* Entry Fee Info */}
      <Card className="casino-glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-casino-gold" />
            <span className="text-sm font-medium">Entry Fee:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-casino-gold">{ENTRY_FEE} BTZ</span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Seu saldo:</span>
          <span className={`font-medium ${hasEnoughBTZ ? 'text-casino-gold' : 'text-destructive'}`}>
            {btzLoading ? '...' : `${userBTZ.toFixed(1)} BTZ`}
          </span>
        </div>
        {!hasEnoughBTZ && !btzLoading && (
          <div className="mt-2 text-xs text-destructive">
            ⚠️ BTZ insuficiente para entrar na batalha
          </div>
        )}
      </Card>

      {/* Mode Selection */}
      <div className="space-y-4">
        <motion.div
          whileHover={{ scale: hasEnoughBTZ ? 1.02 : 1 }}
          whileTap={{ scale: hasEnoughBTZ ? 0.98 : 1 }}
        >
          <Button
            onClick={() => handleQuickStart('solo')}
            disabled={!hasEnoughBTZ || btzLoading}
            className={`w-full h-16 casino-glass-card flex items-center gap-4 text-left border-casino-gold/30 hover:border-casino-gold transition-opacity ${
              !hasEnoughBTZ ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            variant="outline"
          >
            <Crown className="w-8 h-8 text-casino-gold" />
            <div>
              <div className="font-bold text-casino-gold">Solo Battle</div>
              <div className="text-sm text-muted-foreground">
                100 jogadores • Sobreviva sozinho
              </div>
            </div>
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: hasEnoughBTZ ? 1.02 : 1 }}
          whileTap={{ scale: hasEnoughBTZ ? 0.98 : 1 }}
        >
          <Button
            onClick={() => handleQuickStart('squad')}
            disabled={!hasEnoughBTZ || btzLoading}
            className={`w-full h-16 casino-glass-card flex items-center gap-4 text-left border-casino-purple/30 hover:border-casino-purple transition-opacity ${
              !hasEnoughBTZ ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            variant="outline"
          >
            <Users className="w-8 h-8 text-casino-purple" />
            <div>
              <div className="font-bold text-casino-purple">Squad Battle</div>
              <div className="text-sm text-muted-foreground">
                80 jogadores • Forme uma equipe
              </div>
            </div>
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: hasEnoughBTZ ? 1.02 : 1 }}
          whileTap={{ scale: hasEnoughBTZ ? 0.98 : 1 }}
        >
          <Button
            onClick={() => handleQuickStart('chaos')}
            disabled={!hasEnoughBTZ || btzLoading}
            className={`w-full h-16 casino-glass-card flex items-center gap-4 text-left border-destructive/30 hover:border-destructive transition-opacity ${
              !hasEnoughBTZ ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            variant="outline"
          >
            <Zap className="w-8 h-8 text-destructive" />
            <div>
              <div className="font-bold text-destructive">Chaos Mode</div>
              <div className="text-sm text-muted-foreground">
                50 jogadores • Eliminação rápida
              </div>
            </div>
          </Button>
        </motion.div>
      </div>

      {/* Quick Settings */}
      <div className="casino-glass-card p-4 space-y-3">
        <h3 className="text-sm font-medium text-casino-gold">Configurações Rápidas</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Tópico</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full mt-1 bg-background border rounded px-2 py-1 text-sm"
            >
              <option value="general">Geral</option>
              <option value="science">Ciência</option>
              <option value="history">História</option>
              <option value="sports">Esportes</option>
            </select>
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground">Dificuldade</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full mt-1 bg-background border rounded px-2 py-1 text-sm"
            >
              <option value="easy">Fácil</option>
              <option value="medium">Médio</option>
              <option value="hard">Difícil</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="casino-glass-card p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-casino-gold">12</div>
            <div className="text-xs text-muted-foreground">Sessões Ativas</div>
          </div>
          <div>
            <div className="text-lg font-bold text-casino-purple">347</div>
            <div className="text-xs text-muted-foreground">Jogadores Online</div>
          </div>
          <div>
            <div className="text-lg font-bold text-casino-gold">~30s</div>
            <div className="text-xs text-muted-foreground">Tempo Médio</div>
          </div>
        </div>
      </div>
    </div>
  );
};