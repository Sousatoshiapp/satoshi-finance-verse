import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionGeneratorPanel } from "@/components/admin/QuestionGeneratorPanel";
import { Database, Brain, Settings } from "lucide-react";

export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground">
            Gerenciamento do sistema de perguntas e configurações
          </p>
        </div>

        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Banco de Perguntas
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Geração IA
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions">
            <Card>
              <CardHeader>
                <CardTitle>Status do Banco de Perguntas</CardTitle>
                <CardDescription>
                  Análise atual e métricas do banco de dados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">179</div>
                    <div className="text-sm text-muted-foreground">Perguntas Atuais</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">500+</div>
                    <div className="text-sm text-muted-foreground">Meta</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">85</div>
                    <div className="text-sm text-muted-foreground">Categorias</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai">
            <QuestionGeneratorPanel />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>
                  Ajustes e parâmetros do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">SRS Algorithm</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>• Exclusão de perguntas recentes: 10 (antes 20)</div>
                        <div>• Janela de perguntas antigas: 3 dias (antes 7)</div>
                        <div>• Prioridade para perguntas nunca respondidas</div>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Geração de Perguntas</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>• Modelo: GPT-4o</div>
                        <div>• Lotes de 10 perguntas por vez</div>
                        <div>• Validação automática de qualidade</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}