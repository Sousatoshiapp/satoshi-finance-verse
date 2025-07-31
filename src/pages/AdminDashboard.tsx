import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import { supabase } from "@/integrations/supabase/client";
import { AdminAuthProtection } from "@/components/admin-auth-protection";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminStatsCards } from "@/components/admin/admin-stats-cards";
import { AdminRecentActivity } from "@/components/admin/admin-recent-activity";
import { AdminQuickActions } from "@/components/admin/admin-quick-actions";
import { Users, Activity, TrendingUp, DollarSign, Trophy, MessageSquare, Bot, Shield } from "lucide-react";

export default function AdminDashboard() {
  const { t } = useI18n();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalQuizzes: 0,
    totalBots: 0,
    totalPosts: 0,
    subscriptions: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Parallel queries for all stats
      const [
        usersResponse,
        activeUsersResponse,
        quizzesResponse,
        botsResponse,
        postsResponse,
        subscriptionsResponse
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_bot', false),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('quiz_sessions').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_bot', true),
        supabase.from('social_posts').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).not('subscription_tier', 'eq', 'free')
      ]);

      setStats({
        totalUsers: usersResponse.count || 0,
        activeUsers: activeUsersResponse.count || 0,
        totalRevenue: 0, // Would calculate from actual payments
        monthlyRevenue: 0, // Would calculate from current month
        totalQuizzes: quizzesResponse.count || 0,
        totalBots: botsResponse.count || 0,
        totalPosts: postsResponse.count || 0,
        subscriptions: subscriptionsResponse.count || 0
      });
    } catch (error: any) {
      console.error('Error loading dashboard stats:', error);
      toast({
        title: t('errors.errorLoading'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const quickStats = [
    {
      title: "Usuários Reais",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-500",
      change: "+12%"
    },
    {
      title: "Usuários Ativos (24h)",
      value: stats.activeUsers,
      icon: Activity,
      color: "text-success",
      change: "+5%"
    },
    {
      title: "Receita Total",
      value: `R$ ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-beetz",
      change: "+23%"
    },
    {
      title: "Assinaturas Ativas",
      value: stats.subscriptions,
      icon: TrendingUp,
      color: "text-warning",
      change: "+18%"
    },
    {
      title: "Quiz Completados",
      value: stats.totalQuizzes,
      icon: Trophy,
      color: "text-level",
      change: "+31%"
    },
    {
      title: "Bots Ativos",
      value: stats.totalBots,
      icon: Bot,
      color: "text-muted-foreground",
      change: "stable"
    },
    {
      title: "Posts Sociais",
      value: stats.totalPosts,
      icon: MessageSquare,
      color: "text-accent",
      change: "+8%"
    },
    {
      title: "Sistema",
      value: "Online",
      icon: Shield,
      color: "text-success",
      change: "99.9%"
    }
  ];

  return (
    <AdminAuthProtection>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
                  Painel Administrativo
                </h1>
                <p className="text-muted-foreground">
                  Centro de controle completo do Satoshi Finance Game
                </p>
              </div>
              <Button onClick={loadDashboardStats} disabled={loading}>
                {loading ? "Atualizando..." : "Atualizar Dados"}
              </Button>
            </div>

            {/* Stats Grid */}
            <AdminStatsCards stats={quickStats} loading={loading} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AdminRecentActivity />
              </div>
              <div>
                <AdminQuickActions onStatsUpdate={loadDashboardStats} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminAuthProtection>
  );
}
