import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FloatingNavbar } from "@/components/floating-navbar";
import { UsersList } from "@/components/duels/users-list";
import { DuelInvites } from "@/components/duels/duel-invites";
import { SimultaneousDuel } from "@/components/duels/simultaneous-duel";
import { useToast } from "@/hooks/use-toast";

export default function Duels() {
  const [currentView, setCurrentView] = useState<'main' | 'users' | 'active'>('main');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeDuel, setActiveDuel] = useState<any>(null);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Load user profile and check for active duels
    loadUserData();
    checkForActiveDuel();
    loadPendingInvites();
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

  const checkForActiveDuel = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data: duel } = await supabase
        .from('duels')
        .select('*')
        .or(`player1_id.eq.${profile.id},player2_id.eq.${profile.id}`)
        .eq('status', 'active')
        .single();

      if (duel) {
        setActiveDuel(duel);
        setCurrentView('active');
      }
    } catch (error) {
      console.error('Error checking for active duel:', error);
    }
  };

  const loadPendingInvites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data: invites } = await supabase
        .from('duel_invites')
        .select(`
          *,
          challenger:profiles!challenger_id(nickname),
          challenged:profiles!challenged_id(nickname)
        `)
        .eq('challenged_id', profile.id)
        .eq('status', 'pending');

      setPendingInvites(invites || []);
    } catch (error) {
      console.error('Error loading pending invites:', error);
    }
  };

  if (currentView === 'active' && activeDuel) {
    return <SimultaneousDuel 
      duel={activeDuel} 
      onDuelEnd={(result) => {
        toast({
          title: result.winner ? "🎉 Vitória!" : "😔 Derrota",
          description: result.winner ? 
            `Parabéns! Você venceu por ${result.score} x ${result.opponentScore}!` : 
            `Não foi desta vez. Placar: ${result.score} x ${result.opponentScore}`,
        });
        setActiveDuel(null);
        setCurrentView('main');
      }} 
    />;
  }

  if (currentView === 'users') {
    return <UsersList onBack={() => setCurrentView('main')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            ⚔️ Arena de Duelos
          </h1>
          <p className="text-muted-foreground text-lg">
            Desafie outros usuários em quizzes financeiros
          </p>
        </div>

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Convites Pendentes</h2>
            <DuelInvites 
              invites={pendingInvites} 
              onInviteResponse={() => {
                loadPendingInvites();
                checkForActiveDuel();
              }} 
            />
          </div>
        )}

        {/* Quick Stats */}
        {userProfile && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Suas Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {userProfile.level}
                  </div>
                  <div className="text-sm text-muted-foreground">Nível</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-experience">
                    {userProfile.xp}
                  </div>
                  <div className="text-sm text-muted-foreground">XP</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-streak">
                    {userProfile.streak}
                  </div>
                  <div className="text-sm text-muted-foreground">Sequência</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Actions */}
        <div className="grid gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Iniciar Duelo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Escolha um oponente e desafie-o para um duelo de conhecimento financeiro
              </p>
              <Button 
                onClick={() => navigate('/find-opponent')}
                className="w-full"
              >
                Encontrar Oponente
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Duelos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <p>Nenhum duelo encontrado</p>
                <p className="text-sm mt-2">Seus duelos aparecerão aqui após a primeira partida</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How to Play */}
        <Card>
          <CardHeader>
            <CardTitle>Como Jogar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">1</Badge>
                <div>
                  <p className="font-medium">Escolha um Oponente</p>
                  <p className="text-sm text-muted-foreground">
                    Selecione outro usuário para desafiar
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">2</Badge>
                <div>
                  <p className="font-medium">Aceite o Desafio</p>
                  <p className="text-sm text-muted-foreground">
                    Espere a confirmação do seu oponente
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">3</Badge>
                <div>
                  <p className="font-medium">Responda Rapidamente</p>
                  <p className="text-sm text-muted-foreground">
                    Você tem 30 segundos para cada pergunta
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">4</Badge>
                <div>
                  <p className="font-medium">Ganhe XP</p>
                  <p className="text-sm text-muted-foreground">
                    Vença para ganhar XP e Beetz extras
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