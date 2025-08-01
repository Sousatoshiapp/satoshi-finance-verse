import { useState, useEffect } from "react";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Progress } from "@/components/shared/ui/progress";
import { Badge } from "@/components/shared/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Play, BarChart3, Target } from "lucide-react";
import { BatchGenerationRunner } from "./BatchGenerationRunner";
import { ErrorHandler } from "@/utils/error-handling";

interface CategoryStatus {
  category: string;
  current: number;
  target: number;
  progress: number;
  needed: number;
}

interface GenerationResult {
  category: string;
  difficulty: string;
  generated: number;
  success: boolean;
  error?: string;
}

export function QuestionGeneratorPanel() {
  const [status, setStatus] = useState<{
    summary: any;
    categories: CategoryStatus[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);

  const loadStatus = async () => {
    const logger = ErrorHandler.createLogger('QuestionGeneratorPanel');
    setLoading(true);
    logger.info('Carregando status...');
    
    try {
      const statusData = await ErrorHandler.withRetry(async () => {
        const { data, error } = await supabase.functions.invoke('batch-generate-questions', {
          body: { mode: 'status' }
        });

        if (error) {
          logger.error('Erro da edge function', { error });
          throw new Error(error.message || 'Erro na Edge Function');
        }

        if (!data) {
          logger.warn('Dados vazios retornados');
          throw new Error('Nenhum dado retornado do status');
        }

        if (!data.summary || !Array.isArray(data.categories)) {
          logger.error('Formato de dados inválido', { data });
          throw new Error('Formato de resposta inválido do status');
        }

        return data;
      }, {
        maxAttempts: 3,
        baseDelay: 1000,
        shouldRetry: (error, attempt) => {
          return !error.message.includes('Formato de resposta inválido') && attempt < 3;
        }
      });

      logger.info('Status carregado com sucesso', { 
        totalCurrent: statusData.summary?.totalCurrent,
        totalTarget: statusData.summary?.totalTarget,
        categoriesCount: statusData.categories?.length
      });
      
      setStatus(statusData);
    } catch (error) {
      logger.error('Erro ao carregar status', { error: error.message });
      toast.error(`Erro ao carregar status: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const generateQuestions = async () => {
    const logger = ErrorHandler.createLogger('QuestionGeneratorPanel');
    logger.info('Starting question generation...');
    logger.info('Status atual:', status);
    
    setGenerating(true);
    setResults([]);
    
    try {
      // Verificar se temos status carregado
      if (!status) {
        logger.warn('Status não carregado, tentando carregar...');
        await loadStatus();
        if (!status) {
          throw new Error('Status não disponível');
        }
      }

      logger.info('Categorias disponíveis:', { count: status.categories?.length });

      // Pegar categorias que mais precisam de perguntas
      const categoriesToGenerate = status.categories
        ?.filter(cat => {
          logger.debug(`Categoria ${cat.category}`, { needed: cat.needed, current: cat.current, target: cat.target });
          return cat.needed > 0;
        })
        .sort((a, b) => b.needed - a.needed)
        .slice(0, 5); // Processar 5 por vez

      logger.info('Categories selected for generation:', { count: categoriesToGenerate?.length });

      if (!categoriesToGenerate?.length) {
        logger.info('All categories already have sufficient questions!');
        toast.info('Todas as categorias já têm perguntas suficientes!');
        return;
      }

      const requestBody = { 
        mode: 'generate',
        categories: categoriesToGenerate.map(cat => ({
          category: cat.category,
          target: Math.min(cat.needed, 10), // Usar 'target' em vez de 'targetCount' 
          priorities: ['easy', 'medium', 'hard']
        }))
      };

      logger.info('Sending request:', requestBody);

      const generationResult = await ErrorHandler.withRetry(async () => {
        const { data, error } = await supabase.functions.invoke('batch-generate-questions', {
          body: requestBody
        });

        if (error) {
          logger.error('Erro da edge function', { error });
          throw new Error(error.message || 'Erro na Edge Function');
        }

        if (!data) {
          throw new Error('Nenhum dado retornado da geração');
        }

        if (!Array.isArray(data.results)) {
          logger.error('Formato de resposta inválido', { data });
          throw new Error('Formato de resposta inválido da geração');
        }

        return data;
      }, {
        maxAttempts: 2,
        baseDelay: 2000,
        shouldRetry: (error, attempt) => {
          return !error.message.includes('Formato de resposta inválido') && attempt < 2;
        }
      });

      setResults(generationResult.results || []);
      
      const totalGenerated = generationResult.totalGenerated || 0;
      logger.info(`Total de perguntas geradas: ${totalGenerated}`);
      
      if (totalGenerated > 0) {
        toast.success(`${totalGenerated} perguntas geradas com sucesso!`);
        await loadStatus();
      } else {
        toast.warning('Nenhuma pergunta foi gerada');
      }

    } catch (error: any) {
      logger.error('Erro ao gerar perguntas', { error: error.message });
      toast.error(`Erro ao gerar perguntas: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "bg-green-500";
    if (progress >= 70) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerador de Perguntas</h2>
          <p className="text-muted-foreground">
            Expandir banco de dados para 500+ perguntas
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadStatus} disabled={loading} variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Atualizar Status
          </Button>
          <Button onClick={generateQuestions} disabled={generating || loading}>
            {generating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Gerar Perguntas
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      {status && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Progresso Geral
            </CardTitle>
            <CardDescription>
              Status atual do banco de dados de perguntas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {status.summary.totalCurrent}
                </div>
                <div className="text-sm text-muted-foreground">Atual</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {status.summary.totalTarget}
                </div>
                <div className="text-sm text-muted-foreground">Meta</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {status.summary.globalProgress}%
                </div>
                <div className="text-sm text-muted-foreground">Completo</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {status.summary.remaining}
                </div>
                <div className="text-sm text-muted-foreground">Restantes</div>
              </div>
            </div>
            
            <Progress 
              value={status.summary.globalProgress} 
              className="h-3"
            />
          </CardContent>
        </Card>
      )}

      {/* Category Status */}
      {status && (
        <Card>
          <CardHeader>
            <CardTitle>Status por Categoria</CardTitle>
            <CardDescription>
              Progresso individual de cada categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {status.categories.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{category.category}</span>
                      <Badge variant={category.progress >= 90 ? "default" : "secondary"}>
                        {category.current}/{category.target}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {category.progress}%
                    </span>
                  </div>
                  <Progress 
                    value={category.progress} 
                    className={`h-2 ${getProgressColor(category.progress)}`}
                  />
                  {category.needed > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Precisa de {category.needed} perguntas
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Geração</CardTitle>
            <CardDescription>
              Últimas perguntas geradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{result.category}</div>
                    <div className="text-sm text-muted-foreground">
                      Dificuldade: {result.difficulty}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? `${result.generated} geradas` : 'Erro'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Batch Generation Runner */}
      <BatchGenerationRunner />

      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Carregando status...
          </CardContent>
        </Card>
      )}
    </div>
  );
}
