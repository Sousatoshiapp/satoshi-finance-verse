import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Progress } from "@/components/shared/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Play, Pause, RotateCcw, CheckCircle, AlertCircle } from "lucide-react";

interface BotUpdateProgress {
  processed: number;
  total: number;
  percentage: number;
  updated: number;
  failed: number;
  remaining: number;
  isRunning: boolean;
  sample_updates: Array<{
    id: string;
    oldNickname: string;
    newNickname: string;
  }>;
}

export function BotNicknameManager() {
  const [progress, setProgress] = useState<BotUpdateProgress>({
    processed: 0,
    total: 0,
    percentage: 0,
    updated: 0,
    failed: 0,
    remaining: 0,
    isRunning: false,
    sample_updates: []
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const { toast } = useToast();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]); // Manter apenas 20 logs
  };

  const updateBotNicknames = async (startFrom: number = 0) => {
    if (isPaused) return;

    try {
      setProgress(prev => ({ ...prev, isRunning: true }));
      addLog(`Iniciando atualização a partir do bot ${startFrom + 1}...`);

      const { data, error } = await supabase.functions.invoke('update-bot-nicknames', {
        body: { 
          batchSize: 100,
          startFrom: startFrom
        }
      });

      if (error) throw error;

      const newProgress = {
        processed: data.progress?.processed || data.updated_count || 0,
        total: data.progress?.total || data.updated_count || 0,
        percentage: data.progress?.percentage || 100,
        updated: progress.updated + (data.updated || data.updated_count || 0),
        failed: progress.failed + (data.failed || 0),
        remaining: data.remaining || 0,
        isRunning: (data.remaining || 0) > 0 && !isPaused,
        sample_updates: data.sample_updates || []
      };

      setProgress(newProgress);
      
      addLog(`Lote processado: ${data.updated_count || 0} atualizados, ${data.failed || 0} falharam`);
      
      if (data.sample_updates?.length > 0) {
        data.sample_updates.forEach((update: any) => {
          addLog(`${update.oldNickname} → ${update.newNickname}`);
        });
      }

      if ((data.remaining || 0) > 0 && !isPaused) {
        // Continuar com próximo lote após pequeno delay
        setTimeout(() => {
          updateBotNicknames(data.progress?.processed || 0);
        }, 1000);
      } else {
        setProgress(prev => ({ ...prev, isRunning: false }));
        addLog(`✅ Processo concluído! Total: ${newProgress.updated} atualizados`);
        toast({
          title: "Atualização completa!",
          description: `${newProgress.updated} bots atualizados com sucesso`,
        });
      }

    } catch (error: any) {
      console.error('Error updating bot nicknames:', error);
      setProgress(prev => ({ ...prev, isRunning: false }));
      addLog(`❌ Erro: ${error.message}`);
      toast({
        title: "Erro na atualização",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const startUpdate = async () => {
    if (progress.isRunning) return;
    
    setProgress({
      processed: 0,
      total: 0,
      percentage: 0,
      updated: 0,
      failed: 0,
      remaining: 0,
      isRunning: true,
      sample_updates: []
    });
    setLogs([]);
    setIsPaused(false);
    
    await updateBotNicknames(0);
  };

  const pauseUpdate = () => {
    setIsPaused(true);
    setProgress(prev => ({ ...prev, isRunning: false }));
    addLog("⏸️ Processo pausado pelo usuário");
  };

  const resumeUpdate = () => {
    setIsPaused(false);
    addLog("▶️ Retomando processo...");
    updateBotNicknames(progress.processed);
  };

  const resetProgress = () => {
    setProgress({
      processed: 0,
      total: 0,
      percentage: 0,
      updated: 0,
      failed: 0,
      remaining: 0,
      isRunning: false,
      sample_updates: []
    });
    setLogs([]);
    setIsPaused(false);
    addLog("🔄 Sistema resetado");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Gerenciador de Nicknames dos Bots
          </CardTitle>
          <p className="text-muted-foreground">
            Atualiza os nicknames de todos os bots para nomes realistas e únicos
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status e Controles */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={startUpdate}
                disabled={progress.isRunning || isPaused}
                className="bg-primary hover:bg-primary/90"
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Atualização
              </Button>
              
              {progress.isRunning && (
                <Button
                  onClick={pauseUpdate}
                  variant="outline"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pausar
                </Button>
              )}
              
              {isPaused && progress.processed > 0 && (
                <Button
                  onClick={resumeUpdate}
                  variant="outline"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Retomar
                </Button>
              )}
              
              <Button
                onClick={resetProgress}
                variant="ghost"
                disabled={progress.isRunning}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {progress.isRunning && (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                  Processando...
                </div>
              )}
              {isPaused && (
                <div className="flex items-center gap-2 text-warning">
                  <Pause className="h-4 w-4" />
                  Pausado
                </div>
              )}
              {!progress.isRunning && !isPaused && progress.processed > 0 && progress.remaining === 0 && (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-4 w-4" />
                  Concluído
                </div>
              )}
            </div>
          </div>

          {/* Progresso */}
          {progress.total > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Progresso: {progress.processed}/{progress.total} bots</span>
                <span>{progress.percentage}%</span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
              
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                  <div className="text-lg font-bold text-success">{progress.updated}</div>
                  <div className="text-xs text-muted-foreground">Atualizados</div>
                </div>
                <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="text-lg font-bold text-destructive">{progress.failed}</div>
                  <div className="text-xs text-muted-foreground">Falharam</div>
                </div>
                <div className="p-3 bg-info/10 rounded-lg border border-info/20">
                  <div className="text-lg font-bold text-info">{progress.remaining}</div>
                  <div className="text-xs text-muted-foreground">Restantes</div>
                </div>
                <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                  <div className="text-lg font-bold text-accent">{progress.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
            </div>
          )}

          {/* Exemplos Recentes */}
          {progress.sample_updates.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Últimas atualizações:</h4>
              <div className="space-y-1 max-h-32 overflow-auto">
                {progress.sample_updates.map((update, index) => (
                  <div key={index} className="text-sm p-2 bg-accent/5 rounded border">
                    <span className="text-muted-foreground">{update.oldNickname}</span>
                    <span className="mx-2">→</span>
                    <span className="font-medium text-primary">{update.newNickname}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logs */}
          {logs.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Logs do Sistema:</h4>
              <div className="bg-muted/30 p-3 rounded-lg border max-h-48 overflow-auto">
                <div className="space-y-1 font-mono text-xs">
                  {logs.map((log, index) => (
                    <div key={index} className={`${
                      log.includes('❌') ? 'text-destructive' :
                      log.includes('✅') ? 'text-success' :
                      log.includes('⏸️') || log.includes('▶️') ? 'text-warning' :
                      'text-muted-foreground'
                    }`}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Aviso */}
          <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              <span className="font-medium text-warning">Importante</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Este processo irá atualizar todos os 3500 bots com nicknames realistas</li>
              <li>• Os nicknames serão únicos e não conflitarão com usuários reais</li>
              <li>• O processo pode ser pausado e retomado a qualquer momento</li>
              <li>• Leva aproximadamente 3-5 minutos para completar</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
