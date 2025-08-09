import { useState, useEffect } from "react";
import { AdminAuthProtection } from "@/components/admin-auth-protection";
import { AdminSidebar } from "@/components/features/admin/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Shield, AlertTriangle, Ban, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";

export default function AdminUsersModeration() {
  const { t } = useI18n();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      // Simulando dados de moderação
      const mockReports = [
        {
          id: '1',
          reported_user: 'Usuario123',
          reporter: 'UserModerador',
          reason: 'Spam',
          status: 'pending',
          created_at: new Date().toISOString(),
          description: 'Usuário enviando mensagens repetitivas no chat'
        },
        {
          id: '2',
          reported_user: 'TrollerUser',
          reporter: 'UserLegal',
          reason: 'Comportamento inadequado',
          status: 'reviewed',
          created_at: new Date().toISOString(),
          description: 'Comportamento tóxico nos duelos'
        }
      ];
      
      setReports(mockReports);
    } catch (error: any) {
      toast({
        title: t('errors.error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (reportId: string, action: 'approve' | 'reject' | 'ban') => {
    try {
      // Aqui você implementaria a lógica de moderação
      toast({
        title: "Ação executada",
        description: `Relatório ${action === 'approve' ? 'aprovado' : action === 'reject' ? 'rejeitado' : 'usuário banido'}`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const stats = {
    pending: reports.filter(r => r.status === 'pending').length,
    reviewed: reports.filter(r => r.status === 'reviewed').length,
    total: reports.length
  };

  return (
    <AdminAuthProtection>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-foreground">Moderação</h1>
                <p className="text-muted-foreground">Gerencie relatórios e moderação de usuários</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <AlertTriangle className="h-8 w-8 text-yellow-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Pendentes</p>
                        <p className="text-2xl font-bold">{stats.pending}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Resolvidos</p>
                        <p className="text-2xl font-bold">{stats.reviewed}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Shield className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reports List */}
              <Card>
                <CardHeader>
                  <CardTitle>Relatórios de Moderação</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"><div className="text-lg">{t('common.loading')}...</div></div>
                  ) : (
                    <div className="space-y-4">
                      {reports.map((report) => (
                        <div key={report.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">Usuário: {report.reported_user}</h3>
                                <Badge variant={report.status === 'pending' ? 'destructive' : 'default'}>
                                  {report.status === 'pending' ? 'Pendente' : 'Revisado'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Reportado por: {report.reporter}
                              </p>
                              <p className="text-sm">
                                <strong>Motivo:</strong> {report.reason}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {report.description}
                              </p>
                            </div>
                            
                            {report.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleAction(report.id, 'reject')}
                                >
                                  Rejeitar
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleAction(report.id, 'ban')}
                                >
                                  <Ban className="h-4 w-4 mr-1" />
                                  Banir
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => handleAction(report.id, 'approve')}
                                >
                                  Aprovar
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminAuthProtection>
  );
}
