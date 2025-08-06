import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/shared/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useUserEvolution } from '@/hooks/use-user-evolution';
import { useI18n } from '@/hooks/use-i18n';

interface UserEvolutionChartProps {
  userId: string;
  timeRange: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void;
}

const chartConfig = {
  level: {
    label: 'Level',
    color: 'hsl(var(--primary))',
  },
};

export function UserEvolutionChart({ userId, timeRange, onTimeRangeChange }: UserEvolutionChartProps) {
  const { data, loading } = useUserEvolution(userId, timeRange);
  const { t } = useI18n();

  const timeRangeButtons = [
    { key: '7d' as const, label: t('profile.levelEvolution.7days') },
    { key: '30d' as const, label: t('profile.levelEvolution.30days') },
    { key: '90d' as const, label: t('profile.levelEvolution.90days') },
    { key: '1y' as const, label: t('profile.levelEvolution.1year') }
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
            {t('profile.levelEvolution.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 sm:h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
            {t('profile.levelEvolution.title')}
          </CardTitle>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {timeRangeButtons.map((button) => (
              <Button
                key={button.key}
                variant={timeRange === button.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTimeRangeChange(button.key)}
                className="text-xs px-2 py-1 h-7"
              >
                {button.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-48 sm:h-64 w-full">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="levelGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => {
                const date = new Date(value);
                return timeRange === '7d' ? 
                  date.toLocaleDateString('pt-BR', { weekday: 'short' }) :
                  date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
              }}
              axisLine={false}
              tickLine={false}
              className="text-xs text-muted-foreground"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              className="text-xs text-muted-foreground"
              tickFormatter={(value) => `Nv ${value}`}
            />
            <ChartTooltip 
              content={<ChartTooltipContent 
                labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                formatter={(value) => [`Nível ${value}`, t('profile.levelEvolution.level')]}
              />} 
            />
            <Area
              type="monotone"
              dataKey="level"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              fill="url(#levelGradient)"
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2, fill: 'hsl(var(--background))' }}
              className="transition-all duration-500 ease-in-out"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
