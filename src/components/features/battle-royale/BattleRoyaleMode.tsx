import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { Progress } from '@/components/shared/ui/progress';
import { supabase } from '@/integrations/supabase/client';
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

interface BattleRoyaleSession {
  id: string;
  status: 'waiting' | 'starting' | 'active' | 'completed';
  max_players: number;
  current_players: number;
  entry_cost: number;
  prize_pool: number;
  questions_per_round: number;
  rounds_total: number;
  current_round: number;
  created_at: string;
  starts_at?: string;
  ends_at?: string;
  participants: BattleParticipant[];
}

interface BattleParticipant {
  id: string;
  user_id: string;
  session_id: string;
  position: number;
  score: number;
  is_eliminated: boolean;
  elimination_round?: number;
  user: {
    nickname: string;
    level: number;
    current_avatar_id?: string;
    avatar?: {
      image_url: string;
    };
  };
}

interface SquadMode {
  id: string;
  squad_name: string;
  squad_size: number;
  current_members: number;
  max_members: number;
  is_open: boolean;
  entry_cost: number;
  members: SquadMember[];
}

interface SquadMember {
  id: string;
  user_id: string;
  squad_id: string;
  is_leader: boolean;
  joined_at: string;
  user: {
    nickname: string;
    level: number;
    avatar?: {
      image_url: string;
    };
  };
}

export function BattleRoyaleMode() {
  const [activeSessions, setActiveSessions] = useState<BattleRoyaleSession[]>([]);
  const [squadModes, setSquadModes] = useState<SquadMode[]>([]);
  const [joinedSession, setJoinedSession] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<'solo' | 'squad'>('solo');
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useProfile();
  const { toast } = useToast();

  useEffect(() => {
    loadBattleRoyaleSessions();
    loadSquadModes();
    const interval = setInterval(() => {
      loadBattleRoyaleSessions();
      loadSquadModes();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadBattleRoyaleSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('battle_royale_sessions')
        .select(`
          *,
          participants:battle_royale_participants(
            *,
            profiles!user_id(
              nickname,
              level,
              current_avatar_id,
              avatars(image_url)
            )
          )
        `)
        .in('status', ['waiting', 'starting', 'active'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActiveSessions(data || []);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    }
  };

  const loadSquadModes = async () => {
    try {
      const { data, error } = await supabase
        .from('squad_battle_sessions')
        .select(`
          *,
          members:squad_members(
            *,
            profiles!user_id(
              nickname,
              level,
              avatars(image_url)
            )
          )
        `)
        .eq('is_open', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSquadModes(data || []);
    } catch (error) {
      console.error('Erro ao carregar squads:', error);
    }
  };

  const joinBattleRoyale = async (sessionId: string) => {
    if (!profile?.id) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('battle_royale_participants')
        .insert({
          session_id: sessionId,
          user_id: profile.id
        });

      if (error) throw error;

      setJoinedSession(sessionId);
      toast({
        title: "🎯 Entrou na batalha!",
        description: "Prepare-se para o Battle Royale!",
      });
      
      loadBattleRoyaleSessions();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível entrar na sessão",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createSquad = async () => {
    if (!profile?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('squad_battle_sessions')
        .insert({
          squad_name: `Squad de ${profile.nickname}`,
          squad_size: 3,
          max_members: 3,
          entry_cost: 500,
          created_by: profile.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as squad leader
      await supabase
        .from('squad_members')
        .insert({
          squad_id: data.id,
          user_id: profile.id,
          is_leader: true
        });

      toast({
        title: "🏴 Squad criado!",
        description: "Convide seus amigos para se juntarem!",
      });
      
      loadSquadModes();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar squad",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const joinSquad = async (squadId: string) => {
    if (!profile?.id) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('squad_members')
        .insert({
          squad_id: squadId,
          user_id: profile.id,
          is_leader: false
        });

      if (error) throw error;

      toast({
        title: "🤝 Entrou no squad!",
        description: "Trabalhem juntos para vencer!",
      });
      
      loadSquadModes();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível entrar no squad",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-500';
      case 'starting': return 'bg-orange-500';
      case 'active': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return 'Aguardando';
      case 'starting': return 'Iniciando';
      case 'active': return 'Em Andamento';
      default: return 'Finalizada';
    }
  };

  return (
    <div className="space-y-6">
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

      {/* Solo Mode */}
      {currentMode === 'solo' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Sessões Ativas</h3>
            <Badge variant="secondary" className="bg-red-500/20 text-red-600">
              <Flame className="w-3 h-3 mr-1" />
              LIVE
            </Badge>
          </div>

          {activeSessions.length === 0 ? (
            <Card className="p-8 text-center">
              <Crown className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma batalha ativa</h3>
              <p className="text-muted-foreground mb-4">
                As batalhas acontecem a cada hora. Fique atento!
              </p>
              <Button disabled>
                <Clock className="w-4 h-4 mr-2" />
                Próxima batalha em 23min
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeSessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative"
                >
                  <Card className="overflow-hidden border-l-4 border-l-red-500">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            Battle Royale #{session.id.slice(-6)}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="secondary" 
                              className={`${getStatusColor(session.status)} text-white border-0`}
                            >
                              {getStatusText(session.status)}
                            </Badge>
                            {session.status === 'active' && (
                              <Badge variant="outline">
                                Round {session.current_round}/{session.rounds_total}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Trophy className="w-6 h-6 text-yellow-500" />
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Participantes</p>
                          <p className="font-semibold">
                            {session.current_players}/{session.max_players}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Prêmio</p>
                          <p className="font-semibold text-yellow-600">
                            {session.prize_pool} BTZ
                          </p>
                        </div>
                      </div>

                      <Progress 
                        value={(session.current_players / session.max_players) * 100} 
                        className="h-2"
                      />

                      {/* Player Avatars */}
                      <div className="flex -space-x-2">
                        {session.participants.slice(0, 6).map((participant, index) => (
                          <motion.div
                            key={participant.id}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                          >
                            <img
                              src={participant.user.avatar?.image_url || '/placeholder-avatar.png'}
                              alt={participant.user.nickname}
                              className="w-8 h-8 rounded-full border-2 border-background"
                            />
                            {!participant.is_eliminated && session.status === 'active' && (
                              <div className="absolute -top-1 -right-1">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                              </div>
                            )}
                          </motion.div>
                        ))}
                        {session.current_players > 6 && (
                          <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-background bg-muted text-xs font-semibold">
                            +{session.current_players - 6}
                          </div>
                        )}
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => joinBattleRoyale(session.id)}
                        disabled={
                          isLoading || 
                          session.current_players >= session.max_players ||
                          session.status !== 'waiting' ||
                          joinedSession === session.id
                        }
                      >
                        {joinedSession === session.id ? (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Na Batalha
                          </>
                        ) : session.status === 'waiting' ? (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Entrar ({session.entry_cost} BTZ)
                          </>
                        ) : (
                          'Batalha em andamento'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Squad Mode */}
      {currentMode === 'squad' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Squads Disponíveis</h3>
            <Button onClick={createSquad} disabled={isLoading}>
              <Users className="w-4 h-4 mr-2" />
              Criar Squad
            </Button>
          </div>

          {squadModes.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhum squad ativo</h3>
              <p className="text-muted-foreground mb-4">
                Crie um squad ou aguarde outros jogadores criarem!
              </p>
              <Button onClick={createSquad} disabled={isLoading}>
                <Users className="w-4 h-4 mr-2" />
                Criar Primeiro Squad
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {squadModes.map((squad) => (
                <motion.div
                  key={squad.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        {squad.squad_name}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Membros</span>
                        <span className="font-semibold">
                          {squad.current_members}/{squad.max_members}
                        </span>
                      </div>

                      <Progress 
                        value={(squad.current_members / squad.max_members) * 100} 
                        className="h-2"
                      />

                      {/* Squad Members */}
                      <div className="space-y-2">
                        {squad.members.map((member) => (
                          <div key={member.id} className="flex items-center gap-2 text-sm">
                            <img
                              src={member.user.avatar?.image_url || '/placeholder-avatar.png'}
                              alt={member.user.nickname}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="flex-1">{member.user.nickname}</span>
                            {member.is_leader && (
                              <Crown className="w-4 h-4 text-yellow-500" />
                            )}
                            <Badge variant="outline" className="text-xs">
                              Lv.{member.user.level}
                            </Badge>
                          </div>
                        ))}
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => joinSquad(squad.id)}
                        disabled={
                          isLoading || 
                          squad.current_members >= squad.max_members ||
                          !squad.is_open
                        }
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Entrar no Squad ({squad.entry_cost} BTZ)
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}