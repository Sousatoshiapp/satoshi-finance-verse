import { useState, useEffect } from "react";
import { LessonCard } from "@/components/lesson-card";
import { XPCard } from "@/components/ui/xp-card";
import { StreakBadge } from "@/components/ui/streak-badge";
import { Button } from "@/components/ui/button";
import { FloatingNavbar } from "@/components/floating-navbar";
import { useNavigate } from "react-router-dom";
import { lessons } from "@/data/lessons";
import newLogo from "/lovable-uploads/874326e7-1122-419a-8916-5df0c112245d.png";

export default function Dashboard() {
  const [userStats, setUserStats] = useState({
    level: 3,
    currentXP: 245,
    nextLevelXP: 400,
    streak: 7,
    completedLessons: 3
  });
  const [userNickname, setUserNickname] = useState('Estudante');
  
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se usuário existe, se não redirecionar para welcome
    const userData = localStorage.getItem('satoshi_user');
    if (!userData) {
      navigate('/welcome');
      return;
    }
    
    // Carregar dados do usuário
    const user = JSON.parse(userData);
    setUserStats({
      level: user.level || 1,
      currentXP: user.xp || 0,
      nextLevelXP: (user.level || 1) * 100,
      streak: user.streak || 0,
      completedLessons: user.completedLessons || 0
    });
    setUserNickname(user.nickname || 'Estudante');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={newLogo} alt="Logo" className="w-10 h-10" />
            </div>
            
            <div className="flex items-center gap-4">
              <StreakBadge days={userStats.streak} />
              <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                Perfil
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Olá, {userNickname}! 👋
          </h2>
          <p className="text-muted-foreground text-lg">
            Continue sua jornada de educação financeira
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <XPCard
            level={userStats.level}
            currentXP={userStats.currentXP}
            nextLevelXP={userStats.nextLevelXP}
          />
          
          <div className="bg-card rounded-xl p-6 shadow-card border">
            <h3 className="font-bold text-foreground mb-4">Suas Conquistas</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Lições Completas</span>
                <span className="font-semibold text-foreground">{userStats.completedLessons}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sequência Atual</span>
                <span className="font-semibold text-streak">{userStats.streak} dias</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nível Atual</span>
                <span className="font-semibold text-experience">Nível {userStats.level}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate('/quiz')} className="flex flex-col gap-2 h-20">
            <span className="text-2xl">🧠</span>
            <span className="text-sm">Quiz</span>
          </Button>
          <Button variant="outline" onClick={() => navigate('/leaderboard')} className="flex flex-col gap-2 h-20">
            <span className="text-2xl">🏆</span>
            <span className="text-sm">Ranking</span>
          </Button>
          <Button variant="outline" onClick={() => navigate('/store')} className="flex flex-col gap-2 h-20">
            <span className="text-2xl">🛒</span>
            <span className="text-sm">Loja</span>
          </Button>
          <Button variant="outline" onClick={() => navigate('/profile')} className="flex flex-col gap-2 h-20">
            <span className="text-2xl">👤</span>
            <span className="text-sm">Perfil</span>
          </Button>
        </div>

        {/* Lessons Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-6">Suas Lições</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                title={lesson.title}
                description={lesson.description}
                progress={lesson.progress}
                totalLessons={lesson.totalLessons}
                difficulty={lesson.difficulty}
                icon={lesson.icon}
                isLocked={lesson.isLocked}
                onClick={() => {
                  if (!lesson.isLocked) {
                    navigate(`/lesson/${lesson.id}/1`);
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Daily Challenge */}
        <div className="bg-gradient-card rounded-xl p-6 shadow-card border">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">⭐</span>
            <h3 className="text-xl font-bold text-foreground">Desafio Diário</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Complete uma lição hoje para manter sua sequência!
          </p>
          <Button className="gradient-primary" onClick={() => window.location.href = '/quiz'}>
            Começar Desafio
          </Button>
        </div>
      </div>
      
      <FloatingNavbar />
    </div>
  );
}