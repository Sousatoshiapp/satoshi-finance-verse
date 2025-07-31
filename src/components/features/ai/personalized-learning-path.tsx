import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Progress } from '@/components/shared/ui/progress';
import { Badge } from '@/components/shared/ui/badge';
import { 
  MapPin, 
  CheckCircle, 
  Clock, 
  Star, 
  ArrowRight,
  BookOpen,
  Target,
  TrendingUp,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLearningAnalytics } from '@/hooks/use-learning-analytics';

interface LearningStep {
  id: string;
  title: string;
  description: string;
  type: 'lesson' | 'quiz' | 'practice' | 'project';
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  estimatedTime: number;
  difficulty: number;
  concepts: string[];
  prerequisites: string[];
  rewards: {
    xp: number;
    beetz: number;
    badges?: string[];
  };
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  totalSteps: number;
  completedSteps: number;
  estimatedTotalTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: LearningStep[];
  adaptiveRecommendations: string[];
}

export const PersonalizedLearningPath: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const { analytics, getOptimalStudyPlan } = useLearningAnalytics();

  useEffect(() => {
    // Generate personalized learning path based on analytics
    const generatePath = async () => {
      setLoading(true);
      
      // Simulate path generation
      const mockPath: LearningPath = {
        id: 'personalized-finance-path',
        title: 'Seu Caminho Personalizado em Finanças',
        description: 'Baseado na sua análise de aprendizado, este caminho foi otimizado para maximizar seu progresso.',
        totalSteps: 8,
        completedSteps: 2,
        estimatedTotalTime: 240, // minutes
        difficulty: 'intermediate',
        adaptiveRecommendations: [
          'Foque em análise técnica nos próximos 3 estudos',
          'Revise conceitos de renda fixa antes de avançar',
          'Pratique simulações de investimento'
        ],
        steps: [
          {
            id: '1',
            title: 'Fundamentos de Análise Técnica',
            description: 'Aprenda a interpretar gráficos e indicadores básicos',
            type: 'lesson',
            status: 'completed',
            estimatedTime: 30,
            difficulty: 3,
            concepts: ['candlesticks', 'suporte_resistencia', 'volume'],
            prerequisites: [],
            rewards: { xp: 150, beetz: 300 }
          },
          {
            id: '2',
            title: 'Quiz: Padrões Gráficos',
            description: 'Teste seu conhecimento sobre padrões de candlesticks',
            type: 'quiz',
            status: 'completed',
            estimatedTime: 15,
            difficulty: 3,
            concepts: ['padroes_graficos', 'candlesticks'],
            prerequisites: ['1'],
            rewards: { xp: 100, beetz: 200 }
          },
          {
            id: '3',
            title: 'Indicadores Técnicos Avançados',
            description: 'RSI, MACD, Bollinger Bands e outros indicadores',
            type: 'lesson',
            status: 'in_progress',
            estimatedTime: 45,
            difficulty: 4,
            concepts: ['rsi', 'macd', 'bollinger'],
            prerequisites: ['1', '2'],
            rewards: { xp: 200, beetz: 400 }
          },
          {
            id: '4',
            title: 'Simulação: Trading de Ações',
            description: 'Pratique estratégias de trading em ambiente simulado',
            type: 'practice',
            status: 'available',
            estimatedTime: 60,
            difficulty: 4,
            concepts: ['estrategias_trading', 'gestao_risco'],
            prerequisites: ['3'],
            rewards: { xp: 300, beetz: 600, badges: ['Trader Iniciante'] }
          },
          {
            id: '5',
            title: 'Análise Fundamentalista',
            description: 'Avalie empresas através de seus fundamentos',
            type: 'lesson',
            status: 'locked',
            estimatedTime: 40,
            difficulty: 5,
            concepts: ['balanco_patrimonial', 'dre', 'indicadores_fundamentalistas'],
            prerequisites: ['4'],
            rewards: { xp: 250, beetz: 500 }
          }
        ]
      };

      setCurrentPath(mockPath);
      setLoading(false);
    };

    generatePath();
  }, [analytics]);

  const getStepIcon = (type: LearningStep['type']) => {
    switch (type) {
      case 'lesson': return <BookOpen className="w-4 h-4" />;
      case 'quiz': return <Target className="w-4 h-4" />;
      case 'practice': return <Zap className="w-4 h-4" />;
      case 'project': return <Star className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: LearningStep['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'available': return 'text-orange-600';
      case 'locked': return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: LearningStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'available': return <ArrowRight className="w-5 h-5 text-orange-600" />;
      case 'locked': return <MapPin className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-secondary rounded w-1/2"></div>
            <div className="h-4 bg-secondary rounded w-3/4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-secondary rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentPath) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            Caminho de Aprendizado Personalizado
          </h3>
          <p className="text-muted-foreground">
            Não foi possível gerar seu caminho personalizado no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Path Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                {currentPath.title}
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {currentPath.description}
              </p>
            </div>
            <Badge variant={currentPath.difficulty === 'advanced' ? 'destructive' : 'secondary'}>
              {currentPath.difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {currentPath.completedSteps}/{currentPath.totalSteps}
              </div>
              <div className="text-sm text-muted-foreground">Etapas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((currentPath.completedSteps / currentPath.totalSteps) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Completo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {currentPath.estimatedTotalTime}
              </div>
              <div className="text-sm text-muted-foreground">Minutos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {currentPath.difficulty}
              </div>
              <div className="text-sm text-muted-foreground">Nível</div>
            </div>
          </div>

          <Progress 
            value={(currentPath.completedSteps / currentPath.totalSteps) * 100} 
            className="h-3"
          />
        </CardContent>
      </Card>

      {/* Adaptive Recommendations */}
      {currentPath.adaptiveRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              Recomendações Adaptativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentPath.adaptiveRecommendations.map((rec, index) => (
                <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 flex-shrink-0"></div>
                  <span className="text-sm text-blue-800">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Steps */}
      <div className="space-y-4">
        {currentPath.steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`${step.status === 'locked' ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary">
                      {getStepIcon(step.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-semibold ${getStatusColor(step.status)}`}>
                          {step.title}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                        >
                          {step.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {step.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {step.estimatedTime} min
                        </span>
                        <span className="flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          Dificuldade {step.difficulty}/5
                        </span>
                        <span>
                          {step.concepts.length} conceitos
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        +{step.rewards.xp} XP
                      </div>
                      <div className="text-xs text-muted-foreground">
                        +{step.rewards.beetz} Beetz
                      </div>
                    </div>
                    {getStatusIcon(step.status)}
                  </div>
                </div>

                {step.status === 'available' && (
                  <div className="mt-4 pt-4 border-t">
                    <Button className="w-full" size="sm">
                      Iniciar Etapa
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}

                {step.status === 'in_progress' && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progresso</span>
                      <span className="text-sm text-muted-foreground">65%</span>
                    </div>
                    <Progress value={65} className="h-2 mb-3" />
                    <Button className="w-full" size="sm">
                      Continuar
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
