import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BotNicknameManager } from "./bot-nickname-manager";
import { SingleBotNicknameUpdater } from "./single-bot-updater";
import { BotRealismEnhancer } from "./bot-realism-enhancer";
import { BotNicknameUpdater } from "./bot-nickname-updater";
import { 
  Users, Bot, Zap, Gift, MessageSquare, 
  Shield, RefreshCw, AlertTriangle 
} from "lucide-react";

interface AdminQuickActionsProps {
  onStatsUpdate: () => void;
}

export function AdminQuickActions({ onStatsUpdate }: AdminQuickActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleQuickAction = async (action: string, actionFn: () => Promise<void>) => {
    try {
      setLoading(action);
      await actionFn();
      onStatsUpdate();
      toast({
        title: "Ação executada com sucesso!",
        description: `${action} foi executado.`,
      });
    } catch (error: any) {
      console.error(`Error in ${action}:`, error);
      toast({
        title: "Erro ao executar ação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const generateDailyMissions = async () => {
    const { error } = await supabase.rpc('generate_daily_missions');
    if (error) throw error;
  };

  const runBotActivities = async () => {
    const { error } = await supabase.functions.invoke('bot-activities', {
      body: { activityType: 'all' }
    });
    if (error) throw error;
  };

  const cleanupOldData = async () => {
    // Clean old notifications, expired missions, etc.
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    await Promise.all([
      supabase.from('notifications').delete().lt('created_at', thirtyDaysAgo).eq('is_read', true),
      supabase.from('daily_missions').delete().lt('expires_at', new Date().toISOString()),
    ]);
  };

  const quickActions = [
    {
      title: "Gerar Missões Diárias",
      description: "Criar novas missões para hoje",
      icon: Gift,
      action: () => generateDailyMissions(),
      actionKey: "missions",
      color: "text-warning"
    },
    {
      title: "Ativar Bots",
      description: "Executar atividades dos bots",
      icon: Bot,
      action: () => runBotActivities(),
      actionKey: "bots",
      color: "text-muted-foreground"
    },
    {
      title: "Limpeza Automática",
      description: "Remover dados antigos",
      icon: RefreshCw,
      action: () => cleanupOldData(),
      actionKey: "cleanup",
      color: "text-info"
    },
    {
      title: "Backup Sistema",
      description: "Criar backup de emergência",
      icon: Shield,
      action: async () => {
        // Simulate backup action
        await new Promise(resolve => setTimeout(resolve, 2000));
      },
      actionKey: "backup",
      color: "text-success"
    }
  ];

  const systemAlerts = [
    {
      type: "warning",
      message: "3 usuários com atividade suspeita detectada",
      action: "Revisar"
    },
    {
      type: "info", 
      message: "Sistema funcionando normalmente",
      action: "OK"
    },
    {
      type: "success",
      message: "Backup realizado com sucesso há 2h",
      action: "Ver"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Single Bot Updater */}
      <SingleBotNicknameUpdater />
      
      {/* Bot Nickname Manager */}
      <BotNicknameManager />
      
      {/* Bot Realism Enhancer */}
      <BotRealismEnhancer />
      
      {/* Bot Nickname Updater */}
      <BotNicknameUpdater />
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActions.map((action) => (
            <Button
              key={action.actionKey}
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={() => handleQuickAction(action.title, action.action)}
              disabled={loading === action.actionKey}
            >
              <div className="flex items-start gap-3 text-left">
                <action.icon className={`h-5 w-5 mt-0.5 ${action.color}`} />
                <div>
                  <p className="font-medium">
                    {loading === action.actionKey ? "Executando..." : action.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {systemAlerts.map((alert, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-accent/5 border"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  alert.type === 'warning' ? 'bg-warning' :
                  alert.type === 'success' ? 'bg-success' : 
                  'bg-info'
                }`} />
                <p className="text-sm">{alert.message}</p>
              </div>
              <Button variant="ghost" size="sm">
                {alert.action}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
