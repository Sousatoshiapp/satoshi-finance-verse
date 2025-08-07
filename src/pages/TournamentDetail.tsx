import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/shared/ui/button";
import { Card } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Users, Clock, ArrowLeft, Calendar, Star } from "lucide-react";

// Import trophy images
import neuralCrown from "@/assets/trophies/neural-crown.jpg";
import quantumSphere from "@/assets/trophies/quantum-sphere.jpg";
import genesisCrystal from "@/assets/trophies/genesis-crystal.jpg";
import empireThrone from "@/assets/trophies/empire-throne.jpg";
import matrixCore from "@/assets/trophies/matrix-core.jpg";

const trophyImages = {
  'neural': neuralCrown,
  'quantum': quantumSphere,
  'crypto': genesisCrystal,
  'empire': empireThrone,
  'matrix': matrixCore,
};

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tournament, setTournament] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isParticipating, setIsParticipating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournamentData();
    loadUserProfile();
  }, [id]);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        setUserProfile(profile);
        
        if (profile) {
          // Check if user is already participating
          const { data: participation } = await supabase
            .from('tournament_participants')
            .select('*')
            .eq('tournament_id', id)
            .eq('user_id', profile.id)
            .single();
          
          setIsParticipating(!!participation);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadTournamentData = async () => {
    try {
      const { data: tournamentData } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single();

      if (tournamentData) {
        setTournament(tournamentData);
      }

      // Load participants
      const { data: participantsData } = await supabase
        .from('tournament_participants')
        .select(`
          *,
          profiles(nickname, level, avatar_id)
        `)
        .eq('tournament_id', id)
        .order('joined_at', { ascending: false });

      setParticipants(participantsData || []);
    } catch (error) {
      console.error('Error loading tournament:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinTournament = async () => {
    if (!userProfile) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para participar",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: id,
          user_id: userProfile.id
        });

      if (error) throw error;

      setIsParticipating(true);
      toast({
        title: "🎉 Inscrição realizada!",
        description: "Você foi inscrito no torneio com sucesso!",
      });

      // Reload participants
      loadTournamentData();
    } catch (error) {
      console.error('Error joining tournament:', error);
      toast({
        title: "Erro",
        description: "Não foi possível se inscrever no torneio",
        variant: "destructive"
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'hsl(var(--success))';
      case 'medium': return 'hsl(var(--warning))';
      case 'hard': return 'hsl(var(--destructive))';
      case 'legendary': return 'hsl(var(--level))';
      default: return 'hsl(var(--muted))';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'hsl(var(--success))';
      case 'upcoming': return 'hsl(var(--warning))';
      case 'finished': return 'hsl(var(--muted))';
      default: return 'hsl(var(--muted))';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="px-4 pt-8 pb-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="px-4 pt-8 pb-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Torneio não encontrado</h1>
            <Button onClick={() => navigate('/tournaments')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Torneios
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen pb-20 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${getDifficultyColor(tournament.difficulty || 'medium')}15, hsl(var(--background)) 40%, ${getStatusColor(tournament.status)}10)`
      }}
    >
      {/* Cyberpunk Background Effects */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-primary/10 to-transparent transform -skew-y-12"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-l from-transparent via-accent/10 to-transparent transform skew-y-12"></div>
      </div>
      
      <div className="px-4 pt-8 pb-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/tournaments')}
              className="backdrop-blur-sm bg-card/80 border-border"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torneios
            </Button>
          </div>

          {/* Epic Tournament Hero */}
          <Card className="p-0 mb-8 relative overflow-hidden border-2 shadow-2xl"
                style={{ borderColor: getDifficultyColor(tournament.difficulty || 'medium') }}>
            {/* Dynamic Background */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{ 
                background: `radial-gradient(circle at center, ${getDifficultyColor(tournament.difficulty || 'medium')}40, transparent 70%)`
              }}
            />
            
            {/* Animated Glow Effect */}
            <div 
              className="absolute inset-0 opacity-30 animate-pulse"
              style={{ 
                background: `linear-gradient(45deg, transparent, ${getDifficultyColor(tournament.difficulty || 'medium')}20, transparent)`
              }}
            />
            
            <div className="relative z-10 p-8">
              {/* Trophy Hero Section */}
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <img 
                    src={trophyImages[tournament.theme as keyof typeof trophyImages]}
                    alt={tournament.trophy_name || 'Trophy'}
                    className="w-40 h-40 mx-auto object-cover rounded-2xl shadow-2xl"
                    style={{ 
                      filter: `drop-shadow(0 0 30px ${getDifficultyColor(tournament.difficulty || 'medium')}80)`
                    }}
                  />
                  {/* Floating badges around trophy */}
                  <div className="absolute -top-4 -right-4">
                    <Badge 
                      className="text-xs px-3 py-1 border-2 animate-bounce"
                      style={{ 
                        backgroundColor: getDifficultyColor(tournament.difficulty || 'medium'),
                        borderColor: getDifficultyColor(tournament.difficulty || 'medium'),
                        color: 'white'
                      }}
                    >
                      {(tournament.difficulty || 'medium').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="absolute -bottom-4 -left-4">
                    <Badge 
                      className="text-xs px-3 py-1 border-2 animate-pulse"
                      style={{ 
                        backgroundColor: getStatusColor(tournament.status),
                        borderColor: getStatusColor(tournament.status),
                        color: 'white'
                      }}
                    >
                      {tournament.status === 'active' ? 'ATIVO' : 
                       tournament.status === 'upcoming' ? 'EM BREVE' : 'FINALIZADO'}
                    </Badge>
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 mt-6">
                  {tournament.name}
                </h1>
                <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                  {tournament.description}
                </p>
              </div>
              
              {/* Epic Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-4 text-center bg-gradient-to-br from-primary/20 to-transparent border border-primary/30">
                  <div className="flex items-center justify-center gap-2 text-primary mb-2">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {(tournament.prize_pool || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Prêmio Beetz</div>
                </Card>
                
                <Card className="p-4 text-center bg-gradient-to-br from-info/20 to-transparent border border-info/30">
                  <div className="flex items-center justify-center gap-2 text-info mb-2">
                    <Users className="w-8 h-8" />
                  </div>
                  <div className="text-2xl font-bold text-info">
                    {participants.length}/{tournament.max_participants || 100}
                  </div>
                  <div className="text-sm text-muted-foreground">Participantes</div>
                </Card>
                
                <Card className="p-4 text-center bg-gradient-to-br from-warning/20 to-transparent border border-warning/30">
                  <div className="flex items-center justify-center gap-2 text-warning mb-2">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div className="text-lg font-bold text-warning">
                    {new Date(tournament.start_date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Início</div>
                </Card>
                
                <Card className="p-4 text-center bg-gradient-to-br from-success/20 to-transparent border border-success/30">
                  <div className="flex items-center justify-center gap-2 text-success mb-2">
                    <Star className="w-8 h-8" />
                  </div>
                  <div className="text-lg font-bold text-success">
                    {tournament.trophy_name}
                  </div>
                  <div className="text-sm text-muted-foreground">Troféu</div>
                </Card>
              </div>
              
              {/* Epic Action Section */}
              <div className="text-center">
                {isParticipating ? (
                  <div className="space-y-4">
                    <Badge className="bg-success text-white px-6 py-3 text-lg rounded-full">
                      ✓ Você está inscrito neste torneio
                    </Badge>
                    <div>
                      <Button 
                        className="bg-gradient-to-r from-primary via-warning to-success text-black rounded-full font-bold px-12 py-4 text-xl shadow-2xl transform hover:scale-105 transition-all"
                        onClick={() => navigate(`/tournament-quiz/${tournament.id}`)}
                        style={{ 
                          boxShadow: `0 0 40px ${getDifficultyColor(tournament.difficulty || 'medium')}60`
                        }}
                      >
                        🏆 COMEÇAR BATALHA 🏆
                      </Button>
                    </div>
                  </div>
                ) : tournament.status === 'active' ? (
                  <Button 
                    className="bg-gradient-to-r from-primary via-warning to-success text-black rounded-full font-bold px-12 py-4 text-xl shadow-2xl transform hover:scale-105 transition-all"
                    onClick={joinTournament}
                    disabled={participants.length >= (tournament.max_participants || 100)}
                    style={{ 
                      boxShadow: `0 0 40px ${getDifficultyColor(tournament.difficulty || 'medium')}60`
                    }}
                  >
                    {participants.length >= (tournament.max_participants || 100) 
                      ? '🚫 Torneio Lotado' 
                      : '⚔️ ENTRAR NO TORNEIO ⚔️'
                    }
                  </Button>
                ) : (
                  <Badge variant="outline" className="px-8 py-4 text-lg rounded-full">
                    {tournament.status === 'upcoming' ? '⏳ Torneio ainda não iniciado' : '🏁 Torneio finalizado'}
                  </Badge>
                )}
              </div>
            </div>
          </Card>

          {/* Epic Participants Section */}
          <Card className="p-6 bg-gradient-to-br from-card/80 to-muted/20 backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                Arena de Gladiadores ({participants.length})
              </h2>
            </div>
            
            {participants.length > 0 ? (
              <div className="grid gap-3">
                {participants.map((participant, index) => (
                  <Card key={participant.id} className="p-4 bg-gradient-to-r from-card to-muted/30 border border-border hover:border-primary/50 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                            style={{
                              background: `linear-gradient(135deg, ${getDifficultyColor(tournament.difficulty || 'medium')}, ${getStatusColor(tournament.status)})`
                            }}
                          >
                            {participant.profiles?.nickname?.charAt(0).toUpperCase() || '?'}
                          </div>
                          {/* Rank badge */}
                          <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-lg">
                            {participant.profiles?.nickname || 'Gladiador Anônimo'}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Star className="w-4 h-4" />
                            Nível {participant.profiles?.level || 1}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Posição</div>
                        <div className="text-2xl font-bold text-primary">#{index + 1}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚔️</div>
                <h3 className="text-xl font-bold text-foreground mb-2">Arena Vazia</h3>
                <p className="text-muted-foreground">
                  Seja o primeiro gladiador a entrar na arena!
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
      
      <FloatingNavbar />
    </div>
  );
}
