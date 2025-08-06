import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Progress } from "@/components/shared/ui/progress";
import { Badge } from "@/components/shared/ui/badge";
import { useBTZAnalytics } from "@/hooks/use-btz-analytics";
import { 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  BarChart3
} from "lucide-react";

export function BTZAnalyticsDashboard() {
  const { analytics, transactions, loading, DAILY_BTZ_CAP } = useBTZAnalytics();

  if (loading) {
    return <div className="animate-pulse">Carregando analytics...</div>;
  }

  if (!analytics) {
    return <div>Erro ao carregar analytics BTZ</div>;
  }

  const getWarningColor = (level: string) => {
    switch (level) {
      case 'green': return 'text-green-500';
      case 'yellow': return 'text-yellow-500';
      case 'red': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getWarningIcon = (level: string) => {
    switch (level) {
      case 'green': return <CheckCircle className="w-4 h-4" />;
      case 'yellow': return <AlertTriangle className="w-4 h-4" />;
      case 'red': return <Shield className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const capPercentage = (analytics.daily_earned / DAILY_BTZ_CAP) * 100;

  return (
    <div className="space-y-4">
      {/* Cap Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="w-4 h-4" />
            Limite Diário BTZ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {analytics.daily_earned.toFixed(1)} / {DAILY_BTZ_CAP} BTZ
            </span>
            <div className={`flex items-center gap-1 ${getWarningColor(analytics.warning_level)}`}>
              {getWarningIcon(analytics.warning_level)}
              <Badge 
                variant="outline" 
                className={`${getWarningColor(analytics.warning_level)} border-current`}
              >
                {analytics.warning_level.toUpperCase()}
              </Badge>
            </div>
          </div>
          
          <Progress 
            value={capPercentage} 
            className="h-2"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Restante: {analytics.daily_cap_remaining.toFixed(1)} BTZ</span>
            <span>{capPercentage.toFixed(1)}% usado</span>
          </div>
        </CardContent>
      </Card>

      {/* Sources Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Fontes de BTZ Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(analytics.sources_breakdown).map(([source, amount]) => (
              <div key={source} className="flex justify-between items-center">
                <span className="text-sm capitalize">{source}</span>
                <span className="font-mono text-sm">{amount.toFixed(1)} BTZ</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {transaction.source}
                  </Badge>
                  <span className="text-muted-foreground">
                    {new Date(transaction.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <span className="font-mono text-green-500">
                  +{transaction.amount.toFixed(1)} BTZ
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Warning Messages */}
      {analytics.warning_level === 'yellow' && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-yellow-500">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">
                Atenção: Você já atingiu 80% do limite diário de BTZ
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {analytics.warning_level === 'red' && (
        <Card className="border-red-500/50 bg-red-500/5">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-red-500">
              <Shield className="w-4 h-4" />
              <span className="text-sm">
                Limite diário atingido! Novas tentativas não renderão BTZ
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}