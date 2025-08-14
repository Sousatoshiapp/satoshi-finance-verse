import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Progress } from "@/components/shared/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shared/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Swords, 
  Trophy, 
  Timer, 
  Users, 
  Star,
  Target,
  Crown,
  Shield,
  Zap,
  Calendar
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GuildWar {
  id: string;
  name: string;
  description: string;
  status: 'upcoming' | 'active' | 'completed';
  start_date: string;
  end_date: string;
  max_participants: number;
  xp_goal: number;
  prize_pool: any;
  winner_guild_id?: string;
  total_xp_earned: number;
  participants_count: number;
}

interface GuildWarParticipant {
  id: string;
  user_id: string;
  guild_id: string;
  xp_contributed: number;
  quizzes_completed: number;
  joined_at: string;
  profile?: {
    nickname: string;
    current_avatar_id?: string;
  };
  guild?: {
    name: string;
    team_motto?: string;
  };
}

export default function GuildWars() {
  const { toast } = useToast();
  const [wars, setWars] = useState<GuildWar[]>([]);
  const [participants, setParticipants] = useState<GuildWarParticipant[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWar, setSelectedWar] = useState<GuildWar | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setUserProfile(profile);

      // Load guild wars
      const { data: warsData } = await supabase
        .from('guild_wars')
        .select('*')
        .order('start_date', { ascending: false });

      setWars(warsData || []);

      // Load participants for active wars
      if (warsData && warsData.length > 0) {
        const activeWar = warsData.find(w => w.status === 'active');
        if (activeWar) {
          setSelectedWar(activeWar);
          await loadWarParticipants(activeWar.id);
        }
      }

    } catch (error) {
      console.error('Error loading guild wars data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados das Guild Wars",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadWarParticipants = async (warId: string) => {
    const { data } = await supabase
      .from('guild_war_participants')
      .select(`
        *,
        profiles!user_id(nickname, current_avatar_id)
      `)
      .eq('war_id', warId)
      .order('xp_contributed', { ascending: false });

    setParticipants(data || []);
  };

  const joinWar = async (warId: string) => {
    if (!userProfile) return;

    try {
      // Check if user is in a guild
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', userProfile.id)
        .eq('is_active', true)
        .single();

      if (!teamMember) {
        toast({
          title: "Guild necessária",
          description: "Você precisa fazer parte de uma guild para participar das wars",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('guild_war_participants')
        .insert({
          war_id: warId,
          guild_id: teamMember.team_id,
          user_id: userProfile.id
        });

      if (error) throw error;

      toast({
        title: "Inscrição realizada!",
        description: "Você foi inscrito na Guild War com sucesso"
      });

      // Reload data
      await loadData();

    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: "Já inscrito",
          description: "Você já está participando desta Guild War",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao se inscrever na Guild War",
          variant: "destructive"
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'upcoming': return 'Em breve';
      case 'completed': return 'Finalizada';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 p-8 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <Swords className="mr-4" />
                Guild Wars
              </h1>
              <p className="text-xl opacity-90">
                Competições épicas entre guilds por supremacia e recompensas exclusivas
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-lg p-4">
                <Timer className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Próxima Guerra</p>
                <p className="font-bold">Em breve</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Wars Ativas</TabsTrigger>
            <TabsTrigger value="upcoming">Próximas</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {wars.filter(w => w.status === 'active').map((war) => (
              <Card key={war.id} className="border-red-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center text-xl">
                        <Crown className="mr-2 text-yellow-500" />
                        {war.name}
                      </CardTitle>
                      <CardDescription>{war.description}</CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(war.status)} text-white`}>
                      {getStatusText(war.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* War Progress */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">{war.participants_count}</p>
                      <p className="text-sm text-muted-foreground">Participantes</p>
                    </div>
                    <div className="text-center">
                      <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                      <p className="text-2xl font-bold">{war.total_xp_earned.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">XP Total</p>
                    </div>
                    <div className="text-center">
                      <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold">{war.xp_goal.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Meta XP</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progresso Global</span>
                      <span>{Math.round((war.total_xp_earned / war.xp_goal) * 100)}%</span>
                    </div>
                    <Progress value={(war.total_xp_earned / war.xp_goal) * 100} className="h-3" />
                  </div>

                  {/* Prize Pool */}
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Trophy className="mr-2 text-yellow-500" />
                      Pool de Prêmios
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl">🥇</div>
                        <p className="font-bold">{war.prize_pool.first.toLocaleString()} BTZ</p>
                        <p className="text-xs text-muted-foreground">1º Lugar</p>
                      </div>
                      <div>
                        <div className="text-2xl">🥈</div>
                        <p className="font-bold">{war.prize_pool.second.toLocaleString()} BTZ</p>
                        <p className="text-xs text-muted-foreground">2º Lugar</p>
                      </div>
                      <div>
                        <div className="text-2xl">🥉</div>
                        <p className="font-bold">{war.prize_pool.third.toLocaleString()} BTZ</p>
                        <p className="text-xs text-muted-foreground">3º Lugar</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-center">
                    <Button onClick={() => joinWar(war.id)} className="bg-red-600 hover:bg-red-700">
                      <Shield className="mr-2 h-4 w-4" />
                      Participar da Guerra
                    </Button>
                  </div>

                  {/* War End Time */}
                  <div className="text-center text-sm text-muted-foreground">
                    <Calendar className="inline mr-1 h-4 w-4" />
                    Termina {formatDistanceToNow(new Date(war.end_date), { addSuffix: true, locale: ptBR })}
                  </div>
                </CardContent>
              </Card>
            ))}

            {wars.filter(w => w.status === 'active').length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Swords className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma guerra ativa</h3>
                  <p className="text-muted-foreground">
                    Aguarde o próximo evento de Guild War para participar!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            {wars.filter(w => w.status === 'upcoming').map((war) => (
              <Card key={war.id} className="border-blue-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center text-xl">
                        <Calendar className="mr-2 text-blue-500" />
                        {war.name}
                      </CardTitle>
                      <CardDescription>{war.description}</CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(war.status)} text-white`}>
                      {getStatusText(war.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Início</p>
                      <p className="font-semibold">
                        {formatDistanceToNow(new Date(war.start_date), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Meta XP</p>
                      <p className="font-semibold">{war.xp_goal.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Prepare-se!</h4>
                    <p className="text-sm text-muted-foreground">
                      Certifique-se de estar em uma guild ativa para participar desta guerra épica.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {wars.filter(w => w.status === 'completed').map((war) => (
              <Card key={war.id} className="border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center text-xl">
                        <Trophy className="mr-2 text-gray-500" />
                        {war.name}
                      </CardTitle>
                      <CardDescription>{war.description}</CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(war.status)} text-white`}>
                      {getStatusText(war.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <Star className="h-6 w-6 mx-auto mb-1 text-yellow-500" />
                      <p className="text-sm text-muted-foreground">Participantes</p>
                      <p className="font-semibold">{war.participants_count}</p>
                    </div>
                    <div>
                      <Zap className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                      <p className="text-sm text-muted-foreground">XP Total</p>
                      <p className="font-semibold">{war.total_xp_earned.toLocaleString()}</p>
                    </div>
                    <div>
                      <Crown className="h-6 w-6 mx-auto mb-1 text-purple-500" />
                      <p className="text-sm text-muted-foreground">Guild Vencedora</p>
                      <p className="font-semibold">{war.winner_guild_id ? 'Definida' : 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}