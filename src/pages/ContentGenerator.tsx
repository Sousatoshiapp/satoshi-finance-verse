import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { Textarea } from "@/components/shared/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/ui/select";
import { Sparkles, FileText, Users, Brain } from "lucide-react";

export default function ContentGenerator() {
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [description, setDescription] = useState("");

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

        <h1 className="text-3xl font-bold mb-6">✨ Gerador de Conteúdo com IA</h1>
        
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Criar Novo Conteúdo
              </CardTitle>
              <CardDescription>
                Configure os parâmetros para gerar conteúdo personalizado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="topic">Tópico</Label>
                <Input
                  id="topic"
                  placeholder="Ex: Investimentos em ações"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="content-type">Tipo de Conteúdo</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">Quiz Interativo</SelectItem>
                    <SelectItem value="article">Artigo Educativo</SelectItem>
                    <SelectItem value="exercise">Exercício Prático</SelectItem>
                    <SelectItem value="case-study">Estudo de Caso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="difficulty">Nível de Dificuldade</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Descrição (Opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o conteúdo específico que deseja..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <Button className="w-full" disabled={!topic || !contentType || !difficulty}>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Conteúdo
              </Button>
            </CardContent>
          </Card>

          {/* Examples */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Conteúdos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Quiz: Tesouro Direto</h4>
                  <p className="text-sm text-muted-foreground">10 questões • Iniciante</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Artigo: Diversificação</h4>
                  <p className="text-sm text-muted-foreground">8 min de leitura • Intermediário</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Exercício: Análise de Ações</h4>
                  <p className="text-sm text-muted-foreground">Prática • Avançado</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Templates Populares
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Quiz de Fundamentos
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Simulação de Investimento
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Análise de Cenário
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
