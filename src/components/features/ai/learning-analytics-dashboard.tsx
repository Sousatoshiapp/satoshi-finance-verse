import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { Progress } from '@/components/shared/ui/progress';
import { Button } from '@/components/shared/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Target, 
  Clock, 
  BookOpen,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { useLearningAnalytics } from '@/hooks/use-learning-analytics';
import { motion } from 'framer-motion';

export const LearningAnalyticsDashboard: React.FC = () => {
  const { analytics, loading, generateAnalytics } = useLearningAnalytics();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-secondary rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-secondary rounded w-full"></div>
                <div className="h-3 bg-secondary rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            Análise de Aprendizado
          </h3>
          <p className="text-muted-foreground mb-4">
            Gere insights personalizados sobre seu progresso
          </p>
          <Button onClick={generateAnalytics}>
            <Brain className="w-4 h-4 mr-2" />
            Gerar Análise
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analytics.insights.map((insight, index) => (
          <motion.div
            key={insight.metric}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{insight.metric}</span>
                  {insight.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : insight.trend === 'down' ? (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-gray-400" />
                  )}
                </div>
                <div className="text-2xl font-bold mb-1">
                  {typeof insight.value === 'number' 
                    ? insight.value.toFixed(1) 
                    : insight.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {insight.insight}
                </p>
                {insight.actionable && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    Ação recomendada
                  </Badge>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Learning Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Padrões de Aprendizado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.patterns.map((pattern, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{pattern.pattern}</h4>
                  <Badge variant={pattern.confidence > 0.8 ? 'default' : 'secondary'}>
                    {Math.round(pattern.confidence * 100)}% confiança
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {pattern.description}
                </p>
                <div className="space-y-1">
                  <span className="text-sm font-medium">Recomendações:</span>
                  <ul className="text-sm text-muted-foreground">
                    {pattern.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start">
                        <Lightbulb className="w-3 h-3 mr-2 mt-0.5 text-yellow-500" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Previsões Personalizadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                <span className="text-sm font-medium">Próximo Tópico</span>
              </div>
              <p className="text-lg font-semibold">
                {analytics.predictions.nextBestTopic}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                <span className="text-sm font-medium">Domínio Estimado</span>
              </div>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={analytics.predictions.estimatedMastery} 
                  className="flex-1" 
                />
                <span className="text-sm font-semibold">
                  {analytics.predictions.estimatedMastery}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-orange-600" />
                <span className="text-sm font-medium">Tempo Sugerido</span>
              </div>
              <p className="text-lg font-semibold">
                {analytics.predictions.suggestedStudyTime} min/dia
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weaknesses & Strengths */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weaknesses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              Áreas para Melhoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.weaknessAnalysis.map((weakness, index) => (
                <div key={index} className="border-l-4 border-red-500 pl-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold">{weakness.concept}</h4>
                    <Badge 
                      variant="destructive" 
                      className="text-xs"
                    >
                      Severidade: {weakness.severity}/10
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Plano de melhoria:</span>
                    <ul className="mt-1 ml-4">
                      {weakness.improvement_path.map((step, i) => (
                        <li key={i} className="list-disc">{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <TrendingUp className="w-5 h-5 mr-2" />
              Pontos Fortes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.strengthsAnalysis.map((strength, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold">{strength.concept}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="default" 
                        className="text-xs bg-green-100 text-green-800"
                      >
                        {strength.mastery_level}% domínio
                      </Badge>
                      {strength.can_mentor && (
                        <Badge variant="secondary" className="text-xs">
                          Pode mentorar
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Você demonstra excelente compreensão neste conceito!
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regenerate Analytics */}
      <div className="flex justify-center">
        <Button onClick={generateAnalytics} variant="outline">
          <Brain className="w-4 h-4 mr-2" />
          Atualizar Análise
        </Button>
      </div>
    </div>
  );
};
