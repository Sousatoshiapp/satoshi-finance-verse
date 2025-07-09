import { useState, useEffect } from "react";
import { AdminPasswordProtection } from "@/components/admin-password-protection";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Star, Users, Calendar, TrendingUp, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminFinanceSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('subscription_tier', 'free')
        .eq('is_bot', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(profiles || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar assinaturas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_tier: 'free',
          subscription_expires_at: null 
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Assinatura cancelada",
        description: "A assinatura foi cancelada com sucesso",
      });

      loadSubscriptions();
    } catch (error: any) {
      toast({
        title: "Erro ao cancelar assinatura",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const stats = {
    total: subscriptions.length,
    pro: subscriptions.filter(s => s.subscription_tier === 'pro').length,
    elite: subscriptions.filter(s => s.subscription_tier === 'elite').length,
    monthlyRevenue: subscriptions.reduce((sum, s) => {
      return sum + (s.subscription_tier === 'pro' ? 9.99 : s.subscription_tier === 'elite' ? 19.99 : 0);
    }, 0)
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <AdminPasswordProtection>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-foreground">Assinaturas</h1>
                <p className="text-muted-foreground">Gerencie assinaturas e planos premium</p>
              </div>

              {/* Subscription Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Users className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total de Assinantes</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Star className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Plano Pro</p>
                        <p className="text-2xl font-bold">{stats.pro}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Crown className="h-8 w-8 text-yellow-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Plano Elite</p>
                        <p className="text-2xl font-bold">{stats.elite}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <TrendingUp className="h-8 w-8 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Receita Mensal</p>
                        <p className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Subscription Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Assinaturas</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Carregando...</div>
                  ) : (
                    <div className="space-y-4">
                      {subscriptions.map((subscription) => (
                        <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div>
                              <h3 className="font-semibold flex items-center gap-2">
                                {subscription.nickname}
                                {subscription.subscription_tier === 'elite' && <Crown className="h-4 w-4 text-yellow-500" />}
                                {subscription.subscription_tier === 'pro' && <Star className="h-4 w-4 text-blue-500" />}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Nível {subscription.level}</span>
                                <span>•</span>
                                <span>{subscription.xp} XP</span>
                                <span>•</span>
                                <Calendar className="h-3 w-3" />
                                <span>Desde {new Date(subscription.created_at).toLocaleDateString('pt-BR')}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <Badge variant={subscription.subscription_tier === 'elite' ? 'default' : 'secondary'}>
                                {subscription.subscription_tier.toUpperCase()}
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-1">
                                {formatCurrency(subscription.subscription_tier === 'pro' ? 9.99 : 19.99)}/mês
                              </p>
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelSubscription(subscription.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Subscription Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Métricas de Retenção</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Taxa de Churn Mensal</span>
                      <span className="font-semibold text-red-500">3.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Valor de Vida do Cliente (LTV)</span>
                      <span className="font-semibold">{formatCurrency(240)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Tempo Médio de Assinatura</span>
                      <span className="font-semibold">8.4 meses</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Taxa de Upgrade</span>
                      <span className="font-semibold text-green-500">12%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição de Planos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-blue-500" />
                          <span>Plano Pro</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{stats.pro}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({((stats.pro / stats.total) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-yellow-500" />
                          <span>Plano Elite</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{stats.elite}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({((stats.elite / stats.total) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Receita Total Mensal</span>
                        <span className="font-bold text-green-600">{formatCurrency(stats.monthlyRevenue)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminPasswordProtection>
  );
}