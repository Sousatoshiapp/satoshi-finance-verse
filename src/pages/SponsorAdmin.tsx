import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import { AdminAuthProtection } from "@/components/admin-auth-protection";
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
  const { t } = useI18n();
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
      // Verificar se o usuário tem acesso admin (já passou pela senha administrativa)
      const hasAdminAccess = localStorage.getItem("admin_access_granted") === "true";
      
      if (hasAdminAccess) {
        // Admin tem acesso a todos os distritos como owner
        const { data: allDistricts, error: districtsError } = await supabase
          .from('districts')
          .select('id, name, color_primary, sponsor_company')
          .eq('is_active', true);

        if (districtsError) throw districtsError;

        // Criar acesso virtual para todos os distritos
        const adminAccess = allDistricts?.map(district => ({
          id: `admin-${district.id}`,
          district: district,
          access_level: 'owner' as const,
          permissions: {
            view_analytics: true,
            manage_store: true,
            manage_events: true
          }
        })) || [];

        setSponsorAccess(adminAccess);
        if (adminAccess.length > 0) {
          setSelectedDistrict(adminAccess[0].district.id);
        }
      } else {
        // Usuário comum - verificar acesso específico
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
      }
    } catch (error: any) {
      console.error('Error loading sponsor access:', error);
      toast({
        title: t('errors.loadAccessError'),
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
          <p className="text-muted-foreground">{t('common.loading')}...</p>
        </div>
      </div>
    );
  }

  if (sponsorAccess.length === 0) {
    return (
      <AdminAuthProtection>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-2xl w-full">
            <CardContent className="p-8 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-bold mb-2">{t('errors.accessDenied')}</h2>
              <p className="text-muted-foreground mb-6">
                {t('admin.noSponsorAccess')}
              </p>
              <div className="text-sm text-muted-foreground mb-4">
                {t('admin.configureAccess')}
              </div>
              <Button
                onClick={() => window.location.href = '/admin/settings'}
                className="mb-4"
              >
                <Settings className="w-4 h-4 mr-2" />
                {t('admin.systemSettings')}
              </Button>
              <div className="text-xs text-muted-foreground">
                {t('admin.lookForSection')}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminAuthProtection>
    );
  }

  const selectedDistrictData = sponsorAccess.find(access => access.district.id === selectedDistrict);

  return (
    <AdminAuthProtection>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
                  {t('admin.sponsorPanel')}
                </h1>
                <p className="text-muted-foreground">
                  {t('admin.manageSponsoredDistricts')}
                </p>
              </div>
              
              {/* Admin Access Indicator */}
              {localStorage.getItem("admin_access_granted") === "true" && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
                  <Crown className="w-3 h-3 mr-1" />
                  {t('admin.fullAdminAccess')}
                </Badge>
              )}
            </div>
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
                <TabsTrigger value="store">{t('store.store')}</TabsTrigger>
                <TabsTrigger value="events">{t('admin.events')}</TabsTrigger>
                <TabsTrigger value="users">{t('profile.userProfile')}</TabsTrigger>
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
                              <p className="text-sm font-medium text-muted-foreground">{t('admin.totalUsers')}</p>
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
                              <p className="text-sm font-medium text-muted-foreground">{t('admin.activeUsers')}</p>
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
                              <p className="text-sm font-medium text-muted-foreground">{t('admin.storeRevenue')}</p>
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
                              <p className="text-sm font-medium text-muted-foreground">{t('admin.events')}</p>
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
                              <p className="text-sm font-medium text-muted-foreground">{t('admin.engagement')}</p>
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
                          <CardTitle>{t('admin.userGrowth')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64 flex items-center justify-center text-muted-foreground">
                            <BarChart3 className="w-16 h-16 mb-2" />
                            <p>{t('admin.growthChartInDevelopment')}</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>{t('admin.storeRevenue')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64 flex items-center justify-center text-muted-foreground">
                            <DollarSign className="w-16 h-16 mb-2" />
                            <p>{t('admin.revenueChartInDevelopment')}</p>
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
                      {t('admin.storeManagement')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {t('admin.storeInterfaceInDevelopment')}
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
                      {t('admin.eventsPromotions')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {t('admin.eventsInterfaceInDevelopment')}
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
                      {t('admin.userManagement')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {t('admin.userInterfaceInDevelopment')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </AdminAuthProtection>
  );
}
