import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/shared/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useUserEvolution } from '@/hooks/use-user-evolution';
import { useI18n } from '@/hooks/use-i18n';

interface UserEvolutionChartProps {
  userId: string;
  timeRange: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void;
}

const chartConfig = {
  xp: {
    label: 'XP',
    color: 'hsl(var(--chart-1))',
  },
};

export function UserEvolutionChart({ userId, timeRange, onTimeRangeChange }: UserEvolutionChartProps) {
  const { data, loading } = useUserEvolution(userId, timeRange);
  const { t } = useI18n();

  const timeRangeButtons = [
    { key: '7d' as const, label: t('profile.evolution.7days') },
    { key: '30d' as const, label: t('profile.evolution.30days') },
    { key: '90d' as const, label: t('profile.evolution.90days') },
    { key: '1y' as const, label: t('profile.evolution.1year') }
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {t('profile.evolution.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {t('profile.evolution.title')}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {timeRangeButtons.map((button) => (
              <Button
                key={button.key}
                variant={timeRange === button.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTimeRangeChange(button.key)}
                className="flex-1 md:flex-none min-w-0"
              >
                {button.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-48 md:h-64">
          <LineChart data={data}>
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line 
              type="monotone" 
              dataKey="xp" 
              stroke="var(--color-xp)" 
              strokeWidth={3}
              strokeDasharray="0"
              dot={{ fill: 'var(--color-xp)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              name={t('profile.evolution.xpProgress')}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
