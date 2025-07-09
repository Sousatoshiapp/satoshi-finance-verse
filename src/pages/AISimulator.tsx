import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Target, Zap } from "lucide-react";

export default function AISimulator() {
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);

  const simulations = [
    {
      id: "stock-market",
      title: "Simulador da Bolsa de Valores",
      description: "Pratique investimentos em ações com dados reais",
      difficulty: "Intermediário",
      icon: TrendingUp,
      progress: 65,
      status: "available"
    },
    {
      id: "crypto-trading",
      title: "Trading de Criptomoedas",
      description: "Aprenda sobre volatilidade e gestão de risco",
      difficulty: "Avançado",
      icon: BarChart3,
      progress: 0,
      status: "locked"
    },
    {
      id: "portfolio-management",
      title: "Gestão de Portfólio",
      description: "Balance seus investimentos automaticamente",
      difficulty: "Intermediário",
      icon: Target,
      progress: 30,
      status: "available"
    },
    {
      id: "economic-scenarios",
      title: "Cenários Econômicos",
      description: "Teste suas estratégias em diferentes cenários",
      difficulty: "Avançado",
      icon: DollarSign,
      progress: 0,
      status: "locked"
    }
  ];

  const marketData = [
    { name: "PETR4", price: 28.50, change: 2.1, positive: true },
    { name: "VALE3", price: 65.80, change: -1.5, positive: false },
    { name: "ITUB4", price: 22.45, change: 0.8, positive: true },
    { name: "BBDC4", price: 18.90, change: -0.3, positive: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🤖 Simulador de IA</h1>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Simulações Disponíveis */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Simulações Disponíveis</h2>
            <div className="grid gap-4">
              {simulations.map((sim) => (
                <Card key={sim.id} className={`cursor-pointer transition-all ${
                  activeSimulation === sim.id ? 'ring-2 ring-primary' : ''
                } ${sim.status === 'locked' ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary text-white">
                          <sim.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{sim.title}</CardTitle>
                          <CardDescription>{sim.description}</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={sim.status === 'locked' ? 'secondary' : 'outline'}>
                          {sim.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progresso</span>
                        <span>{sim.progress}%</span>
                      </div>
                      <Progress value={sim.progress} className="w-full" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {sim.status === 'locked' ? '🔒 Desbloqueie completando outros simuladores' : '✅ Disponível'}
                        </span>
                        <Button 
                          size="sm"
                          disabled={sim.status === 'locked'}
                          onClick={() => setActiveSimulation(sim.id)}
                        >
                          {sim.progress > 0 ? 'Continuar' : 'Iniciar'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Painel Lateral */}
          <div className="space-y-4">
            {/* Dados do Mercado */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Dados do Mercado
                </CardTitle>
                <CardDescription>Dados em tempo real</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {marketData.map((stock, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{stock.name}</div>
                      <div className="text-sm text-muted-foreground">R$ {stock.price}</div>
                    </div>
                    <div className={`flex items-center gap-1 ${
                      stock.positive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stock.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="text-sm font-medium">{stock.positive ? '+' : ''}{stock.change}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sua Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Carteira Virtual</span>
                  <span className="font-semibold">R$ 12.450</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Retorno Total</span>
                  <span className="font-semibold text-green-600">+24.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Melhor Trade</span>
                  <span className="font-semibold text-green-600">+8.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Taxa de Acerto</span>
                  <span className="font-semibold">68%</span>
                </div>
              </CardContent>
            </Card>

            {/* Power-up Ativo */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  Power-up Ativo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="font-semibold">Análise Avançada</div>
                  <div className="text-sm text-muted-foreground">Insights de IA ativados</div>
                  <div className="text-xs text-purple-600 mt-2">Expira em 2h 15m</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}