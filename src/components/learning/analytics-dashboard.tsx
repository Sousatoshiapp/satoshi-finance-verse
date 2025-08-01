import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Progress } from '@/components/shared/ui/progress';
import { Badge } from '@/components/shared/ui/badge';
import { TrendingUp, Clock, Target, Brain } from 'lucide-react';

export function AnalyticsDashboard() {
  const stats = {
    totalStudyTime: 120,
    conceptsMastered: 45,
    averageScore: 85,
    streakDays: 12
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics de Aprendizado</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Estudo</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudyTime}h</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conceitos Dominados</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conceptsMastered}</div>
            <p className="text-xs text-muted-foreground">+12% do mês passado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
            <p className="text-xs text-muted-foreground">+2% do mês passado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sequência</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streakDays} dias</div>
            <p className="text-xs text-muted-foreground">Recorde pessoal!</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progresso por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { category: 'Investimentos', progress: 75 },
            { category: 'Poupança', progress: 90 },
            { category: 'Economia', progress: 60 },
            { category: 'Empreendedorismo', progress: 45 }
          ].map((item) => (
            <div key={item.category} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{item.category}</span>
                <Badge variant="outline">{item.progress}%</Badge>
              </div>
              <Progress value={item.progress} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}