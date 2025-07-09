import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle, Lock, Play } from "lucide-react";

export default function LearningPath() {
  const modules = [
    { 
      title: "Fundamentos Financeiros", 
      description: "Conceitos básicos de educação financeira",
      progress: 100, 
      status: "completed",
      lessons: 8,
      completedLessons: 8,
      estimatedTime: "2h"
    },
    { 
      title: "Investimentos Básicos", 
      description: "Introdução ao mundo dos investimentos",
      progress: 60, 
      status: "in_progress",
      lessons: 10,
      completedLessons: 6,
      estimatedTime: "3h"
    },
    { 
      title: "Renda Fixa", 
      description: "Tesouro Direto, CDB, LCI e LCA",
      progress: 0, 
      status: "locked",
      lessons: 12,
      completedLessons: 0,
      estimatedTime: "4h"
    },
    { 
      title: "Renda Variável", 
      description: "Ações, FIIs e ETFs",
      progress: 0, 
      status: "locked",
      lessons: 15,
      completedLessons: 0,
      estimatedTime: "5h"
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress': return <Play className="w-5 h-5 text-blue-500" />;
      case 'locked': return <Lock className="w-5 h-5 text-gray-400" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'locked': return 'bg-gray-400';
      default: return 'bg-primary';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Development Banner */}
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <div className="text-2xl">🚧</div>
            <div>
              <h3 className="font-semibold">Em Desenvolvimento</h3>
              <p className="text-sm">Esta funcionalidade está sendo desenvolvida e estará disponível em breve!</p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">📚 Trilha de Aprendizado</h1>
          <p className="text-muted-foreground">
            Siga uma jornada estruturada de educação financeira personalizada para você
          </p>
        </div>

        {/* Overall Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Seu Progresso Geral</CardTitle>
            <CardDescription>40% da trilha completa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>14 de 35 lições concluídas</span>
                <span>~9h restantes</span>
              </div>
              <Progress value={40} className="w-full h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Learning Modules */}
        <div className="space-y-4">
          {modules.map((module, index) => (
            <Card key={index} className={`overflow-hidden border-l-4 ${
              module.status === 'completed' ? 'border-l-green-500' :
              module.status === 'in_progress' ? 'border-l-blue-500' :
              'border-l-gray-300'
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(module.status)} text-white`}>
                      {getStatusIcon(module.status)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={module.status === 'completed' ? 'default' : 'outline'}>
                    {module.status === 'completed' ? 'Completo' :
                     module.status === 'in_progress' ? 'Em andamento' : 'Bloqueado'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{module.completedLessons}/{module.lessons} lições</span>
                      <span>{module.progress}%</span>
                    </div>
                    <Progress value={module.progress} className="w-full" />
                  </div>
                  
                  {/* Module Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>⏱️ {module.estimatedTime}</span>
                      <span>📖 {module.lessons} lições</span>
                    </div>
                    
                    <Button 
                      variant={module.status === 'locked' ? 'secondary' : 'default'}
                      disabled={module.status === 'locked'}
                    >
                      {module.status === 'completed' ? 'Revisar' :
                       module.status === 'in_progress' ? 'Continuar' : 'Bloqueado'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Recommendations */}
        <Card className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500 text-white">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Recomendação da IA</CardTitle>
                <CardDescription>
                  Baseado no seu desempenho, recomendamos focar em "Diversificação de Investimentos"
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}