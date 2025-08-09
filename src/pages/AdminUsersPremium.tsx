import { useState, useEffect } from "react";
import { AdminAuthProtection } from "@/components/admin-auth-protection";
import { AdminSidebar } from "@/components/features/admin/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Star, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";

export default function AdminUsersPremium() {
  const { t } = useI18n();
  const [premiumUsers, setPremiumUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPremiumUsers();
  }, []);

  const loadPremiumUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('subscription_tier', 'free')
        .eq('is_bot', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPremiumUsers(data || []);
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

  const stats = {
    total: premiumUsers.length,
    pro: premiumUsers.filter(u => u.subscription_tier === 'pro').length,
    elite: premiumUsers.filter(u => u.subscription_tier === 'elite').length,
    revenue: premiumUsers.length * 19.99 // Exemplo
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
                <h1 className="text-3xl font-bold text-foreground">Usuários Premium</h1>
                <p className="text-muted-foreground">Gerencie usuários com assinaturas ativas</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Crown className="h-8 w-8 text-yellow-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Premium</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Star className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Pro</p>
                        <p className="text-2xl font-bold">{stats.pro}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Zap className="h-8 w-8 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Elite</p>
                        <p className="text-2xl font-bold">{stats.elite}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Crown className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Receita Est.</p>
                        <p className="text-2xl font-bold">R$ {stats.revenue.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Premium Users List */}
              <Card>
                <CardHeader>
                  <CardTitle>Usuários Premium ({premiumUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"><div className="text-lg">{t('common.loading')}...</div></div>
                  ) : (
                    <div className="space-y-4">
                      {premiumUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div>
                              <h3 className="font-semibold flex items-center gap-2">
                                {user.nickname}
                                {user.subscription_tier === 'elite' && <Crown className="h-4 w-4 text-yellow-500" />}
                                {user.subscription_tier === 'pro' && <Star className="h-4 w-4 text-blue-500" />}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Nível {user.level}</span>
                                <span>•</span>
                                <span>{user.xp} XP</span>
                                <span>•</span>
                                <span>Streak: {user.streak} dias</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={user.subscription_tier === 'elite' ? 'default' : 'secondary'}>
                              {user.subscription_tier.toUpperCase()}
                            </Badge>
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
