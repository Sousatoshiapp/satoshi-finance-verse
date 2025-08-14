import React from 'react';
import { Card } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { Skeleton } from '@/components/shared/ui/skeleton';
import { VirtualTable } from '@/components/shared/ui/virtual-table';
import { useRealtimeAnalytics, LiveActivity } from '@/hooks/use-realtime-analytics';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Activity, Cpu, Database, Users, Zap, AlertCircle, 
  CheckCircle, RefreshCw, Clock, TrendingUp, TrendingDown,
  Monitor, Globe, Server
} from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  status?: 'healthy' | 'warning' | 'critical';
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, trend, status, className }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-primary';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className={cn("h-5 w-5", getStatusColor())} />
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
        {getTrendIcon()}
      </div>
    </Card>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-32" />
    </div>
    
    {/* Metrics cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </Card>
      ))}
    </div>
    
    {/* Charts skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-64 w-full" />
        </Card>
      ))}
    </div>
  </div>
);

export const RealTimeAnalyticsDashboard: React.FC = () => {
  const { data, loading, autoRefresh, setAutoRefresh, refreshData } = useRealtimeAnalytics();

  if (loading || !data) {
    return <LoadingSkeleton />;
  }

  // Prepare chart data
  const performanceData = [
    { time: '00:00', fps: 58, memory: 45 },
    { time: '00:05', fps: 60, memory: 48 },
    { time: '00:10', fps: 59, memory: 52 },
    { time: '00:15', fps: 61, memory: 49 },
    { time: '00:20', fps: data.performance.fps, memory: data.performance.memoryUsage }
  ];

  const userActivityData = data.userBehavior.topPages.map(page => ({
    name: page.path.replace('/', ''),
    value: page.visits
  }));

  const databaseData = data.database.hotspots.map(hotspot => ({
    table: hotspot.table,
    queries: hotspot.queries
  }));

  const activityColumns = [
    {
      key: 'type',
      header: 'Tipo',
      render: (activity: LiveActivity) => (
        <Badge variant={activity.severity === 'error' ? 'destructive' : activity.severity === 'warning' ? 'secondary' : 'default'}>
          {activity.type}
        </Badge>
      ),
      width: '100px'
    },
    {
      key: 'message',
      header: 'Atividade',
      render: (activity: LiveActivity) => activity.message,
    },
    {
      key: 'timestamp',
      header: 'Tempo',
      render: (activity: LiveActivity) => {
        const timeAgo = Math.floor((Date.now() - activity.timestamp) / 1000);
        return `${timeAgo}s atrás`;
      },
      width: '120px'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-Time Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitoramento avançado em tempo real • Última atualização: {new Date(data.lastUpdated).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-500/10 text-green-600' : ''}
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Status do Sistema"
          value={data.systemHealth.status === 'healthy' ? 'Saudável' : data.systemHealth.status === 'warning' ? 'Atenção' : 'Crítico'}
          icon={data.systemHealth.status === 'healthy' ? CheckCircle : AlertCircle}
          status={data.systemHealth.status}
        />
        <MetricCard
          title="Uso de Memória"
          value={`${data.systemHealth.memory.toFixed(1)}%`}
          icon={Cpu}
          trend={data.systemHealth.memory > 70 ? 'up' : 'down'}
          status={data.systemHealth.memory > 80 ? 'warning' : 'healthy'}
        />
        <MetricCard
          title="Usuários Ativos"
          value={data.userBehavior.activeUsers}
          icon={Users}
          trend="up"
          status="healthy"
        />
        <MetricCard
          title="Queries Lentas"
          value={data.database.slowQueries.length}
          icon={Database}
          trend={data.database.slowQueries.length > 2 ? 'up' : 'down'}
          status={data.database.slowQueries.length > 2 ? 'warning' : 'healthy'}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Performance em Tempo Real</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Line yAxisId="left" type="monotone" dataKey="fps" stroke="hsl(var(--primary))" strokeWidth={2} name="FPS" />
              <Line yAxisId="right" type="monotone" dataKey="memory" stroke="hsl(var(--secondary))" strokeWidth={2} name="Memória %" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* User Activity Chart */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Páginas Mais Visitadas</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userActivityData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="hsl(var(--primary))"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {userActivityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Hotspots */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Server className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Database Hotspots</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={databaseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="table" />
              <YAxis />
              <Bar dataKey="queries" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* User Behavior Metrics */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Métricas de Comportamento</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tempo Médio de Sessão</span>
              <span className="font-semibold">{data.userBehavior.averageSessionTime} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Taxa de Rejeição</span>
              <span className="font-semibold">{data.userBehavior.bounceRate}%</span>
            </div>
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Top Interações</span>
              {data.userBehavior.interactions.map((interaction, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-xs">{interaction.action}</span>
                  <Badge variant="outline">{interaction.count}</Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Live Activity Feed */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Feed de Atividade em Tempo Real</h3>
        </div>
        <VirtualTable
          data={data.liveActivity}
          columns={activityColumns}
          height={300}
          itemHeight={60}
        />
      </Card>
    </div>
  );
};