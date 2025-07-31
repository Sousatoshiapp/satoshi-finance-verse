import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Calendar, Award, ArrowLeft, Activity, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PerformanceData {
  date: string;
  xp: number;
  quizzes: number;
  duels: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export default function AdvancedAnalytics() {
  const navigate = useNavigate();
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    // Mock data
    const mockPerformance: PerformanceData[] = [
      { date: '01/12', xp: 420, quizzes: 5, duels: 2 },
      { date: '02/12', xp: 380, quizzes: 4, duels: 3 },
      { date: '03/12', xp: 560, quizzes: 7, duels: 1 },
      { date: '04/12', xp: 490, quizzes: 6, duels: 2 },
      { date: '05/12', xp: 670, quizzes: 8, duels: 4 },
      { date: '06/12', xp: 520, quizzes: 5, duels: 3 },
      { date: '07/12', xp: 780, quizzes: 9, duels: 5 }
    ];

    const mockCategories: CategoryData[] = [
      { name: 'Criptomoedas', value: 35, color: '#8884d8' },
      { name: 'DeFi', value: 25, color: '#82ca9d' },
      { name: 'Trading', value: 20, color: '#ffc658' },
      { name: 'Blockchain', value: 15, color: '#ff7300' },
      { name: 'NFTs', value: 5, color: '#00ff88' }
    ];

    setTimeout(() => {
      setPerformanceData(mockPerformance);
      setCategoryData(mockCategories);
      setLoading(false);
    }, 1000);
  };

  const totalXP = performanceData.reduce((sum, data) => sum + data.xp, 0);
  const totalQuizzes = performanceData.reduce((sum, data) => sum + data.quizzes, 0);
  const totalDuels = performanceData.reduce((sum, data) => sum + data.duels, 0);
  const avgXPPerDay = totalXP / performanceData.length || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-muted/30 rounded-lg p-6 h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="h-6 w-6 text-purple-500" />
                Analytics Avançado
              </h1>
              <p className="text-muted-foreground">Análise detalhada do seu desempenho e progresso</p>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">XP Total</p>
                    <p className="text-2xl font-bold">{totalXP.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">XP/Dia Médio</p>
                    <p className="text-2xl font-bold">{Math.round(avgXPPerDay)}</p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Quizzes</p>
                    <p className="text-2xl font-bold">{totalQuizzes}</p>
                  </div>
                  <Award className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Duelos</p>
                    <p className="text-2xl font-bold">{totalDuels}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="categories">Categorias</TabsTrigger>
              <TabsTrigger value="trends">Tendências</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* XP Over Time */}
                <Card>
                  <CardHeader>
                    <CardTitle>Evolução do XP</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Line 
                          type="monotone" 
                          dataKey="xp" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          dot={{ fill: '#8884d8' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Activities Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Atividades por Dia</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Bar dataKey="quizzes" fill="#82ca9d" name="Quizzes" />
                        <Bar dataKey="duels" fill="#ffc658" name="Duelos" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Category Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detalhes das Categorias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categoryData.map((category, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">{category.value}%</div>
                            <div className="text-sm text-muted-foreground">
                              {Math.round((category.value / 100) * totalQuizzes)} quizzes
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Growth Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tendência de Crescimento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div>
                          <div className="font-medium text-green-600">Tendência Positiva</div>
                          <div className="text-sm text-muted-foreground">Crescimento consistente nos últimos 7 dias</div>
                        </div>
                        <div className="text-2xl text-green-500">📈</div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Média semanal de XP</span>
                          <span className="font-medium">{Math.round(avgXPPerDay)}/dia</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Melhor dia</span>
                          <span className="font-medium">780 XP</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Streak atual</span>
                          <span className="font-medium">7 dias</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recomendações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="font-medium text-blue-600 mb-2">💡 Foque em DeFi</div>
                        <div className="text-sm text-muted-foreground">
                          Você tem bom desempenho em DeFi. Continue estudando esta categoria para maximizar seus ganhos.
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <div className="font-medium text-yellow-600 mb-2">⚠️ Pratique Trading</div>
                        <div className="text-sm text-muted-foreground">
                          Sua performance em Trading pode melhorar. Tente mais quizzes desta categoria.
                        </div>
                      </div>

                      <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <div className="font-medium text-purple-600 mb-2">🎯 Meta Semanal</div>
                        <div className="text-sm text-muted-foreground">
                          Você está 23% acima da meta desta semana. Continue assim!
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <FloatingNavbar />
    </div>
  );
}
