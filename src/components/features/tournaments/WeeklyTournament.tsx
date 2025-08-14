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
  Trophy, 
  Crown, 
  Star, 
  Timer, 
  Users, 
  Zap,
  Target,
  Gift,
  TrendingUp,
  Calendar,
  Medal
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WeeklyTournament {
  id: string;
  name: string;
  description: string;
  status: 'upcoming' | 'registration' | 'active' | 'completed';
  start_time: string;
  end_time: string;
  max_participants: number;
  current_participants: number;
  entry_cost: number;
  prize_pool: {
    first: number;
    second: number;
    third: number;
    participation: number;
  };
  tournament_type: 'weekly' | 'special' | 'seasonal';
  registration_deadline: string;
  participants: TournamentParticipant[];
}

interface TournamentParticipant {
  id: string;
  user_id: string;
  tournament_id: string;
  current_score: number;
  questions_answered: number;
  best_streak: number;
  joined_at: string;
  user: {
    nickname: string;
    level: number;
    current_avatar_id?: string;
    avatar?: {
      image_url: string;
    };
  };
}

export function WeeklyTournament() {
  const [tournaments, setTournaments] = useState<WeeklyTournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [registeredTournaments, setRegisteredTournaments] = useState<string[]>([]);
  const { profile } = useProfile();
  const { toast } = useToast();

  useEffect(() => {
    loadTournaments();
    loadUserRegistrations();
    const interval = setInterval(loadTournaments, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadTournaments = async () => {
    try {
      // Mock data until database tables are created
      const mockTournaments: WeeklyTournament[] = [
        {
          id: '1',
          name: 'Weekly Knowledge Championship',
          description: 'Test your knowledge across all categories and compete for amazing prizes!',
          status: 'active',
          start_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          max_participants: 2000,
          current_participants: 1234,
          entry_cost: 0,
          prize_pool: {
            first: 5000,
            second: 2500,
            third: 1500,
            participation: 1000
          },
          tournament_type: 'weekly',
          registration_deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          participants: [
            {
              id: '1',
              user_id: '1',
              tournament_id: '1',
              current_score: 2850,
              questions_answered: 45,
              best_streak: 12,
              joined_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              user: {
                nickname: 'CryptoGuru',
                level: 15,
                current_avatar_id: '1',
                avatar: { image_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face' }
              }
            },
            {
              id: '2',
              user_id: '2',
              tournament_id: '1',
              current_score: 2740,
              questions_answered: 42,
              best_streak: 10,
              joined_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              user: {
                nickname: 'QuizMaster',
                level: 22,
                current_avatar_id: '2',
                avatar: { image_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face' }
              }
            },
            {
              id: '3',
              user_id: '3',
              tournament_id: '1',
              current_score: 2680,
              questions_answered: 40,
              best_streak: 9,
              joined_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              user: {
                nickname: 'StreakKing',
                level: 18,
                current_avatar_id: '3',
                avatar: { image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' }
              }
            }
          ]
        }
      ];
      
      setTournaments(mockTournaments);
    } catch (error) {
      console.error('Erro ao carregar torneios:', error);
    }
  };

  const loadUserRegistrations = async () => {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select('tournament_id')
        .eq('user_id', profile.id);

      if (error) throw error;
      setRegisteredTournaments(data?.map(p => p.tournament_id) || []);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
    }
  };

  const registerForTournament = async (tournamentId: string) => {
    if (!profile?.id) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: tournamentId,
          user_id: profile.id
        });

      if (error) throw error;

      setRegisteredTournaments(prev => [...prev, tournamentId]);
      toast({
        title: "🏆 Inscrito no torneio!",
        description: "Boa sorte na competição!",
      });
      
      loadTournaments();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível se inscrever",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500';
      case 'registration': return 'bg-green-500';
      case 'active': return 'bg-red-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Em breve';
      case 'registration': return 'Inscrições abertas';
      case 'active': return 'Em andamento';
      case 'completed': return 'Finalizado';
      default: return 'Indefinido';
    }
  };

  const getTournamentIcon = (type: string) => {
    switch (type) {
      case 'weekly': return <Calendar className="w-5 h-5" />;
      case 'special': return <Star className="w-5 h-5" />;
      case 'seasonal': return <Crown className="w-5 h-5" />;
      default: return <Trophy className="w-5 h-5" />;
    }
  };

  const getPositionMedal = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-4 h-4 text-yellow-500" />;
      case 2: return <Medal className="w-4 h-4 text-gray-400" />;
      case 3: return <Medal className="w-4 h-4 text-amber-600" />;
      default: return <Target className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (tournaments.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">Nenhum torneio ativo</h3>
        <p className="text-muted-foreground">
          Os torneios semanais começam toda segunda-feira!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6" />
          Torneios Semanais
        </h2>
        <Badge variant="secondary" className="bg-purple-500/20 text-purple-600">
          <Star className="w-3 h-3 mr-1" />
          PREMIUM
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {tournaments.map((tournament) => (
          <motion.div
            key={tournament.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <Card className="overflow-hidden border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getTournamentIcon(tournament.tournament_type)}
                    <div>
                      <CardTitle className="text-lg">{tournament.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {tournament.description}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${getStatusColor(tournament.status)} text-white border-0`}
                  >
                    {getStatusText(tournament.status)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Tournament Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Participantes</p>
                    <p className="font-semibold">
                      {tournament.current_participants}/{tournament.max_participants}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Prêmio Total</p>
                    <p className="font-semibold text-yellow-600">
                      {Object.values(tournament.prize_pool).reduce((a, b) => a + b, 0)} BTZ
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <Progress 
                  value={(tournament.current_participants / tournament.max_participants) * 100} 
                  className="h-2"
                />

                {/* Timeline */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Início:</span>
                    <span className="font-medium">
                      {format(new Date(tournament.start_time), 'dd/MM HH:mm', { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fim:</span>
                    <span className="font-medium">
                      {format(new Date(tournament.end_time), 'dd/MM HH:mm', { locale: ptBR })}
                    </span>
                  </div>
                  {tournament.status === 'registration' && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Inscrições até:</span>
                      <span className="font-medium text-red-600">
                        {format(new Date(tournament.registration_deadline), 'dd/MM HH:mm', { locale: ptBR })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Prize Breakdown */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <h4 className="font-semibold text-sm mb-2">Prêmios:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Crown className="w-3 h-3 text-yellow-500" />
                      <span>1º: {tournament.prize_pool.first} BTZ</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Medal className="w-3 h-3 text-gray-400" />
                      <span>2º: {tournament.prize_pool.second} BTZ</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Medal className="w-3 h-3 text-amber-600" />
                      <span>3º: {tournament.prize_pool.third} BTZ</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Gift className="w-3 h-3 text-blue-500" />
                      <span>Todos: {tournament.prize_pool.participation} BTZ</span>
                    </div>
                  </div>
                </div>

                {/* Top Participants */}
                {tournament.participants.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Classificação Atual:</h4>
                    <div className="space-y-2">
                      {tournament.participants
                        .sort((a, b) => b.current_score - a.current_score)
                        .slice(0, 3)
                        .map((participant, index) => (
                        <div key={participant.id} className="flex items-center gap-2 text-sm">
                          {getPositionMedal(index + 1)}
                          <img
                            src={participant.user.avatar?.image_url || '/placeholder-avatar.png'}
                            alt={participant.user.nickname}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="flex-1">{participant.user.nickname}</span>
                          <Badge variant="outline" className="text-xs">
                            {participant.current_score} pts
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-2">
                  {registeredTournaments.includes(tournament.id) ? (
                    <Button className="w-full" disabled>
                      <Trophy className="w-4 h-4 mr-2" />
                      Inscrito
                    </Button>
                  ) : tournament.status === 'registration' ? (
                    <Button
                      className="w-full"
                      onClick={() => registerForTournament(tournament.id)}
                      disabled={
                        isLoading || 
                        tournament.current_participants >= tournament.max_participants
                      }
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Inscrever-se ({tournament.entry_cost} BTZ)
                    </Button>
                  ) : tournament.status === 'active' ? (
                    <Button className="w-full" disabled>
                      <Timer className="w-4 h-4 mr-2" />
                      Em andamento
                    </Button>
                  ) : (
                    <Button className="w-full" disabled>
                      <Calendar className="w-4 h-4 mr-2" />
                      {tournament.status === 'upcoming' ? 'Aguardando' : 'Finalizado'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}