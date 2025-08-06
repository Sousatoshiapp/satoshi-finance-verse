import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Progress } from "@/components/shared/ui/progress";
import { 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  Activity,
  Coins
} from "lucide-react";

export function BTZEconomySummary() {
  const economyData = {
    // Dados simulados baseados no novo sistema
    daily_earned: 3.2,
    daily_cap: 10,
    sources: {
      quiz: 1.4, // 7 questions × 0.1 × 2x multiplier
      yield: 1.5,
      daily: 0.3
    },
    warnings: {
      level: 'green' as const,
      message: 'Economia saudável'
    }
  };

  const capPercentage = (economyData.daily_earned / economyData.daily_cap) * 100;
  const isNearCap = capPercentage >= 80;

  return (
    <div className="space-y-4">
      {/* Status Geral */}
      <Card className="border-green-500/20 bg-green-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Economia BTZ Rebalanceada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>✅ Redução de 96% nos ganhos diários (400+ → 10 BTZ/dia)</p>
            <p>✅ Quiz rebalanceado (0.1 BTZ base, 2x max multiplier)</p>
            <p>✅ Yield limitado (5 BTZ/dia máximo)</p>
            <p>✅ Achievements rebalanceados (-90%)</p>
            <p>✅ Sistema de vidas removido</p>
          </div>
        </CardContent>
      </Card>

      {/* Cap Diário */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4" />
            Uso do Limite Diário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">
              {economyData.daily_earned}/{economyData.daily_cap} BTZ
            </span>
            <Badge 
              variant={isNearCap ? "destructive" : "secondary"}
              className="text-xs"
            >
              {capPercentage.toFixed(0)}% usado
            </Badge>
          </div>
          
          <Progress 
            value={capPercentage} 
            className="h-2"
          />
          
          <div className="text-xs text-muted-foreground">
            Restante: {(economyData.daily_cap - economyData.daily_earned).toFixed(1)} BTZ
          </div>
        </CardContent>
      </Card>

      {/* Breakdown por Fonte */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Coins className="w-4 h-4" />
            Fontes de BTZ Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Quiz (rebalanceado)</span>
              <span className="text-sm font-mono">{economyData.sources.quiz} BTZ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Yield (limitado)</span>
              <span className="text-sm font-mono">{economyData.sources.yield} BTZ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Recompensa diária</span>
              <span className="text-sm font-mono">{economyData.sources.daily} BTZ</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparação Antes/Depois */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Impacto do Rebalanceamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Antes (Quiz):</span>
              <span className="line-through text-red-500">112 BTZ/quiz</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Depois (Quiz):</span>
              <span className="text-green-500">0.7 BTZ/quiz</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Redução:</span>
                <span className="text-green-500">-99.4%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}