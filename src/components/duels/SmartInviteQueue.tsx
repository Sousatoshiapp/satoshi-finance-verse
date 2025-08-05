import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/ui/tabs';
import { Progress } from '@/components/shared/ui/progress';
import { AvatarDisplayUniversal } from '@/components/shared/avatar-display-universal';
import { 
  Clock, 
  Target, 
  Users, 
  Zap, 
  CheckCircle,
  XCircle,
  Timer,
  Settings
} from 'lucide-react';
import { useMatchmakingPreferences } from '@/hooks/useMatchmakingPreferences';

interface SmartInviteQueueProps {
  invites: any[];
  onAccept: (inviteId: string) => void;
  onDecline: (inviteId: string) => void;
  onBulkAction: (action: 'accept-all' | 'decline-all', filters?: any) => void;
}

const topicsMap: Record<string, string> = {
  "financas": "Finanças Gerais",
  "investimentos": "Investimentos", 
  "criptomoedas": "Criptomoedas",
  "economia": "Economia"
};

export function SmartInviteQueue({ 
  invites, 
  onAccept, 
  onDecline, 
  onBulkAction 
}: SmartInviteQueueProps) {
  const { preferences } = useMatchmakingPreferences();
  const [selectedTab, setSelectedTab] = useState<'all' | 'priority' | 'filtered'>('all');
  const [timers, setTimers] = useState<Record<string, number>>({});

  // Update timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const updated = { ...prev };
        invites.forEach(invite => {
          const timeLeft = Math.max(0, 30 - Math.floor((Date.now() - new Date(invite.created_at).getTime()) / 1000));
          updated[invite.id] = timeLeft;
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [invites]);

  // Categorize invites
  const priorityInvites = invites.filter(invite => 
    preferences.preferredTopics.includes(invite.quiz_topic) ||
    invite.challenger?.level >= 20 // High level players
  );

  const filteredInvites = invites.filter(invite => {
    if (!preferences.allowBots && invite.challenger?.is_bot) return false;
    if (preferences.skillLevelRange === 'similar') {
      // Assume current user level logic here
      return true; // Simplified for demo
    }
    return true;
  });

  const getInvitesByTab = () => {
    switch (selectedTab) {
      case 'priority':
        return priorityInvites;
      case 'filtered':
        return filteredInvites;
      default:
        return invites;
    }
  };

  const getTimeProgress = (inviteId: string) => {
    const timeLeft = timers[inviteId] || 30;
    return ((30 - timeLeft) / 30) * 100;
  };

  if (invites.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum convite pendente</h3>
          <p className="text-muted-foreground">
            Quando receber convites de duelo, eles aparecerão aqui
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              Fila de Convites Inteligente
              <Badge variant="secondary">{invites.length}</Badge>
            </CardTitle>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction('accept-all')}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Aceitar Todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction('decline-all')}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Recusar Todos
              </Button>
            </div>
          </div>

          <Tabs value={selectedTab} onValueChange={(value: any) => setSelectedTab(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Todos ({invites.length})
              </TabsTrigger>
              <TabsTrigger value="priority" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Prioritários ({priorityInvites.length})
              </TabsTrigger>
              <TabsTrigger value="filtered" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Filtrados ({filteredInvites.length})
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <TabsContent value={selectedTab} className="space-y-4">
                <AnimatePresence>
                  {getInvitesByTab().map((invite, index) => {
                    const timeLeft = timers[invite.id] || 30;
                    const progress = getTimeProgress(invite.id);
                    const isPriority = priorityInvites.includes(invite);
                    
                    return (
                      <motion.div
                        key={invite.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isPriority 
                            ? 'border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50' 
                            : 'border-border bg-card'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <AvatarDisplayUniversal
                            avatarName={invite.challenger?.avatars?.name}
                            avatarUrl={invite.challenger?.avatars?.image_url}
                            nickname={invite.challenger?.nickname}
                            size="md"
                            className={isPriority ? 'ring-2 ring-orange-300' : ''}
                          />

                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold flex items-center gap-2">
                                  {invite.challenger?.nickname}
                                  {isPriority && (
                                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                                      <Zap className="h-3 w-3 mr-1" />
                                      Prioritário
                                    </Badge>
                                  )}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Nível {invite.challenger?.level} • {invite.challenger?.xp} XP
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  {topicsMap[invite.quiz_topic] || invite.quiz_topic}
                                </Badge>
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Timer className="h-3 w-3" />
                                  {timeLeft}s
                                </Badge>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Progress 
                                value={progress} 
                                className={`h-2 ${
                                  timeLeft <= 10 ? 'bg-red-100' : 
                                  timeLeft <= 20 ? 'bg-yellow-100' : 'bg-green-100'
                                }`}
                              />
                              
                              <div className="flex justify-between items-center">
                                <p className="text-xs text-muted-foreground">
                                  Recebido às {new Date(invite.created_at).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDecline(invite.id)}
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Recusar
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => onAccept(invite.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Aceitar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {getInvitesByTab().length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {selectedTab === 'priority' ? 'Nenhum convite prioritário' :
                       selectedTab === 'filtered' ? 'Nenhum convite filtrado' :
                       'Nenhum convite disponível'}
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedTab === 'priority' ? 'Convites de tópicos preferidos aparecerão aqui' :
                       selectedTab === 'filtered' ? 'Convites que atendem suas preferências aparecerão aqui' :
                       'Aguarde novos convites chegarem'}
                    </p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </CardHeader>
      </Card>
    </motion.div>
  );
}