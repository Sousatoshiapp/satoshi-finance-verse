import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Progress } from "@/components/shared/ui/progress";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain,
  Zap,
  Eye,
  Calendar,
  Award,
  Activity,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface PerformanceMetric {
  name: string;
  value: number;
  change: number;
  period: string;
  trend: 'up' | 'down' | 'stable';
  category: 'trading' | 'learning' | 'social' | 'overall';
}

interface SkillAssessment {
  skill: string;
  current_level: number;
  max_level: number;
  progress_percentage: number;
  recent_improvement: number;
  weak_areas: string[];
  recommendations: string[];
}

interface TradingStats {
  total_trades: number;
  win_rate: number;
  avg_profit: number;
  best_streak: number;
  risk_score: number;
  sharpe_ratio: number;
  max_drawdown: number;
  profit_factor: number;
}

export function AdvancedAnalyticsDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [skills, setSkills] = useState<SkillAssessment[]>([]);
  const [tradingStats, setTradingStats] = useState<TradingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeframe]);

  const loadAnalyticsData = async () => {
    try {
      // Mock performance metrics
      const mockMetrics: PerformanceMetric[] = [
        {
          name: 'Precisão de Trades',
          value: 78.5,
          change: 5.2,
          period: timeframe,
          trend: 'up',
          category: 'trading'
        },
        {
          name: 'XP Earned Rate',
          value: 245,
          change: -3.1,
          period: timeframe,
          trend: 'down',
          category: 'learning'
        },
        {
          name: 'Engagement Social',
          value: 92,
          change: 12.8,
          period: timeframe,
          trend: 'up',
          category: 'social'
        },
        {
          name: 'Score Geral',
          value: 847,
          change: 23,
          period: timeframe,
          trend: 'up',
          category: 'overall'
        }
      ];

      const mockSkills: SkillAssessment[] = [
        {
          skill: 'Análise Técnica',
          current_level: 7,
          max_level: 10,
          progress_percentage: 70,
          recent_improvement: 8.5,
          weak_areas: ['Fibonacci Retracements', 'Volume Analysis'],
          recommendations: ['Pratique identificação de padrões', 'Estude indicadores de volume']
        },
        {
          skill: 'Gestão de Risco',
          current_level: 6,
          max_level: 10,
          progress_percentage: 60,
          recent_improvement: 12.3,
          weak_areas: ['Position Sizing', 'Portfolio Diversification'],
          recommendations: ['Revise conceitos de Kelly Criterion', 'Pratique cálculo de posições']
        },
        {
          skill: 'Psicologia do Trading',
          current_level: 5,
          max_level: 10,
          progress_percentage: 50,
          recent_improvement: 15.7,
          weak_areas: ['Controle Emocional', 'Disciplina'],
          recommendations: ['Mantenha journal de trades', 'Pratique meditação']
        }
      ];

      const mockTradingStats: TradingStats = {
        total_trades: 127,
        win_rate: 68.5,
        avg_profit: 3.2,
        best_streak: 12,
        risk_score: 7.8,
        sharpe_ratio: 1.34,
        max_drawdown: 8.7,
        profit_factor: 1.89
      };

      setMetrics(mockMetrics);
      setSkills(mockSkills);
      setTradingStats(mockTradingStats);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />;
      default: return <Activity className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'trading': return 'text-blue-500';
      case 'learning': return 'text-green-500';
      case 'social': return 'text-purple-500';
      case 'overall': return 'text-orange-500';
      default: return 'text-muted-foreground';
    }
  };

  const getSkillColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-blue-500';
    if (percentage >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRiskColor = (score: number) => {
    if (score >= 8) return 'text-red-500';
    if (score >= 6) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics Avançado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-muted/30 rounded-lg p-3 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-indigo-500/20 bg-gradient-to-br from-background to-indigo-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            Analytics Avançado
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-lg p-1">
              {(['7d', '30d', '90d'] as const).map((period) => (
                <Button
                  key={period}
                  variant={timeframe === period ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTimeframe(period)}
                  className="text-xs h-6"
                >
                  {period}
                </Button>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/analytics')}
              className="text-indigo-500 border-indigo-500/30 hover:bg-indigo-500/10"
            >
              Ver Completo
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Performance Metrics */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-indigo-500" />
            Métricas de Performance
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {metrics.slice(0, 4).map((metric) => (
              <div 
                key={metric.name}
                className="border rounded-lg p-3 hover:border-indigo-500/30 transition-all cursor-pointer"
                onClick={() => navigate(`/analytics/metric/${metric.name}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("text-xs font-medium", getCategoryColor(metric.category))}>
                    {metric.name}
                  </span>
                  {getTrendIcon(metric.trend)}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">{metric.value}</span>
                  <div className={cn("text-xs flex items-center gap-1",
                    metric.change > 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Skill Assessment */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-indigo-500" />
            Avaliação de Habilidades
          </h3>
          
          <div className="space-y-2">
            {skills.slice(0, 2).map((skill) => (
              <div 
                key={skill.skill}
                className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{skill.skill}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Nível {skill.current_level}/{skill.max_level}
                    </span>
                    <Badge variant="outline" className={cn("text-xs", getSkillColor(skill.progress_percentage))}>
                      +{skill.recent_improvement}%
                    </Badge>
                  </div>
                </div>
                
                <div className="mb-2">
                  <Progress 
                    value={skill.progress_percentage} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span>Progresso</span>
                    <span className={getSkillColor(skill.progress_percentage)}>
                      {skill.progress_percentage}%
                    </span>
                  </div>
                </div>
                
                {skill.weak_areas.length > 0 && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">Áreas de melhoria: </span>
                    <span>{skill.weak_areas.slice(0, 2).join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Trading Statistics Summary */}
        {tradingStats && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <PieChart className="h-4 w-4 text-indigo-500" />
              Estatísticas de Trading
            </h3>
            
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-muted-foreground">Win Rate</div>
                  <div className="font-medium text-green-500">{tradingStats.win_rate}%</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Profit Factor</div>
                  <div className="font-medium">{tradingStats.profit_factor}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Risk Score</div>
                  <div className={cn("font-medium", getRiskColor(tradingStats.risk_score))}>
                    {tradingStats.risk_score}/10
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Sharpe Ratio</div>
                  <div className="font-medium">{tradingStats.sharpe_ratio}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/performance-report')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Relatório
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/skill-training')}
          >
            <Zap className="h-4 w-4 mr-2" />
            Treinar Skills
          </Button>
        </div>
        
        {metrics.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Coletando dados de performance...</p>
            <p className="text-sm">Analytics aparecerão em breve!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
