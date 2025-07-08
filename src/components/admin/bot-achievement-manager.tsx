import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Trophy, Zap, TrendingUp, Users, Target, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function BotAchievementManager() {
  const [loading, setLoading] = useState(false);
  const [improvingData, setImprovingData] = useState(false);
  const [assigningAchievements, setAssigningAchievements] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const improveBotData = async () => {
    setImprovingData(true);
    setResult(null);
    setLogs([]);

    try {
      addLog('Melhorando dados dos bots para conquistas...');

      const { data, error } = await supabase.rpc('improve_bot_data');

      if (error) {
        throw error;
      }

      const improvedCount = data || 0;
      setResult(`Dados melhorados para ${improvedCount} bots! Agora eles têm streaks maiores e combos melhores.`);
      addLog(`✅ ${improvedCount} bots tiveram seus dados melhorados`);
      
      toast({
        title: "Dados dos Bots Melhorados",
        description: `${improvedCount} bots agora têm dados melhores para conquistas`,
        variant: "default"
      });

    } catch (error: any) {
      console.error('Error improving bot data:', error);
      setResult('Erro ao melhorar dados dos bots');
      addLog(`❌ Erro: ${error.message}`);
      
      toast({
        title: "Erro",
        description: error.message || "Falha ao melhorar dados dos bots",
        variant: "destructive"
      });
    } finally {
      setImprovingData(false);
    }
  };

  const assignBotAchievements = async () => {
    setAssigningAchievements(true);
    setResult(null);
    setLogs([]);

    try {
      addLog('Atribuindo conquistas automáticas aos bots...');

      const { data, error } = await supabase.rpc('assign_bot_achievements');

      if (error) {
        throw error;
      }

      const achievementCount = data || 0;
      setResult(`${achievementCount} conquistas atribuídas aos bots com sucesso!`);
      addLog(`✅ ${achievementCount} conquistas criadas automaticamente`);
      
      toast({
        title: "Conquistas Atribuídas",
        description: `${achievementCount} conquistas foram criadas para os bots`,
        variant: "default"
      });

    } catch (error: any) {
      console.error('Error assigning bot achievements:', error);
      setResult('Erro ao atribuir conquistas aos bots');
      addLog(`❌ Erro: ${error.message}`);
      
      toast({
        title: "Erro",
        description: error.message || "Falha ao atribuir conquistas",
        variant: "destructive"
      });
    } finally {
      setAssigningAchievements(false);
    }
  };

  const runCompleteProcess = async () => {
    setLoading(true);
    setResult(null);
    setLogs([]);

    try {
      addLog('Iniciando processo completo de conquistas...');

      // Step 1: Improve bot data
      addLog('Etapa 1: Melhorando dados dos bots...');
      const { data: improveData, error: improveError } = await supabase.rpc('improve_bot_data');
      
      if (improveError) throw improveError;
      
      const improvedCount = improveData || 0;
      addLog(`✅ ${improvedCount} bots tiveram dados melhorados`);

      // Step 2: Assign achievements
      addLog('Etapa 2: Atribuindo conquistas...');
      const { data: achievementData, error: achievementError } = await supabase.rpc('assign_bot_achievements');
      
      if (achievementError) throw achievementError;
      
      const achievementCount = achievementData || 0;
      addLog(`✅ ${achievementCount} conquistas atribuídas`);

      setResult(`Processo completo! ${improvedCount} bots melhorados e ${achievementCount} conquistas atribuídas.`);
      
      toast({
        title: "Processo Completo!",
        description: `${improvedCount} bots melhorados, ${achievementCount} conquistas criadas`,
        variant: "default"
      });

    } catch (error: any) {
      console.error('Error in complete process:', error);
      setResult('Erro no processo completo');
      addLog(`❌ Erro: ${error.message}`);
      
      toast({
        title: "Erro",
        description: error.message || "Falha no processo completo",
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
          <Award className="h-5 w-5" />
          Gerenciador de Conquistas dos Bots
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p className="mb-4">
            Sistema completo para gerenciar e atribuir conquistas realistas aos bots:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span>Melhora streaks e combos</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span>Conquistas de nível</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <span>Conquistas de quiz</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-500" />
              <span>Conquistas de combo</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" />
              <span>Conquistas de streak</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-pink-500" />
              <span>Distribuição realista</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button 
            onClick={improveBotData} 
            disabled={improvingData || loading}
            variant="outline"
            className="h-auto py-3 flex flex-col items-center gap-2"
          >
            {improvingData && <Loader2 className="h-4 w-4 animate-spin" />}
            <TrendingUp className="h-5 w-5" />
            <div className="text-center">
              <div className="font-medium">Melhorar Dados</div>
              <div className="text-xs text-muted-foreground">
                Aumenta streaks e combos
              </div>
            </div>
          </Button>

          <Button 
            onClick={assignBotAchievements} 
            disabled={assigningAchievements || loading}
            variant="outline"
            className="h-auto py-3 flex flex-col items-center gap-2"
          >
            {assigningAchievements && <Loader2 className="h-4 w-4 animate-spin" />}
            <Trophy className="h-5 w-5" />
            <div className="text-center">
              <div className="font-medium">Atribuir Conquistas</div>
              <div className="text-xs text-muted-foreground">
                Analisa e cria conquistas
              </div>
            </div>
          </Button>

          <Button 
            onClick={runCompleteProcess} 
            disabled={loading || improvingData || assigningAchievements}
            className="h-auto py-3 flex flex-col items-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <Award className="h-5 w-5" />
            <div className="text-center">
              <div className="font-medium">Processo Completo</div>
              <div className="text-xs text-muted-foreground">
                Faz tudo automaticamente
              </div>
            </div>
          </Button>
        </div>

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
          <strong>Como funciona:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li><strong>Melhorar Dados:</strong> Aumenta streaks para 30-90 dias e adiciona sessões de quiz com combos 10+ para alguns bots</li>
            <li><strong>Atribuir Conquistas:</strong> Analisa dados dos bots e cria conquistas apropriadas baseadas em nível, quizzes, combos e streaks</li>
            <li><strong>Processo Completo:</strong> Executa ambas as etapas em sequência para máximo realismo</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}