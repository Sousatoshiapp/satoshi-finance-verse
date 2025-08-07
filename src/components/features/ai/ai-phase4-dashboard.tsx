import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { 
  Bot, 
  Brain, 
  Wand2, 
  TrendingUp, 
  MapPin,
  PlayCircle
} from 'lucide-react';
import { AITutorChat } from './ai-tutor-chat';
import { LearningAnalyticsDashboard } from './learning-analytics-dashboard';
import { AIContentGenerator } from './ai-content-generator';
import { PersonalizedLearningPath } from './personalized-learning-path';
import { DynamicSimulator } from './dynamic-simulator';

export const AIPhase4Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tutor');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center">
          <Brain className="w-8 h-8 mr-3 text-purple-600" />
          Central de IA e Conteúdo
        </h1>
        <p className="text-muted-foreground">
          Experiência de aprendizado personalizada com Inteligência Artificial
        </p>
        <div className="flex justify-center space-x-2">
          <Badge variant="secondary">Fase 4</Badge>
          <Badge variant="outline">Content & AI</Badge>
          <Badge variant="default">Personalizado</Badge>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tutor" className="flex items-center space-x-2">
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">Tutor IA</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="generator" className="flex items-center space-x-2">
            <Wand2 className="w-4 h-4" />
            <span className="hidden sm:inline">Gerador</span>
          </TabsTrigger>
          <TabsTrigger value="path" className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Caminho</span>
          </TabsTrigger>
          <TabsTrigger value="simulator" className="flex items-center space-x-2">
            <PlayCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Simulador</span>
          </TabsTrigger>
        </TabsList>

        {/* AI Tutor Chat */}
        <TabsContent value="tutor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="w-5 h-5 mr-2 text-blue-600" />
                Tutor IA Personalizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Converse com seu tutor de IA especializado em finanças. 
                Ele adapta as respostas baseado no seu nível e histórico de aprendizado.
              </p>
              <AITutorChat />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Analytics de Aprendizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Análise inteligente do seu progresso com insights personalizados 
                e recomendações baseadas em IA.
              </p>
              <LearningAnalyticsDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Generator */}
        <TabsContent value="generator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wand2 className="w-5 h-5 mr-2 text-purple-600" />
                Gerador de Conteúdo IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Crie conteúdo educacional personalizado usando IA: simulações, 
                quizzes adaptativos, lições interativas e cenários práticos.
              </p>
              <AIContentGenerator />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Path */}
        <TabsContent value="path" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-orange-600" />
                Caminho Personalizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Siga um caminho de aprendizado personalizado, adaptado ao seu 
                nível, ritmo e objetivos específicos.
              </p>
              <PersonalizedLearningPath />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dynamic Simulator */}
        <TabsContent value="simulator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PlayCircle className="w-5 h-5 mr-2 text-red-600" />
                Simulador Dinâmico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Pratique com simulações realistas que se adaptam ao seu 
                comportamento e oferecem cenários únicos.
              </p>
              <DynamicSimulator
                scenario="Portfolio de Investimentos"
                complexity="intermediate"
                onComplete={(results) => {
                  console.log('Simulation completed:', results);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
