import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Holding, assetTypes } from "./types";

interface PortfolioChartsProps {
  holdings: Holding[];
}

export function PortfolioCharts({ holdings }: PortfolioChartsProps) {
  if (holdings.length === 0) return null;

  const chartConfig = {
    valor: {
      label: "Valor (R$)",
      color: "hsl(var(--primary))",
    },
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--destructive))', 'hsl(var(--muted))'];

  const getPieChartData = () => {
    const totalValue = holdings.reduce((sum, h) => sum + (h.total_value || 0), 0);
    return holdings.map(holding => ({
      name: holding.asset_symbol,
      value: holding.total_value || 0,
      percentage: ((holding.total_value || 0) / totalValue * 100).toFixed(1)
    }));
  };

  const getBarChartData = () => {
    return holdings.map(holding => ({
      name: holding.asset_symbol,
      valor: holding.total_value || 0,
      tipo: assetTypes.find(t => t.value === holding.asset_type)?.label || holding.asset_type
    }));
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Pie Chart - Asset Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Ativos</CardTitle>
          <CardDescription>Percentual de cada ativo na carteira</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <PieChart>
              <Pie
                data={getPieChartData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percentage }) => `${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getPieChartData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number, name: string) => [
                  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  name
                ]}
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Bar Chart - Asset Composition */}
      <Card>
        <CardHeader>
          <CardTitle>Composição da Carteira</CardTitle>
          <CardDescription>Valor total investido por ativo</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart data={getBarChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number) => [
                  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  'Valor'
                ]}
              />
              <Bar 
                dataKey="valor" 
                fill="var(--color-valor)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}