import { useState, useEffect } from "react";
import { LessonCard } from "@/components/lesson-card";
import { XPCard } from "@/components/ui/xp-card";
import { StreakBadge } from "@/components/ui/streak-badge";
import { Button } from "@/components/ui/button";
import { FloatingNavbar } from "@/components/floating-navbar";
import { useNavigate } from "react-router-dom";
import { lessons } from "@/data/lessons";
import { supabase } from "@/integrations/supabase/client";
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
  
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se usuário existe, se não redirecionar para welcome
    const userData = localStorage.getItem('satoshi_user');
    if (!userData) {
      navigate('/welcome');
      return;
    }
    
    // Carregar dados do usuário do Supabase
    loadUserData();
    
    // Atualizar saudação a cada minuto
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    
    return () => clearInterval(interval);
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

      if (profile) {
        setUserStats({
          level: profile.level || 1,
          currentXP: profile.xp || 0,
          nextLevelXP: (profile.level || 1) * 100,
          streak: profile.streak || 0,
          completedLessons: profile.completed_lessons || 0
        });
        setUserNickname(profile.nickname || 'Estudante');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback para localStorage se Supabase falhar
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

          {/* Streak Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-foreground font-medium">Streaks : {userStats.streak}/7</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-success to-primary h-3 rounded-full transition-all duration-500"
                style={{ width: `${(userStats.streak / 7) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Avatar Section */}
          <div className="text-center mb-8">
            <div className="relative mb-4">
              <div className="w-48 h-48 mx-auto bg-gradient-to-b from-muted to-card rounded-full flex items-end justify-center overflow-hidden shadow-elevated">
                <div className="text-8xl mb-4">🤖</div>
              </div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                <div className="bg-warning text-black px-2 py-1 rounded-full text-xs font-medium">
                  🟡 Nível atual
                </div>
              </div>
            </div>
            
            <Button 
              className="bg-gradient-to-r from-primary to-success text-white px-8 py-3 rounded-full text-lg font-semibold shadow-glow mb-4"
              onClick={() => navigate('/store')}
            >
              Comprar Avatar
            </Button>
            
            <p className="text-muted-foreground text-sm mb-2">
              Jogue o próximo nível para evoluir seu avatar
            </p>
            
            <div className="flex items-center justify-between text-sm mb-4">
              <span className="text-foreground font-medium">Tartaruga Estrategista</span>
              <span className="text-muted-foreground">Nível {userStats.level}</span>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2 mb-6">
              <div 
                className="bg-gradient-to-r from-success to-primary h-2 rounded-full"
                style={{ width: `${(userStats.currentXP / userStats.nextLevelXP) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-experience rounded-2xl p-4 text-center shadow-card">
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-xs text-black/70 mb-1">XP</div>
              <div className="text-2xl font-bold text-white">{userStats.currentXP}</div>
            </div>
            <div className="bg-gradient-level rounded-2xl p-4 text-center shadow-card">
              <div className="text-2xl mb-1">🏅</div>
              <div className="text-xs text-white/70 mb-1">Nível</div>
              <div className="text-2xl font-bold text-white">{String(userStats.level).padStart(2, '0')}</div>
            </div>
            <div className="bg-gradient-points rounded-2xl p-4 text-center shadow-card">
              <div className="text-2xl mb-1">💎</div>
              <div className="text-xs text-black/70 mb-1">Pontos</div>
              <div className="text-2xl font-bold text-white">{userStats.currentXP * 2}</div>
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
                    <div className="text-muted-foreground">Pontos</div>
                    <div className="font-bold text-points">100</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Troféu</div>
                    <div className="text-lg">🏆</div>
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-success text-white rounded-full font-semibold"
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
                    <div className="text-muted-foreground">Pontos</div>
                    <div className="font-bold text-points">150</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Troféu</div>
                    <div className="text-lg">⚔️</div>
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-success text-white rounded-full font-semibold"
                  onClick={() => navigate('/duels')}
                >
                  Duelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <FloatingNavbar />
    </div>
  );
}