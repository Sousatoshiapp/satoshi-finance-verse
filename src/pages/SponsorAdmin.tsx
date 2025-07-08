import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminPasswordProtection } from "@/components/admin-password-protection";
import { 
  Building2, BarChart3, Calendar, Store, Users, TrendingUp,
  DollarSign, Target, Crown, Zap, Settings
} from "lucide-react";

interface SponsorAccess {
  id: string;
  district: {
    id: string;
    name: string;
    color_primary: string;
    sponsor_company: string;
  };
  access_level: string;
  permissions: any;
}

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  storeRevenue: number;
  eventsCreated: number;
  engagement: number;
}

export default function SponsorAdmin() {
  const [sponsorAccess, setSponsorAccess] = useState<SponsorAccess[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSponsorAccess();
  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      loadAnalytics(selectedDistrict);
    }
  }, [selectedDistrict]);

  const loadSponsorAccess = async () => {
    try {
      const { data, error } = await supabase
        .from('sponsor_admin_access')
        .select(`
          id,
          access_level,
          permissions,
          district:districts(
            id,
            name,
            color_primary,
            sponsor_company
          )
        `)
        .eq('is_active', true);

      if (error) throw error;

      setSponsorAccess(data || []);
      if (data && data.length > 0) {
        setSelectedDistrict(data[0].district.id);
      }
    } catch (error: any) {
      console.error('Error loading sponsor access:', error);
      toast({
        title: "Erro ao carregar acesso",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async (districtId: string) => {
    try {
      // Get user count for district
      const { count: totalUsers } = await supabase
        .from('user_districts')
        .select('*', { count: 'exact', head: true })
        .eq('district_id', districtId);

      // Get active users (last 7 days)
      const { count: activeUsers } = await supabase
        .from('user_districts')
        .select('*', { count: 'exact', head: true })
        .eq('district_id', districtId)
        .gte('joined_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Get store revenue from store items
      const { data: storeData } = await supabase
        .from('user_store_purchases')
        .select(`
          store_item:district_store_items(price_beetz)
        `)
        .not('store_item', 'is', null);

      const storeRevenue = storeData?.reduce((sum, purchase: any) => 
        sum + (purchase.store_item?.price_beetz || 0), 0) || 0;

      // Get events count
      const { count: eventsCreated } = await supabase
        .from('sponsor_events')
        .select('*', { count: 'exact', head: true })
        .eq('district_id', districtId);

      setAnalytics({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        storeRevenue,
        eventsCreated: eventsCreated || 0,
        engagement: activeUsers && totalUsers ? Math.round((activeUsers / totalUsers) * 100) : 0
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const getAccessBadgeColor = (level: string) => {
    switch (level) {
      case 'owner': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black';
      case 'manager': return 'bg-gradient-to-r from-blue-500 to-purple-600 text-white';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando painel de patrocinadores...</p>
        </div>
      </div>
    );
  }

  if (sponsorAccess.length === 0) {
    return (
      <AdminPasswordProtection>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-2xl w-full">
            <CardContent className="p-8 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-bold mb-2">Acesso Negado</h2>
              <p className="text-muted-foreground mb-6">
                Você não possui acesso administrativo a nenhum distrito patrocinado.
              </p>
              <div className="text-sm text-muted-foreground mb-4">
                Para configurar acessos de sponsor admin, acesse:
              </div>
              <Button 
                onClick={() => window.location.href = '/admin/settings'}
                className="mb-4"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurações do Sistema
              </Button>
              <div className="text-xs text-muted-foreground">
                Procure pela seção "Gerenciamento de Acesso de Sponsors"
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminPasswordProtection>
    );
  }

  const selectedDistrictData = sponsorAccess.find(access => access.district.id === selectedDistrict);

  return (
    <AdminPasswordProtection>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
              Painel de Patrocinadores
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus distritos patrocinados e analise o desempenho
            </p>
          </div>

          {/* District Selector */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-3">
              {sponsorAccess.map((access) => (
                <Button
                  key={access.id}
                  variant={selectedDistrict === access.district.id ? "default" : "outline"}
                  onClick={() => setSelectedDistrict(access.district.id)}
                  className="flex items-center gap-2"
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: access.district.color_primary }}
                  />
                  {access.district.name}
                  <Badge className={getAccessBadgeColor(access.access_level)}>
                    {access.access_level}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {selectedDistrictData && (
            <Tabs defaultValue="analytics" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="store">Loja</TabsTrigger>
                <TabsTrigger value="events">Eventos</TabsTrigger>
                <TabsTrigger value="users">Usuários</TabsTrigger>
              </TabsList>

              <TabsContent value="analytics" className="space-y-6">
                {analytics && (
                  <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center">
                            <Users className="h-8 w-8 text-blue-600" />
                            <div className="ml-2">
                              <p className="text-sm font-medium text-muted-foreground">Total Usuários</p>
                              <p className="text-2xl font-bold">{analytics.totalUsers}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center">
                            <TrendingUp className="h-8 w-8 text-green-600" />
                            <div className="ml-2">
                              <p className="text-sm font-medium text-muted-foreground">Usuários Ativos</p>
                              <p className="text-2xl font-bold">{analytics.activeUsers}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center">
                            <DollarSign className="h-8 w-8 text-green-600" />
                            <div className="ml-2">
                              <p className="text-sm font-medium text-muted-foreground">Receita Loja</p>
                              <p className="text-2xl font-bold">₿{analytics.storeRevenue}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center">
                            <Calendar className="h-8 w-8 text-purple-600" />
                            <div className="ml-2">
                              <p className="text-sm font-medium text-muted-foreground">Eventos</p>
                              <p className="text-2xl font-bold">{analytics.eventsCreated}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center">
                            <Target className="h-8 w-8 text-orange-600" />
                            <div className="ml-2">
                              <p className="text-sm font-medium text-muted-foreground">Engajamento</p>
                              <p className="text-2xl font-bold">{analytics.engagement}%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Charts Placeholder */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Crescimento de Usuários</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64 flex items-center justify-center text-muted-foreground">
                            <BarChart3 className="w-16 h-16 mb-2" />
                            <p>Gráfico de crescimento em desenvolvimento</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Receita da Loja</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64 flex items-center justify-center text-muted-foreground">
                            <DollarSign className="w-16 h-16 mb-2" />
                            <p>Gráfico de receita em desenvolvimento</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="store">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="w-5 h-5" />
                      Gerenciamento da Loja
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Interface de gerenciamento da loja em desenvolvimento
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="events">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Eventos e Promoções
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Interface de gerenciamento de eventos em desenvolvimento
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Gestão de Usuários
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Interface de gestão de usuários em desenvolvimento
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </AdminPasswordProtection>
  );
}