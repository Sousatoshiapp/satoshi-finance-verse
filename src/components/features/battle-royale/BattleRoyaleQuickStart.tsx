import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Users, Zap, Coins, Clock, PlayCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/shared/ui/card';
import { BattleRoyaleMatchmaking } from './BattleRoyaleMatchmaking';
import { BetConfirmDialog } from './BetConfirmDialog';
import { useRealtimePoints } from '@/hooks/use-realtime-points';
import { useBattleRoyaleStats } from '@/hooks/use-battle-royale-stats';

interface BattleRoyaleQuickStartProps {
  onSessionJoined: (sessionId: string, sessionCode: string) => void;
}

export const BattleRoyaleQuickStart: React.FC<BattleRoyaleQuickStartProps> = ({
  onSessionJoined,
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [showBetDialog, setShowBetDialog] = useState(false);
  const [pendingMode, setPendingMode] = useState<string | null>(null);
  const { points: userBTZ, isLoading: btzLoading } = useRealtimePoints();
  const { stats, isLoading: statsLoading } = useBattleRoyaleStats();

  const ENTRY_FEE = 10; // 10 BTZ entry fee
  const hasEnoughBTZ = userBTZ >= ENTRY_FEE;

  const handleModeSelect = (mode: string) => {
    if (!hasEnoughBTZ && !btzLoading) {
      return; // Prevent action if insufficient BTZ
    }
    setPendingMode(mode);
    setShowBetDialog(true);
  };

  const handleBetConfirm = () => {
    if (pendingMode) {
      setSelectedMode(pendingMode);
      setIsSearching(true);
      setShowBetDialog(false);
      setPendingMode(null);
    }
  };

  const handleBetCancel = () => {
    setShowBetDialog(false);
    setPendingMode(null);
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
        topic="general"
        difficulty="medium"
        onSessionFound={handleSessionFound}
        onCancel={handleCancel}
      />
    );
  }

  const battleModes = [
    { 
      id: 'solo', 
      name: 'Solo', 
      icon: Crown, 
      maxPlayers: '100',
      color: 'text-amber-400'
    },
    { 
      id: 'squad', 
      name: 'Squad', 
      icon: Users, 
      maxPlayers: '80',
      color: 'text-purple-400'
    },
    { 
      id: 'chaos', 
      name: 'Chaos', 
      icon: Zap, 
      maxPlayers: '50',
      color: 'text-red-400'
    }
  ];

  return (
    <div className="max-w-md mx-auto space-y-8">
      {/* Header - Compact */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="relative inline-block mb-2">
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Crown className="h-8 w-8 text-amber-400 mx-auto casino-coin-glow" />
          </motion.div>
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
          Battle Royale Arena
        </h1>
        <p className="text-xs text-muted-foreground">
          Sobreviva e conquiste o troféu!
        </p>
      </motion.div>

      {/* Entry Fee Info - Compact */}
      <Card className="casino-card bg-black/40 backdrop-blur-sm border-purple-500/30">
        <CardContent className="p-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-400" />
              <span className="text-white font-semibold">Taxa: {ENTRY_FEE} BTZ</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Saldo:</span>
              <span className={`font-bold ${hasEnoughBTZ ? 'text-amber-400' : 'text-red-400'}`}>
                {btzLoading ? "..." : userBTZ.toFixed(2)} BTZ
              </span>
            </div>
          </div>
          {!hasEnoughBTZ && !btzLoading && (
            <div className="mt-2 text-red-400 text-xs">
              ⚠️ Saldo insuficiente
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mode Selection - Compact 3x1 Grid */}
      <Card className="casino-card bg-black/40 backdrop-blur-sm border-purple-500/30">
        <CardContent className="p-3">
          <h2 className="text-sm font-bold mb-3 text-white text-center">Selecione o Modo</h2>
          <div className="grid grid-cols-3 gap-2">
            {battleModes.map((mode) => {
              const IconComponent = mode.icon;
              
              return (
                <button
                  key={mode.id}
                  onClick={() => hasEnoughBTZ && !btzLoading && handleModeSelect(mode.id)}
                  className={`p-2 rounded-lg border-2 transition-all duration-300 casino-topic-card ${
                    hasEnoughBTZ && !btzLoading
                      ? 'border-purple-500/30 bg-black/20 text-gray-300 casino-hover hover:border-purple-500/60 hover:bg-purple-500/10'
                      : 'border-gray-600/30 bg-gray-800/20 text-gray-500 opacity-60 cursor-not-allowed'
                  }`}
                  disabled={!hasEnoughBTZ || btzLoading}
                >
                  <IconComponent className={`h-3 w-3 mb-1 mx-auto ${mode.color}`} />
                  <div className="text-xs font-medium">{mode.name}</div>
                  <div className="text-[10px] text-muted-foreground">{mode.maxPlayers}</div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Statistics */}
      <Card className="casino-card bg-black/40 backdrop-blur-sm border-purple-500/30">
        <CardContent className="p-3">
          <h2 className="text-sm font-bold mb-3 text-white text-center">Estatísticas</h2>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <PlayCircle className="h-4 w-4 text-green-400 mx-auto mb-1" />
              <div className="text-xs font-medium text-white">
                {statsLoading ? "..." : stats.activeSessions}
              </div>
              <div className="text-[10px] text-muted-foreground">Sessões Ativas</div>
            </div>
            
            <div className="text-center">
              <Users className="h-4 w-4 text-blue-400 mx-auto mb-1" />
              <div className="text-xs font-medium text-white">
                {statsLoading ? "..." : stats.onlinePlayers}
              </div>
              <div className="text-[10px] text-muted-foreground">Jogadores Online</div>
            </div>
            
            <div className="text-center">
              <Clock className="h-4 w-4 text-purple-400 mx-auto mb-1" />
              <div className="text-xs font-medium text-white">
                {statsLoading ? "..." : `${stats.averageWaitTime}s`}
              </div>
              <div className="text-[10px] text-muted-foreground">Tempo Médio</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Action Button */}
      <div className="text-center">
        <button
          disabled={!hasEnoughBTZ || btzLoading}
          className={`relative z-60 w-full py-2 px-6 font-bold text-sm rounded-lg transition-all duration-300 border-2 ${
            !hasEnoughBTZ || btzLoading 
              ? 'opacity-50 cursor-not-allowed border-gray-500 text-gray-500' 
              : 'hover:brightness-110 border-[#adff2f] text-[#adff2f]'
          }`}
          style={!hasEnoughBTZ || btzLoading ? {} : { 
            backgroundColor: 'transparent',
            boxShadow: '0 0 10px rgba(173, 255, 47, 0.5)',
            minHeight: '28px'
          }}
        >
          {btzLoading ? (
            "Carregando..."
          ) : !hasEnoughBTZ ? (
            "BTZ Insuficiente"
          ) : (
            <>
              <Crown className="h-4 w-4 mr-2 inline" />
              ENTRAR NA ARENA
            </>
          )}
        </button>
      </div>

      {/* Bet Confirmation Dialog */}
      <BetConfirmDialog
        isOpen={showBetDialog}
        onClose={handleBetCancel}
        onConfirm={handleBetConfirm}
        mode={pendingMode || ''}
        entryFee={ENTRY_FEE}
        userBTZ={userBTZ}
        isLoading={false}
      />
    </div>
  );
};