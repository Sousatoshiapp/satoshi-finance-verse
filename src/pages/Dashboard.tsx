import { useState, useEffect } from "react";
import { LessonCard } from "@/components/lesson-card";
import { XPCard } from "@/components/ui/xp-card";
import { StreakBadge } from "@/components/ui/streak-badge";
import { Button } from "@/components/ui/button";
import { FloatingNavbar } from "@/components/floating-navbar";
import { AvatarSelection } from "@/components/avatar-selection";
import { AvatarDisplay } from "@/components/avatar-display";
import { CompactStreakCounter } from "@/components/compact-streak-counter";
import { CompactBadgeShowcase } from "@/components/compact-badge-showcase";
import { CompactDailyRewards } from "@/components/compact-daily-rewards";
import { useNavigate } from "react-router-dom";
import { lessons } from "@/data/lessons";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getLevelInfo } from "@/data/levels";
import newLogo from "/lovable-uploads/874326e7-1122-419a-8916-5df0c112245d.png";

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
    level: 3,
    currentXP: 245,
    nextLevelXP: 400,
    streak: 7,
    completedLessons: 3
  });
  const [userNickname, setUserNickname] = useState('Estudante');
  const [greeting, setGreeting] = useState(getGreeting());
  const [userAvatar, setUserAvatar] = useState<any>(null);
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  const [hasAvatar, setHasAvatar] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Carregar dados do usuário do Supabase
    loadUserData();
    
    // Atualizar saudação a cada minuto
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    
    return () => clearInterval(interval);
  }, [navigate]);

  const loadUserData = async () => {
    // Sempre carregar dados do localStorage primeiro
    const userData = localStorage.getItem('satoshi_user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserStats({
        level: user.level || 1,
        currentXP: user.xp || 0,
        nextLevelXP: (user.level || 1) * 100,
        streak: user.streak || 0,
        completedLessons: user.completedLessons || 0
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

      if (profile) {
        setUserStats({
          level: profile.level || 1,
          currentXP: profile.xp || 0,
          nextLevelXP: (profile.level || 1) * 100,
          streak: profile.streak || 0,
          completedLessons: profile.completed_lessons || 0
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

  const handleAvatarAction = () => {
    if (hasAvatar) {
      // Navigate to avatar evolution/upgrade section in store
      navigate('/store?tab=avatars');
    } else {
      // Show avatar selection dialog
      setShowAvatarSelection(true);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with Profile */}
      <div className="px-4 pt-8 pb-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{greeting.icon} {greeting.text}</p>
              <h1 className="text-xl font-bold text-foreground">{userNickname}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-avatar rounded-full flex items-center justify-center text-white font-bold text-lg shadow-glow">
                {userNickname.charAt(0).toUpperCase()}
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
                ⚙️
              </Button>
            </div>
          </div>

          {/* Avatar Section */}
          <div className="text-center mb-6">
            <div className="relative mb-4">
              {userAvatar ? (
                <div className="flex justify-center">
                  <div className="relative">
                    <AvatarDisplay 
                      avatar={userAvatar} 
                      size="xl"
                      showBadge={true}
                      evolutionLevel={userAvatar.evolution_level || 1}
                    />
                    {/* Level Badge - Centered at bottom of avatar */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border border-orange-400">
                        NÍVEL {userStats.level}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="w-48 h-48 mx-auto bg-gradient-to-b from-muted to-card rounded-full flex items-center justify-center overflow-hidden shadow-elevated">
                    <div className="text-8xl mb-4">🤖</div>
                  </div>
                  {/* Level Badge for placeholder avatar */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border border-orange-400">
                      NÍVEL {userStats.level}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <Button 
              className="bg-gradient-to-r from-primary to-success text-black px-8 py-3 rounded-full text-lg font-semibold shadow-glow mb-4"
              onClick={handleAvatarAction}
            >
              {hasAvatar ? 'Evoluir Avatar' : 'Escolher Avatar'}
            </Button>
            
            <p className="text-muted-foreground text-sm mb-2">
              {hasAvatar 
                ? 'Continue jogando para evoluir seu cidadão digital' 
                : 'Selecione seu primeiro avatar para começar'
              }
            </p>
            
            <div className="flex items-center justify-between text-sm mb-4">
              <span className="text-foreground font-medium">
                {userAvatar ? userAvatar.name : 'Cidadão Anônimo'}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/levels')}
                className="text-muted-foreground hover:text-foreground"
              >
                {getLevelInfo(userStats.level).name} →
              </Button>
            </div>
            
            <div 
              className="w-full bg-muted rounded-full h-2 mb-6 cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => navigate('/levels')}
            >
              <div 
                className="bg-gradient-to-r from-success to-primary h-2 rounded-full"
                style={{ width: `${(userStats.currentXP / userStats.nextLevelXP) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
              <span>XP: {userStats.currentXP}</span>
              <span>Próximo: {getLevelInfo(userStats.level + 1).name}</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div 
              className="bg-gradient-experience rounded-2xl p-4 text-center shadow-card cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate('/levels')}
            >
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-xs text-white mb-1">XP</div>
              <div className="text-2xl font-bold text-white">{userStats.currentXP}</div>
            </div>
            <div 
              className="bg-gradient-level rounded-2xl p-4 text-center shadow-card cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate('/levels')}
            >
              <div className="text-2xl mb-1">🏅</div>
              <div className="text-xs text-white mb-1">Nível</div>
              <div className="text-2xl font-bold text-white">{String(userStats.level).padStart(2, '0')}</div>
            </div>
            <div 
              className="bg-gradient-beetz rounded-2xl p-4 text-center shadow-card cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate('/beetz-info')}
            >
              <div className="text-2xl mb-1">🥕</div>
              <div className="text-xs text-white mb-1">Beetz</div>
              <div className="text-2xl font-bold text-white">{userStats.currentXP * 2}</div>
            </div>
          </div>

          {/* Compact Engagement Components */}
          <div className="grid gap-3 mb-8">
            <CompactStreakCounter currentStreak={userStats.streak} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CompactDailyRewards />
              <CompactBadgeShowcase />
            </div>
          </div>

          {/* Recent Tournaments */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-foreground mb-4">Torneios recentes</h3>
            <div className="grid gap-3">
              <div className="bg-card rounded-2xl p-4 border border-border shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground">Quiz Financeiro</h4>
                  <span className="text-xs text-muted-foreground">Tempo restante: 20 minutos</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center text-xs mb-4">
                  <div>
                    <div className="text-muted-foreground">Ganhe</div>
                    <div className="font-bold text-experience">50 XP</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Beetz</div>
                    <div className="font-bold text-beetz">100</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Troféu</div>
                    <div className="text-lg">🏆</div>
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-success text-black rounded-full font-semibold"
                  onClick={() => navigate('/game-mode')}
                >
                  Jogar
                </Button>
              </div>
              
              <div className="bg-card rounded-2xl p-4 border border-border shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground">Duelo Financeiro</h4>
                  <span className="text-xs text-muted-foreground">Disponível agora</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center text-xs mb-4">
                  <div>
                    <div className="text-muted-foreground">Ganhe</div>
                    <div className="font-bold text-experience">75 XP</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Beetz</div>
                    <div className="font-bold text-beetz">150</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Troféu</div>
                    <div className="text-lg">⚔️</div>
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-success text-black rounded-full font-semibold"
                  onClick={() => navigate('/duels')}
                >
                  Duelar
                </Button>
              </div>
              
              <div className="bg-card rounded-2xl p-4 border border-border shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground">Playground Investimentos</h4>
                  <span className="text-xs text-muted-foreground">Novo!</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center text-xs mb-4">
                  <div>
                    <div className="text-muted-foreground">Pratique</div>
                    <div className="font-bold text-primary">Carteiras</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Siga</div>
                    <div className="font-bold text-secondary">Outros</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Aprenda</div>
                    <div className="text-lg">📈</div>
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-secondary to-primary text-black rounded-full font-semibold"
                  onClick={() => navigate('/playground')}
                >
                  Explorar
                </Button>
              </div>
            </div>
          </div>
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