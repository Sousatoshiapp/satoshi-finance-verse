import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FloatingNavbar } from "@/components/floating-navbar";
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
    <div className="min-h-screen bg-background pb-20">
      <div className="px-4 pt-8 pb-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate('/tournaments')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torneios
            </Button>
          </div>

          {/* Tournament Hero */}
          <Card className="p-8 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" 
                 style={{ 
                   background: `linear-gradient(135deg, ${getDifficultyColor(tournament.difficulty || 'medium')}40, transparent)`
                 }}
            />
            
            <div className="relative z-10">
              <div className="flex items-start gap-8">
                <div className="flex-shrink-0">
                  <img 
                    src={trophyImages[tournament.theme as keyof typeof trophyImages]}
                    alt={tournament.trophy_name || 'Trophy'}
                    className="w-32 h-32 object-cover rounded-lg shadow-glow"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge 
                      variant="outline" 
                      className="border-2"
                      style={{ 
                        borderColor: getDifficultyColor(tournament.difficulty || 'medium'),
                        color: getDifficultyColor(tournament.difficulty || 'medium')
                      }}
                    >
                      {(tournament.difficulty || 'medium').toUpperCase()}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="border-2"
                      style={{ 
                        borderColor: getStatusColor(tournament.status),
                        color: getStatusColor(tournament.status)
                      }}
                    >
                      {tournament.status === 'active' ? 'ATIVO' : 
                       tournament.status === 'upcoming' ? 'EM BREVE' : 'FINALIZADO'}
                    </Badge>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-foreground mb-3">
                    {tournament.name}
                  </h1>
                  <p className="text-muted-foreground text-lg mb-6">
                    {tournament.description}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-primary mb-1">
                        <Trophy className="w-5 h-5" />
                        <span className="text-xl font-bold">
                          {(tournament.prize_pool || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">Prêmio Beetz</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-info mb-1">
                        <Users className="w-5 h-5" />
                        <span className="text-xl font-bold">
                          {participants.length}/{tournament.max_participants || 100}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">Participantes</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-warning mb-1">
                        <Calendar className="w-5 h-5" />
                        <span className="text-xl font-bold">
                          {new Date(tournament.start_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">Início</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-success mb-1">
                        <Star className="w-5 h-5" />
                        <span className="text-xl font-bold">
                          {tournament.trophy_name}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">Troféu</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                {isParticipating ? (
                  <div className="flex items-center gap-4">
                    <Badge className="bg-success text-white px-4 py-2">
                      ✓ Você está participando
                    </Badge>
                    <Button 
                      className="bg-gradient-to-r from-primary to-success text-black rounded-full font-semibold px-8"
                      onClick={() => navigate('/game-mode')}
                    >
                      Começar Torneio
                    </Button>
                  </div>
                ) : tournament.status === 'active' ? (
                  <Button 
                    className="bg-gradient-to-r from-primary to-success text-black rounded-full font-semibold px-8 py-3 text-lg"
                    onClick={joinTournament}
                    disabled={participants.length >= (tournament.max_participants || 100)}
                  >
                    {participants.length >= (tournament.max_participants || 100) 
                      ? 'Torneio Lotado' 
                      : 'Participar do Torneio'
                    }
                  </Button>
                ) : (
                  <Badge variant="outline" className="px-4 py-2">
                    {tournament.status === 'upcoming' ? 'Torneio ainda não iniciado' : 'Torneio finalizado'}
                  </Badge>
                )}
              </div>
            </div>
          </Card>

          {/* Participants */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Participantes ({participants.length})
            </h2>
            {participants.length > 0 ? (
              <div className="grid gap-2">
                {participants.map((participant, index) => (
                  <div key={participant.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-avatar rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {participant.profiles?.nickname?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="font-medium">{participant.profiles?.nickname || 'Jogador'}</div>
                        <div className="text-xs text-muted-foreground">
                          Nível {participant.profiles?.level || 1}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum participante ainda. Seja o primeiro!
              </div>
            )}
          </Card>
        </div>
      </div>
      
      <FloatingNavbar />
    </div>
  );
}