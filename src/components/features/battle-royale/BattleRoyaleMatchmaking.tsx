import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
// Simple button component
const Button = ({ children, onClick, variant, size, className }: any) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 rounded transition-colors ${className || ''} ${
      variant === 'outline' ? 'border border-current' : 'bg-casino-gold text-casino-dark'
    }`}
  >
    {children}
  </button>
);
import { Crown, Users, Clock, Target, Zap } from 'lucide-react';
import { useBattleRoyaleMatchmaking } from '@/hooks/useBattleRoyaleMatchmaking';

interface BattleRoyaleMatchmakingProps {
  mode: string;
  topic: string;
  difficulty: string;
  onSessionFound: (sessionId: string, sessionCode: string) => void;
  onCancel: () => void;
}

export const BattleRoyaleMatchmaking: React.FC<BattleRoyaleMatchmakingProps> = ({
  mode,
  topic,
  difficulty,
  onSessionFound,
  onCancel,
}) => {
  const {
    isSearching,
    foundSession,
    sessionId,
    sessionCode,
    searchTime,
    queuePosition,
    estimatedWaitTime,
    activeSessions,
    currentPlayers,
    maxPlayers,
    error,
    startMatchmaking,
    cancelMatchmaking,
  } = useBattleRoyaleMatchmaking();

  useEffect(() => {
    startMatchmaking(mode, topic, difficulty);
  }, [startMatchmaking, mode, topic, difficulty]);

  useEffect(() => {
    if (foundSession && sessionId && sessionCode) {
      onSessionFound(sessionId, sessionCode);
    }
  }, [foundSession, sessionId, sessionCode, onSessionFound]);

  const handleCancel = async () => {
    await cancelMatchmaking();
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'solo': return <Crown className="w-5 h-5" />;
      case 'squad': return <Users className="w-5 h-5" />;
      case 'chaos': return <Zap className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getProgressPercentage = () => {
    const maxTime = estimatedWaitTime;
    return Math.min((searchTime / maxTime) * 100, 95);
  };

  if (error) {
    return (
      <div className="casino-glass-card p-6 text-center">
        <div className="text-destructive mb-4">
          <Target className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={onCancel} variant="outline" size="sm">
          Voltar
        </Button>
      </div>
    );
  }

  if (foundSession) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="casino-glass-card p-6 text-center border-success"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
          className="text-success mb-4"
        >
          <Crown className="w-8 h-8 mx-auto mb-2" />
        </motion.div>
        <h3 className="text-lg font-bold text-casino-gold mb-2">Sessão Encontrada!</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {currentPlayers}/{maxPlayers} jogadores
        </p>
        <div className="space-y-2">
          <div className="text-xs text-casino-gold font-mono">{sessionCode}</div>
          <div className="text-xs text-muted-foreground">Entrando na arena...</div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="casino-glass-card p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-casino-gold mb-3"
        >
          {getModeIcon()}
        </motion.div>
        <h3 className="text-lg font-bold text-casino-gold mb-1">
          Procurando {mode === 'solo' ? 'Duelo Solo' : mode === 'squad' ? 'Esquadrão' : 'Caos Total'}
        </h3>
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex items-center justify-center gap-2">
            <Target className="w-3 h-3" />
            <span>{topic} • {difficulty}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="casino-stat-card">
          <div className="casino-stat-value">{formatTime(searchTime)}</div>
          <div className="casino-stat-label">
            <Clock className="w-3 h-3" />
            Tempo de Busca
          </div>
        </div>

        <div className="casino-stat-card">
          <div className="casino-stat-value">{queuePosition}</div>
          <div className="casino-stat-label">
            <Users className="w-3 h-3" />
            Posição na Fila
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Progresso da Busca</span>
          <span>~{Math.max(0, estimatedWaitTime - searchTime)}s restantes</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-casino-gold h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Info */}
      <div className="space-y-3 mb-6">
        <div className="casino-info-item">
          <Users className="w-4 h-4 text-casino-gold" />
          <span className="text-sm">
            {activeSessions} sessões ativas
          </span>
        </div>
        
        {queuePosition > 1 && (
          <div className="casino-info-item">
            <Clock className="w-4 h-4 text-casino-purple" />
            <span className="text-sm">
              {queuePosition - 1} jogadores à sua frente
            </span>
          </div>
        )}

        <div className="casino-info-item">
          <Target className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">
            Máximo de {mode === 'solo' ? '100' : mode === 'squad' ? '80' : '50'} jogadores por arena
          </span>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-muted/20 rounded-lg p-4 mb-6">
        <h4 className="text-xs font-medium text-casino-gold mb-2">💡 Dicas:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Modo Solo: busca mais rápida</li>
          <li>• Tópicos populares encontram mais jogadores</li>
          <li>• Horários de pico: 18h-22h</li>
        </ul>
      </div>

      {/* Action */}
      <Button 
        onClick={handleCancel}
        variant="outline" 
        size="sm" 
        className="w-full"
      >
        Cancelar Busca
      </Button>

      {/* Background Animation */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-lg">
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 20% 80%, rgba(120, 53, 15, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, rgba(120, 53, 15, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 40%, rgba(120, 53, 15, 0.3) 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0"
        />
      </div>
    </div>
  );
};