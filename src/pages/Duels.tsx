import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { UsersList } from "@/components/duels/users-list";
import { DuelInvites } from "@/components/duels/duel-invites";
import EnhancedSimultaneousDuel from "@/components/duels/enhanced-simultaneous-duel";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Duels() {
  const [currentView, setCurrentView] = useState<'main' | 'users' | 'active'>('main');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeDuel, setActiveDuel] = useState<any>(null);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Reset all states when component mounts (when user returns to the screen)
    setActiveDuel(null);
    setCurrentView('main');
    setPendingInvites([]);
    
    // Load user profile and check for active duels
    loadUserData();
    checkForActiveDuel();
    loadPendingInvites();
  }, []);

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

  const checkForActiveDuel = async (skipCleanup = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      for (let attempt = 0; attempt < 8; attempt++) {
        const { data: duel } = await supabase
          .from('duels')
          .select('*')
          .or(`player1_id.eq.${profile.id},player2_id.eq.${profile.id}`)
          .eq('status', 'active')
          .single();

        if (duel) {
          setActiveDuel(duel);
          setCurrentView('active');
          return;
        }

        if (attempt < 7) {
          await new Promise(resolve => setTimeout(resolve, 750));
        }
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
          challenger:profiles!challenger_id(nickname, level, xp, avatars(name, image_url))
        `)
        .eq('challenged_id', profile.id)
        .eq('status', 'pending');

      setPendingInvites(invites || []);

      // Set up realtime subscription for new invites
      const channel = supabase
        .channel(`duel-invites-${profile.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'duel_invites',
            filter: `challenged_id=eq.${profile.id}`,
          },
          async (payload) => {
            console.log('🎯 New duel invite received:', payload);
            if (payload.new.status === 'pending') {
              // Fetch complete invite data with challenger info
              const { data: fullInvite } = await supabase
                .from('duel_invites')
                .select(`
                  *,
                  challenger:profiles!challenger_id(nickname, level, xp, avatars(name, image_url))
                `)
                .eq('id', payload.new.id)
                .single();

              if (fullInvite) {
                setPendingInvites(prev => [...prev, fullInvite]);
                console.log('🎯 New duel invite added to pending list:', fullInvite.id);
              }
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'duel_invites',
            filter: `challenged_id=eq.${profile.id}`,
          },
          (payload) => {
            console.log('📊 Duel invite updated:', payload);
            // Remove processed invites from the list
            if (payload.new.status !== 'pending') {
              setPendingInvites(prev => prev.filter(invite => invite.id !== payload.new.id));
            }
          }
        )
        .subscribe();

      // Cleanup function
      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error('Error loading pending invites:', error);
    }
  };

  if (currentView === 'active' && activeDuel) {
    // Redirecionar para o sistema unificado
    console.log('🔄 Redirecting to unified duel system:', activeDuel.id);
    navigate(`/unified-duel/${activeDuel.id}`);
    return null;
  }

  if (currentView === 'users') {
    return <UsersList onBack={() => setCurrentView('main')} />;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background to-muted ${isMobile ? 'pb-24' : 'pb-20'}`} 
         style={isMobile ? { paddingTop: 'env(safe-area-inset-top, 20px)' } : {}}>
      <div className={`mx-auto overflow-x-hidden ${isMobile ? 'max-w-sm px-6 py-4 pt-18' : 'max-w-4xl px-4 py-8'}`}>
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="flex-shrink-0"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">
              ⚔️ Arena de Duelos
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
              Desafie outros usuários em quizzes financeiros
            </p>
          </div>
        </div>

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Convites Pendentes</h2>
            <DuelInvites 
              invites={pendingInvites} 
              onInviteResponse={() => {
                loadPendingInvites();
                setTimeout(() => checkForActiveDuel(true), 500);
              }} 
            />
          </div>
        )}

        {/* Quick Stats */}
        {userProfile && (
          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Suas Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center min-w-0">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-primary">
                    {userProfile.level}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Nível</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-experience">
                    {userProfile.xp}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">XP</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-streak">
                    {userProfile.streak}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Sequência</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Actions */}
        <div className="grid gap-4 sm:gap-6 mb-6 sm:mb-8 w-full min-w-0">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <span className="text-xl sm:text-2xl">🎯</span>
                Iniciar Duelo
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                Escolha um oponente e desafie-o para um duelo de conhecimento financeiro
              </p>
              <Button 
                onClick={() => navigate('/find-opponent')}
                className="w-full text-sm sm:text-base"
              >
                Encontrar Oponente
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <span className="text-xl sm:text-2xl">📊</span>
                Duelos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-center text-muted-foreground py-6 sm:py-8">
                <p className="text-sm sm:text-base">Nenhum duelo encontrado</p>
                <p className="text-xs sm:text-sm mt-2">Seus duelos aparecerão aqui após a primeira partida</p>
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
