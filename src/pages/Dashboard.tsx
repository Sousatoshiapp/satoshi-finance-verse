import { useState, useEffect } from "react";
import { LessonCard } from "@/components/lesson-card";
import { XPCard } from "@/components/ui/xp-card";
import { StreakBadge } from "@/components/ui/streak-badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import satoshiMascot from "@/assets/satoshi-mascot.png";

const lessons = [
  {
    id: 1,
    title: "Orçamento Pessoal",
    description: "Aprenda a controlar seus gastos e criar um orçamento que funciona para você",
    progress: 3,
    totalLessons: 5,
    difficulty: "Básico" as const,
    icon: "💰",
    isLocked: false
  },
  {
    id: 2,
    title: "Poupança Inteligente",
    description: "Descubra estratégias para economizar dinheiro e construir sua reserva de emergência",
    progress: 0,
    totalLessons: 4,
    difficulty: "Básico" as const,
    icon: "🏦",
    isLocked: false
  },
  {
    id: 3,
    title: "Investimentos Básicos",
    description: "Introdução ao mundo dos investimentos: ações, fundos e renda fixa",
    progress: 0,
    totalLessons: 6,
    difficulty: "Intermediário" as const,
    icon: "📈",
    isLocked: true
  },
  {
    id: 4,
    title: "Planejamento Financeiro",
    description: "Aprenda a definir metas financeiras e criar um plano para alcançá-las",
    progress: 0,
    totalLessons: 5,
    difficulty: "Intermediário" as const,
    icon: "🎯",
    isLocked: true
  }
];

export default function Dashboard() {
  const [userStats, setUserStats] = useState({
    level: 3,
    currentXP: 245,
    nextLevelXP: 400,
    streak: 7,
    completedLessons: 3
  });
  
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
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={satoshiMascot} alt="Satoshi" className="w-10 h-10" />
              <h1 className="text-2xl font-bold text-gradient">Satoshi</h1>
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
            Olá, Estudante! 👋
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
                  // Navegar para a lição
                  console.log(`Navegando para lição: ${lesson.title}`);
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
    </div>
  );
}