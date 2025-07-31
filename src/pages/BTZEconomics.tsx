import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useBTZEconomics } from "@/hooks/use-btz-economics";
import { useI18n } from "@/hooks/use-i18n";
import { TrendingUp, Shield, Clock, Award, History, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function BTZEconomics() {
  const { t } = useI18n();
  const { analytics, loading, getStreakTier, formatTimeUntilYield } = useBTZEconomics();

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">{t('errors.error')} ao carregar dados de BTZ</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare chart data
  const yieldChartData = analytics.charts.yield_history.map(record => ({
    date: format(new Date(record.created_at), 'dd/MM', { locale: ptBR }),
    yield: record.yield_amount,
    rate: (record.yield_rate * 100).toFixed(2)
  })).reverse();

  const penaltyChartData = analytics.charts.penalty_history.map(record => ({
    date: format(new Date(record.created_at), 'dd/MM', { locale: ptBR }),
    penalty: record.penalty_amount,
    days_inactive: record.days_inactive
  })).reverse();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">BTZ Economics</h1>
          <p className="text-muted-foreground">Sistema monetário baseado em atividade diária</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <span className="w-2 h-2 rounded-full bg-[#adff2f] mr-2"></span>
          {analytics.current.total_btz.toLocaleString()} BTZ
        </Badge>
      </div>

      {/* Current Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total BTZ */}
        <Card className="bg-gradient-to-br from-[#adff2f]/10 to-[#32cd32]/10 border-[#adff2f]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#adff2f]" />
              BTZ Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{analytics.current.total_btz.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Próximo: +{analytics.current.next_yield_amount.toLocaleString()} BTZ
            </p>
          </CardContent>
        </Card>

        {/* Protected BTZ */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              BTZ Protegido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-blue-400">
              {analytics.current.protected_btz.toLocaleString()}
            </div>
            <Progress 
              value={(analytics.current.protected_btz / analytics.current.total_btz) * 100} 
              className="h-2 mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {((analytics.current.protected_btz / analytics.current.total_btz) * 100).toFixed(1)}% protegido
            </p>
          </CardContent>
        </Card>

        {/* Login Streak */}
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-500" />
              Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-orange-500">
              {analytics.current.consecutive_login_days}
            </div>
            <Badge variant="outline" className="text-xs mt-1">
              {getStreakTier()}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              +{(analytics.bonuses.streak_bonus * 100).toFixed(1)}% bonus yield
            </p>
          </CardContent>
        </Card>

        {/* Next Yield */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              Próximo Rendimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.current.yield_applied_today ? (
              <div>
                <div className="text-2xl font-bold text-[#adff2f]">✓</div>
                <p className="text-xs text-[#adff2f]">Aplicado hoje</p>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold font-mono text-purple-400">
                  {formatTimeUntilYield(analytics.current.time_until_next_yield_ms)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Taxa atual: {(analytics.current.current_yield_rate * 100).toFixed(2)}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yield History Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#adff2f]" />
              Histórico de Rendimentos (30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {yieldChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={yieldChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value} BTZ`,
                      name === 'yield' ? 'Rendimento' : 'Taxa'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="yield"
                    stroke="#adff2f"
                    fill="#adff2f"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Nenhum rendimento nos últimos 30 dias
              </div>
            )}
          </CardContent>
        </Card>

        {/* Penalty History Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-red-400" />
              Histórico de Penalidades (30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {penaltyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={penaltyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value} ${name === 'penalty' ? 'BTZ perdido' : 'dias inativo'}`,
                      name === 'penalty' ? 'Penalidade' : 'Dias Inativo'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="penalty"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-center">
                <div>
                  <div className="text-2xl mb-2">🛡️</div>
                  <p>Nenhuma penalidade!</p>
                  <p className="text-sm">Continue fazendo login diariamente</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas Resumidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#adff2f]">
                {analytics.historical.total_yield_earned.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">BTZ Total Ganho</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {analytics.historical.yield_last_30_days.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Rendimento (30d)</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {analytics.historical.penalty_last_30_days.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Penalidades (30d)</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {analytics.historical.net_gain_last_30_days.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Ganho Líquido (30d)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona o Sistema BTZ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-[#adff2f] mb-2">💰 Rendimento Diário</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Base: 0.5% do seu BTZ total por dia</li>
                <li>• Streak Bonus: +0.1% a cada 5 dias consecutivos</li>
                <li>• Pro: +0.5% | Elite: +1.0% adicional</li>
                <li>• Máximo: 2.5% por dia</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-400 mb-2">⚠️ Sistema de Penalidades</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 1 dia: 0% (período de graça)</li>
                <li>• 2-3 dias: -1% por dia</li>
                <li>• 4-7 dias: -2% por dia</li>
                <li>• 8+ dias: -5% por dia</li>
              </ul>
            </div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              BTZ Protegido
            </h4>
            <p className="text-sm text-muted-foreground">
              20% do seu BTZ total é sempre protegido e nunca pode ser perdido por penalidades. 
              Este valor aumenta automaticamente conforme seu BTZ cresce.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
