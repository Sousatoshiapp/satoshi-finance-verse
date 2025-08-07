import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Alert, AlertDescription } from "@/components/shared/ui/alert";
import { Loader2, Bot, TrendingUp, Users, Trophy, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function BotRealismEnhancer() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ processed: 0, total: 0, percentage: 0 });
  const [result, setResult] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]); // Keep only 10 logs
  };

  const enhanceBotRealism = async () => {
    setLoading(true);
    setResult(null);
    setProgress({ processed: 0, total: 0, percentage: 0 });
    setLogs([]);

    try {
      let offset = 0;
      const batchSize = 50;
      let hasMore = true;
      let totalProcessed = 0;

      addLog('Iniciando aprimoramento do realismo dos bots...');

      while (hasMore) {
        addLog(`Processando lote ${Math.floor(offset / batchSize) + 1}...`);

        const { data, error } = await supabase.functions.invoke('enhance-bot-realism-batch', {
          body: { batchSize, offset }
        });

        if (error) {
          throw error;
        }

        if (!data.success) {
          throw new Error(data.error || 'Erro desconhecido no processamento');
        }

        totalProcessed += data.processed;
        hasMore = data.hasMore;
        offset = data.nextOffset;

        setProgress({
          processed: data.progress.processed,
          total: data.progress.total,
          percentage: data.progress.percentage
        });

        addLog(`Lote concluído: ${data.processed} bots processados`);

        // Small delay between batches to prevent overload
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      setResult(`Realismo aprimorado com sucesso! ${totalProcessed} bots processados.`);
      addLog(`✅ Processo concluído! Total: ${totalProcessed} bots processados`);
      
      toast({
        title: "Sucesso",
        description: `${totalProcessed} bots tiveram seu realismo aprimorado`,
        variant: "default"
      });

    } catch (error: any) {
      console.error('Error enhancing bot realism:', error);
      setResult('Erro ao aprimorar realismo dos bots');
      addLog(`❌ Erro: ${error.message}`);
      
      toast({
        title: "Erro",
        description: error.message || "Falha ao aprimorar realismo dos bots",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Aprimorar Realismo dos Bots
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p className="mb-4">
            Esta função adiciona dados realistas aos bots, incluindo conquistas automáticas:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span>Participações em torneios</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>Sessões de quiz históricas</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <span>Interações sociais</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span>Dados de leaderboard</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span>Datas de membro realistas</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🏆</span>
              <span>Conquistas condizentes</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💼</span>
              <span>Portfolios públicos</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📊</span>
              <span>Estatísticas consistentes</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🏆</span>
              <span>Conquistas automáticas</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⚡</span>
              <span>Combos e streaks realistas</span>
            </div>
          </div>
        </div>

        <Button 
          onClick={enhanceBotRealism} 
          disabled={loading}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Aprimorando Bots...' : 'Aprimorar Realismo dos Bots'}
        </Button>

        {/* Progress Bar */}
        {progress.total > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso: {progress.processed}/{progress.total} bots</span>
              <span>{progress.percentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Logs do Sistema:</h4>
            <div className="bg-muted/30 p-3 rounded-lg border max-h-32 overflow-auto">
              <div className="space-y-1 font-mono text-xs">
                {logs.map((log, index) => (
                  <div key={index} className={`${
                    log.includes('❌') ? 'text-destructive' :
                    log.includes('✅') ? 'text-success' :
                    'text-muted-foreground'
                  }`}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {result && (
          <Alert>
            <AlertDescription>{result}</AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground">
          <strong>Nota:</strong> Esta operação pode levar alguns minutos para ser concluída. 
          Ela adiciona dados históricos realistas a todos os bots do sistema, incluindo:
          sessões de quiz baseadas no nível, posts sociais, participações em leaderboards 
          semanais, <strong>conquistas automáticas apropriadas</strong> e portfolios de investimento.
          
          <br /><br />
          <strong>Conquistas incluídas:</strong> A função agora atribui automaticamente conquistas
          baseadas no nível, número de quizzes, combos máximos e streaks dos bots, garantindo
          que todos tenham conquistas condizentes com seu progresso.
        </div>
      </CardContent>
    </Card>
  );
}
