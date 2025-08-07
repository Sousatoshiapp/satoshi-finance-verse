import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

interface DuplicateStats {
  totalQuestions: number;
  duplicatesFound: number;
  qualityIssues: number;
  pendingApproval: number;
  approved: number;
  rejected: number;
  byTheme: Record<string, {
    total: number;
    duplicates: number;
    quality_issues: number;
    pending: number;
  }>;
}

interface SimilarQuestion {
  id: string;
  question: string;
  theme: string;
  difficulty: string;
  similarity: number;
  created_at: string;
}

export function DuplicateDetectionDashboard() {
  const [stats, setStats] = useState<DuplicateStats | null>(null);
  const [similarQuestions, setSimilarQuestions] = useState<SimilarQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas gerais
      const { data: allQuestions } = await supabase
        .from('quiz_questions')
        .select('id, theme, difficulty, approval_status, created_at');

      if (!allQuestions) return;

      const stats: DuplicateStats = {
        totalQuestions: allQuestions.length,
        duplicatesFound: 0,
        qualityIssues: 0,
        pendingApproval: allQuestions.filter(q => q.approval_status === 'pending').length,
        approved: allQuestions.filter(q => q.approval_status === 'approved').length,
        rejected: allQuestions.filter(q => q.approval_status === 'rejected').length,
        byTheme: {}
      };

      // Agrupar por tema
      allQuestions.forEach(q => {
        if (!stats.byTheme[q.theme]) {
          stats.byTheme[q.theme] = {
            total: 0,
            duplicates: 0,
            quality_issues: 0,
            pending: 0
          };
        }
        stats.byTheme[q.theme].total++;
        if (q.approval_status === 'pending') {
          stats.byTheme[q.theme].pending++;
        }
      });

      setStats(stats);
    } catch (error) {
      console.error('Erro carregando dashboard:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados do dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeForSimilarQuestions = async () => {
    try {
      setAnalyzing(true);
      toast({
        title: "Analisando",
        description: "Buscando perguntas similares..."
      });

      // Buscar perguntas recentes para análise
      const { data: recentQuestions } = await supabase
        .from('quiz_questions')
        .select('id, question, theme, difficulty, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!recentQuestions) return;

      const similarResults: SimilarQuestion[] = [];

      // Verificar similaridade entre perguntas
      for (const question of recentQuestions) {
        const { data: similar } = await supabase
          .rpc('find_similar_questions', {
            new_question: question.question,
            similarity_threshold: 0.75
          });

        if (similar && similar.length > 1) { // Mais de 1 significa que encontrou similares além dela mesma
          similarResults.push({
            id: question.id,
            question: question.question,
            theme: question.theme,
            difficulty: question.difficulty,
            similarity: similar[0]?.similarity || 0,
            created_at: question.created_at
          });
        }
      }

      setSimilarQuestions(similarResults);
      
      // Atualizar estatísticas
      if (stats) {
        setStats({
          ...stats,
          duplicatesFound: similarResults.length
        });
      }

      toast({
        title: "Análise Concluída",
        description: `Encontradas ${similarResults.length} perguntas similares`
      });

    } catch (error) {
      console.error('Erro analisando duplicatas:', error);
      toast({
        title: "Erro",
        description: "Falha na análise de duplicatas",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const cleanDuplicates = async () => {
    try {
      toast({
        title: "Limpando",
        description: "Removendo duplicatas encontradas..."
      });

      const { data, error } = await supabase
        .rpc('clean_duplicate_questions');

      if (error) throw error;

      toast({
        title: "Limpeza Concluída",
        description: `${data} duplicatas removidas`
      });

      loadDashboardData();
    } catch (error) {
      console.error('Erro limpando duplicatas:', error);
      toast({
        title: "Erro",
        description: "Falha na limpeza de duplicatas",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando dashboard...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const approvalRate = stats.totalQuestions > 0 
    ? Math.round((stats.approved / stats.totalQuestions) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Qualidade</h2>
          <p className="text-muted-foreground">
            Monitoramento de duplicatas e qualidade das perguntas
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={analyzeForSimilarQuestions} disabled={analyzing}>
            {analyzing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <TrendingUp className="h-4 w-4 mr-2" />
            )}
            Analisar Similaridade
          </Button>
          <Button onClick={loadDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total de Perguntas</p>
                <p className="text-2xl font-bold">{stats.totalQuestions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{stats.pendingApproval}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Duplicatas</p>
                <p className="text-2xl font-bold">{stats.duplicatesFound}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Taxa de Aprovação</p>
                <p className="text-2xl font-bold">{approvalRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="themes">Por Tema</TabsTrigger>
          <TabsTrigger value="similar">Perguntas Similares</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status de Aprovação</CardTitle>
                <CardDescription>
                  Distribuição das perguntas por status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Aprovadas</span>
                    <Badge variant="outline" className="bg-green-50">
                      {stats.approved}
                    </Badge>
                  </div>
                  <Progress value={(stats.approved / stats.totalQuestions) * 100} />
                  
                  <div className="flex justify-between">
                    <span>Pendentes</span>
                    <Badge variant="outline" className="bg-yellow-50">
                      {stats.pendingApproval}
                    </Badge>
                  </div>
                  <Progress value={(stats.pendingApproval / stats.totalQuestions) * 100} />
                  
                  <div className="flex justify-between">
                    <span>Rejeitadas</span>
                    <Badge variant="outline" className="bg-red-50">
                      {stats.rejected}
                    </Badge>
                  </div>
                  <Progress value={(stats.rejected / stats.totalQuestions) * 100} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações de Limpeza</CardTitle>
                <CardDescription>
                  Ferramentas para manter a qualidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={cleanDuplicates} 
                  variant="destructive" 
                  className="w-full"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Limpar Duplicatas
                </Button>
                
                <Button 
                  onClick={analyzeForSimilarQuestions} 
                  variant="outline" 
                  className="w-full"
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TrendingUp className="h-4 w-4 mr-2" />
                  )}
                  Analisar Similaridade
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="themes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.byTheme).map(([theme, data]) => (
              <Card key={theme}>
                <CardHeader>
                  <CardTitle className="text-sm">{theme}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total:</span>
                    <span className="font-medium">{data.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pendentes:</span>
                    <Badge variant="outline" size="sm">
                      {data.pending}
                    </Badge>
                  </div>
                  <Progress 
                    value={(data.pending / data.total) * 100} 
                    className="h-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="similar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Perguntas Similares Detectadas</CardTitle>
              <CardDescription>
                Perguntas que podem ser duplicatas ou muito similares
              </CardDescription>
            </CardHeader>
            <CardContent>
              {similarQuestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  <p>Nenhuma pergunta similar detectada</p>
                  <p className="text-sm">Execute a análise para verificar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {similarQuestions.map((question) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium mb-2">
                            {question.question.substring(0, 100)}...
                          </p>
                          <div className="flex gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{question.theme}</Badge>
                            <Badge variant="outline">{question.difficulty}</Badge>
                            <Badge variant="outline">
                              {Math.round(question.similarity * 100)}% similar
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}