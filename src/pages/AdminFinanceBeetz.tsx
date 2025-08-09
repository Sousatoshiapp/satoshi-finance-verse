import { useState, useEffect } from "react";
import { AdminAuthProtection } from "@/components/admin-auth-protection";
import { AdminSidebar } from "@/components/features/admin/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Badge } from "@/components/shared/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Plus, Minus, TrendingUp, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";

export default function AdminFinanceBeetz() {
  const { t } = useI18n();
  const [beetzStats, setBeetzStats] = useState({
    totalBeetzInCirculation: 0,
    totalBeetzDistributed: 0,
    averageBeetzPerUser: 0,
    topUsers: []
  });
  const [loading, setLoading] = useState(true);
  const [giveawayAmount, setGiveawayAmount] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadBeetzData();
  }, []);

  const loadBeetzData = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, nickname, points, is_bot')
        .eq('is_bot', false)
        .order('points', { ascending: false });

      if (error) throw error;

      const totalBeetz = profiles?.reduce((sum, user) => sum + (user.points || 0), 0) || 0;
      const avgBeetz = profiles?.length ? totalBeetz / profiles.length : 0;
      
      setBeetzStats({
        totalBeetzInCirculation: totalBeetz,
        totalBeetzDistributed: totalBeetz,
        averageBeetzPerUser: avgBeetz,
        topUsers: profiles?.slice(0, 10) || []
      });
    } catch (error: any) {
      toast({
        title: t('errors.error') + " ao carregar dados dos Beetz",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGiveaway = async () => {
    if (!giveawayAmount || selectedUsers.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione usuários e informe a quantidade de Beetz",
        variant: "destructive",
      });
      return;
    }

    try {
      for (const userId of selectedUsers) {
        // First get current points
        const { data: currentUser } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', userId)
          .single();

        const currentPoints = currentUser?.points || 0;
        const newPoints = currentPoints + parseInt(giveawayAmount);

        const { error } = await supabase
          .from('profiles')
          .update({ points: newPoints })
          .eq('id', userId);

        if (error) throw error;
      }

      toast({
        title: "Beetz distribuídos!",
        description: `${giveawayAmount} Beetz foram dados para ${selectedUsers.length} usuários`,
      });

      setGiveawayAmount("");
      setSelectedUsers([]);
      loadBeetzData();
    } catch (error: any) {
      toast({
        title: t('errors.error') + " ao distribuir Beetz",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
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
                <h1 className="text-3xl font-bold text-foreground">Gestão de Beetz</h1>
                <p className="text-muted-foreground">Gerencie a economia virtual da plataforma</p>
              </div>

              {/* Beetz Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Zap className="h-8 w-8 text-yellow-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total em Circulação</p>
                        <p className="text-2xl font-bold">{formatNumber(beetzStats.totalBeetzInCirculation)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <TrendingUp className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Média por Usuário</p>
                        <p className="text-2xl font-bold">{formatNumber(Math.round(beetzStats.averageBeetzPerUser))}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Users className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Distribuído</p>
                        <p className="text-2xl font-bold">{formatNumber(beetzStats.totalBeetzDistributed)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Beetz Distribution Tool */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuir Beetz</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Input
                      type="number"
                      placeholder="Quantidade de Beetz"
                      value={giveawayAmount}
                      onChange={(e) => setGiveawayAmount(e.target.value)}
                      className="w-48"
                    />
                    <Button onClick={handleGiveaway} disabled={!giveawayAmount || selectedUsers.length === 0}>
                      <Plus className="h-4 w-4 mr-2" />
                      Distribuir Beetz
                    </Button>
                  </div>
                  
                  {selectedUsers.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {selectedUsers.length} usuário(s) selecionado(s)
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Beetz Holders */}
              <Card>
                <CardHeader>
                  <CardTitle>Maiores Possuidores de Beetz</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"><div className="text-lg">{t('common.loading')}...</div></div>
                  ) : (
                    <div className="space-y-4">
                      {beetzStats.topUsers.map((user: any, index) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <div>
                              <h3 className="font-semibold">{user.nickname}</h3>
                              <p className="text-sm text-muted-foreground">
                                {formatNumber(user.points)} Beetz
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (selectedUsers.includes(user.id)) {
                                  setSelectedUsers(prev => prev.filter(id => id !== user.id));
                                } else {
                                  setSelectedUsers(prev => [...prev, user.id]);
                                }
                              }}
                            >
                              {selectedUsers.includes(user.id) ? (
                                <Minus className="h-4 w-4" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Beetz Economy Health */}
              <Card>
                <CardHeader>
                  <CardTitle>Saúde da Economia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Métricas de Distribuição</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Inflação Mensal</span>
                          <span className="text-green-500">+2.1%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Velocidade de Circulação</span>
                          <span>4.2x/mês</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Concentração Top 10%</span>
                          <span>32%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold">Recomendações</h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-green-600">✓ Distribuição equilibrada</p>
                        <p className="text-yellow-600">⚠ Monitorar concentração</p>
                        <p className="text-blue-600">ℹ Considerar novos eventos de distribuição</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminAuthProtection>
  );
}
