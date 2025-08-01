import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import { supabase } from "@/integrations/supabase/client";
import { AdminAuthProtection } from "@/components/admin-auth-protection";
import { AdminSidebar } from "@/components/features/admin/admin-sidebar";
import { 
  FileText,
  RefreshCw,
  Calendar,
  User,
  Building2,
  TrendingUp,
  TrendingDown
} from "lucide-react";


interface PowerLog {
  id: string;
  district_id: string | null;
  user_id: string | null;
  action_type: string;
  power_type: string;
  power_change: number;
  previous_value: number;
  new_value: number;
  created_at: string;
  districts: { name: string; color_primary: string } | null;
  profiles: { username: string } | null;
}

interface District {
  id: string;
  name: string;
  color_primary: string;
}

export default function AdminDistrictPowerLogs() {
  const { t } = useI18n();
  const [logs, setLogs] = useState<PowerLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [districts, setDistricts] = useState<District[]>([]);
  const { toast } = useToast();

  const actionTypes = [
    'quiz_investimentos',
    'duelo_risco',
    'doacao_btz',
    'quiz_tecnologia',
    'missao_energia',
    'transacao_comercial',
    'quiz_distrito',
    'participacao_duelo'
  ];

  const powerTypeLabels: Record<string, string> = {
    'monetary_power': 'Monetário',
    'tech_power': 'Tecnológico',
    'military_power': 'Militar',
    'energy_power': 'Energético',
    'commercial_power': 'Comercial',
    'social_power': 'Social'
  };

  const loadDistricts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('districts')
        .select('id, name, color_primary')
        .order('name');

      if (error) throw error;
      setDistricts(data || []);
    } catch (error) {
      console.error('Error loading districts:', error);
    }
  }, []);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('district_power_logs')
        .select(`
          id,
          district_id,
          user_id,
          action_type,
          power_type,
          power_change,
          previous_value,
          new_value,
          created_at,
          districts(name, color_primary),
          profiles(username)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs((data as unknown as PowerLog[]) || []);
    } catch (error) {
      console.error('Error loading logs:', error);
      toast({
        title: "Erro ao carregar logs",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadLogs();
    loadDistricts();
  }, [loadLogs, loadDistricts]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <AdminAuthProtection>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
                  Logs de Poder dos Distritos
                </h1>
                <p className="text-muted-foreground">
                  Histórico de mudanças nos poderes dos distritos
                </p>
              </div>
              <Button onClick={loadLogs} disabled={loading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                {loading ? "Carregando..." : "Atualizar"}
              </Button>
            </div>


            {loading ? (
              <div className="text-center py-8">Carregando logs...</div>
            ) : (
              <div className="space-y-4">
                {logs.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">Nenhum log encontrado</p>
                    </CardContent>
                  </Card>
                ) : (
                  logs.map((log) => (
                    <Card key={log.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Building2 
                                className="w-4 h-4" 
                                style={{ color: log.districts?.color_primary || '#666' }}
                              />
                              <span className="font-medium">
                                {log.districts?.name || 'Distrito Desconhecido'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {log.profiles?.username || 'Usuário Desconhecido'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {formatDate(log.created_at)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Badge variant="outline">
                              {log.action_type.replace('_', ' ').toUpperCase()}
                            </Badge>
                            
                            <span className="text-sm">
                              <strong>{powerTypeLabels[log.power_type] || log.power_type}</strong>
                            </span>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {log.previous_value}%
                              </span>
                              
                              {log.power_change > 0 ? (
                                <TrendingUp className="w-4 h-4 text-green-500" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-500" />
                              )}
                              
                              <span className="text-sm font-medium">
                                {log.new_value}%
                              </span>
                              
                              <Badge 
                                variant={log.power_change > 0 ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {log.power_change > 0 ? '+' : ''}{log.power_change}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminAuthProtection>
  );
}
