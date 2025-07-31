import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Clock, 
  Target, 
  TrendingUp, 
  Brain, 
  Zap, 
  BarChart3,
  Lightbulb,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useLearningAnalytics } from "@/hooks/use-learning-analytics";

interface AnalyticsDashboardProps {
  className?: string;
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const {
    analytics,
    recommendations,
    loading,
    getWeeklyStudyTime,
    getAverageAccuracy,
    getLearningVelocity,
    getStudyTimeProgress,
    getPendingRecommendations,
    generateRecommendations,
    applyRecommendation
  } = useLearningAnalytics();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const weeklyStudyTime = getWeeklyStudyTime();
  const averageAccuracy = getAverageAccuracy();
  const learningVelocity = getLearningVelocity();
  const studyProgress = getStudyTimeProgress();
  const pendingRecommendations = getPendingRecommendations();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className={className}>
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Semanal</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(weeklyStudyTime / 60)}h</div>
            <p className="text-xs text-muted-foreground">
              {weeklyStudyTime} minutos esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisão Média</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAccuracy.toFixed(1)}%</div>
            <Progress value={averageAccuracy} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Velocidade</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{learningVelocity.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              questões por minuto
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recomendações</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRecommendations.length}</div>
            <p className="text-xs text-muted-foreground">
              sugestões da IA
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Progresso Diário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={studyProgress.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                  formatter={(value, name) => [
                    name === 'minutes' ? `${value} min` : 
                    name === 'questions' ? `${value} questões` : 
                    `${value}%`,
                    name === 'minutes' ? 'Tempo de Estudo' :
                    name === 'questions' ? 'Questões' :
                    'Precisão'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="minutes" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="minutes"
                />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="accuracy"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Distribuição Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studyProgress.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { weekday: 'short' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                  formatter={(value) => [`${value} questões`, 'Questões Respondidas']}
                />
                <Bar dataKey="questions" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recomendações da IA */}
      {pendingRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Recomendações Personalizadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRecommendations.map((rec) => (
              <div key={rec.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Badge variant="outline" className="capitalize">
                      {rec.recommendation_type.replace('_', ' ')}
                    </Badge>
                    <p className="text-sm font-medium">
                      {rec.recommendation_data.suggestion || 'Recomendação personalizada'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Confiança: {(rec.confidence_score * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => applyRecommendation(rec.id)}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Aplicar
                    </Button>
                    <Button size="sm" variant="ghost">
                      <XCircle className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {rec.recommendation_data.weak_concepts && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium">Conceitos para revisar:</p>
                    <div className="flex flex-wrap gap-1">
                      {rec.recommendation_data.weak_concepts.map((concept: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {concept}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {rec.recommendation_data.recommended_difficulty && (
                  <div className="text-xs">
                    <span className="font-medium">Dificuldade sugerida: </span>
                    <Badge variant="outline" className="capitalize">
                      {rec.recommendation_data.recommended_difficulty}
                    </Badge>
                  </div>
                )}
              </div>
            ))}

            <Button 
              variant="outline" 
              onClick={generateRecommendations}
              className="w-full"
            >
              <Brain className="h-4 w-4 mr-2" />
              Gerar Novas Recomendações
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}