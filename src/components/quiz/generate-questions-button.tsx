import { useState } from "react";
import { Button } from "@/components/shared/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateAllThemedQuestions, getThemeQuestionStats } from "@/utils/generate-questions";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Database, CheckCircle, Settings, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { AdvancedQuestionGenerator } from "@/components/features/quiz/advanced-question-generator";
import { QuestionPreviewModal } from "@/components/features/quiz/question-preview-modal";

export function GenerateQuestionsButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Toast de início com progresso
    toast({
      title: "🚀 Iniciando geração de perguntas...",
      description: "Este processo pode levar alguns minutos. Gerando em lotes para melhor estabilidade.",
    });
    
    try {
      const result = await generateAllThemedQuestions();
      console.log('Resultado:', result);
      
      if (result.success) {
        toast({
          title: "✅ Perguntas geradas com sucesso!",
          description: `Total de ${result.totalGenerated} perguntas criadas para ${result.summary?.themes_processed || 0} temas`,
        });
        
        // Atualizar estatísticas
        const newStats = await getThemeQuestionStats();
        setStats(newStats);
      } else {
        toast({
          title: "⚠️ Geração parcialmente concluída",
          description: result.message || "Algumas perguntas foram geradas, mas houveram erros. Verifique o console.",
          variant: "destructive",
        });
        
        // Ainda assim, tentar atualizar estatísticas para mostrar o que foi gerado
        const newStats = await getThemeQuestionStats();
        setStats(newStats);
      }
    } catch (error) {
      console.error('Erro completo:', error);
      
      const errorMessage = error?.message || 'Erro desconhecido';
      
      let userFriendlyMessage = "Ocorreu um erro durante a geração. Tente novamente em alguns minutos.";
      
      if (errorMessage.includes('403') || errorMessage.includes('API')) {
        userFriendlyMessage = "Problema com a API do OpenAI. Verifique se a chave está configurada corretamente.";
      } else if (errorMessage.includes('429')) {
        userFriendlyMessage = "Muitas requisições. Aguarde alguns minutos antes de tentar novamente.";
      } else if (errorMessage.includes('timeout')) {
        userFriendlyMessage = "Timeout na geração. O processo foi interrompido. Tente com lotes menores.";
      }
      
      toast({
        title: "❌ Erro ao gerar perguntas",
        description: userFriendlyMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGetStats = async () => {
    const currentStats = await getThemeQuestionStats();
    setStats(currentStats);
  };

  const handleTestGeneration = async () => {
    setIsGenerating(true);
    try {
      toast({
        title: "🧪 Iniciando teste simples",
        description: "Testando geração de 10 perguntas de educação financeira...",
      });

      const { data, error } = await supabase.functions.invoke('generate-quick-questions', {
        body: { theme: 'financial_education', difficulty: 'easy', count: 10 }
      });
      
      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "✅ Teste concluído!",
          description: `${data.questions_generated} perguntas de teste geradas com sucesso!`,
        });
        await handleGetStats();
      } else {
        throw new Error(data?.error || 'Erro no teste');
      }
    } catch (error) {
      console.error('Erro no teste:', error);
      toast({
        title: "❌ Erro no teste",
        description: error.message || "Falha no teste de geração.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gerador de Perguntas Temáticas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleTestGeneration}
              disabled={isGenerating}
              size="lg"
              variant="secondary"
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                "🧪 Teste Rápido (10 perguntas) - Modo Seguro"
              )}
            </Button>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Gerar Todas
                  </>
                )}
              </Button>
              
              <Button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                variant="outline"
              >
                <Settings className="mr-2 h-4 w-4" />
                Avançado
              </Button>
              
              <Button 
                onClick={() => setShowPreview(true)}
                variant="outline"
              >
                <Eye className="mr-2 h-4 w-4" />
                Validar
              </Button>
              
              <Button 
                onClick={handleGetStats}
                variant="outline"
              >
                Estatísticas
              </Button>
            </div>
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
          
          {!showAdvanced && (
            <div className="text-sm text-muted-foreground">
              <p><strong>O que será gerado:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>7 temas financeiros (Educação Financeira, Trading, etc.)</li>
                <li>3 níveis de dificuldade por tema (fácil, médio, difícil)</li>
                <li>~30 perguntas por nível = ~90 perguntas por tema</li>
                <li><strong>Total: ~630 perguntas</strong></li>
                <li className="text-primary">✨ Geração otimizada em lotes menores</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Generator */}
      {showAdvanced && (
        <AdvancedQuestionGenerator />
      )}

      {/* Preview Modal */}
      <QuestionPreviewModal 
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}