import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LearningModulesGrid } from "@/components/learning/learning-modules-grid";
import { SRSQuizCard } from "@/components/srs-quiz-card";
import { useLearningModules } from "@/hooks/use-learning-modules";
import { BookOpen, Brain, Trophy, TrendingUp, Target, Clock, Star } from "lucide-react";

export default function LearningCenter() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizDifficulty, setQuizDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  
  const { 
    modules,
    userProgress,
    conceptMastery,
    getOverallMastery,
    getRecommendedModule,
    loading
  } = useLearningModules();

  const stats = {
    modulesStarted: userProgress.length,
    modulesCompleted: userProgress.filter(p => p.is_completed).length,
    overallMastery: getOverallMastery(),
    totalTimeSpent: userProgress.reduce((sum, p) => sum + p.time_spent_minutes, 0),
    strongConcepts: conceptMastery.filter(c => c.mastery_level > 0.8).length,
    weakConcepts: conceptMastery.filter(c => c.mastery_level < 0.5).length
  };

  const recommendedModule = getRecommendedModule();

  const handleQuizComplete = (score: number, total: number, conceptsImproved: number) => {
    setShowQuiz(false);
    // Could show a completion modal here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Carregando centro de aprendizado...</div>
        </div>
      </div>
    );
  }

  if (showQuiz) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setShowQuiz(false)}
              className="mb-4"
            >
              ← Voltar ao Centro de Aprendizado
            </Button>
          </div>
          
          <SRSQuizCard
            difficulty={quizDifficulty}
            moduleId={selectedModule || undefined}
            onComplete={handleQuizComplete}
            onExit={() => setShowQuiz(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Centro de Aprendizado</h1>
          <p className="text-muted-foreground text-lg">
            Desenvolva suas habilidades financeiras com nossa plataforma educacional avançada
          </p>
        </div>

        {/* Personal Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <BookOpen className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Módulos Iniciados</p>
                  <p className="text-2xl font-bold">{stats.modulesStarted}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.modulesCompleted} completados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Brain className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Mastery Geral</p>
                  <p className="text-2xl font-bold">{Math.round(stats.overallMastery * 100)}%</p>
                  <p className="text-xs text-muted-foreground">
                    dos conceitos dominados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Clock className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Tempo de Estudo</p>
                  <p className="text-2xl font-bold">{Math.floor(stats.totalTimeSpent / 60)}h</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalTimeSpent % 60}min adicionais
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Target className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Conceitos</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-green-600">{stats.strongConcepts}</span>
                    <span className="text-xs text-muted-foreground">/</span>
                    <span className="text-sm font-bold text-red-600">{stats.weakConcepts}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    fortes / fracos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => setShowQuiz(true)}
                className="h-auto p-4 flex-col items-start"
              >
                <div className="w-full text-left">
                  <div className="font-medium">Quiz Personalizado</div>
                  <div className="text-xs opacity-80">Baseado nos seus pontos fracos</div>
                </div>
              </Button>
              
              {recommendedModule && (
                <Button 
                  variant="outline"
                  onClick={() => setSelectedModule(recommendedModule.id)}
                  className="h-auto p-4 flex-col items-start"
                >
                  <div className="w-full text-left">
                    <div className="font-medium">Módulo Recomendado</div>
                    <div className="text-xs opacity-80">{recommendedModule.name}</div>
                  </div>
                </Button>
              )}

              {stats.weakConcepts > 0 && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setQuizDifficulty('easy');
                    setShowQuiz(true);
                  }}
                  className="h-auto p-4 flex-col items-start"
                >
                  <div className="w-full text-left">
                    <div className="font-medium">Reforçar Conceitos</div>
                    <div className="text-xs opacity-80">{stats.weakConcepts} conceitos para revisar</div>
                  </div>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="modules" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="modules">Todos os Módulos</TabsTrigger>
            <TabsTrigger value="sponsored">Patrocinados</TabsTrigger>
            <TabsTrigger value="progress">Meu Progresso</TabsTrigger>
            <TabsTrigger value="concepts">Conceitos</TabsTrigger>
          </TabsList>

          <TabsContent value="modules">
            <LearningModulesGrid onModuleSelect={(id) => setSelectedModule(id)} />
          </TabsContent>

          <TabsContent value="sponsored">
            <LearningModulesGrid 
              onModuleSelect={(id) => setSelectedModule(id)} 
              showSponsoredOnly={true}
            />
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Seu Progresso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userProgress.map((progress) => {
                    const module = modules.find(m => m.id === progress.module_id);
                    if (!module) return null;

                    return (
                      <div key={progress.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{module.icon}</span>
                            <div>
                              <h3 className="font-semibold">{module.name}</h3>
                              {module.sponsor_company && (
                                <Badge variant="outline" className="text-xs">
                                  {module.sponsor_company}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {progress.is_completed && (
                            <Trophy className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progresso</span>
                            <span>{Math.round(progress.mastery_score * 100)}%</span>
                          </div>
                          <Progress value={progress.mastery_score * 100} />
                          
                          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                            <div>Tempo gasto: {progress.time_spent_minutes}min</div>
                            <div>Última visita: {new Date(progress.last_accessed).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {userProgress.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Você ainda não iniciou nenhum módulo.
                      </p>
                      <Button 
                        className="mt-4"
                        onClick={() => {
                          // Switch to modules tab
                          const modulesTab = document.querySelector('[value="modules"]') as HTMLElement;
                          modulesTab?.click();
                        }}
                      >
                        Começar Primeiro Módulo
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="concepts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Mastery de Conceitos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {conceptMastery.map((concept) => (
                    <div key={concept.id} className="p-4 border rounded-lg">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{concept.concept_name}</h4>
                          <Badge variant={
                            concept.mastery_level > 0.8 ? "default" :
                            concept.mastery_level > 0.5 ? "secondary" : "destructive"
                          }>
                            {Math.round(concept.mastery_level * 100)}%
                          </Badge>
                        </div>
                        
                        <Progress value={concept.mastery_level * 100} />
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Exposições: {concept.total_exposures}</div>
                          <div>Taxa de acerto: {concept.total_exposures > 0 
                            ? Math.round((concept.correct_responses / concept.total_exposures) * 100)
                            : 0}%</div>
                          <div>Última revisão: {new Date(concept.last_reviewed).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {conceptMastery.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Comece a fazer quizzes para ver seu progresso em conceitos específicos.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}