import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
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

  const handleJoin = () => {
    toast({
      title: "🎯 Coming Soon!",
      description: "Battle Royale mode will be available soon!",
    });
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

      {/* Coming Soon */}
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
        <h3 className="text-xl font-semibold mb-2">Battle Royale Coming Soon!</h3>
        <p className="text-muted-foreground mb-4">
          Get ready for the ultimate knowledge showdown! Epic battles are coming soon.
        </p>
        <Button onClick={handleJoin} className="bg-gradient-primary">
          <Flame className="w-4 h-4 mr-2" />
          Join Waitlist
        </Button>
      </Card>
    </div>
  );
});

BattleRoyaleMode.displayName = 'BattleRoyaleMode';