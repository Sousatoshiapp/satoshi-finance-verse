import { useState, useEffect } from "react";
import { Button } from "@/components/shared/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Progress } from "@/components/shared/ui/progress";
import { Loader2, Play, Pause, RotateCcw, CheckCircle2 } from "lucide-react";

const THEMES = {
  financial_education: "Educação Financeira",
  budgeting: "Orçamento & Planejamento", 
  basic_investments: "Investimentos Básicos",
  economics: "Economia & Macroeconomia",
  portfolio: "Gestão de Portfolio",
  trading: "Trading & Análise Técnica",
  cryptocurrency: "Criptomoedas & DeFi"
};

const DIFFICULTIES = ["easy", "medium", "hard"];

interface GenerationProgress {
  currentTheme: string;
  currentDifficulty: string;
  completedBatches: number;
  totalBatches: number;
  totalGenerated: number;
  isRunning: boolean;
  error?: string;
}

export function StagedQuestionGenerator({ onUpdate }: { onUpdate?: () => void }) {
  const [progress, setProgress] = useState<GenerationProgress>({
    currentTheme: "",
    currentDifficulty: "",
    completedBatches: 0,
    totalBatches: 0,
    totalGenerated: 0,
    isRunning: false
  });
  
  const [stats, setStats] = useState<Record<string, { easy: number; medium: number; hard: number; total: number }>>({});
  const [questionsPerBatch] = useState(5); // Lotes pequenos
  const [batchesPerExecution] = useState(3); // Máximo 3 lotes por execução
  
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('theme, difficulty')
        .not('theme', 'is', null);

      if (error) throw error;

      const themeStats: Record<string, { easy: number; medium: number; hard: number; total: number }> = {};
      Object.keys(THEMES).forEach(theme => {
        themeStats[theme] = { easy: 0, medium: 0, hard: 0, total: 0 };
      });

      data?.forEach(item => {
        if (themeStats[item.theme]) {
          themeStats[item.theme][item.difficulty]++;
          themeStats[item.theme].total++;
        }
      });

      setStats(themeStats);
    } catch (error) {
      console.error('Erro carregando estatísticas:', error);
    }
  };

  const calculateProgress = () => {
    const totalPossible = Object.keys(THEMES).length * DIFFICULTIES.length;
    const completed = progress.completedBatches;
    return Math.min((completed / totalPossible) * 100, 100);
  };

  const getNextBatch = () => {
    const themeKeys = Object.keys(THEMES);
    const combinations = [];
    
    // Criar todas as combinações
    for (const theme of themeKeys) {
      for (const difficulty of DIFFICULTIES) {
        const currentCount = stats[theme]?.[difficulty] || 0;
        if (currentCount < 20) { // Alvo de 20 perguntas por tema/dificuldade
          combinations.push({ theme, difficulty, currentCount });
        }
      }
    }
    
    // Priorizar combinações com menos perguntas
    combinations.sort((a, b) => a.currentCount - b.currentCount);
    
    return combinations.slice(0, batchesPerExecution);
  };

  const generateNextBatch = async () => {
    const nextBatch = getNextBatch();
    
    if (nextBatch.length === 0) {
      toast({
        title: "🎉 Geração completa!",
        description: "Todas as combinações de tema/dificuldade atingiram o alvo de 20 perguntas.",
      });
      return;
    }

    setProgress(prev => ({
      ...prev,
      isRunning: true,
      error: undefined,
      currentTheme: nextBatch[0].theme,
      currentDifficulty: nextBatch[0].difficulty
    }));

    try {
      toast({
        title: "🚀 Gerando próximo lote...",
        description: `${nextBatch.length} combinações de tema/dificuldade sendo processadas`,
      });

      const themes = nextBatch.map(item => item.theme);
      const difficulties = nextBatch.map(item => item.difficulty);

      const { data, error } = await supabase.functions.invoke('generate-batch-questions', {
        body: {
          themes: Array.from(new Set(themes)), // Remove duplicatas
          difficulties: Array.from(new Set(difficulties)),
          questionsPerBatch
        }
      });

      if (error) throw error;

      if (data?.success) {
        setProgress(prev => ({
          ...prev,
          completedBatches: prev.completedBatches + nextBatch.length,
          totalGenerated: prev.totalGenerated + (data.totalGenerated || 0)
        }));

        toast({
          title: "✅ Lote concluído!",
          description: `${data.totalGenerated} perguntas geradas com sucesso`,
        });

        await loadStats();
        onUpdate?.();
      } else {
        throw new Error(data?.error || 'Erro na geração do lote');
      }

    } catch (error) {
      console.error('Erro gerando lote:', error);
      
      setProgress(prev => ({
        ...prev,
        error: error.message
      }));

      toast({
        title: "❌ Erro no lote",
        description: error.message || "Falha na geração do lote",
        variant: "destructive",
      });
    } finally {
      setProgress(prev => ({
        ...prev,
        isRunning: false,
        currentTheme: "",
        currentDifficulty: ""
      }));
    }
  };

  const resetProgress = () => {
    setProgress({
      currentTheme: "",
      currentDifficulty: "",
      completedBatches: 0,
      totalBatches: 0,
      totalGenerated: 0,
      isRunning: false
    });
  };

  const hasNextBatch = () => {
    return getNextBatch().length > 0;
  };

  const getCompletionStatus = () => {
    const total = Object.keys(THEMES).length * DIFFICULTIES.length * 20; // 420 total
    const current = Object.values(stats).reduce((sum: number, theme) => sum + (theme?.total || 0), 0);
    return { current, total };
  };

  const completionStatus = getCompletionStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Geração por Etapas
        </CardTitle>
        <CardDescription>
          Sistema otimizado para gerar perguntas em lotes menores, evitando timeouts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Geral */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progresso Geral</span>
            <Badge variant="outline">
              {completionStatus.current} / {completionStatus.total} perguntas
            </Badge>
          </div>
          <Progress value={(completionStatus.current / completionStatus.total) * 100} />
        </div>

        {/* Status Atual */}
        {progress.isRunning && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="font-medium">Gerando lote...</span>
            </div>
            {progress.currentTheme && (
              <div className="text-sm text-muted-foreground">
                Tema: {THEMES[progress.currentTheme as keyof typeof THEMES]} ({progress.currentDifficulty})
              </div>
            )}
          </div>
        )}

        {/* Erro */}
        {progress.error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{progress.error}</p>
          </div>
        )}

        {/* Controles */}
        <div className="flex gap-3">
          <Button 
            onClick={generateNextBatch}
            disabled={progress.isRunning || !hasNextBatch()}
            className="flex-1"
          >
            {progress.isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : hasNextBatch() ? (
              <>
                <Play className="mr-2 h-4 w-4" />
                Gerar Próximo Lote
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Concluído
              </>
            )}
          </Button>
          
          <Button 
            onClick={resetProgress}
            variant="outline"
            disabled={progress.isRunning}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Estatísticas por Tema */}
        <div className="space-y-3">
          <h4 className="font-medium">Status por Tema:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(THEMES).map(([themeKey, themeName]) => {
              const themeStats = stats[themeKey] || { easy: 0, medium: 0, hard: 0, total: 0 };
              const progressPercent = (Number(themeStats.total) / 60) * 100; // 60 = 20 por dificuldade
              
              return (
                <div key={themeKey} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{themeName}</span>
                    <Badge variant={progressPercent >= 100 ? "default" : "secondary"}>
                      {themeStats.total}/60
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground flex gap-2">
                    <span>Fácil: {themeStats.easy}</span>
                    <span>Médio: {themeStats.medium}</span>
                    <span>Difícil: {themeStats.hard}</span>
                  </div>
                  <Progress value={Math.min(progressPercent, 100)} className="mt-2" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Informações do Sistema */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Sistema Otimizado:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>{questionsPerBatch} perguntas por tema/dificuldade por execução</li>
            <li>Máximo {batchesPerExecution} combinações por lote</li>
            <li>Alvo: 20 perguntas por combinação (total 420)</li>
            <li>Evita timeouts com lotes pequenos e controlados</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}