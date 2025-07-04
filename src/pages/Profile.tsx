import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { XPCard } from "@/components/ui/xp-card";
import { StreakBadge } from "@/components/ui/streak-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FloatingNavbar } from "@/components/floating-navbar";
import { useNavigate } from "react-router-dom";
import satoshiLogo from "/lovable-uploads/f344f3a7-aa34-4a5f-a2e0-8ac072c6aac5.png";

interface UserProfile {
  nickname: string;
  email: string;
  level: number;
  xp: number;
  streak: number;
  completedLessons: number;
  achievements: string[];
  coins: number;
  financialGoal: string;
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('satoshi_user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/welcome');
    }
  }, [navigate]);

  const achievements = [
    { id: 'first_lesson', name: 'Primeira Lição', icon: '🎯', earned: true },
    { id: 'streak_7', name: '7 Dias Seguidos', icon: '🔥', earned: user?.streak >= 7 },
    { id: 'level_5', name: 'Nível 5', icon: '⭐', earned: user?.level >= 5 },
    { id: 'quiz_master', name: 'Mestre dos Quiz', icon: '🧠', earned: false },
    { id: 'investor', name: 'Primeiro Investimento', icon: '📈', earned: false },
    { id: 'saver', name: 'Poupador Expert', icon: '🏦', earned: false }
  ];

  const stats = [
    { label: 'Lições Completas', value: user?.completedLessons || 0, icon: '📚' },
    { label: 'Dias de Sequência', value: user?.streak || 0, icon: '🔥' },
    { label: 'Moedas Satoshi', value: user?.coins || 0, icon: '🪙' },
    { label: 'Nível Atual', value: user?.level || 1, icon: '⭐' }
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                ← Dashboard
              </Button>
              <h1 className="text-xl font-bold text-foreground">Meu Perfil</h1>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
              Configurações
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <img src={satoshiLogo} alt={user.nickname} />
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-1">{user.nickname}</h2>
              <p className="text-muted-foreground mb-3">{user.email}</p>
              <div className="flex items-center gap-3">
                <StreakBadge days={user.streak} />
                <Badge variant="outline">{user.financialGoal}</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* XP and Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <XPCard
            level={user.level}
            currentXP={user.xp}
            nextLevelXP={user.level * 100}
          />
          
          <Card className="p-6">
            <h3 className="font-bold text-foreground mb-4">Progresso Geral</h3>
            <ProgressBar
              value={user.completedLessons}
              max={20}
              showLabel
              className="mb-3"
            />
            <p className="text-sm text-muted-foreground">
              {user.completedLessons} de 20 lições principais completadas
            </p>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-4 text-center">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Achievements */}
        <Card className="p-6">
          <h3 className="font-bold text-foreground mb-6">Conquistas</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border text-center transition-all ${
                  achievement.earned
                    ? 'bg-primary/10 border-primary'
                    : 'bg-muted/50 border-muted opacity-50'
                }`}
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <div className="font-semibold text-sm text-foreground">
                  {achievement.name}
                </div>
                {achievement.earned && (
                  <div className="text-xs text-primary mt-1">Conquistado!</div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      <FloatingNavbar />
    </div>
  );
}