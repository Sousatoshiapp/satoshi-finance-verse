import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { Progress } from '@/components/shared/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shared/ui/select';
import { Input } from '@/components/shared/ui/input';
import { Label } from '@/components/shared/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, 
  TrendingUp, 
  Bitcoin, 
  Briefcase, 
  GraduationCap, 
  Calculator, 
  BarChart,
  Loader2,
  CheckCircle,
  AlertCircle,
  Zap,
  Target,
  Settings
} from 'lucide-react';

const THEMES = {
  'trading': { name: 'Trading & Análise Técnica', icon: TrendingUp, color: 'text-green-600' },
  'cryptocurrency': { name: 'Criptomoedas & DeFi', icon: Bitcoin, color: 'text-orange-600' },
  'portfolio': { name: 'Gestão de Portfolio', icon: Briefcase, color: 'text-blue-600' },
  'basic_investments': { name: 'Investimentos Básicos', icon: BarChart, color: 'text-purple-600' },
  'financial_education': { name: 'Educação Financeira', icon: GraduationCap, color: 'text-teal-600' },
  'budgeting': { name: 'Orçamento & Planejamento', icon: Calculator, color: 'text-pink-600' },
  'economics': { name: 'Economia & Macroeconomia', icon: Brain, color: 'text-gray-600' }
};

const DIFFICULTIES = {
  'easy': { name: 'Fácil', color: 'bg-green-100 text-green-800' },
  'medium': { name: 'Médio', color: 'bg-yellow-100 text-yellow-800' },
  'hard': { name: 'Difícil', color: 'bg-red-100 text-red-800' }
};

interface GenerationProgress {
  current: number;
  total: number;
  currentTheme: string;
  currentDifficulty: string;
  completed: string[];
  errors: string[];
}

export function AdvancedQuestionGenerator() {
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('medium');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<GenerationProgress | null>(null);
  const [stats, setStats] = useState<any>(null);
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

      const statsMap: any = {};
      data?.forEach(q => {
        if (!statsMap[q.theme]) {
          statsMap[q.theme] = { easy: 0, medium: 0, hard: 0, total: 0 };
        }
        statsMap[q.theme][q.difficulty]++;
        statsMap[q.theme].total++;
      });

      setStats(statsMap);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const generateSingleTheme = async (theme: string, difficulty: string, count: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-themed-questions', {
        body: { theme, difficulty, count }
      });

      if (error) throw error;

      if (data?.success) {
        return data;
      } else {
        throw new Error(data?.error || 'Generation failed');
      }
    } catch (error) {
      console.error(`Error generating ${theme} ${difficulty}:`, error);
      throw error;
    }
  };

  const handleSingleGeneration = async () => {
    if (!selectedTheme) {
      toast({
        title: "Erro",
        description: "Selecione um tema para gerar perguntas",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      toast({
        title: "🚀 Iniciando geração",
        description: `Gerando ${questionCount} perguntas de ${THEMES[selectedTheme].name} (${DIFFICULTIES[selectedDifficulty].name})`
      });

      const result = await generateSingleTheme(selectedTheme, selectedDifficulty, questionCount);
      
      toast({
        title: "✅ Perguntas geradas!",
        description: `${result.questions_generated} perguntas criadas com sucesso`,
      });

      await loadStats();
    } catch (error) {
      toast({
        title: "❌ Erro na geração",
        description: error.message || "Falha ao gerar perguntas",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBatchGeneration = async () => {
    setIsGenerating(true);
    
    const allTasks: Array<{theme: string, difficulty: string, count: number}> = [];
    
    // Generate all combinations
    Object.keys(THEMES).forEach(theme => {
      Object.keys(DIFFICULTIES).forEach(difficulty => {
        allTasks.push({ theme, difficulty, count: 15 });
      });
    });

    setBatchProgress({
      current: 0,
      total: allTasks.length,
      currentTheme: '',
      currentDifficulty: '',
      completed: [],
      errors: []
    });

    let completed = 0;
    let errors: string[] = [];

    for (const task of allTasks) {
      setBatchProgress(prev => prev ? {
        ...prev,
        current: completed,
        currentTheme: task.theme,
        currentDifficulty: task.difficulty
      } : null);

      try {
        toast({
          title: "📝 Gerando...",
          description: `${THEMES[task.theme].name} - ${DIFFICULTIES[task.difficulty].name}`,
          duration: 2000
        });

        await generateSingleTheme(task.theme, task.difficulty, task.count);
        
        setBatchProgress(prev => prev ? {
          ...prev,
          completed: [...prev.completed, `${task.theme}-${task.difficulty}`]
        } : null);

        completed++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Failed to generate ${task.theme} ${task.difficulty}:`, error);
        errors.push(`${task.theme}-${task.difficulty}: ${error.message}`);
        
        setBatchProgress(prev => prev ? {
          ...prev,
          errors: [...prev.errors, `${task.theme}-${task.difficulty}`]
        } : null);
      }
    }

    setBatchProgress(prev => prev ? {
      ...prev,
      current: completed
    } : null);

    toast({
      title: completed === allTasks.length ? "✅ Geração completa!" : "⚠️ Geração finalizada",
      description: `${completed}/${allTasks.length} lotes gerados com sucesso`,
      variant: completed === allTasks.length ? "default" : "destructive"
    });

    await loadStats();
    setIsGenerating(false);
    
    // Clear progress after 5 seconds
    setTimeout(() => setBatchProgress(null), 5000);
  };

  const getDifficultyColor = (difficulty: string) => {
    return DIFFICULTIES[difficulty]?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Single Theme Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Gerador por Tema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tema</Label>
              <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tema" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(THEMES).map(([key, theme]) => {
                    const IconComponent = theme.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <IconComponent className={`h-4 w-4 ${theme.color}`} />
                          {theme.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dificuldade</Label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DIFFICULTIES).map(([key, diff]) => (
                    <SelectItem key={key} value={key}>
                      <Badge className={getDifficultyColor(key)}>{diff.name}</Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                type="number"
                min="5"
                max="50"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value) || 10)}
              />
            </div>
          </div>

          <Button 
            onClick={handleSingleGeneration}
            disabled={isGenerating || !selectedTheme}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Gerar Perguntas
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Batch Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Geração em Lote (Todos os Temas)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Gera perguntas para todos os temas em todas as dificuldades:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>7 temas × 3 dificuldades = 21 lotes</li>
              <li>15 perguntas por lote = ~315 perguntas total</li>
              <li>Processamento sequencial com delays</li>
            </ul>
          </div>

          {batchProgress && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Progresso: {batchProgress.current}/{batchProgress.total}</span>
                <span>{Math.round((batchProgress.current / batchProgress.total) * 100)}%</span>
              </div>
              
              <Progress value={(batchProgress.current / batchProgress.total) * 100} />
              
              {batchProgress.currentTheme && (
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando: {THEMES[batchProgress.currentTheme]?.name} - {DIFFICULTIES[batchProgress.currentDifficulty]?.name}
                </div>
              )}

              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Concluídos: {batchProgress.completed.length}
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Erros: {batchProgress.errors.length}
                </div>
              </div>
            </div>
          )}

          <Button 
            onClick={handleBatchGeneration}
            disabled={isGenerating}
            variant="outline"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando em Lote...
              </>
            ) : (
              "🚀 Gerar Todos os Temas"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Estatísticas por Tema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(stats).map(([theme, data]: [string, any]) => {
                const themeInfo = THEMES[theme];
                if (!themeInfo) return null;
                
                const IconComponent = themeInfo.icon;
                
                return (
                  <div key={theme} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className={`h-4 w-4 ${themeInfo.color}`} />
                      <span className="font-medium">{themeInfo.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Total: <span className="font-medium">{data.total}</span></div>
                      <div className="flex gap-4">
                        <span>Fácil: {data.easy}</span>
                        <span>Médio: {data.medium}</span>
                        <span>Difícil: {data.hard}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}