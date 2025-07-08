import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Bot, TrendingUp, Users, Trophy, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function BotRealismEnhancer() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const enhanceBotRealism = async () => {
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('enhance-bot-realism');

      if (error) {
        throw error;
      }

      setResult('Realismo dos bots aprimorado com sucesso!');
      toast({
        title: "Sucesso",
        description: "Dados realistas foram adicionados aos bots",
        variant: "default"
      });

    } catch (error) {
      console.error('Error enhancing bot realism:', error);
      setResult('Erro ao aprimorar realismo dos bots');
      toast({
        title: "Erro",
        description: "Falha ao aprimorar realismo dos bots",
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
            Esta função adiciona dados realistas aos bots, incluindo:
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

        {result && (
          <Alert>
            <AlertDescription>{result}</AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground">
          <strong>Nota:</strong> Esta operação pode levar alguns minutos para ser concluída. 
          Ela adiciona dados históricos realistas a todos os bots do sistema, incluindo:
          sessões de quiz baseadas no nível, posts sociais, participações em leaderboards 
          semanais, conquistas apropriadas e portfolios de investimento.
        </div>
      </CardContent>
    </Card>
  );
}