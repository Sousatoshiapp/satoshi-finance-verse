import React from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, Swords, Clock, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { BattleRoyaleSession, BattleRoyaleParticipant } from '@/hooks/useBattleRoyaleReal';

interface LobbyPhaseProps {
  session: BattleRoyaleSession | null;
  participants: BattleRoyaleParticipant[];
  onStartGame: () => void;
}

export function LobbyPhase({ session, participants, onStartGame }: LobbyPhaseProps) {
  if (!session) return null;

  const progress = (participants.length / session.max_players) * 100;
  const canStart = participants.length >= 2;
  const isCreator = true; // For now, assume user can start the game

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="space-y-6"
    >
      {/* Session Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-destructive/5">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Swords className="w-8 h-8 text-destructive" />
            Arena de Batalha
            <Swords className="w-8 h-8 text-destructive" />
          </CardTitle>
          <p className="text-muted-foreground">
            Aguardando jogadores para iniciar a batalha épica
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Jogadores</span>
              <span>{participants.length}/{session.max_players}</span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-destructive"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Session Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Crown className="w-6 h-6 text-warning mx-auto mb-2" />
              <div className="font-semibold text-sm capitalize">{session.mode}</div>
              <div className="text-xs text-muted-foreground">Modo</div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Trophy className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="font-semibold text-sm">{session.prize_pool}</div>
              <div className="text-xs text-muted-foreground">Prêmio BTZ</div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Clock className="w-6 h-6 text-info mx-auto mb-2" />
              <div className="font-semibold text-sm">{session.total_rounds}</div>
              <div className="text-xs text-muted-foreground">Rodadas</div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Users className="w-6 h-6 text-success mx-auto mb-2" />
              <div className="font-semibold text-sm">{session.difficulty}</div>
              <div className="text-xs text-muted-foreground">Dificuldade</div>
            </div>
          </div>

          {/* Topic and Rules */}
          <div className="text-center p-4 bg-muted/30 rounded-lg border">
            <Badge variant="secondary" className="mb-2">
              {session.topic}
            </Badge>
            <h3 className="font-semibold mb-2">Regras da Batalha</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Responda perguntas rapidamente para ganhar pontos</p>
              <p>• Os piores jogadores são eliminados a cada rodada</p>
              <p>• Último sobrevivente vence o prêmio total</p>
              <p>• Use power-ups estrategicamente para sobreviver</p>
            </div>
          </div>

          {/* Start Button */}
          {isCreator && (
            <motion.div
              className="text-center"
              whileHover={{ scale: canStart ? 1.05 : 1 }}
              whileTap={{ scale: canStart ? 0.95 : 1 }}
            >
              <Button 
                size="lg" 
                className="px-8"
                disabled={!canStart}
                onClick={onStartGame}
              >
                {canStart ? (
                  <>
                    <Swords className="w-5 h-5 mr-2" />
                    Iniciar Batalha!
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5 mr-2" />
                    Aguardando mais jogadores...
                  </>
                )}
              </Button>
              {!canStart && (
                <p className="text-xs text-muted-foreground mt-2">
                  Mínimo 2 jogadores necessários
                </p>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Waiting Animation */}
      <div className="text-center">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="inline-flex items-center gap-2 text-muted-foreground"
        >
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
          Preparando arena de batalha...
        </motion.div>
      </div>
    </motion.div>
  );
}