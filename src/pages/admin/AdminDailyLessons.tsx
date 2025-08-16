import React, { useState } from 'react';
import { AdminAuthProtection } from '@/components/admin-auth-protection';
import { JSONLessonImporter } from '@/components/features/admin/json-lesson-importer';
import { Button } from '@/components/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/ui/tabs';
import { BookOpen, Upload, Download, BarChart3, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function AdminDailyLessons() {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const handleExportLessons = async () => {
    setExporting(true);
    try {
      const { data: lessons, error } = await supabase
        .from('daily_lessons')
        .select('*')
        .order('lesson_date', { ascending: false })
        .order('is_main_lesson', { ascending: false });

      if (error) throw error;

      if (!lessons || lessons.length === 0) {
        toast({
          title: "Nenhuma lição encontrada",
          description: "Não há lições disponíveis para exportar.",
          variant: "destructive",
        });
        return;
      }

      // Formatear dados para export
      const exportData = lessons.map(lesson => ({
        title: lesson.title,
        content: lesson.content,
        category: lesson.category,
        quiz_question: lesson.quiz_question,
        quiz_options: lesson.quiz_options,
        correct_answer: lesson.correct_answer,
        lesson_date: lesson.lesson_date,
        is_main_lesson: lesson.is_main_lesson,
        xp_reward: lesson.xp_reward,
        btz_reward: lesson.btz_reward
      }));

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `licoes-diarias-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export realizado com sucesso!",
        description: `${lessons.length} lições exportadas.`,
      });

    } catch (error) {
      console.error('Erro ao exportar lições:', error);
      toast({
        title: "Erro no export",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const getStatsCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Lições</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Carregue dados para ver</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lições Este Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Carregue dados para ver</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias Ativas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Categorias disponíveis</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <AdminAuthProtection>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Gestão de Lições Diárias</h1>
            <p className="text-muted-foreground">
              Gerencie as Pílulas de Conhecimento com importação e exportação em massa
            </p>
          </div>

          {/* Stats Cards */}
          {getStatsCards()}

          {/* Main Content */}
          <Tabs defaultValue="import" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="import" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Importar
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </TabsTrigger>
              <TabsTrigger value="manage" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Gerenciar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="import" className="mt-6">
              <JSONLessonImporter />
            </TabsContent>

            <TabsContent value="export" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Exportar Lições Existentes
                  </CardTitle>
                  <CardDescription>
                    Baixe todas as lições existentes em formato JSON para backup ou edição em massa.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <h3 className="font-semibold mb-2">Formato de Export</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      O arquivo exportado conterá todas as lições no mesmo formato usado para importação,
                      permitindo edição e re-importação posterior.
                    </p>
                    
                    <Button 
                      onClick={handleExportLessons} 
                      disabled={exporting}
                      className="w-full md:w-auto"
                    >
                      {exporting ? (
                        <>
                          <Download className="h-4 w-4 mr-2 animate-pulse" />
                          Exportando...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Exportar Todas as Lições
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-950/30">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                      <BarChart3 className="h-4 w-4" />
                      Informações do Export
                    </h3>
                    <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                      <li>• Todas as lições serão exportadas ordenadas por data (mais recentes primeiro)</li>
                      <li>• O arquivo incluirá apenas os campos necessários para re-importação</li>
                      <li>• Nome do arquivo: licoes-diarias-export-YYYY-MM-DD.json</li>
                      <li>• Você pode editar o arquivo e usar a aba "Importar" para atualizar</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manage" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Gerenciamento Avançado
                  </CardTitle>
                  <CardDescription>
                    Ferramentas de análise e gerenciamento das lições diárias.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/30">
                    <h3 className="font-semibold mb-2">Funcionalidades Futuras</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Dashboard com estatísticas detalhadas</li>
                      <li>• Visualização de calendário com lições programadas</li>
                      <li>• Editor inline para lições individuais</li>
                      <li>• Sistema de aprovação para lições importadas</li>
                      <li>• Relatórios de engajamento por lição</li>
                      <li>• Agendamento automático de lições</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Categorias Suportadas</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      <div className="p-2 bg-muted rounded">Investimentos</div>
                      <div className="p-2 bg-muted rounded">Criptomoedas</div>
                      <div className="p-2 bg-muted rounded">Economia Pessoal</div>
                      <div className="p-2 bg-muted rounded">Mercado Financeiro</div>
                      <div className="p-2 bg-muted rounded">Educação Financeira</div>
                      <div className="p-2 bg-muted rounded">Finanças do Dia a Dia</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminAuthProtection>
  );
}