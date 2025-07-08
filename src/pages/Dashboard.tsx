import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BeetzIcon } from "@/components/ui/beetz-icon";
import { FloatingNavbar } from "@/components/floating-navbar";
import { AvatarSelection } from "@/components/avatar-selection";
import { AvatarDisplay } from "@/components/avatar-display";
import { TournamentCarousel } from "@/components/tournaments/tournament-carousel";
import { DuelPlaygroundGrid } from "@/components/duel-playground-grid";
import { SubscriptionIndicator } from "@/components/subscription-indicator";
import { CarouselDailyMissions } from "@/components/carousel-daily-missions";
import { useSubscription } from "@/hooks/use-subscription";
import { useDailyMissions } from "@/hooks/use-daily-missions";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getLevelInfo } from "@/data/levels";
import { DashboardSummary } from "@/components/dashboard-summary";
import { QuickActions } from "@/components/quick-actions";
import { UserAffiliation } from "@/components/user-affiliation";

const getGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return { text: "BOM DIA", icon: "☀️" };
  } else if (hour >= 12 && hour < 18) {
    return { text: "BOA TARDE", icon: "🌤️" };
  } else {
    return { text: "BOA NOITE", icon: "🌙" };
  }
};

export default function Dashboard() {
  const [userStats, setUserStats] = useState({
    level: 1,
    currentXP: 0,
    nextLevelXP: 100,
    streak: 0,
    completedLessons: 0,
    points: 0
  });
  const [userNickname, setUserNickname] = useState('Estudante');
  const [greeting, setGreeting] = useState(getGreeting());
  const [userAvatar, setUserAvatar] = useState<any>(null);
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  const [hasAvatar, setHasAvatar] = useState(false);
  const [userDistrict, setUserDistrict] = useState<any>(null);
  const [userTeam, setUserTeam] = useState<any>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription, refreshSubscription } = useSubscription();
  const { markDailyLogin } = useDailyMissions();

  useEffect(() => {
    // Verificar se há parâmetros de sucesso do Stripe na URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const tier = urlParams.get('tier');
    
    if (sessionId && tier) {
      handlePaymentSuccess(sessionId, tier);
    }
    
    // Carregar dados do usuário
    loadUserData();
    
    // Marcar login diário para missões
    markDailyLogin();
    
    // Atualizar saudação a cada minuto
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    
    return () => clearInterval(interval);
  }, [navigate, markDailyLogin]);

  const handlePaymentSuccess = async (sessionId: string, tier: string) => {
    try {
      toast({
        title: "Processando pagamento...",
        description: "Aguarde enquanto ativamos sua assinatura.",
      });

      const { data, error } = await supabase.functions.invoke('process-subscription-success', {
        body: { session_id: sessionId }
      });

      if (error) throw error;

      if (data?.success) {
        // Limpar parâmetros da URL
        window.history.replaceState({}, document.title, "/dashboard");
        
        // Atualizar dados da assinatura
        refreshSubscription();
        
        toast({
          title: "🎉 Assinatura ativada!",
          description: `Seu plano ${tier.toUpperCase()} está ativo! ${data.beetz_awarded > 0 ? `Você ganhou ${data.beetz_awarded} Beetz!` : ''}`,
        });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Houve um problema ao ativar sua assinatura. Entre em contato com o suporte.",
        variant: "destructive"
      });
    }
  };

  const getNextLevelXP = async (currentLevel: number) => {
    try {
      const { data, error } = await supabase.rpc('get_next_level_xp', {
        current_level: currentLevel
      });
      if (error) throw error;
      return data || (currentLevel + 1) * 100;
    } catch (error) {
      console.error('Error getting next level XP:', error);
      return (currentLevel + 1) * 100;
    }
  };

  const loadUserData = async () => {
    // Sempre carregar dados do localStorage primeiro
    const userData = localStorage.getItem('satoshi_user');
    if (userData) {
      const user = JSON.parse(userData);
      const nextLevelXP = await getNextLevelXP(user.level || 1);
      setUserStats({
        level: user.level || 1,
        currentXP: user.xp || 0,
        nextLevelXP,
        streak: user.streak || 0,
        completedLessons: user.completedLessons || 0,
        points: user.points || 0
      });
      setUserNickname(user.nickname || 'Estudante');
    }
    
    try {
      // Tentar carregar do Supabase para sobrescrever se disponível
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          *,
          avatars (
            id,
            name,
            description,
            image_url,
            avatar_class,
            district_theme,
            rarity,
            evolution_level
          )
        `)
        .eq('user_id', authUser.id)
        .single();

      // Load user district and team information
      const { data: userDistrictData } = await supabase
        .from('user_districts')
        .select(`
          districts (
            id,
            name,
            color_primary,
            color_secondary,
            theme
          )
        `)
        .eq('user_id', profile?.id)
        .eq('is_residence', true)
        .maybeSingle();

      const { data: userTeamData } = await supabase
        .from('team_members')
        .select(`
          district_teams (
            id,
            name,
            team_color
          )
        `)
        .eq('user_id', profile?.id)
        .eq('is_active', true)
        .maybeSingle();

      if (profile) {
        // Calculate correct level based on XP
        const { data: calculatedLevel } = await supabase.rpc('calculate_user_level', {
          user_xp: profile.xp || 0
        });
        
        const actualLevel = calculatedLevel || profile.level || 1;
        const nextLevelXP = await getNextLevelXP(actualLevel);
        
        // Update level in database if it's different
        if (actualLevel !== profile.level) {
          await supabase
            .from('profiles')
            .update({ level: actualLevel })
            .eq('id', profile.id);
        }
        
        setUserStats({
          level: actualLevel,
          currentXP: profile.xp || 0,
          nextLevelXP,
          streak: profile.streak || 0,
          completedLessons: profile.completed_lessons || 0,
          points: profile.points || 0
        });
        setUserNickname(profile.nickname || 'Estudante');
        
        // Check if user has an avatar
        if (profile.avatars) {
          setUserAvatar(profile.avatars);
          setHasAvatar(true);
        } else {
          // Check if user is new and should see avatar selection
          setShowAvatarSelection(true);
        }

        // Set district and team data
        if (userDistrictData?.districts) {
          setUserDistrict(userDistrictData.districts);
        }
        if (userTeamData?.district_teams) {
          setUserTeam(userTeamData.district_teams);
        }
      }
    } catch (error) {
      console.error('Error loading user data from Supabase:', error);
      // Dados do localStorage já foram carregados acima
    }
  };

  const handleAvatarSelected = () => {
    // Reload user data to get the new avatar
    loadUserData();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Optimized Header with Consolidated Profile */}
      <div className="px-4 pt-8 pb-4">
        <div className="max-w-md mx-auto">
          {/* Simplified Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{greeting.icon} {greeting.text}</p>
              <h1 className="text-xl font-bold text-foreground">{userNickname}</h1>
            </div>
            <div className="flex items-center gap-2">
              <SubscriptionIndicator tier={subscription.tier} size="sm" />
              {subscription.tier === 'free' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/subscription-plans')}
                  className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0"
                >
                  ⭐ Pro
                </Button>
              )}
            </div>
          </div>

          {/* Consolidated Avatar & Level Section */}
          <div className="text-center mb-6">
            <div className="relative mb-4">
              {userAvatar ? (
                <div className="flex justify-center">
                  <div className="relative">
                    <AvatarDisplay 
                      avatar={userAvatar} 
                      size="lg"
                      showBadge={true}
                      evolutionLevel={userAvatar.evolution_level || 1}
                    />
                    {/* Level Badge - Positioned Right Side */}
                    <div className="absolute -bottom-0.5 right-2">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-medium shadow-md flex items-center gap-1">
                        <span>Nível</span>
                        <span className="font-bold">{userStats.level}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-b from-muted to-card rounded-full flex items-center justify-center overflow-hidden shadow-elevated">
                    <div className="text-5xl">🤖</div>
                  </div>
                  <div className="absolute -bottom-0.5 right-2">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-medium shadow-md flex items-center gap-1">
                      <span>Nível</span>
                      <span className="font-bold">{userStats.level}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Responsive Progress Bar */}
            <div className="w-full max-w-sm mx-auto px-2 sm:px-0">
              <div 
                className="w-full bg-muted rounded-full h-2 mb-3 cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => navigate('/levels')}
              >
                <div 
                  className="bg-gradient-to-r from-success to-primary h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((userStats.currentXP / userStats.nextLevelXP) * 100, 100)}%` 
                  }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center text-xs text-muted-foreground mb-4 px-1">
                <span>XP: {userStats.currentXP}</span>
                <span>Meta: {userStats.nextLevelXP}</span>
              </div>
            </div>

            {/* Profile Button with Side Badges - Responsive */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4">
              {/* XP Badge - Left Side */}
              <div 
                className="border border-[#adff2f] rounded-full px-3 sm:px-6 py-2 cursor-pointer hover:scale-105 transition-all duration-200 flex items-center justify-center gap-1.5 w-full sm:w-[120px] max-w-[120px]"
                onClick={() => navigate('/levels')}
                style={{ borderWidth: '0.5px' }}
              >
                <span className="text-sm">⚡</span>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground leading-none">XP</div>
                  <div className="text-xs font-bold text-foreground leading-none">{userStats.currentXP}</div>
                </div>
              </div>

              {/* Profile Button */}
              <Button 
                className="bg-gradient-to-r from-primary to-success text-black px-3 sm:px-6 py-2 rounded-full font-semibold shadow-glow w-full sm:w-[120px] max-w-[120px] text-xs sm:text-sm"
                onClick={() => navigate(hasAvatar ? '/profile' : '/store')}
              >
                {hasAvatar ? 'Meu Perfil' : 'Escolher Avatar'}
              </Button>

              {/* Beetz Badge - Right Side */}
              <div 
                className="border border-[#adff2f] rounded-full px-3 sm:px-6 py-2 cursor-pointer hover:scale-105 transition-all duration-200 flex items-center justify-center gap-1.5 w-full sm:w-[120px] max-w-[120px]"
                onClick={() => navigate('/beetz-info')}
                style={{ borderWidth: '0.5px' }}
              >
                <BeetzIcon size="md" />
                <div className="text-center">
                  <div className="text-xs text-muted-foreground leading-none">Beetz</div>
                  <div className="text-xs font-bold text-foreground leading-none">{userStats.points}</div>
                </div>
              </div>
            </div>
          </div>

          {/* User Affiliation - District & Team */}
          <UserAffiliation district={userDistrict} team={userTeam} />

          {/* Enhanced Daily Summary */}
          <DashboardSummary userStats={userStats} subscription={subscription} />

          {/* Core Actions */}
          <div className="mb-6">
            <CarouselDailyMissions />
          </div>

          <div className="mb-6">
            <TournamentCarousel />
          </div>
          
          <div className="mb-6">
            <DuelPlaygroundGrid />
          </div>

          {/* Quick Actions */}
          <QuickActions />

        </div>
      </div>
      
      <FloatingNavbar />
      
      {/* Avatar Selection Dialog */}
      <AvatarSelection 
        open={showAvatarSelection}
        onOpenChange={setShowAvatarSelection}
        onAvatarSelected={handleAvatarSelected}
      />
    </div>
  );
}