import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Progress } from "@/components/shared/ui/progress";
import { Button } from "@/components/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuizStats {
  total_questions: number;
  approved_questions: number;
  pending_questions: number;
  rejected_questions: number;
  themes: Record<string, {
    total: number;
    easy: number;
    medium: number;
    hard: number;
    approved: number;
  }>;
}

interface QuizAnalyticsDashboardProps {
  onRefresh?: () => void;
}

export function QuizAnalyticsDashboard({ onRefresh }: QuizAnalyticsDashboardProps) {
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get all questions with stats
      const { data: questions, error } = await supabase
        .from('quiz_questions')
        .select('theme, difficulty, is_approved')
        .not('theme', 'is', null);

      if (error) throw error;

      const stats: QuizStats = {
        total_questions: questions?.length || 0,
        approved_questions: questions?.filter(q => q.is_approved === true).length || 0,
        pending_questions: questions?.filter(q => q.is_approved === null).length || 0,
        rejected_questions: questions?.filter(q => q.is_approved === false).length || 0,
        themes: {}
      };

      // Process theme statistics
      questions?.forEach(question => {
        if (!question.theme) return;
        
        if (!stats.themes[question.theme]) {
          stats.themes[question.theme] = {
            total: 0,
            easy: 0,
            medium: 0,
            hard: 0,
            approved: 0
          };
        }

        const themeStats = stats.themes[question.theme];
        themeStats.total++;
        themeStats[question.difficulty as keyof typeof themeStats]++;
        
        if (question.is_approved === true) {
          themeStats.approved++;
        }
      });

      setStats(stats);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleRefresh = () => {
    loadAnalytics();
    onRefresh?.();
  };

  if (loading || !stats) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const approvalRate = stats.total_questions > 0 
    ? (stats.approved_questions / stats.total_questions) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics do Quiz</h2>
          <p className="text-muted-foreground">Dashboard de qualidade e estatísticas</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Perguntas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_questions}</div>
            <p className="text-xs text-muted-foreground">
              Geradas automaticamente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvalRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.approved_questions} de {stats.total_questions}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_questions}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando revisão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejeitadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected_questions}</div>
            <p className="text-xs text-muted-foreground">
              Precisam de revisão
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Theme Analytics */}
      <Tabs defaultValue="themes" className="w-full">
        <TabsList>
          <TabsTrigger value="themes">Por Tema</TabsTrigger>
          <TabsTrigger value="difficulty">Por Dificuldade</TabsTrigger>
        </TabsList>
        
        <TabsContent value="themes" className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(stats.themes).map(([theme, themeStats]) => {
              const themeApprovalRate = themeStats.total > 0 
                ? (themeStats.approved / themeStats.total) * 100 
                : 0;

              return (
                <Card key={theme}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg capitalize">
                        {theme.replace(/_/g, ' ')}
                      </CardTitle>
                      <Badge variant={themeApprovalRate > 80 ? "default" : "secondary"}>
                        {themeApprovalRate.toFixed(0)}% aprovação
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Total: {themeStats.total}</span>
                        <span>Aprovadas: {themeStats.approved}</span>
                      </div>
                      
                      <Progress 
                        value={themeApprovalRate} 
                        className="h-2" 
                      />
                      
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-medium text-green-700">{themeStats.easy}</div>
                          <div className="text-green-600">Fácil</div>
                        </div>
                        <div className="text-center p-2 bg-yellow-50 rounded">
                          <div className="font-medium text-yellow-700">{themeStats.medium}</div>
                          <div className="text-yellow-600">Médio</div>
                        </div>
                        <div className="text-center p-2 bg-red-50 rounded">
                          <div className="font-medium text-red-700">{themeStats.hard}</div>
                          <div className="text-red-600">Difícil</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="difficulty" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['easy', 'medium', 'hard'].map(difficulty => {
              const difficultyCount = Object.values(stats.themes)
                .reduce((sum, theme) => sum + theme[difficulty as keyof typeof theme], 0);
              
              return (
                <Card key={difficulty}>
                  <CardHeader>
                    <CardTitle className="text-lg capitalize">{difficulty}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{difficultyCount}</div>
                    <p className="text-sm text-muted-foreground">perguntas</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}