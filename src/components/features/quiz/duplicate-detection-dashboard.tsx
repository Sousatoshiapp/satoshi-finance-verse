import { useState, useEffect } from 'react';
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
      
      // Buscar estatísticas gerais usando apenas colunas existentes
      const { data: allQuestions } = await supabase
        .from('quiz_questions')
        .select('id, theme, difficulty, created_at');

      if (!allQuestions) return;

      const stats: DuplicateStats = {
        totalQuestions: allQuestions.length,
        duplicatesFound: 0,
        qualityIssues: 0,
        pendingApproval: 0, // Será calculado se existir a coluna
        approved: 0,
        rejected: 0,
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
        try {
          const { data: similar } = await supabase
            .rpc('find_similar_questions', {
              new_question: question.question,
              similarity_threshold: 0.75
            });

          if (similar && similar.length > 1) {
            similarResults.push({
              id: question.id,
              question: question.question,
              theme: question.theme,
              difficulty: question.difficulty,
              similarity: similar[0]?.similarity || 0,
              created_at: question.created_at
            });
          }
        } catch (error) {
          console.log('RPC function not available, skipping similarity check');
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

      try {
        const { data, error } = await supabase
          .rpc('clean_duplicate_questions');

        if (error) throw error;

        toast({
          title: "Limpeza Concluída",
          description: `${data} duplicatas removidas`
        });

        loadDashboardData();
      } catch (error) {
        toast({
          title: "Função não disponível",
          description: "A função de limpeza será implementada em breve",
          variant: "destructive"
        });
      }
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
      <div className="bg-card p-6 rounded-lg border">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Carregando dashboard...</span>
        </div>
      </div>
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
          <button 
            onClick={analyzeForSimilarQuestions} 
            disabled={analyzing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            {analyzing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <TrendingUp className="h-4 w-4 mr-2" />
            )}
            Analisar Similaridade
          </button>
          <button 
            onClick={loadDashboardData}
            className="inline-flex items-center px-4 py-2 border border-input text-sm font-medium rounded-md hover:bg-accent"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-2">
              <p className="text-sm font-medium text-muted-foreground">Total de Perguntas</p>
              <p className="text-2xl font-bold">{stats.totalQuestions}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div className="ml-2">
              <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold">{stats.pendingApproval}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="ml-2">
              <p className="text-sm font-medium text-muted-foreground">Duplicatas</p>
              <p className="text-2xl font-bold">{stats.duplicatesFound}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div className="ml-2">
              <p className="text-sm font-medium text-muted-foreground">Taxa de Aprovação</p>
              <p className="text-2xl font-bold">{approvalRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Ações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Ações de Limpeza</h3>
          <div className="space-y-4">
            <button 
              onClick={cleanDuplicates}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-destructive hover:bg-destructive/90"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Limpar Duplicatas
            </button>
            
            <button 
              onClick={analyzeForSimilarQuestions}
              disabled={analyzing}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-input text-sm font-medium rounded-md hover:bg-accent disabled:opacity-50"
            >
              {analyzing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <TrendingUp className="h-4 w-4 mr-2" />
              )}
              Analisar Similaridade
            </button>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Estatísticas por Tema</h3>
          <div className="space-y-3">
            {Object.entries(stats.byTheme).map(([theme, data]) => (
              <div key={theme} className="flex justify-between items-center">
                <span className="text-sm font-medium">{theme}</span>
                <div className="flex gap-2">
                  <span className="text-sm text-muted-foreground">Total: {data.total}</span>
                  <span className="text-sm text-muted-foreground">Pendentes: {data.pending}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Perguntas Similares */}
      {similarQuestions.length > 0 && (
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Perguntas Similares Detectadas</h3>
          <div className="space-y-4">
            {similarQuestions.map((question) => (
              <div key={question.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium mb-2">
                      {question.question.substring(0, 100)}...
                    </p>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <span className="px-2 py-1 bg-secondary rounded text-xs">{question.theme}</span>
                      <span className="px-2 py-1 bg-secondary rounded text-xs">{question.difficulty}</span>
                      <span className="px-2 py-1 bg-secondary rounded text-xs">
                        {Math.round(question.similarity * 100)}% similar
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {similarQuestions.length === 0 && (
        <div className="bg-card p-6 rounded-lg border">
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Nenhuma pergunta similar detectada</p>
            <p className="text-sm">Execute a análise para verificar</p>
          </div>
        </div>
      )}
    </div>
  );
}