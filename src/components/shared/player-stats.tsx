import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Trophy, 
  Target, 
  Zap, 
  Clock, 
  Users,
  Sword,
  Brain,
  Medal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface PlayerStats {
  totalXP: number;
  level: number;
  streak: number;
  quizzesCompleted: number;
  duelsWon: number;
  correctAnswers: number;
  averageTime: number;
  rank: number;
  weeklyXP: number;
}

export function PlayerStats() {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayerStats();
  }, []);

  const loadPlayerStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Load quiz sessions for additional stats
      const { data: quizSessions } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      // Calculate stats
      const quizzesCompleted = quizSessions?.length || 0;
      const totalCorrect = quizSessions?.reduce((sum, session) => sum + (session.questions_correct || 0), 0) || 0;
      const totalTime = quizSessions?.reduce((sum, session) => sum + (session.time_spent || 0), 0) || 0;
      const averageTime = quizzesCompleted > 0 ? Math.round(totalTime / quizzesCompleted) : 0;

      // Get weekly leaderboard position (mock for now)
      const mockRank = Math.floor(Math.random() * 100) + 1;

      setStats({
        totalXP: profile.xp || 0,
        level: profile.level || 1,
        streak: profile.streak || 0,
        quizzesCompleted,
        duelsWon: Math.floor(quizzesCompleted * 0.3), // Mock
        correctAnswers: totalCorrect,
        averageTime,
        rank: mockRank,
        weeklyXP: Math.floor((profile.xp || 0) * 0.1) // Mock weekly XP
      });
    } catch (error) {
      console.error('Error loading player stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-muted/30 rounded-lg p-3 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      icon: <Zap className="h-4 w-4 text-blue-500" />,
      label: "XP Total",
      value: stats.totalXP.toLocaleString(),
      color: "text-blue-500"
    },
    {
      icon: <Medal className="h-4 w-4 text-purple-500" />,
      label: "Nível",
      value: stats.level.toString(),
      color: "text-purple-500"
    },
    {
      icon: <Target className="h-4 w-4 text-orange-500" />,
      label: "Sequência",
      value: `${stats.streak} dias`,
      color: "text-orange-500"
    },
    {
      icon: <Trophy className="h-4 w-4 text-yellow-500" />,
      label: "Ranking",
      value: `#${stats.rank}`,
      color: "text-yellow-500"
    },
    {
      icon: <Brain className="h-4 w-4 text-green-500" />,
      label: "Quizzes",
      value: stats.quizzesCompleted.toString(),
      color: "text-green-500"
    },
    {
      icon: <Sword className="h-4 w-4 text-red-500" />,
      label: "Duelos Vencidos",
      value: stats.duelsWon.toString(),
      color: "text-red-500"
    },
    {
      icon: <Target className="h-4 w-4 text-cyan-500" />,
      label: "Acertos",
      value: stats.correctAnswers.toString(),
      color: "text-cyan-500"
    },
    {
      icon: <Clock className="h-4 w-4 text-pink-500" />,
      label: "Tempo Médio",
      value: `${stats.averageTime}s`,
      color: "text-pink-500"
    }
  ];

  return (
    <Card className="border-green-500/20 bg-gradient-to-br from-background to-green-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Estatísticas do Jogador
          </CardTitle>
          
          <Badge variant="outline" className="text-green-500 border-green-500/30">
            Esta Semana: +{stats.weeklyXP} XP
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-lg p-3 text-center hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-center mb-2">
                {stat.icon}
              </div>
              <div className="text-xs text-muted-foreground mb-1">
                {stat.label}
              </div>
              <div className={cn("text-lg font-bold", stat.color)}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
        
        {/* Performance Indicators */}
        <div className="mt-6 space-y-3">
          <div className="text-sm font-medium">Performance Semanal</div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>XP Ganho</span>
              <span>{stats.weeklyXP} / {stats.weeklyXP + 200}</span>
            </div>
            <Progress value={(stats.weeklyXP / (stats.weeklyXP + 200)) * 100} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Precisão</span>
              <span>{Math.round((stats.correctAnswers / Math.max(stats.correctAnswers + 20, 1)) * 100)}%</span>
            </div>
            <Progress 
              value={(stats.correctAnswers / Math.max(stats.correctAnswers + 20, 1)) * 100} 
              className="h-2" 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}