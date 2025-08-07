import { useState } from "react";
import { Button } from "@/components/shared/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateAllThemedQuestions, getThemeQuestionStats } from "@/utils/generate-questions";
import { Loader2, Database, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";

export function GenerateQuestionsButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateAllThemedQuestions();
      
      toast({
        title: "✅ Perguntas geradas com sucesso!",
        description: `${result.totalGenerated} perguntas criadas para todos os temas`,
      });
      
      // Atualizar estatísticas
      const newStats = await getThemeQuestionStats();
      setStats(newStats);
      
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "❌ Erro ao gerar perguntas",
        description: "Verifique o console para mais detalhes",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGetStats = async () => {
    const currentStats = await getThemeQuestionStats();
    setStats(currentStats);
  };

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gerador de Perguntas Temáticas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando perguntas...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Gerar Todas as Perguntas
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleGetStats}
              variant="outline"
            >
              Ver Estatísticas
            </Button>
          </div>
          
          {stats && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-3">Estatísticas por Tema:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {Object.entries(stats).map(([theme, data]: [string, any]) => (
                  <div key={theme} className="p-2 bg-background rounded border">
                    <div className="font-medium">{theme}</div>
                    <div className="text-muted-foreground">
                      Total: {data.total} | Fácil: {data.easy} | Médio: {data.medium} | Difícil: {data.hard}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            <p><strong>O que será gerado:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>7 temas financeiros (Educação Financeira, Trading, etc.)</li>
              <li>3 níveis de dificuldade por tema (fácil, médio, difícil)</li>
              <li>~70 perguntas por nível = ~210 perguntas por tema</li>
              <li><strong>Total: ~1470 perguntas</strong></li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}