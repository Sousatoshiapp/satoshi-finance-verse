import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Play, Pause, RotateCcw } from "lucide-react";

export function BatchGenerationRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [totalGenerated, setTotalGenerated] = useState(0);

  const runBatchGeneration = async () => {
    setIsRunning(true);
    setProgress(0);
    setTotalGenerated(0);

    try {
      // Primeira fase: Expandir categorias populares
      const popularCategories = [
        { category: 'Investimentos Básicos', needed: 18 },
        { category: 'Cryptocurrency', needed: 15 },
        { category: 'Trading', needed: 10 },
        { category: 'Educação Financeira', needed: 15 },
        { category: 'Orçamento Pessoal', needed: 10 }
      ];

      const totalSteps = popularCategories.length;
      let completed = 0;

      for (const { category, needed } of popularCategories) {
        if (!isRunning) break;

        setCurrentCategory(category);
        
        // Gerar para easy
        if (needed >= 5) {
          await generateForDifficulty(category, 'easy', Math.min(5, needed));
          await delay(2000);
        }

        // Gerar para medium
        if (needed >= 3) {
          await generateForDifficulty(category, 'medium', Math.min(3, Math.max(0, needed - 5)));
          await delay(2000);
        }

        // Gerar para hard se necessário
        if (needed > 8) {
          await generateForDifficulty(category, 'hard', Math.min(2, needed - 8));
          await delay(2000);
        }

        completed++;
        setProgress((completed / totalSteps) * 100);
      }

      // Segunda fase: Criar novas categorias brasileiras
      const newCategories = [
        'Economia Brasileira',
        'Tesouro Direto', 
        'PIX e Bancos Digitais',
        'Imposto de Renda',
        'FGTS e Benefícios',
        'Cartão de Crédito',
        'Financiamentos',
        'Seguros',
        'Previdência Privada',
        'Fundos de Investimento'
      ];

      for (const category of newCategories) {
        if (!isRunning) break;

        setCurrentCategory(category);
        
        // 8 perguntas easy, 5 medium, 2 hard por categoria nova
        await generateForDifficulty(category, 'easy', 8);
        await delay(2000);
        await generateForDifficulty(category, 'medium', 5);
        await delay(2000);
        await generateForDifficulty(category, 'hard', 2);
        await delay(2000);
      }

      toast.success(`Geração completa! ${totalGenerated} perguntas criadas.`);

    } catch (error) {
      console.error('Erro na geração em lote:', error);
      toast.error('Erro durante a geração');
    } finally {
      setIsRunning(false);
      setCurrentCategory("");
    }
  };

  const generateForDifficulty = async (category: string, difficulty: string, count: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz-questions', {
        body: {
          category,
          difficulty,
          count
        }
      });

      if (error) throw error;

      if (data.success) {
        setTotalGenerated(prev => prev + data.generated);
        toast.success(`${data.generated} perguntas ${difficulty} geradas para ${category}`);
      }
    } catch (error) {
      console.error(`Erro gerando ${difficulty} para ${category}:`, error);
      toast.error(`Erro gerando ${difficulty} para ${category}`);
    }
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const stopGeneration = () => {
    setIsRunning(false);
    toast.info('Geração interrompida');
  };

  const resetProgress = () => {
    setProgress(0);
    setTotalGenerated(0);
    setCurrentCategory("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geração Automatizada em Lote</CardTitle>
        <CardDescription>
          Executa o plano completo de expansão para 500+ perguntas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {!isRunning ? (
            <Button onClick={runBatchGeneration} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Iniciar Geração Completa
            </Button>
          ) : (
            <Button onClick={stopGeneration} variant="destructive" className="flex-1">
              <Pause className="w-4 h-4 mr-2" />
              Parar Geração
            </Button>
          )}
          
          <Button onClick={resetProgress} variant="outline" disabled={isRunning}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {(progress > 0 || isRunning) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso Geral</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            
            {currentCategory && (
              <div className="text-sm text-muted-foreground">
                Processando: <span className="font-medium">{currentCategory}</span>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 border rounded-lg">
            <div className="text-2xl font-bold text-primary">{totalGenerated}</div>
            <div className="text-sm text-muted-foreground">Perguntas Geradas</div>
          </div>
          <div className="p-3 border rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {179 + totalGenerated}
            </div>
            <div className="text-sm text-muted-foreground">Total no Banco</div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <div><strong>Fase 1:</strong> Expandir categorias populares (50-60 perguntas)</div>
          <div><strong>Fase 2:</strong> Criar categorias brasileiras (150 perguntas)</div>
          <div><strong>Fase 3:</strong> Balancear dificuldades (100 perguntas)</div>
          <div><strong>Meta:</strong> 500+ perguntas totais</div>
        </div>
      </CardContent>
    </Card>
  );
}