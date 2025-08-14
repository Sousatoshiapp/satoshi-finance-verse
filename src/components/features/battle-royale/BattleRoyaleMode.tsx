import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { useBattleRoyale } from '@/hooks/useBattleRoyale';
import { useProfile } from '@/hooks/use-profile';
import { useToast } from '@/hooks/use-toast';
import { 
  Crown, 
  Users, 
  Clock, 
  Target, 
  Zap, 
  Trophy, 
  Sword,
  Shield,
  Flame
} from 'lucide-react';

export const BattleRoyaleMode = memo(() => {
  const [currentMode, setCurrentMode] = useState<'solo' | 'squad'>('solo');
  const { toast } = useToast();
  const { profile } = useProfile();
  const { matches, stats, queuePosition, joinQueue } = useBattleRoyale();

  const handleJoin = async () => {
    if (!profile?.id) {
      toast({
        title: "Login Required",
        description: "Please login to join the battle queue!",
        variant: "destructive"
      });
      return;
    }

    const result = await joinQueue(profile.id, 100, 'general');
    if (result.success) {
      toast({
        title: "🎯 Joined Queue!",
        description: queuePosition ? `Position #${queuePosition} in queue` : "Looking for opponents...",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to join queue",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Mode Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sword className="w-6 h-6" />
            Battle Royale de Conhecimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              variant={currentMode === 'solo' ? 'default' : 'outline'}
              onClick={() => setCurrentMode('solo')}
              className="flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Solo
            </Button>
            <Button
              variant={currentMode === 'squad' ? 'default' : 'outline'}
              onClick={() => setCurrentMode('squad')}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Squad (3-4 pessoas)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Battle Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Battle Arena Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{stats.activeMatches}</div>
                <div className="text-sm text-muted-foreground">Active Battles</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{stats.totalPlayers}</div>
                <div className="text-sm text-muted-foreground">Players Online</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{stats.averageLevel}</div>
                <div className="text-sm text-muted-foreground">Avg Level</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{matches.length}</div>
                <div className="text-sm text-muted-foreground">Recent Matches</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Join Battle */}
      <Card className="p-8 text-center">
        <motion.div
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        >
          <Crown className="w-16 h-16 mx-auto mb-4 text-primary" />
        </motion.div>
        <h3 className="text-xl font-semibold mb-2">
          {queuePosition ? `Queue Position: #${queuePosition}` : 'Ready for Battle?'}
        </h3>
        <p className="text-muted-foreground mb-4">
          {matches.length > 0 
            ? `${matches.filter(m => m.status === 'active').length} battles currently active!`
            : 'Join the queue and battle other players in real-time knowledge duels!'
          }
        </p>
        <Button onClick={handleJoin} className="bg-gradient-primary" disabled={!!queuePosition}>
          <Flame className="w-4 h-4 mr-2" />
          {queuePosition ? 'In Queue...' : 'Join Battle Queue'}
        </Button>
      </Card>

      {/* Recent Matches */}
      {matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Battles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {matches.slice(0, 5).map((match) => (
                <div key={match.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <img 
                      src={match.player1.avatar?.image_url || '/placeholder-avatar.png'} 
                      alt={match.player1.nickname}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium">{match.player1.nickname}</span>
                    <span className="text-muted-foreground">vs</span>
                    <img 
                      src={match.player2.avatar?.image_url || '/placeholder-avatar.png'} 
                      alt={match.player2.nickname}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium">{match.player2.nickname}</span>
                  </div>
                  <Badge variant={
                    match.status === 'active' ? 'default' : 
                    match.status === 'completed' ? 'secondary' : 'outline'
                  }>
                    {match.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

BattleRoyaleMode.displayName = 'BattleRoyaleMode';