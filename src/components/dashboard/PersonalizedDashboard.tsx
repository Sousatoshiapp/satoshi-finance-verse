import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BTZCounter } from "@/components/quiz/btz-counter";
import { 
  BookOpen, 
  Brain, 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock,
  Star,
  Award,
  Zap,
  BarChart3
} from "lucide-react";

interface LearningStats {
  currentStreak: number;
  totalXP: number;
  level: number;
  weeklyGoal: number;
  weeklyProgress: number;
  strongConcepts: number;
  weakConcepts: number;
  nextLevelXP: number;
  averageAccuracy: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_icon: string;
  rarity: string;
  earned_at: string;
}

interface AIRecommendation {
  id: string;
  recommendation_type: string;
  recommendation_data: any;
  confidence_score: number;
  created_at: string;
}

export function PersonalizedDashboard() {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Load learning analytics
      const { data: analytics } = await supabase
        .from('learning_analytics')
        .select('*')
        .eq('user_id', profile.id)
        .order('analytics_date', { ascending: false })
        .limit(30);

      // Load recent achievements
      const { data: achievements } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements (*)
        `)
        .eq('user_id', profile.id)
        .order('earned_at', { ascending: false })
        .limit(3);

      // Load AI recommendations
      const { data: recommendations } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', profile.id)
        .eq('applied', false)
        .order('confidence_score', { ascending: false })
        .limit(3);

      // Load concept mastery
      const { data: concepts } = await supabase
        .from('user_concept_mastery')
        .select('*')
        .eq('user_id', profile.id);

      // Calculate stats
      const currentWeek = new Date();
      const weekStart = new Date(currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay()));
      
      const weeklyAnalytics = analytics?.filter(a => 
        new Date(a.analytics_date) >= weekStart
      ) || [];

      const weeklyXP = weeklyAnalytics.reduce((sum, a) => sum + (a.questions_correct * 10), 0);
      const totalQuestions = analytics?.reduce((sum, a) => sum + (a.questions_attempted || 0), 0) || 1;
      const totalCorrect = analytics?.reduce((sum, a) => sum + (a.questions_correct || 0), 0) || 0;
      
      const strongConcepts = concepts?.filter(c => c.mastery_level > 0.8).length || 0;
      const weakConcepts = concepts?.filter(c => c.mastery_level < 0.5).length || 0;

      const calculatedStats: LearningStats = {
        currentStreak: profile.streak || 0,
        totalXP: profile.xp || 0,
        level: profile.level || 1,
        weeklyGoal: 1000, // Default weekly goal
        weeklyProgress: weeklyXP,
        strongConcepts,
        weakConcepts,
        nextLevelXP: ((profile.level || 1) + 1) * 500, // Simplified calculation
        averageAccuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
      };

      setStats(calculatedStats);
      setRecentAchievements(achievements?.map(a => ({
        ...a.achievements,
        earned_at: a.earned_at
      })) || []);
      setAiRecommendations(recommendations || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressToNextLevel = () => {
    if (!stats) return 0;
    const currentLevelXP = stats.level * 500;
    const progress = ((stats.totalXP - currentLevelXP) / (stats.nextLevelXP - currentLevelXP)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-500 border-yellow-500';
      case 'epic': return 'text-purple-500 border-purple-500';
      case 'rare': return 'text-blue-500 border-blue-500';
      default: return 'text-gray-500 border-gray-500';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'concept_focus': return <Target className="h-4 w-4" />;
      case 'difficulty_adjustment': return <TrendingUp className="h-4 w-4" />;
      case 'schedule_optimization': return <Clock className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Dados do dashboard indisponíveis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bem-vindo de volta!</h2>
          <p className="text-muted-foreground">
            Aqui está seu progresso de aprendizado personalizado
          </p>
        </div>
        <div className="flex items-center gap-4">
          <BTZCounter className="min-w-0" />
          <Button onClick={() => navigate('/analytics')} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Ver Analytics Completo
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5" />
          <CardContent className="p-6 relative">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nível Atual</p>
                <p className="text-2xl font-bold">{stats.level}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={getProgressToNextLevel()} className="h-2 w-20" />
                  <span className="text-xs text-muted-foreground">
                    {Math.round(getProgressToNextLevel())}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/5" />
          <CardContent className="p-6 relative">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sequência</p>
                <p className="text-2xl font-bold">{stats.currentStreak}</p>
                <p className="text-xs text-muted-foreground">dias consecutivos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5" />
          <CardContent className="p-6 relative">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-full">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Precisão</p>
                <p className="text-2xl font-bold">{stats.averageAccuracy}%</p>
                <p className="text-xs text-muted-foreground">média geral</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5" />
          <CardContent className="p-6 relative">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 rounded-full">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Meta Semanal</p>
                <p className="text-2xl font-bold">
                  {Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100)}%
                </p>
                <Progress 
                  value={(stats.weeklyProgress / stats.weeklyGoal) * 100} 
                  className="h-2 mt-2" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Progress */}
        <Card className="h-48">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progresso de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">XP Ganho</span>
              <span className="font-bold">+{stats.weeklyProgress}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Questões</span>
              <span className="font-bold">12/15</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Meta Diária</span>
                <span>80%</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Daily Missions */}
        <Card className="h-36">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Missões Diárias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Completar 10 questões</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Manter sequência</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span>Ganhar 150 XP</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Conquistas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAchievements.length > 0 ? (
              recentAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className={`text-2xl p-2 rounded-full border-2 ${getRarityColor(achievement.rarity)}`}>
                    {achievement.badge_icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{achievement.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(achievement.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Star className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Suas conquistas aparecerão aqui
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Recomendações Personalizadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiRecommendations.length > 0 ? (
            aiRecommendations.map((recommendation) => (
              <div key={recommendation.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-full mt-1">
                    {getRecommendationIcon(recommendation.recommendation_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">
                        {recommendation.recommendation_type === 'concept_focus' && 'Focar em Conceitos'}
                        {recommendation.recommendation_type === 'difficulty_adjustment' && 'Ajustar Dificuldade'}
                        {recommendation.recommendation_type === 'schedule_optimization' && 'Otimizar Horário'}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(recommendation.confidence_score * 100)}% confiança
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {recommendation.recommendation_data?.suggestion || 
                       'Recomendação baseada no seu padrão de estudo'}
                    </p>
                    <Button size="sm" className="mt-2">
                      Aplicar Recomendação
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Continue estudando para receber recomendações personalizadas
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => navigate('/quiz')}
              className="h-auto p-4 flex-col gap-2"
            >
              <BookOpen className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Continuar Estudando</div>
                <div className="text-xs opacity-80">Próximo tópico recomendado</div>
              </div>
            </Button>

            <Button 
              variant="outline"
              onClick={() => navigate('/analytics')}
              className="h-auto p-4 flex-col gap-2"
            >
              <BarChart3 className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Ver Analytics</div>
                <div className="text-xs opacity-80">Progresso detalhado</div>
              </div>
            </Button>

            <Button 
              variant="outline"
              onClick={() => navigate('/duels')}
              className="h-auto p-4 flex-col gap-2"
            >
              <Trophy className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Duelar</div>
                <div className="text-xs opacity-80">Teste seus conhecimentos</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}