import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Users, Activity, Zap, Trophy, MessageSquare, RefreshCw } from "lucide-react";
import { AdminAuthProtection } from "@/components/admin-auth-protection";

export default function BotAdmin() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [generatingBots, setGeneratingBots] = useState(false);
  const [batchSize, setBatchSize] = useState(500);
  const [stats, setStats] = useState({
    totalBots: 0,
    totalProfiles: 0,
    weeklyEntries: 0,
    lastActivity: null
  });
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const generateAllBots = async () => {
    setGeneratingBots(true);
    try {
      const totalBatches = Math.ceil(3000 / batchSize);
      let totalGenerated = 0;

      for (let i = 0; i < totalBatches; i++) {
        const currentBatchSize = Math.min(batchSize, 3000 - totalGenerated);
        
        toast({
          title: `Gerando Lote ${i + 1}/${totalBatches}`,
          description: `Criando ${currentBatchSize} bots...`,
        });

        const { data, error } = await supabase.functions.invoke('generate-bots', {
          body: { batchSize: currentBatchSize }
        });

        if (error) throw error;

        totalGenerated += data.botsGenerated || 0;
        
        // Small delay between batches to avoid overwhelming the system
        if (i < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      toast({
        title: "✅ 3000 Bots Criados com Sucesso!",
        description: `${totalGenerated} bots foram criados e estão ativos no ranking.`,
      });

      await loadStats();
    } catch (error: any) {
      console.error('Error generating bots:', error);
      toast({
        title: t('errors.error') + " ao Gerar Bots",
        description: error.message || "Falha ao criar bots",
        variant: "destructive",
      });
    } finally {
      setGeneratingBots(false);
    }
  };

  const runBotActivities = async (activityType = 'all') => {
    setLoading(true);
    try {
      // Run activities in multiple batches to handle all bots
      const batches = 5; // Process bots in 5 batches
      let totalActiveBots = 0;

      for (let i = 0; i < batches; i++) {
        const { data, error } = await supabase.functions.invoke('bot-activities', {
          body: { activityType, batchOffset: i * 600 } // 600 bots per batch
        });

        if (error) throw error;
        totalActiveBots += data.activeBots || 0;
      }

      toast({
        title: "Atividades dos Bots Executadas!",
        description: `${totalActiveBots} bots realizaram atividades.`,
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

      // Get total profiles
      const { count: totalProfiles } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get weekly leaderboard entries
      const { count: weeklyEntries } = await supabase
        .from('weekly_leaderboards')
        .select('*', { count: 'exact', head: true });

      // Get last activity
      const { data: lastActivity } = await supabase
        .from('bot_activity_log')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setStats({
        totalBots: totalBots || 0,
        totalProfiles: totalProfiles || 0,
        weeklyEntries: weeklyEntries || 0,
        lastActivity: lastActivity?.created_at || null
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const clearAllBots = async () => {
    if (!confirm('Tem certeza que deseja excluir TODOS os bots? Esta ação não pode ser desfeita.')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('is_bot', true);

      if (error) throw error;

      toast({
        title: "Bots Removidos",
        description: "Todos os bots foram excluídos do sistema.",
      });

      await loadStats();
    } catch (error: any) {
      console.error('Error clearing bots:', error);
      toast({
        title: t('errors.error') + " ao Remover Bots",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthProtection>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Administração de Bots</h1>
            <p className="text-muted-foreground">Gerencie os usuários robôs do sistema</p>
          </div>
          <Button onClick={loadStats} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Total de Bots</span>
              </div>
              <div className="text-3xl font-bold">{stats.totalBots}</div>
              <div className="text-xs text-muted-foreground">Meta: 3,000</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-green-500" />
                <span className="font-medium">Total Perfis</span>
              </div>
              <div className="text-3xl font-bold">{stats.totalProfiles}</div>
              <div className="text-xs text-muted-foreground">Bots + Usuários reais</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">No Ranking</span>
              </div>
              <div className="text-3xl font-bold">{stats.weeklyEntries}</div>
              <div className="text-xs text-muted-foreground">Entradas semanais</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Última Atividade</span>
              </div>
              <div className="text-sm font-bold">
                {stats.lastActivity 
                  ? new Date(stats.lastActivity).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Nenhuma'
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Generate Bots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Gerar 3000 Bots
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Tamanho do lote"
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                    min={100}
                    max={1000}
                  />
                </div>
                <Badge variant="outline">
                  {Math.ceil(3000 / batchSize)} lotes
                </Badge>
              </div>

              <Button 
                onClick={generateAllBots}
                disabled={generatingBots || stats.totalBots >= 3000}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                {generatingBots ? "Gerando Bots..." : "🚀 Gerar 3000 Bots"}
              </Button>

              <p className="text-sm text-muted-foreground">
                Cria 3000 bots com perfis únicos, níveis variados (1-50) e atividade inicial no ranking semanal.
              </p>

              {stats.totalBots >= 3000 && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-600">
                    ✅ Meta de 3000 bots atingida!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bot Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Atividades dos Bots
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
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

                <Button 
                  onClick={() => runBotActivities('all')}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Activity className="h-4 w-4" />
                  Todas
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Simula atividades realistas para manter o engajamento e competição ativa.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-600">Zona de Perigo</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive"
              onClick={clearAllBots}
              disabled={loading || stats.totalBots === 0}
            >
              🗑️ Excluir Todos os Bots
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Remove permanentemente todos os bots do sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminAuthProtection>
  );
}
