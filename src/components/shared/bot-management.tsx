import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Users, Activity, Zap, Trophy, MessageSquare } from "lucide-react";

export function BotManagement() {
  const [loading, setLoading] = useState(false);
  const [batchSize, setBatchSize] = useState(100);
  const [stats, setStats] = useState({
    totalBots: 0,
    activeBots: 0,
    lastActivity: null
  });
  const { toast } = useToast();

  const generateBots = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-bots', {
        body: { batchSize }
      });

      if (error) throw error;

      toast({
        title: "Bots Gerados com Sucesso!",
        description: `${data.botsGenerated} novos bots foram criados e estão ativos.`,
      });

      await loadStats();
    } catch (error: any) {
      console.error('Error generating bots:', error);
      toast({
        title: "Erro ao Gerar Bots",
        description: error.message || "Falha ao criar bots",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const runBotActivities = async (activityType = 'all') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bot-activities', {
        body: { activityType }
      });

      if (error) throw error;

      toast({
        title: "Atividades dos Bots Executadas!",
        description: `${data.activeBots} bots realizaram atividades.`,
      });

      await loadStats();
    } catch (error: any) {
      console.error('Error running bot activities:', error);
      toast({
        title: "Erro nas Atividades dos Bots",
        description: error.message || "Falha ao executar atividades",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get total bots count
      const { count: totalBots } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_bot', true);

      // Get recent activity count
      const { count: activeBots } = await supabase
        .from('bot_activity_log')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Get last activity
      const { data: lastActivity } = await supabase
        .from('bot_activity_log')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setStats({
        totalBots: totalBots || 0,
        activeBots: activeBots || 0,
        lastActivity: lastActivity?.created_at || null
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Gerenciamento de Bots
          <Badge variant="outline" className="bg-primary/10">
            Sistema Automatizado
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total de Bots</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalBots}</div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Ativos (24h)</span>
            </div>
            <div className="text-2xl font-bold">{stats.activeBots}</div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Última Atividade</span>
            </div>
            <div className="text-sm">
              {stats.lastActivity 
                ? new Date(stats.lastActivity).toLocaleString('pt-BR')
                : 'Nenhuma'
              }
            </div>
          </div>
        </div>

        {/* Generation */}
        <div className="space-y-4">
          <h3 className="font-semibold">Gerar Novos Bots</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Quantidade de bots"
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                min={1}
                max={500}
              />
            </div>
            <Button 
              onClick={generateBots}
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? "Gerando..." : "Gerar Bots"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Cria bots com perfis únicos, níveis variados e atividade inicial no ranking semanal.
          </p>
        </div>

        {/* Activities */}
        <div className="space-y-4">
          <h3 className="font-semibold">Executar Atividades dos Bots</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              variant="outline"
              onClick={() => runBotActivities('all')}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              Todas
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => runBotActivities('quiz')}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Trophy className="h-4 w-4" />
              Quizzes
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => runBotActivities('duel')}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Duelos
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => runBotActivities('social')}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Social
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Simula atividades realistas: quizzes, duelos, posts sociais e streaks.
          </p>
        </div>

        {/* Auto Refresh Stats */}
        <div className="flex justify-between items-center pt-4 border-t">
          <span className="text-sm text-muted-foreground">
            Sistema de bots ativo e funcionando
          </span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={loadStats}
            disabled={loading}
          >
            Atualizar Stats
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}