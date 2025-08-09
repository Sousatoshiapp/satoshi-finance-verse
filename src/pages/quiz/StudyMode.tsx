import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { Progress } from '@/components/shared/ui/progress';
import { Brain, BookOpen, Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudyMode() {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'basic' | 'intermediate' | 'advanced'>('basic');

  const topics = [
    { id: 'matematica', name: 'Matemática', description: 'Álgebra, geometria e cálculo', progress: 65 },
    { id: 'portugues', name: 'Português', description: 'Gramática e interpretação', progress: 80 },
    { id: 'ciencias', name: 'Ciências', description: 'Física, química e biologia', progress: 45 },
    { id: 'historia', name: 'História', description: 'História geral e do Brasil', progress: 55 },
    { id: 'geografia', name: 'Geografia', description: 'Geografia física e humana', progress: 70 }
  ];

  const difficulties = [
    { id: 'basic', name: 'Básico', description: 'Conceitos fundamentais', color: 'bg-green-100 text-green-800' },
    { id: 'intermediate', name: 'Intermediário', description: 'Conhecimento aplicado', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'advanced', name: 'Avançado', description: 'Domínio complexo', color: 'bg-red-100 text-red-800' }
  ];

  const startStudySession = () => {
    if (!selectedTopic) {
      // Modo adaptativo - sem tópico específico
      navigate('/quiz/solo?mode=adaptive&count=15');
    } else {
      navigate(`/quiz/solo?topic=${selectedTopic}&difficulty=${selectedDifficulty}&mode=study&count=15`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Modo Estudo</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sistema inteligente de repetição espaçada que adapta as questões ao seu progresso
          </p>
        </div>

        {/* Study Options */}
        <div className="grid gap-6 mb-8">
          {/* Quick Start - Adaptive Mode */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Sessão Adaptativa</CardTitle>
                  <p className="text-muted-foreground">O sistema escolhe as melhores questões para você</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">
                    <Brain className="w-3 h-3 mr-1" />
                    IA Adaptativa
                  </Badge>
                  <span className="text-sm text-muted-foreground">15 questões personalizadas</span>
                </div>
                <Button onClick={() => setSelectedTopic('')} className="min-w-32">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Iniciar Agora
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Topic Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-primary" />
                <CardTitle>Escolher Tópico Específico</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedTopic === topic.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{topic.name}</h3>
                      <Badge variant="outline">{topic.progress}%</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{topic.description}</p>
                    <Progress value={topic.progress} className="h-2" />
                  </button>
                ))}
              </div>

              {/* Difficulty Selection - só aparece se um tópico for selecionado */}
              {selectedTopic && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-3">Selecione a Dificuldade:</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {difficulties.map((diff) => (
                      <button
                        key={diff.id}
                        onClick={() => setSelectedDifficulty(diff.id as any)}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          selectedDifficulty === diff.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-primary/50'
                        }`}
                      >
                        <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${diff.color}`}>
                          {diff.name}
                        </div>
                        <p className="text-sm text-muted-foreground">{diff.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <Button 
            onClick={startStudySession}
            size="lg"
            className="min-w-48"
          >
            {selectedTopic ? 'Iniciar Estudo Direcionado' : 'Iniciar Sessão Adaptativa'}
          </Button>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Brain className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Sistema SRS</h3>
              <p className="text-sm text-muted-foreground">
                Repetição espaçada baseada em seu desempenho individual
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Foco Personalizado</h3>
              <p className="text-sm text-muted-foreground">
                Questões adaptadas às suas necessidades de aprendizado
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Progresso Contínuo</h3>
              <p className="text-sm text-muted-foreground">
                Acompanhamento detalhado do seu desenvolvimento
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}