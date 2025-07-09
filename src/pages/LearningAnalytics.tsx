import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsDashboard } from "@/components/learning/analytics-dashboard";
import { GamificationPanel } from "@/components/learning/gamification-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Trophy, Brain, Target } from "lucide-react";

export default function LearningAnalytics() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics de Aprendizado</h1>
        <p className="text-muted-foreground">
          Acompanhe seu progresso, conquistas e receba recomendações personalizadas
        </p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="gamification" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Gamificação
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            IA Personalizada
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="gamification">
          <GamificationPanel />
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Sistema de Personalização por IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Análise de Desempenho
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Nossa IA analisa seu padrão de estudo, velocidade de aprendizado, 
                      conceitos dominados e áreas de dificuldade para criar um perfil 
                      personalizado de aprendizagem.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Velocidade de Aprendizado:</span>
                        <span className="font-medium">Adaptativa</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Preferência de Dificuldade:</span>
                        <span className="font-medium">Progressiva</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Melhor Horário:</span>
                        <span className="font-medium">Noite</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recomendações Ativas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Baseado na sua performance recente, a IA sugere ajustes 
                      no seu plano de estudos para otimizar o aprendizado.
                    </p>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="font-medium text-sm">Foco em Conceitos</div>
                        <div className="text-xs text-muted-foreground">
                          Revisar: Análise Fundamentalista, Renda Fixa
                        </div>
                      </div>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="font-medium text-sm">Aumento de Dificuldade</div>
                        <div className="text-xs text-muted-foreground">
                          Performance de 92% - pronto para questões avançadas
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Como Funciona a Personalização</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-medium">Coleta de Dados</h4>
                    <p className="text-sm text-muted-foreground">
                      Analisamos tempo de resposta, padrões de erro e progresso
                    </p>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                      <Brain className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-medium">Processamento IA</h4>
                    <p className="text-sm text-muted-foreground">
                      Algoritmos identificam padrões e oportunidades de melhoria
                    </p>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-medium">Recomendações</h4>
                    <p className="text-sm text-muted-foreground">
                      Sugestões personalizadas para otimizar o aprendizado
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}