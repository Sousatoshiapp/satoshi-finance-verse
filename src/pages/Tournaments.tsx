import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FloatingNavbar } from "@/components/floating-navbar";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Users, Clock, Star, Crown, Medal } from "lucide-react";

export default function Tournaments() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [districts, setDistricts] = useState<any[]>([]);
  const [activeTournaments, setActiveTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
    loadDistricts();
    // For now, we'll create mock tournaments
    loadMockTournaments();
  }, [navigate]);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadDistricts = async () => {
    try {
      const { data: districts } = await supabase
        .from('districts')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      setDistricts(districts || []);
    } catch (error) {
      console.error('Error loading districts:', error);
    }
  };

  const loadMockTournaments = () => {
    // Mock tournaments for demonstration
    const mockTournaments = [
      {
        id: 1,
        name: "Copa Satoshi City",
        description: "O maior torneio de conhecimento financeiro da cidade",
        districtId: "1c58cbaa-9ed2-45ba-b2f9-6b666e94e937",
        districtName: "Anima Educação District",
        participants: 128,
        maxParticipants: 256,
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        prize: "10.000 XP + Avatar Exclusivo",
        status: "open",
        difficulty: "medium"
      },
      {
        id: 2,
        name: "Desafio Crypto Masters",
        description: "Torneio avançado para especialistas em criptomoedas",
        districtId: "5a562d56-efde-4341-8789-87fd3d4cf703",
        districtName: "Cripto Valley",
        participants: 64,
        maxParticipants: 128,
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
        prize: "25.000 XP + NFT Exclusivo",
        status: "open",
        difficulty: "hard"
      },
      {
        id: 3,
        name: "Liga dos Investidores",
        description: "Competição semanal para traders experientes",
        districtId: "0645a23d-6f02-465a-b9a5-8571853ebdec",
        districtName: "XP Investimentos District",
        participants: 45,
        maxParticipants: 64,
        startDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // In 2 hours
        prize: "5.000 XP + Badge Especial",
        status: "filling",
        difficulty: "hard"
      }
    ];

    setActiveTournaments(mockTournaments);
    setLoading(false);
  };

  const joinTournament = async (tournamentId: number) => {
    if (!userProfile) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para participar",
        variant: "destructive"
      });
      return;
    }

    // Mock join functionality
    toast({
      title: "Inscrição Realizada!",
      description: "Você foi inscrito no torneio. Boa sorte!",
    });

    // Update participant count (mock)
    setActiveTournaments(prev => 
      prev.map(tournament => 
        tournament.id === tournamentId 
          ? { ...tournament, participants: tournament.participants + 1 }
          : tournament
      )
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge className="bg-green-500">Aberto</Badge>;
      case 'filling': return <Badge className="bg-yellow-500">Preenchendo</Badge>;
      case 'active': return <Badge className="bg-blue-500">Ativo</Badge>;
      case 'finished': return <Badge variant="secondary">Finalizado</Badge>;
      default: return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando torneios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Torneios
          </h1>
          <p className="text-muted-foreground text-lg">
            Compete com centenas de jogadores em torneios épicos
          </p>
        </div>

        {/* User Stats */}
        {userProfile && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Suas Estatísticas de Torneio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {userProfile.level}
                  </div>
                  <div className="text-sm text-muted-foreground">Nível</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-500">
                    0
                  </div>
                  <div className="text-sm text-muted-foreground">Vitórias</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-500">
                    0
                  </div>
                  <div className="text-sm text-muted-foreground">Participações</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-500">
                    0
                  </div>
                  <div className="text-sm text-muted-foreground">Pódios</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Tournaments */}
        <div className="grid gap-6 mb-8">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Torneios Ativos
          </h2>
          
          {activeTournaments.map((tournament) => (
            <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Medal className="h-6 w-6 text-yellow-500" />
                    <div>
                      <h3 className="text-xl">{tournament.name}</h3>
                      <p className="text-sm text-muted-foreground font-normal">
                        {tournament.districtName}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(tournament.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {tournament.description}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-4 w-4" />
                      <span className="font-semibold">
                        {tournament.participants}/{tournament.maxParticipants}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">Participantes</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span className="font-semibold">
                        {tournament.startDate.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">Início</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`font-semibold ${getDifficultyColor(tournament.difficulty)}`}>
                      {tournament.difficulty === 'easy' ? 'Fácil' : 
                       tournament.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                    </div>
                    <div className="text-sm text-muted-foreground">Dificuldade</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-semibold text-green-500">
                      {tournament.prize.split(' ')[0]} {tournament.prize.split(' ')[1]}
                    </div>
                    <div className="text-sm text-muted-foreground">Prêmio</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Inscrições</span>
                    <span>{tournament.participants}/{tournament.maxParticipants}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ 
                        width: `${(tournament.participants / tournament.maxParticipants) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => joinTournament(tournament.id)}
                  className="w-full"
                  disabled={tournament.participants >= tournament.maxParticipants}
                >
                  {tournament.participants >= tournament.maxParticipants ? 
                    'Torneio Lotado' : 'Participar do Torneio'
                  }
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How Tournaments Work */}
        <Card>
          <CardHeader>
            <CardTitle>Como Funcionam os Torneios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">1</Badge>
                <div>
                  <p className="font-medium">Inscrição</p>
                  <p className="text-sm text-muted-foreground">
                    Inscreva-se em torneios abertos antes do prazo limite
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">2</Badge>
                <div>
                  <p className="font-medium">Eliminatórias</p>
                  <p className="text-sm text-muted-foreground">
                    Compete em rounds eliminatórios contra outros participantes
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">3</Badge>
                <div>
                  <p className="font-medium">Classificação</p>
                  <p className="text-sm text-muted-foreground">
                    Sua pontuação determina sua posição no ranking
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">4</Badge>
                <div>
                  <p className="font-medium">Premiação</p>
                  <p className="text-sm text-muted-foreground">
                    Os melhores colocados recebem XP, badges e itens exclusivos
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <FloatingNavbar />
    </div>
  );
}