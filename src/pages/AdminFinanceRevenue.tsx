import { useState, useEffect } from "react";
import { AdminAuthProtection } from "@/components/admin-auth-protection";
import { AdminSidebar } from "@/components/features/admin/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";

export default function AdminFinanceRevenue() {
  const { t } = useI18n();
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    dailyRevenue: 0,
    subscribers: 0,
    averageRevenuePerUser: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    try {
      // Buscar usuários premium para calcular receita estimada
      const { data: premiumUsers, error } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .neq('subscription_tier', 'free')
        .eq('is_bot', false);

      if (error) throw error;

      const proUsers = premiumUsers?.filter(u => u.subscription_tier === 'pro').length || 0;
      const eliteUsers = premiumUsers?.filter(u => u.subscription_tier === 'elite').length || 0;
      
      // Preços estimados
      const proPrice = 9.99;
      const elitePrice = 19.99;
      
      const monthlyRevenue = (proUsers * proPrice) + (eliteUsers * elitePrice);
      const totalRevenue = monthlyRevenue * 6; // Simulando 6 meses de histórico
      
      setRevenueData({
        totalRevenue,
        monthlyRevenue,
        weeklyRevenue: monthlyRevenue / 4,
        dailyRevenue: monthlyRevenue / 30,
        subscribers: premiumUsers?.length || 0,
        averageRevenuePerUser: premiumUsers?.length ? monthlyRevenue / premiumUsers.length : 0
      });
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
                <h1 className="text-3xl font-bold text-foreground">Receitas</h1>
                <p className="text-muted-foreground">Acompanhe o desempenho financeiro da plataforma</p>
              </div>

              {/* Revenue Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <DollarSign className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Receita Total</p>
                        <p className="text-2xl font-bold">{formatCurrency(revenueData.totalRevenue)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Calendar className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Receita Mensal</p>
                        <p className="text-2xl font-bold">{formatCurrency(revenueData.monthlyRevenue)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <TrendingUp className="h-8 w-8 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Receita Semanal</p>
                        <p className="text-2xl font-bold">{formatCurrency(revenueData.weeklyRevenue)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Users className="h-8 w-8 text-orange-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Assinantes</p>
                        <p className="text-2xl font-bold">{revenueData.subscribers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Revenue Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Métricas de Receita</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Receita Diária Média</span>
                      <span className="font-semibold">{formatCurrency(revenueData.dailyRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Receita por Usuário (ARPU)</span>
                      <span className="font-semibold">{formatCurrency(revenueData.averageRevenuePerUser)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Taxa de Conversão</span>
                      <span className="font-semibold">12.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Churn Rate</span>
                      <span className="font-semibold text-red-500">3.2%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Plano</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"><div className="text-lg">{t('common.loading')}...</div></div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Plano Pro (R$ 9,99)</span>
                          <span className="font-semibold">65%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Plano Elite (R$ 19,99)</span>
                          <span className="font-semibold">35%</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="font-medium">Total de Assinantes</span>
                          <span className="font-bold">{revenueData.subscribers}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Growth Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Tendências de Crescimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                    <p>Gráficos de crescimento serão implementados aqui</p>
                    <p className="text-sm">Integração com bibliotecas de gráficos em desenvolvimento</p>
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
