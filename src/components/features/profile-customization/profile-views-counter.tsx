import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { Eye, TrendingUp, Users, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/use-profile';

interface ViewStats {
  totalViews: number;
  todayViews: number;
  weekViews: number;
  monthViews: number;
  uniqueViewers: number;
  recentViewers: Array<{
    id: string;
    nickname: string;
    viewed_at: string;
  }>;
}

export function ProfileViewsCounter() {
  const { profile } = useProfile();
  const [viewStats, setViewStats] = useState<ViewStats>({
    totalViews: 0,
    todayViews: 0,
    weekViews: 0,
    monthViews: 0,
    uniqueViewers: 0,
    recentViewers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadViewStats();
      // Atualizar contagem a cada minuto
      const interval = setInterval(loadViewStats, 60000);
      return () => clearInterval(interval);
    }
  }, [profile]);

  const loadViewStats = async () => {
    try {
      if (!profile) return;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Total de visualizações
      const { count: totalViews } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profile.id);

      // Visualizações de hoje
      const { count: todayViews } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profile.id)
        .gte('viewed_at', today.toISOString());

      // Visualizações da semana
      const { count: weekViews } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profile.id)
        .gte('viewed_at', weekAgo.toISOString());

      // Visualizações do mês
      const { count: monthViews } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profile.id)
        .gte('viewed_at', monthAgo.toISOString());

      // Visualizadores únicos (últimos 30 dias)
      const { data: uniqueViewersData } = await supabase
        .from('profile_views')
        .select('viewer_id')
        .eq('profile_id', profile.id)
        .gte('viewed_at', monthAgo.toISOString())
        .not('viewer_id', 'is', null);

      const uniqueViewerIds = new Set(uniqueViewersData?.map(v => v.viewer_id) || []);

      // Visualizadores recentes (com perfis)
      const { data: recentViewsData } = await supabase
        .from('profile_views')
        .select(`
          viewer_id,
          viewed_at,
          viewer_profile:profiles!profile_views_viewer_id_fkey(
            id,
            nickname
          )
        `)
        .eq('profile_id', profile.id)
        .not('viewer_id', 'is', null)
        .order('viewed_at', { ascending: false })
        .limit(5);

      const recentViewers = recentViewsData
        ?.filter(v => v.viewer_profile)
        .map(v => ({
          id: v.viewer_id,
          nickname: v.viewer_profile?.nickname || 'Usuário',
          viewed_at: v.viewed_at
        })) || [];

      setViewStats({
        totalViews: totalViews || 0,
        todayViews: todayViews || 0,
        weekViews: weekViews || 0,
        monthViews: monthViews || 0,
        uniqueViewers: uniqueViewerIds.size,
        recentViewers
      });

    } catch (error) {
      console.error('Error loading view stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Agora há pouco';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}sem atrás`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Carregando estatísticas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Visualizações do Perfil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estatísticas Principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{viewStats.totalViews}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{viewStats.todayViews}</div>
            <div className="text-xs text-muted-foreground">Hoje</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{viewStats.weekViews}</div>
            <div className="text-xs text-muted-foreground">7 dias</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{viewStats.uniqueViewers}</div>
            <div className="text-xs text-muted-foreground">Únicos</div>
          </div>
        </div>

        {/* Métricas com Ícones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div>
              <div className="font-medium">{viewStats.weekViews}</div>
              <div className="text-xs text-muted-foreground">Última semana</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Calendar className="h-8 w-8 text-blue-500" />
            <div>
              <div className="font-medium">{viewStats.monthViews}</div>
              <div className="text-xs text-muted-foreground">Último mês</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Users className="h-8 w-8 text-purple-500" />
            <div>
              <div className="font-medium">{viewStats.uniqueViewers}</div>
              <div className="text-xs text-muted-foreground">Únicos (30d)</div>
            </div>
          </div>
        </div>

        {/* Visualizadores Recentes */}
        {viewStats.recentViewers.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Visualizaram Recentemente
            </h3>
            <div className="space-y-2">
              {viewStats.recentViewers.map((viewer, index) => (
                <div 
                  key={`${viewer.id}-${index}`}
                  className="flex items-center justify-between p-2 bg-muted/20 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {viewer.nickname.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{viewer.nickname}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {formatTimeAgo(viewer.viewed_at)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensagem de Engajamento */}
        {viewStats.totalViews > 0 && (
          <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
            <p className="text-sm">
              🎉 Seu perfil está gerando curiosidade! 
              <br />
              <span className="font-medium text-primary">
                {viewStats.totalViews} pessoas já visualizaram seu perfil
              </span>
            </p>
          </div>
        )}

        {/* Dica para Aumentar Visualizações */}
        {viewStats.totalViews < 10 && (
          <div className="text-center p-4 bg-muted/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Dica:</strong> Personalize seu avatar e banner para atrair mais visualizações!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}