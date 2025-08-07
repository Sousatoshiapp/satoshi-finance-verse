import { useState } from "react";
import { AdminAuthProtection } from "@/components/admin-auth-protection";
import { AdminSidebar } from "@/components/features/admin/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { Badge } from "@/components/shared/ui/badge";
import { QuestionImportTool } from "@/components/features/admin/question-import-tool";
import { useLearningModules } from "@/hooks/use-learning-modules";
import { BookOpen, Brain, Upload, BarChart3, Users, TrendingUp } from "lucide-react";

export default function AdminEducationalSystem() {
  const { modules, userProgress, conceptMastery, loading } = useLearningModules();

  const stats = {
    totalModules: modules.length,
    activeModules: modules.filter(m => m.is_active).length,
    sponsoredModules: modules.filter(m => m.sponsor_company).length,
    totalProgress: userProgress.length,
    completedModules: userProgress.filter(p => p.is_completed).length,
    conceptsMastered: conceptMastery.filter(c => c.mastery_level > 0.8).length,
    totalConcepts: conceptMastery.length
  };

  if (loading) {
    return (
      <AdminAuthProtection>
        <div className="flex min-h-screen w-full bg-background">
          <AdminSidebar />
          <div className="flex-1 p-8">
            <div className="text-center">Carregando sistema educacional...</div>
          </div>
        </div>
      </AdminAuthProtection>
    );
  }

  return (
    <AdminAuthProtection>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-foreground">Sistema Educacional</h1>
                <p className="text-muted-foreground">
                  Gerencie módulos de aprendizado, importação de questões e analytics educacionais
                </p>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <BookOpen className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Módulos Ativos</p>
                        <p className="text-2xl font-bold">{stats.activeModules}</p>
                        <p className="text-xs text-muted-foreground">
                          {stats.sponsoredModules} patrocinados
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Users className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                        <p className="text-2xl font-bold">{stats.totalProgress}</p>
                        <p className="text-xs text-muted-foreground">
                          {stats.completedModules} módulos completados
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
                        <p className="text-sm text-muted-foreground">Conceitos</p>
                        <p className="text-2xl font-bold">{stats.totalConcepts}</p>
                        <p className="text-xs text-muted-foreground">
                          {stats.conceptsMastered} dominados
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <TrendingUp className="h-8 w-8 text-orange-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                        <p className="text-2xl font-bold">
                          {stats.totalProgress > 0 
                            ? Math.round((stats.completedModules / stats.totalProgress) * 100)
                            : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">dos módulos iniciados</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <Tabs defaultValue="modules" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="modules">Módulos</TabsTrigger>
                  <TabsTrigger value="import">Importar Questões</TabsTrigger>
                  <TabsTrigger value="concepts">Conceitos</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                {/* Modules Tab */}
                <TabsContent value="modules" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Módulos de Aprendizado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {modules.map((module) => (
                          <div key={module.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xl">{module.icon}</span>
                                  <h3 className="font-semibold">{module.name}</h3>
                                  {module.sponsor_company && (
                                    <Badge variant="secondary">{module.sponsor_company}</Badge>
                                  )}
                                  <Badge 
                                    variant={module.is_active ? "default" : "secondary"}
                                  >
                                    {module.is_active ? "Ativo" : "Inativo"}
                                  </Badge>
                                </div>
                                
                                <p className="text-sm text-muted-foreground mb-2">
                                  {module.description}
                                </p>
                                
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>Ordem: {module.module_order}</span>
                                  <span>Duração: {module.estimated_duration_minutes}min</span>
                                  <span>Nível: {module.difficulty_level}/10</span>
                                </div>

                                {module.learning_objectives.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium mb-1">Objetivos:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {module.learning_objectives.slice(0, 3).map((obj, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {obj}
                                        </Badge>
                                      ))}
                                      {module.learning_objectives.length > 3 && (
                                        <Badge variant="outline" className="text-xs">
                                          +{module.learning_objectives.length - 3} mais
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Import Tab */}
                <TabsContent value="import" className="space-y-4">
                  <QuestionImportTool />
                </TabsContent>

                {/* Concepts Tab */}
                <TabsContent value="concepts" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Conceitos Educacionais</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {conceptMastery.map((concept) => (
                          <div key={concept.id} className="p-4 border rounded-lg">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm">{concept.concept_name}</h4>
                                <Badge variant={
                                  concept.mastery_level > 0.8 ? "default" :
                                  concept.mastery_level > 0.5 ? "secondary" : "outline"
                                }>
                                  {Math.round(concept.mastery_level * 100)}%
                                </Badge>
                              </div>
                              
                              <div className="text-xs text-muted-foreground space-y-1">
                                <div>Exposições: {concept.total_exposures}</div>
                                <div>Acertos: {concept.correct_responses}</div>
                                <div>
                                  Taxa: {concept.total_exposures > 0 
                                    ? Math.round((concept.correct_responses / concept.total_exposures) * 100)
                                    : 0}%
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Progresso por Módulo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {modules.map((module) => {
                            const moduleProgressCount = userProgress.filter(p => p.module_id === module.id).length;
                            const completedCount = userProgress.filter(p => p.module_id === module.id && p.is_completed).length;
                            const completionRate = moduleProgressCount > 0 ? (completedCount / moduleProgressCount) * 100 : 0;
                            
                            return (
                              <div key={module.id} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span>{module.name}</span>
                                  <span>{Math.round(completionRate)}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${completionRate}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>{moduleProgressCount} usuários</span>
                                  <span>{completedCount} completaram</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Mastery de Conceitos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { range: "90-100%", color: "bg-green-500", count: conceptMastery.filter(c => c.mastery_level >= 0.9).length },
                            { range: "80-89%", color: "bg-blue-500", count: conceptMastery.filter(c => c.mastery_level >= 0.8 && c.mastery_level < 0.9).length },
                            { range: "70-79%", color: "bg-yellow-500", count: conceptMastery.filter(c => c.mastery_level >= 0.7 && c.mastery_level < 0.8).length },
                            { range: "60-69%", color: "bg-orange-500", count: conceptMastery.filter(c => c.mastery_level >= 0.6 && c.mastery_level < 0.7).length },
                            { range: "< 60%", color: "bg-red-500", count: conceptMastery.filter(c => c.mastery_level < 0.6).length }
                          ].map((item) => (
                            <div key={item.range} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                <span className="text-sm">{item.range}</span>
                              </div>
                              <span className="font-medium">{item.count}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </AdminAuthProtection>
  );
}
