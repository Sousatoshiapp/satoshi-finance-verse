import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { AdminAuthProtection } from "@/components/admin-auth-protection";
import { AdminSidebar } from "@/components/features/admin/admin-sidebar";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import { 
  Trophy, Plus, Calendar, Users, BarChart3, 
  Clock, Target, Crown, Gamepad2, Edit, Trash2 
} from "lucide-react";

interface Tournament {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'completed';
  participants_count: number;
  max_participants: number;
  prize_pool: number;
  entry_fee: number;
}

export default function AdminTournaments() {
  const { t } = useI18n();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTournaments: 0,
    activeTournaments: 0,
    totalParticipants: 0,
    totalPrizePool: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      // Simular dados de torneios para demonstração
      const mockTournaments: Tournament[] = [
        {
          id: '1',
          name: 'Campeonato de Finanças Q1 2025',
          description: 'Torneio trimestral com foco em conhecimentos financeiros avançados',
          start_date: '2025-01-15T10:00:00Z',
          end_date: '2025-01-22T18:00:00Z',
          status: 'upcoming',
          participants_count: 45,
          max_participants: 100,
          prize_pool: 5000,
          entry_fee: 50
        },
        {
          id: '2',
          name: 'Liga de Investimentos',
          description: 'Competição semanal de estratégias de investimento',
          start_date: '2025-01-08T09:00:00Z',
          end_date: '2025-01-14T21:00:00Z',
          status: 'active',
          participants_count: 78,
          max_participants: 80,
          prize_pool: 2000,
          entry_fee: 25
        },
        {
          id: '3',
          name: 'Torneio Cripto Challenge',
          description: 'Desafio especial sobre criptomoedas e blockchain',
          start_date: '2024-12-20T12:00:00Z',
          end_date: '2024-12-27T20:00:00Z',
          status: 'completed',
          participants_count: 120,
          max_participants: 120,
          prize_pool: 8000,
          entry_fee: 75
        }
      ];

      setTournaments(mockTournaments);

      // Calcular estatísticas
      const totalTournaments = mockTournaments.length;
      const activeTournaments = mockTournaments.filter(t => t.status === 'active').length;
      const totalParticipants = mockTournaments.reduce((sum, t) => sum + t.participants_count, 0);
      const totalPrizePool = mockTournaments.reduce((sum, t) => sum + t.prize_pool, 0);

      setStats({
        totalTournaments,
        activeTournaments,
        totalParticipants,
        totalPrizePool
      });

    } catch (error) {
      console.error('Error loading tournaments:', error);
      toast({
        title: t('errors.error'),
        description: t('common.tryAgainLater'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Tournament['status']) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="secondary">{t('tournaments.upcoming')}</Badge>;
      case 'active':
        return <Badge className="bg-green-500 text-white">{t('tournaments.active')}</Badge>;
      case 'completed':
        return <Badge variant="outline">{t('tournaments.finished')}</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminAuthProtection>
        <div className="flex min-h-screen w-full bg-background">
          <AdminSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">{t('admin.loadingTournaments')}</p>
            </div>
          </div>
        </div>
      </AdminAuthProtection>
    );
  }

  return (
    <AdminAuthProtection>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
                    {t('admin.tournamentManagement')}
                  </h1>
                  <p className="text-muted-foreground">
                    {t('admin.manageTournaments')}
                  </p>
                </div>
                
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('admin.createTournament')}
                </Button>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Trophy className="h-8 w-8 text-yellow-600" />
                      <div className="ml-2">
                        <p className="text-sm font-medium text-muted-foreground">{t('admin.totalTournaments')}</p>
                        <p className="text-2xl font-bold">{stats.totalTournaments}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Gamepad2 className="h-8 w-8 text-green-600" />
                      <div className="ml-2">
                        <p className="text-sm font-medium text-muted-foreground">{t('admin.activeTournaments')}</p>
                        <p className="text-2xl font-bold">{stats.activeTournaments}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div className="ml-2">
                        <p className="text-sm font-medium text-muted-foreground">{t('admin.totalParticipants')}</p>
                        <p className="text-2xl font-bold">{stats.totalParticipants}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Crown className="h-8 w-8 text-purple-600" />
                      <div className="ml-2">
                        <p className="text-sm font-medium text-muted-foreground">{t('admin.totalPrizes')}</p>
                        <p className="text-2xl font-bold">₿{stats.totalPrizePool.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="all" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">{t('tournaments.all')}</TabsTrigger>
                  <TabsTrigger value="active">{t('tournaments.active')}</TabsTrigger>
                  <TabsTrigger value="upcoming">{t('tournaments.upcoming')}</TabsTrigger>
                  <TabsTrigger value="completed">{t('tournaments.finished')}</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {tournaments.map((tournament) => (
                    <Card key={tournament.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="space-y-1">
                          <CardTitle className="flex items-center gap-2">
                            {tournament.name}
                            {getStatusBadge(tournament.status)}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {tournament.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">{t('common.start')}</p>
                              <p className="text-sm font-medium">{formatDate(tournament.start_date)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">{t('common.end')}</p>
                              <p className="text-sm font-medium">{formatDate(tournament.end_date)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">{t('admin.participants')}</p>
                              <p className="text-sm font-medium">
                                {tournament.participants_count}/{tournament.max_participants}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">{t('tournaments.prizeBeetz')}</p>
                              <p className="text-sm font-medium">₿{tournament.prize_pool.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="active">
                  <div className="space-y-4">
                    {tournaments
                      .filter(t => t.status === 'active')
                      .map((tournament) => (
                        <Card key={tournament.id}>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold">{tournament.name}</h3>
                                <p className="text-sm text-muted-foreground">{tournament.description}</p>
                              </div>
                              {getStatusBadge(tournament.status)}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="upcoming">
                  <div className="space-y-4">
                    {tournaments
                      .filter(t => t.status === 'upcoming')
                      .map((tournament) => (
                        <Card key={tournament.id}>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold">{tournament.name}</h3>
                                <p className="text-sm text-muted-foreground">{tournament.description}</p>
                              </div>
                              {getStatusBadge(tournament.status)}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="completed">
                  <div className="space-y-4">
                    {tournaments
                      .filter(t => t.status === 'completed')
                      .map((tournament) => (
                        <Card key={tournament.id}>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold">{tournament.name}</h3>
                                <p className="text-sm text-muted-foreground">{tournament.description}</p>
                              </div>
                              {getStatusBadge(tournament.status)}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </AdminAuthProtection>
  );
}
